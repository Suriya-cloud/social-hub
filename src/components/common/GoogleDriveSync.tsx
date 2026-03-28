import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { googleDrive } from '@/services/googleDrive';
import { storage } from '@/services/storage';
import { Cloud, CloudOff, Download, Upload, RefreshCw, Trash2 } from 'lucide-react';

export default function GoogleDriveSync() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkSignInStatus();
  }, []);

  const checkSignInStatus = async () => {
    try {
      await googleDrive.init();
      const signedIn = googleDrive.isSignedIn();
      setIsSignedIn(signedIn);
      if (signedIn) {
        setUserInfo(googleDrive.getCurrentUser());
      }
    } catch (error) {
      console.error('Error checking sign-in status:', error);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await googleDrive.signIn();
      setIsSignedIn(true);
      setUserInfo(googleDrive.getCurrentUser());
      toast({
        title: 'Connected to Google Drive',
        description: 'Your data can now be synced to the cloud',
      });
    } catch (error: any) {
      toast({
        title: 'Sign-in failed',
        description: error.message || 'Failed to connect to Google Drive',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await googleDrive.signOut();
      setIsSignedIn(false);
      setUserInfo(null);
      toast({
        title: 'Disconnected',
        description: 'Google Drive sync has been disabled',
      });
    } catch (error: any) {
      toast({
        title: 'Sign-out failed',
        description: error.message || 'Failed to disconnect from Google Drive',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      // Get all data from localStorage
      const data = {
        users: storage.getUsers(),
        posts: storage.getPosts(),
        stories: storage.getStories(),
        reels: storage.getReels(),
        comments: storage.getComments(),
        follows: storage.getFollows(),
        conversations: storage.getConversations(),
        messages: storage.getMessages(),
        savedPosts: storage.getSavedPosts(),
        currentUser: storage.getCurrentUser(),
      };

      // Upload to Google Drive
      await googleDrive.writeFile('socialhub_backup.json', data);

      toast({
        title: 'Backup successful',
        description: 'Your data has been backed up to Google Drive',
      });
    } catch (error: any) {
      toast({
        title: 'Backup failed',
        description: error.message || 'Failed to backup data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      // Download from Google Drive
      const data = await googleDrive.readFile<any>('socialhub_backup.json', null);

      if (!data) {
        toast({
          title: 'No backup found',
          description: 'No backup file found in Google Drive',
          variant: 'destructive',
        });
        return;
      }

      // Restore to localStorage
      if (data.users) storage.setUsers(data.users);
      if (data.posts) storage.setPosts(data.posts);
      if (data.stories) storage.setStories(data.stories);
      if (data.reels) storage.setReels(data.reels);
      if (data.comments) storage.setComments(data.comments);
      if (data.follows) storage.setFollows(data.follows);
      if (data.conversations) storage.setConversations(data.conversations);
      if (data.messages) storage.setMessages(data.messages);
      if (data.savedPosts) storage.setSavedPosts(data.savedPosts);
      if (data.currentUser) storage.setCurrentUser(data.currentUser);

      toast({
        title: 'Restore successful',
        description: 'Your data has been restored from Google Drive. Please refresh the page.',
      });

      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Restore failed',
        description: error.message || 'Failed to restore data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearBackup = async () => {
    if (!confirm('Are you sure you want to delete the backup from Google Drive?')) {
      return;
    }

    setIsLoading(true);
    try {
      await googleDrive.deleteFile('socialhub_backup.json');
      toast({
        title: 'Backup deleted',
        description: 'The backup file has been removed from Google Drive',
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete backup',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSignedIn ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
          Google Drive Sync
        </CardTitle>
        <CardDescription>
          Backup and restore your SocialHub data using Google Drive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSignedIn ? (
          <>
            <Alert>
              <AlertDescription>
                Connect your Google account to enable cloud backup and sync your data across devices.
              </AlertDescription>
            </Alert>
            <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
              {isLoading ? 'Connecting...' : 'Connect Google Drive'}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {userInfo?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-medium">{userInfo?.name}</p>
                <p className="text-sm text-muted-foreground">{userInfo?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleBackup}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Backup
              </Button>
              <Button
                onClick={handleRestore}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Restore
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleClearBackup}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Backup
              </Button>
              <Button
                onClick={handleSignOut}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <CloudOff className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Backup:</strong> Save current data to Google Drive<br />
                <strong>Restore:</strong> Load data from Google Drive backup<br />
                <strong>Note:</strong> Restoring will overwrite your current data
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}
