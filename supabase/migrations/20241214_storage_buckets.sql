/*
# Storage Buckets for SocialHub

## Buckets Created

1. **app-87ml1bn52jgh_avatars** - User profile pictures
   - Max file size: 1MB
   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
   - Public access for reading

2. **app-87ml1bn52jgh_posts** - Post images and videos
   - Max file size: 10MB
   - Allowed MIME types: image/*, video/*
   - Public access for reading

3. **app-87ml1bn52jgh_stories** - Story media
   - Max file size: 10MB
   - Allowed MIME types: image/*, video/*
   - Public access for reading

4. **app-87ml1bn52jgh_reels** - Reel videos
   - Max file size: 50MB
   - Allowed MIME types: video/*
   - Public access for reading

5. **app-87ml1bn52jgh_messages** - Message media
   - Max file size: 10MB
   - Allowed MIME types: image/*, video/*
   - Public access for reading

## Policies
- All users can upload to any bucket
- All users can read from any bucket
- Users can delete their own uploads
*/

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-87ml1bn52jgh_avatars',
  'app-87ml1bn52jgh_avatars',
  true,
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create posts bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-87ml1bn52jgh_posts',
  'app-87ml1bn52jgh_posts',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Create stories bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-87ml1bn52jgh_stories',
  'app-87ml1bn52jgh_stories',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Create reels bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-87ml1bn52jgh_reels',
  'app-87ml1bn52jgh_reels',
  true,
  52428800, -- 50MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Create messages bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-87ml1bn52jgh_messages',
  'app-87ml1bn52jgh_messages',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can upload avatars"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'app-87ml1bn52jgh_avatars');

CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-87ml1bn52jgh_avatars');

CREATE POLICY "Anyone can update avatars"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'app-87ml1bn52jgh_avatars');

CREATE POLICY "Anyone can delete avatars"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'app-87ml1bn52jgh_avatars');

-- Storage policies for posts bucket
CREATE POLICY "Anyone can upload posts"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'app-87ml1bn52jgh_posts');

CREATE POLICY "Anyone can read posts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-87ml1bn52jgh_posts');

CREATE POLICY "Anyone can update posts"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'app-87ml1bn52jgh_posts');

CREATE POLICY "Anyone can delete posts"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'app-87ml1bn52jgh_posts');

-- Storage policies for stories bucket
CREATE POLICY "Anyone can upload stories"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'app-87ml1bn52jgh_stories');

CREATE POLICY "Anyone can read stories"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-87ml1bn52jgh_stories');

CREATE POLICY "Anyone can update stories"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'app-87ml1bn52jgh_stories');

CREATE POLICY "Anyone can delete stories"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'app-87ml1bn52jgh_stories');

-- Storage policies for reels bucket
CREATE POLICY "Anyone can upload reels"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'app-87ml1bn52jgh_reels');

CREATE POLICY "Anyone can read reels"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-87ml1bn52jgh_reels');

CREATE POLICY "Anyone can update reels"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'app-87ml1bn52jgh_reels');

CREATE POLICY "Anyone can delete reels"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'app-87ml1bn52jgh_reels');

-- Storage policies for messages bucket
CREATE POLICY "Anyone can upload message media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'app-87ml1bn52jgh_messages');

CREATE POLICY "Anyone can read message media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-87ml1bn52jgh_messages');

CREATE POLICY "Anyone can update message media"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'app-87ml1bn52jgh_messages');

CREATE POLICY "Anyone can delete message media"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'app-87ml1bn52jgh_messages');
