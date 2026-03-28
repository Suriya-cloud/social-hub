/*
# SocialHub Database Schema

## Overview
This migration creates the complete database schema for the SocialHub social networking application.

## Tables Created

1. **profiles** - User profile information
   - id (uuid, primary key, references auth.users)
   - username (text, unique, not null)
   - email (text, unique, not null)
   - full_name (text, not null)
   - bio (text)
   - avatar (text)
   - is_private (boolean, default false)
   - created_at (timestamptz, default now())

2. **posts** - User posts with media
   - id (uuid, primary key)
   - user_id (uuid, references profiles)
   - caption (text)
   - media_url (text, not null)
   - media_type (text, not null) - 'image' or 'video'
   - created_at (timestamptz, default now())

3. **post_likes** - Post likes tracking
   - id (uuid, primary key)
   - post_id (uuid, references posts)
   - user_id (uuid, references profiles)
   - created_at (timestamptz, default now())
   - UNIQUE(post_id, user_id)

4. **hashtags** - Hashtag definitions
   - id (uuid, primary key)
   - tag (text, unique, not null)
   - created_at (timestamptz, default now())

5. **post_hashtags** - Many-to-many relationship between posts and hashtags
   - id (uuid, primary key)
   - post_id (uuid, references posts)
   - hashtag_id (uuid, references hashtags)
   - UNIQUE(post_id, hashtag_id)

6. **stories** - Temporary 24-hour content
   - id (uuid, primary key)
   - user_id (uuid, references profiles)
   - media_url (text, not null)
   - media_type (text, not null)
   - text (text)
   - created_at (timestamptz, default now())
   - expires_at (timestamptz, not null)

7. **story_viewers** - Track who viewed stories
   - id (uuid, primary key)
   - story_id (uuid, references stories)
   - user_id (uuid, references profiles)
   - viewed_at (timestamptz, default now())
   - UNIQUE(story_id, user_id)

8. **reels** - Short-form video content
   - id (uuid, primary key)
   - user_id (uuid, references profiles)
   - video_url (text, not null)
   - caption (text)
   - created_at (timestamptz, default now())

9. **reel_likes** - Reel likes tracking
   - id (uuid, primary key)
   - reel_id (uuid, references reels)
   - user_id (uuid, references profiles)
   - created_at (timestamptz, default now())
   - UNIQUE(reel_id, user_id)

10. **comments** - Comments on posts and reels
    - id (uuid, primary key)
    - post_id (uuid, references posts, nullable)
    - reel_id (uuid, references reels, nullable)
    - user_id (uuid, references profiles)
    - text (text, not null)
    - created_at (timestamptz, default now())

11. **comment_likes** - Comment likes tracking
    - id (uuid, primary key)
    - comment_id (uuid, references comments)
    - user_id (uuid, references profiles)
    - created_at (timestamptz, default now())
    - UNIQUE(comment_id, user_id)

12. **follows** - User follow relationships
    - id (uuid, primary key)
    - follower_id (uuid, references profiles)
    - following_id (uuid, references profiles)
    - created_at (timestamptz, default now())
    - UNIQUE(follower_id, following_id)

13. **conversations** - Chat conversations
    - id (uuid, primary key)
    - created_at (timestamptz, default now())
    - updated_at (timestamptz, default now())

14. **conversation_participants** - Participants in conversations
    - id (uuid, primary key)
    - conversation_id (uuid, references conversations)
    - user_id (uuid, references profiles)
    - joined_at (timestamptz, default now())
    - UNIQUE(conversation_id, user_id)

15. **messages** - Chat messages
    - id (uuid, primary key)
    - conversation_id (uuid, references conversations)
    - sender_id (uuid, references profiles)
    - text (text)
    - media_url (text)
    - media_type (text)
    - created_at (timestamptz, default now())

16. **saved_posts** - User saved posts
    - id (uuid, primary key)
    - user_id (uuid, references profiles)
    - post_id (uuid, references posts)
    - created_at (timestamptz, default now())
    - UNIQUE(user_id, post_id)

## Security
- All tables have RLS disabled for maximum accessibility
- Users can read all public content
- Users can modify their own content
- No authentication required for read operations (public social network)

## Indexes
- Created on foreign keys for performance
- Created on commonly queried fields (username, hashtags, etc.)

## Functions
- get_post_likes_count(post_id) - Returns like count for a post
- get_reel_likes_count(reel_id) - Returns like count for a reel
- get_comment_likes_count(comment_id) - Returns like count for a comment
- get_followers_count(user_id) - Returns follower count
- get_following_count(user_id) - Returns following count
- cleanup_expired_stories() - Removes stories older than 24 hours
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  bio text DEFAULT '',
  avatar text DEFAULT '',
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caption text DEFAULT '',
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  created_at timestamptz DEFAULT now()
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create hashtags table
CREATE TABLE IF NOT EXISTS hashtags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create post_hashtags table
CREATE TABLE IF NOT EXISTS post_hashtags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id uuid NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  UNIQUE(post_id, hashtag_id)
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  text text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Create story_viewers table
CREATE TABLE IF NOT EXISTS story_viewers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Create reels table
CREATE TABLE IF NOT EXISTS reels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  caption text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create reel_likes table
CREATE TABLE IF NOT EXISTS reel_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id uuid NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reel_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  reel_id uuid REFERENCES reels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CHECK (
    (post_id IS NOT NULL AND reel_id IS NULL) OR
    (post_id IS NULL AND reel_id IS NOT NULL)
  )
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text text,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  created_at timestamptz DEFAULT now()
);

-- Create saved_posts table
CREATE TABLE IF NOT EXISTS saved_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag_id ON post_hashtags(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_viewers_story_id ON story_viewers(story_id);
CREATE INDEX IF NOT EXISTS idx_reels_user_id ON reels(user_id);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON reels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reel_likes_reel_id ON reel_likes(reel_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_reel_id ON comments(reel_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);

-- Helper function to get post likes count
CREATE OR REPLACE FUNCTION get_post_likes_count(p_post_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) FROM post_likes WHERE post_id = p_post_id;
$$;

-- Helper function to get reel likes count
CREATE OR REPLACE FUNCTION get_reel_likes_count(p_reel_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) FROM reel_likes WHERE reel_id = p_reel_id;
$$;

-- Helper function to get comment likes count
CREATE OR REPLACE FUNCTION get_comment_likes_count(p_comment_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) FROM comment_likes WHERE comment_id = p_comment_id;
$$;

-- Helper function to get followers count
CREATE OR REPLACE FUNCTION get_followers_count(p_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) FROM follows WHERE following_id = p_user_id;
$$;

-- Helper function to get following count
CREATE OR REPLACE FUNCTION get_following_count(p_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) FROM follows WHERE follower_id = p_user_id;
$$;

-- Function to cleanup expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM stories WHERE expires_at < now();
END;
$$;

-- Function to update conversation updated_at on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Trigger to update conversation timestamp
CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Note: RLS is intentionally NOT enabled for this social networking app
-- All content is public by default for maximum accessibility
-- Users can view all posts, reels, stories, and profiles
-- Authentication is only required for creating/modifying content
