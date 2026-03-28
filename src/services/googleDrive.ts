/**
 * Google Drive Storage Service
 * 
 * This service uses Google Drive as a cloud database by storing
 * application data as JSON files. Each data type (users, posts, etc.)
 * is stored in a separate file for better organization.
 */

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Google Drive API configuration
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

// Folder name in Google Drive where all app data will be stored
const APP_FOLDER_NAME = 'SocialHub_Data';

interface DriveFile {
  id: string;
  name: string;
}

class GoogleDriveService {
  private isInitialized = false;
  private appFolderId: string | null = null;
  private fileCache: Map<string, string> = new Map(); // filename -> fileId

  /**
   * Initialize Google Drive API
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('client:auth2', async () => {
          try {
            await gapi.client.init({
              apiKey: API_KEY,
              clientId: CLIENT_ID,
              discoveryDocs: DISCOVERY_DOCS,
              scope: SCOPES,
            });
            this.isInitialized = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  /**
   * Sign in to Google account
   */
  async signIn(): Promise<void> {
    await this.init();
    const auth = gapi.auth2.getAuthInstance();
    if (!auth.isSignedIn.get()) {
      await auth.signIn();
    }
    await this.ensureAppFolder();
  }

  /**
   * Sign out from Google account
   */
  async signOut(): Promise<void> {
    const auth = gapi.auth2.getAuthInstance();
    if (auth.isSignedIn.get()) {
      await auth.signOut();
    }
    this.appFolderId = null;
    this.fileCache.clear();
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    if (!this.isInitialized) return false;
    const auth = gapi.auth2.getAuthInstance();
    return auth?.isSignedIn.get() || false;
  }

  /**
   * Get current user info
   */
  getCurrentUser(): any {
    if (!this.isSignedIn()) return null;
    const auth = gapi.auth2.getAuthInstance();
    const user = auth.currentUser.get();
    const profile = user.getBasicProfile();
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl(),
    };
  }

  /**
   * Ensure app folder exists in Google Drive
   */
  private async ensureAppFolder(): Promise<string> {
    if (this.appFolderId) return this.appFolderId;

    // Search for existing folder
    const response = await gapi.client.request({
      path: '/drive/v3/files',
      method: 'GET',
      params: {
        q: `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      },
    });

    const files = response.result.files || [];
    if (files.length > 0) {
      this.appFolderId = files[0].id;
      return this.appFolderId;
    }

    // Create folder if it doesn't exist
    const createResponse = await gapi.client.request({
      path: '/drive/v3/files',
      method: 'POST',
      body: {
        name: APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
    });

    this.appFolderId = createResponse.result.id;
    return this.appFolderId;
  }

  /**
   * Get file ID by name
   */
  private async getFileId(fileName: string): Promise<string | null> {
    // Check cache first
    if (this.fileCache.has(fileName)) {
      return this.fileCache.get(fileName)!;
    }

    const folderId = await this.ensureAppFolder();
    const response = await gapi.client.request({
      path: '/drive/v3/files',
      method: 'GET',
      params: {
        q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      },
    });

    const files = response.result.files || [];
    if (files.length > 0) {
      const fileId = files[0].id;
      this.fileCache.set(fileName, fileId);
      return fileId;
    }

    return null;
  }

  /**
   * Read data from a file
   */
  async readFile<T>(fileName: string, defaultValue: T): Promise<T> {
    try {
      const fileId = await this.getFileId(fileName);
      if (!fileId) {
        return defaultValue;
      }

      const response = await gapi.client.request({
        path: `/drive/v3/files/${fileId}`,
        method: 'GET',
        params: {
          alt: 'media',
        },
      });

      return JSON.parse(response.body) as T;
    } catch (error) {
      console.error(`Error reading file ${fileName}:`, error);
      return defaultValue;
    }
  }

  /**
   * Write data to a file
   */
  async writeFile<T>(fileName: string, data: T): Promise<void> {
    try {
      const folderId = await this.ensureAppFolder();
      const fileId = await this.getFileId(fileName);
      const content = JSON.stringify(data, null, 2);

      if (fileId) {
        // Update existing file
        await gapi.client.request({
          path: `/upload/drive/v3/files/${fileId}`,
          method: 'PATCH',
          params: {
            uploadType: 'media',
          },
          body: content,
        });
      } else {
        // Create new file
        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelim = `\r\n--${boundary}--`;

        const metadata = {
          name: fileName,
          mimeType: 'application/json',
          parents: [folderId],
        };

        const multipartRequestBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          content +
          closeDelim;

        const response = await gapi.client.request({
          path: '/upload/drive/v3/files',
          method: 'POST',
          params: {
            uploadType: 'multipart',
          },
          headers: {
            'Content-Type': `multipart/related; boundary="${boundary}"`,
          },
          body: multipartRequestBody,
        });

        const newFileId = response.result.id;
        this.fileCache.set(fileName, newFileId);
      }
    } catch (error) {
      console.error(`Error writing file ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      const fileId = await this.getFileId(fileName);
      if (fileId) {
        await gapi.client.request({
          path: `/drive/v3/files/${fileId}`,
          method: 'DELETE',
        });
        this.fileCache.delete(fileName);
      }
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * List all data files
   */
  async listFiles(): Promise<DriveFile[]> {
    try {
      const folderId = await this.ensureAppFolder();
      const response = await gapi.client.request({
        path: '/drive/v3/files',
        method: 'GET',
        params: {
          q: `'${folderId}' in parents and trashed=false`,
          spaces: 'drive',
          fields: 'files(id, name)',
        },
      });

      return response.result.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Clear all app data (for testing/reset)
   */
  async clearAllData(): Promise<void> {
    const files = await this.listFiles();
    for (const file of files) {
      await this.deleteFile(file.name);
    }
    this.fileCache.clear();
  }
}

export const googleDrive = new GoogleDriveService();
