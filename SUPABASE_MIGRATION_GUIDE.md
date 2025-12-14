# SocialHub - Supabase Migration Guide

## Current Status

⚠️ **IMPORTANT**: Supabase is currently unavailable for this project. The application is fully functional using browser localStorage as a temporary data storage solution.

## What's Ready

✅ **Complete Application**: All features are implemented and working with localStorage
✅ **Database Schema**: Complete SQL migration files are prepared
✅ **Storage Configuration**: Bucket setup scripts are ready
✅ **Migration Plan**: Step-by-step guide documented below

## Migration Files Prepared

### 1. Database Schema (`supabase/migrations/20241214_initial_schema.sql`)
- 16 tables covering all application features
- Indexes for optimal query performance
- Helper functions for common operations
- Triggers for automatic updates
- Complete relationships and constraints

### 2. Storage Buckets (`supabase/migrations/20241214_storage_buckets.sql`)
- 5 storage buckets for different media types
- Proper size limits and MIME type restrictions
- Public access policies configured

## When Supabase Becomes Available

### Step 1: Contact Miaoda Support
Contact **Miaoda official support** to enable Supabase for your project.

### Step 2: Initialize Supabase
Once Supabase is enabled, the system will automatically:
1. Create the Supabase project
2. Generate connection credentials
3. Create the `src/db/supabase.ts` file with configuration

### Step 3: Apply Migrations
Run the migration files in order:
```bash
# These will be applied automatically when Supabase is available
1. 20241214_initial_schema.sql
2. 20241214_storage_buckets.sql
```

### Step 4: Update Application Code
The following files will need to be updated to use Supabase instead of localStorage:

#### A. Create Supabase Client (`src/db/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### B. Update Environment Variables (`.env`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### C. Create Database API Layer (`src/db/api.ts`)
Replace the current `src/services/api.ts` with Supabase queries:

**Example - Posts API:**
```typescript
import { supabase } from './supabase';

export const postsApi = {
  // Create post
  async create(userId: string, caption: string, mediaUrl: string, mediaType: string, hashtags: string[]) {
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        caption,
        media_url: mediaUrl,
        media_type: mediaType,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert hashtags
    for (const tag of hashtags) {
      const { data: hashtag } = await supabase
        .from('hashtags')
        .upsert({ tag })
        .select()
        .single();

      if (hashtag) {
        await supabase
          .from('post_hashtags')
          .insert({
            post_id: post.id,
            hashtag_id: hashtag.id,
          });
      }
    }

    return post;
  },

  // Get feed posts
  async getFeed(userId: string) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = follows?.map(f => f.following_id) || [];
    followingIds.push(userId);

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id(*),
        post_likes(user_id),
        comments(count)
      `)
      .in('user_id', followingIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return posts || [];
  },

  // Like post
  async like(postId: string, userId: string) {
    const { data: existing } = await supabase
      .from('post_likes')
      .select()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });
    }
  },
};
```

#### D. Update Authentication (`src/contexts/AuthContext.tsx`)
Replace localStorage auth with Supabase Auth:

```typescript
import { supabase } from '@/db/supabase';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setCurrentUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setCurrentUser(data);
    }
  };

  const register = async (username: string, password: string, fullName: string) => {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${username}@socialhub.local`,
      password,
    });

    if (authError) throw authError;

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user!.id,
        username,
        email: `${username}@socialhub.local`,
        full_name: fullName,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    setCurrentUser(profile);
    return profile;
  };

  const login = async (username: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@socialhub.local`,
      password,
    });

    if (error) throw error;

    await loadUserProfile(data.user.id);
    return currentUser!;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  // ... rest of the context
};
```

#### E. Update File Upload (`src/lib/imageUtils.ts`)
Add Supabase Storage upload function:

```typescript
import { supabase } from '@/db/supabase';

export const uploadToStorage = async (
  file: File,
  bucket: string,
  path: string
): Promise<string> => {
  // Compress image if needed
  const processedFile = file.type.startsWith('image/')
    ? await compressImage(file)
    : file;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, processedFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
};

// Usage example:
const avatarUrl = await uploadToStorage(
  file,
  'app-87ml1bn52jgh_avatars',
  `${userId}/avatar.webp`
);
```

### Step 5: Data Migration (Optional)
If you have test data in localStorage that you want to migrate:

1. Export localStorage data:
```javascript
const exportData = () => {
  const data = {
    users: JSON.parse(localStorage.getItem('socialhub_users') || '[]'),
    posts: JSON.parse(localStorage.getItem('socialhub_posts') || '[]'),
    // ... export all data
  };
  console.log(JSON.stringify(data));
};
```

2. Import to Supabase using the admin panel or API

### Step 6: Enable Real-Time Features
Add real-time subscriptions for messaging:

```typescript
// Subscribe to new messages
const subscription = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload) => {
      setMessages(prev => [...prev, payload.new]);
    }
  )
  .subscribe();

// Cleanup
return () => {
  subscription.unsubscribe();
};
```

### Step 7: Testing Checklist
After migration, test all features:

- [ ] User registration and login
- [ ] Profile editing with avatar upload
- [ ] Creating posts with images/videos
- [ ] Liking and commenting on posts
- [ ] Creating and viewing stories
- [ ] Creating and viewing reels
- [ ] Following/unfollowing users
- [ ] Sending messages
- [ ] Saving posts
- [ ] Searching users and hashtags
- [ ] Viewing user profiles
- [ ] Feed updates

## Benefits After Migration

### Performance
- ✅ Faster queries with database indexes
- ✅ Efficient pagination for large datasets
- ✅ Optimized media delivery via CDN

### Features
- ✅ Real-time messaging updates
- ✅ Real-time notifications
- ✅ Multi-device synchronization
- ✅ Persistent data storage

### Scalability
- ✅ Handle thousands of users
- ✅ Store unlimited posts and media
- ✅ Automatic backups
- ✅ Database replication

### Security
- ✅ Secure authentication
- ✅ Row-level security policies
- ✅ Encrypted data storage
- ✅ API rate limiting

## Current Limitations (localStorage)

⚠️ **Temporary Storage**: Data is stored in browser localStorage
⚠️ **Single Device**: Data doesn't sync across devices
⚠️ **Data Loss Risk**: Clearing browser cache deletes all data
⚠️ **No Real-Time**: Messages don't update in real-time
⚠️ **Size Limits**: Browser storage has size limitations
⚠️ **No Backups**: No automatic data backup

## Support

For Supabase enablement and migration support:
📧 **Contact Miaoda Official Support**

Include in your support request:
- Project ID: `app-87ml1bn52jgh`
- Application Name: SocialHub
- Request: Enable Supabase for production deployment

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
