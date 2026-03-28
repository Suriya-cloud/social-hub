# Google Drive Integration Setup Guide

## Overview
SocialHub now supports Google Drive as a cloud backup solution for your data. This allows you to:
- ✅ Backup your data to Google Drive
- ✅ Restore data from Google Drive
- ✅ Access your data across multiple devices
- ✅ Protect against data loss from browser cache clearing

## Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `SocialHub` (or any name you prefer)
4. Click "Create"

### Step 2: Enable Google Drive API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on "Google Drive API"
4. Click "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: SocialHub
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Skip this step (click "Save and Continue")
   - Test users: Add your email address
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: Web application
   - Name: SocialHub Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Add your production domain when deploying
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Add your production domain when deploying
   - Click "Create"

5. Copy the **Client ID** (you'll need this)

### Step 4: Create API Key

1. In "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API key"
3. Copy the **API Key** (you'll need this)
4. Click "Restrict Key" (recommended):
   - API restrictions: Select "Restrict key"
   - Select APIs: Choose "Google Drive API"
   - Click "Save"

### Step 5: Configure Environment Variables

1. Create a `.env` file in the project root (copy from `.env.example`)
2. Add your credentials:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your_api_key_here
```

3. Save the file

### Step 6: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

## How to Use Google Drive Sync

### Accessing the Feature

1. Log in to SocialHub
2. Click on your profile avatar (top right)
3. Select "Settings"
4. Go to the "Data & Sync" tab
5. You'll see the "Google Drive Sync" card

### Connecting Google Drive

1. Click "Connect Google Drive"
2. Sign in with your Google account
3. Grant permissions to SocialHub
4. You're now connected!

### Backing Up Data

1. Click the "Backup" button
2. Wait for the backup to complete
3. Your data is now saved to Google Drive in a folder called `SocialHub_Data`

### Restoring Data

1. Click the "Restore" button
2. Confirm the action (this will overwrite current data)
3. Wait for the restore to complete
4. The page will automatically refresh

### Disconnecting

1. Click the "Disconnect" button
2. Your Google Drive connection will be removed
3. Existing backups remain in Google Drive

## What Gets Backed Up?

The following data is included in backups:
- ✅ User profiles
- ✅ Posts (with captions and media URLs)
- ✅ Stories
- ✅ Reels
- ✅ Comments
- ✅ Likes (posts, reels, comments)
- ✅ Follows
- ✅ Conversations and messages
- ✅ Saved posts

**Note:** Media files (images/videos) are stored as base64 data URLs in the backup.

## File Structure in Google Drive

```
Google Drive
└── SocialHub_Data/
    └── socialhub_backup.json  (All app data in one file)
```

## Security & Privacy

### Data Access
- SocialHub only accesses files it creates
- The app uses the `drive.file` scope (limited access)
- Cannot read or modify other files in your Google Drive

### Data Storage
- All data is stored in JSON format
- Media is stored as base64-encoded data URLs
- No data is sent to external servers (except Google Drive)

### Permissions
The app requests these permissions:
- **See and download files created by this app**: To read backup files
- **Create files in Google Drive**: To save backups
- **Edit files created by this app**: To update backups

## Troubleshooting

### "Sign-in failed" Error

**Possible causes:**
1. Invalid Client ID or API Key
2. Google Drive API not enabled
3. OAuth consent screen not configured
4. Authorized origins/redirect URIs not set correctly

**Solutions:**
1. Double-check your credentials in `.env`
2. Verify Google Drive API is enabled in Cloud Console
3. Check OAuth consent screen configuration
4. Ensure `http://localhost:5173` is in authorized origins

### "Backup failed" Error

**Possible causes:**
1. Not signed in to Google Drive
2. Network connection issues
3. Google Drive quota exceeded

**Solutions:**
1. Click "Connect Google Drive" first
2. Check your internet connection
3. Check your Google Drive storage space

### "Restore failed" Error

**Possible causes:**
1. No backup file found
2. Corrupted backup file
3. Network connection issues

**Solutions:**
1. Create a backup first using the "Backup" button
2. Try creating a new backup
3. Check your internet connection

### "No backup found" Message

This means you haven't created a backup yet. Click the "Backup" button to create your first backup.

## Best Practices

### Regular Backups
- Backup your data regularly (daily or weekly)
- Backup before clearing browser cache
- Backup before switching browsers or devices

### Multiple Devices
- You can restore your data on any device
- Just sign in with the same Google account
- Click "Restore" to sync your data

### Data Safety
- Keep your Google account secure
- Use a strong password
- Enable 2-factor authentication on Google

## Limitations

### Current Limitations
- ⚠️ One backup file per Google account
- ⚠️ Manual backup/restore (not automatic)
- ⚠️ Large media files increase backup size
- ⚠️ Backup time depends on data size

### Future Improvements
- 🔄 Automatic background sync
- 📦 Multiple backup versions
- 🗜️ Compressed backups
- ⚡ Incremental backups (only changed data)

## Alternative: Supabase

For a production-ready solution with real-time sync and better performance, consider migrating to Supabase:

1. Contact Miaoda official support to enable Supabase
2. Follow the migration guide in `SUPABASE_MIGRATION_GUIDE.md`
3. Enjoy automatic sync, real-time updates, and better scalability

## Support

### Getting Help
- Check this guide first
- Review error messages carefully
- Check browser console for detailed errors
- Verify Google Cloud Console settings

### Common Issues
- **Credentials not working**: Make sure to restart dev server after adding `.env`
- **Popup blocked**: Allow popups for the sign-in window
- **Slow backups**: Large amounts of data take longer to upload

## Technical Details

### API Usage
- Uses Google Drive API v3
- OAuth 2.0 for authentication
- REST API for file operations

### Data Format
```json
{
  "users": [...],
  "posts": [...],
  "stories": [...],
  "reels": [...],
  "comments": [...],
  "postLikes": [...],
  "reelLikes": [...],
  "commentLikes": [...],
  "follows": [...],
  "conversations": [...],
  "messages": [...],
  "savedPosts": [...]
}
```

### File Operations
- **Backup**: Reads localStorage → Uploads to Drive
- **Restore**: Downloads from Drive → Writes to localStorage
- **Sync**: Compares timestamps → Merges changes (future feature)

## Conclusion

Google Drive integration provides a simple, free cloud backup solution for SocialHub. While it's not as powerful as a dedicated database like Supabase, it's perfect for:
- Personal use
- Small user bases
- Development and testing
- Temporary cloud storage

For production deployments with multiple users, real-time features, and better performance, migrate to Supabase when available.
