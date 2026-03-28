# SocialHub Database Schema Summary

## Overview
Complete database schema for a full-featured social networking application with posts, stories, reels, messaging, and social interactions.

## Database Tables (16 Total)

### 1. User Management

#### profiles
Primary user information table
- `id` (uuid, PK) - User identifier
- `username` (text, unique) - Unique username
- `email` (text, unique) - User email
- `full_name` (text) - Display name
- `bio` (text) - User biography
- `avatar` (text) - Profile picture URL
- `is_private` (boolean) - Account privacy setting
- `created_at` (timestamptz) - Account creation date

**Relationships:**
- Referenced by: posts, stories, reels, comments, follows, messages, saved_posts

---

### 2. Content Tables

#### posts
User posts with images or videos
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `caption` (text) - Post description
- `media_url` (text) - Image/video URL
- `media_type` (text) - 'image' or 'video'
- `created_at` (timestamptz)

**Relationships:**
- Belongs to: profiles (user_id)
- Has many: post_likes, comments, post_hashtags, saved_posts

#### stories
Temporary 24-hour content
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `media_url` (text)
- `media_type` (text)
- `text` (text) - Optional text overlay
- `created_at` (timestamptz)
- `expires_at` (timestamptz) - Auto-delete after 24 hours

**Relationships:**
- Belongs to: profiles (user_id)
- Has many: story_viewers

#### reels
Short-form video content
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `video_url` (text)
- `caption` (text)
- `created_at` (timestamptz)

**Relationships:**
- Belongs to: profiles (user_id)
- Has many: reel_likes, comments

---

### 3. Engagement Tables

#### post_likes
Track post likes
- `id` (uuid, PK)
- `post_id` (uuid, FK → posts)
- `user_id` (uuid, FK → profiles)
- `created_at` (timestamptz)
- UNIQUE(post_id, user_id) - One like per user per post

#### reel_likes
Track reel likes
- `id` (uuid, PK)
- `reel_id` (uuid, FK → reels)
- `user_id` (uuid, FK → profiles)
- `created_at` (timestamptz)
- UNIQUE(reel_id, user_id)

#### comment_likes
Track comment likes
- `id` (uuid, PK)
- `comment_id` (uuid, FK → comments)
- `user_id` (uuid, FK → profiles)
- `created_at` (timestamptz)
- UNIQUE(comment_id, user_id)

#### comments
Comments on posts and reels
- `id` (uuid, PK)
- `post_id` (uuid, FK → posts, nullable)
- `reel_id` (uuid, FK → reels, nullable)
- `user_id` (uuid, FK → profiles)
- `text` (text) - Comment content
- `created_at` (timestamptz)
- CHECK: Must have either post_id OR reel_id, not both

**Relationships:**
- Belongs to: profiles (user_id), posts (post_id) OR reels (reel_id)
- Has many: comment_likes

---

### 4. Hashtag System

#### hashtags
Hashtag definitions
- `id` (uuid, PK)
- `tag` (text, unique) - Hashtag text without #
- `created_at` (timestamptz)

#### post_hashtags
Many-to-many relationship between posts and hashtags
- `id` (uuid, PK)
- `post_id` (uuid, FK → posts)
- `hashtag_id` (uuid, FK → hashtags)
- UNIQUE(post_id, hashtag_id)

---

### 5. Social Features

#### follows
User follow relationships
- `id` (uuid, PK)
- `follower_id` (uuid, FK → profiles) - User who follows
- `following_id` (uuid, FK → profiles) - User being followed
- `created_at` (timestamptz)
- UNIQUE(follower_id, following_id)
- CHECK: follower_id != following_id (can't follow yourself)

#### story_viewers
Track who viewed stories
- `id` (uuid, PK)
- `story_id` (uuid, FK → stories)
- `user_id` (uuid, FK → profiles)
- `viewed_at` (timestamptz)
- UNIQUE(story_id, user_id)

#### saved_posts
User saved/bookmarked posts
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `post_id` (uuid, FK → posts)
- `created_at` (timestamptz)
- UNIQUE(user_id, post_id)

---

### 6. Messaging System

#### conversations
Chat conversation containers
- `id` (uuid, PK)
- `created_at` (timestamptz)
- `updated_at` (timestamptz) - Auto-updated on new message

#### conversation_participants
Users in conversations
- `id` (uuid, PK)
- `conversation_id` (uuid, FK → conversations)
- `user_id` (uuid, FK → profiles)
- `joined_at` (timestamptz)
- UNIQUE(conversation_id, user_id)

#### messages
Chat messages
- `id` (uuid, PK)
- `conversation_id` (uuid, FK → conversations)
- `sender_id` (uuid, FK → profiles)
- `text` (text, nullable) - Text message
- `media_url` (text, nullable) - Media attachment
- `media_type` (text, nullable) - 'image' or 'video'
- `created_at` (timestamptz)

---

## Database Functions

### Helper Functions

#### get_post_likes_count(post_id)
Returns the number of likes for a post
```sql
SELECT get_post_likes_count('post-uuid');
```

#### get_reel_likes_count(reel_id)
Returns the number of likes for a reel
```sql
SELECT get_reel_likes_count('reel-uuid');
```

#### get_comment_likes_count(comment_id)
Returns the number of likes for a comment
```sql
SELECT get_comment_likes_count('comment-uuid');
```

#### get_followers_count(user_id)
Returns the number of followers for a user
```sql
SELECT get_followers_count('user-uuid');
```

#### get_following_count(user_id)
Returns the number of users a user is following
```sql
SELECT get_following_count('user-uuid');
```

#### cleanup_expired_stories()
Deletes stories older than 24 hours
```sql
SELECT cleanup_expired_stories();
```

### Triggers

#### update_conversation_timestamp
Automatically updates `conversations.updated_at` when a new message is inserted
- Trigger: AFTER INSERT ON messages
- Updates: conversations.updated_at = NEW.created_at

---

## Indexes for Performance

### Posts
- `idx_posts_user_id` - Fast user post queries
- `idx_posts_created_at` - Chronological ordering

### Likes
- `idx_post_likes_post_id` - Count likes per post
- `idx_post_likes_user_id` - User's liked posts
- `idx_reel_likes_reel_id` - Count likes per reel

### Hashtags
- `idx_hashtags_tag` - Fast hashtag search
- `idx_post_hashtags_post_id` - Post hashtags
- `idx_post_hashtags_hashtag_id` - Posts by hashtag

### Stories
- `idx_stories_user_id` - User stories
- `idx_stories_expires_at` - Cleanup expired stories
- `idx_story_viewers_story_id` - Story view count

### Social
- `idx_follows_follower_id` - User's following list
- `idx_follows_following_id` - User's followers list

### Messaging
- `idx_conversation_participants_conversation_id` - Conversation members
- `idx_conversation_participants_user_id` - User's conversations
- `idx_messages_conversation_id` - Messages in conversation
- `idx_messages_created_at` - Message ordering

---

## Storage Buckets (5 Total)

### 1. app-87ml1bn52jgh_avatars
- **Purpose**: User profile pictures
- **Max Size**: 1MB
- **Types**: image/jpeg, image/png, image/webp, image/gif
- **Access**: Public read, authenticated write

### 2. app-87ml1bn52jgh_posts
- **Purpose**: Post images and videos
- **Max Size**: 10MB
- **Types**: image/*, video/*
- **Access**: Public read, authenticated write

### 3. app-87ml1bn52jgh_stories
- **Purpose**: Story media (24-hour content)
- **Max Size**: 10MB
- **Types**: image/*, video/*
- **Access**: Public read, authenticated write

### 4. app-87ml1bn52jgh_reels
- **Purpose**: Short-form videos
- **Max Size**: 50MB
- **Types**: video/*
- **Access**: Public read, authenticated write

### 5. app-87ml1bn52jgh_messages
- **Purpose**: Message attachments
- **Max Size**: 10MB
- **Types**: image/*, video/*
- **Access**: Public read, authenticated write

---

## Security Model

### Row Level Security (RLS)
**Status**: Disabled for all tables

**Rationale**: This is a public social networking platform where:
- All content is public by default
- Users can view all posts, stories, reels, and profiles
- Authentication is only required for creating/modifying content
- Maximum accessibility for content discovery

### Storage Security
- All buckets are public for reading
- All authenticated users can upload
- File size and type restrictions enforced at bucket level

---

## Data Relationships Diagram

```
profiles (users)
├── posts (1:many)
│   ├── post_likes (1:many)
│   ├── comments (1:many)
│   │   └── comment_likes (1:many)
│   ├── post_hashtags (many:many via hashtags)
│   └── saved_posts (1:many)
├── stories (1:many)
│   └── story_viewers (1:many)
├── reels (1:many)
│   ├── reel_likes (1:many)
│   └── comments (1:many)
├── follows (self-referential many:many)
├── conversation_participants (many:many via conversations)
└── messages (1:many)
```

---

## Query Examples

### Get User Feed
```sql
-- Get posts from followed users
SELECT p.*, pr.username, pr.avatar,
       (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
       (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
FROM posts p
JOIN profiles pr ON p.user_id = pr.id
WHERE p.user_id IN (
  SELECT following_id FROM follows WHERE follower_id = 'current-user-id'
)
ORDER BY p.created_at DESC
LIMIT 20;
```

### Get Trending Hashtags
```sql
-- Get most used hashtags
SELECT h.tag, COUNT(ph.post_id) as post_count
FROM hashtags h
JOIN post_hashtags ph ON h.id = ph.hashtag_id
GROUP BY h.id, h.tag
ORDER BY post_count DESC
LIMIT 10;
```

### Get User Profile Stats
```sql
-- Get user statistics
SELECT 
  p.*,
  (SELECT COUNT(*) FROM posts WHERE user_id = p.id) as posts_count,
  (SELECT COUNT(*) FROM follows WHERE following_id = p.id) as followers_count,
  (SELECT COUNT(*) FROM follows WHERE follower_id = p.id) as following_count
FROM profiles p
WHERE p.id = 'user-id';
```

### Get Active Stories
```sql
-- Get non-expired stories from followed users
SELECT s.*, pr.username, pr.avatar
FROM stories s
JOIN profiles pr ON s.user_id = pr.id
WHERE s.expires_at > NOW()
  AND s.user_id IN (
    SELECT following_id FROM follows WHERE follower_id = 'current-user-id'
  )
ORDER BY s.created_at DESC;
```

---

## Maintenance Tasks

### Scheduled Jobs (Recommended)

1. **Story Cleanup** (Run every hour)
```sql
SELECT cleanup_expired_stories();
```

2. **Database Vacuum** (Run weekly)
```sql
VACUUM ANALYZE;
```

3. **Index Maintenance** (Run monthly)
```sql
REINDEX DATABASE socialhub;
```

---

## Migration Status

✅ **Schema Ready**: All SQL files prepared
✅ **Storage Ready**: Bucket configurations complete
⚠️ **Supabase Unavailable**: Waiting for service enablement

**Next Steps:**
1. Contact Miaoda support to enable Supabase
2. Apply migrations automatically
3. Update application code to use Supabase
4. Test all features with real database
5. Deploy to production

---

## Technical Specifications

- **Database**: PostgreSQL (via Supabase)
- **Total Tables**: 16
- **Total Indexes**: 20+
- **Total Functions**: 6
- **Total Triggers**: 1
- **Storage Buckets**: 5
- **Estimated Size**: Scales to millions of records
- **Performance**: Optimized for social media workloads
