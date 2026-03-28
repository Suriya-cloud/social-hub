import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { compressImage, validateImageFile } from '@/lib/imageUtils';
import { Upload, Image as ImageIcon, Film, Sparkles } from 'lucide-react';

export default function CreatePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('post');
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (activeTab === 'post' && file.type.startsWith('image/')) {
      const error = validateImageFile(file);
      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
        return;
      }

      try {
        const compressed = await compressImage(file);
        setMediaPreview(compressed);
        setMediaFile(file);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to process image',
          variant: 'destructive',
        });
      }
    } else if (file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
        setMediaFile(file);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: 'Error',
        description: 'Please select a valid image or video file',
        variant: 'destructive',
      });
    }
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  };

  const handleCreatePost = async () => {
    if (!currentUser || !mediaPreview) {
      toast({
        title: 'Error',
        description: 'Please select a media file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const hashtags = extractHashtags(caption);
      const mediaType = mediaFile?.type.startsWith('video/') ? 'video' : 'image';
      
      api.posts.create(currentUser.id, caption, mediaPreview, mediaType, hashtags);
      
      toast({
        title: 'Success',
        description: 'Post created successfully',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateStory = async () => {
    if (!currentUser || !mediaPreview) {
      toast({
        title: 'Error',
        description: 'Please select a media file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const mediaType = mediaFile?.type.startsWith('video/') ? 'video' : 'image';
      api.stories.create(currentUser.id, mediaPreview, mediaType, caption);
      
      toast({
        title: 'Success',
        description: 'Story created successfully',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create story',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateReel = async () => {
    if (!currentUser || !mediaPreview) {
      toast({
        title: 'Error',
        description: 'Please select a video file',
        variant: 'destructive',
      });
      return;
    }

    if (!mediaFile?.type.startsWith('video/')) {
      toast({
        title: 'Error',
        description: 'Reels must be video files',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      api.reels.create(currentUser.id, mediaPreview, caption);
      
      toast({
        title: 'Success',
        description: 'Reel created successfully',
      });
      navigate('/reels');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create reel',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">Create New Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="post" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Post
                </TabsTrigger>
                <TabsTrigger value="story" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Story
                </TabsTrigger>
                <TabsTrigger value="reel" className="flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Reel
                </TabsTrigger>
              </TabsList>

              <TabsContent value="post" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="post-media">Upload Image or Video</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {mediaPreview ? (
                      <div className="relative">
                        {mediaFile?.type.startsWith('video/') ? (
                          <video src={mediaPreview} controls className="max-h-96 mx-auto rounded-lg" />
                        ) : (
                          <img src={mediaPreview} alt="Preview" className="max-h-96 mx-auto rounded-lg" />
                        )}
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setMediaPreview('');
                            setMediaFile(null);
                          }}
                        >
                          Change Media
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="post-media" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Click to upload image or video</p>
                        <input
                          id="post-media"
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="post-caption">Caption</Label>
                  <Textarea
                    id="post-caption"
                    placeholder="Write a caption... Use #hashtags"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleCreatePost}
                  disabled={!mediaPreview || isUploading}
                  className="w-full gradient-bg"
                >
                  {isUploading ? 'Creating...' : 'Create Post'}
                </Button>
              </TabsContent>

              <TabsContent value="story" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="story-media">Upload Image or Video</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {mediaPreview ? (
                      <div className="relative">
                        {mediaFile?.type.startsWith('video/') ? (
                          <video src={mediaPreview} controls className="max-h-96 mx-auto rounded-lg" />
                        ) : (
                          <img src={mediaPreview} alt="Preview" className="max-h-96 mx-auto rounded-lg" />
                        )}
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setMediaPreview('');
                            setMediaFile(null);
                          }}
                        >
                          Change Media
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="story-media" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Click to upload image or video</p>
                        <input
                          id="story-media"
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-text">Text (Optional)</Label>
                  <Textarea
                    id="story-text"
                    placeholder="Add text to your story..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleCreateStory}
                  disabled={!mediaPreview || isUploading}
                  className="w-full gradient-bg"
                >
                  {isUploading ? 'Creating...' : 'Create Story'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Stories disappear after 24 hours
                </p>
              </TabsContent>

              <TabsContent value="reel" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reel-media">Upload Video</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {mediaPreview ? (
                      <div className="relative">
                        <video src={mediaPreview} controls className="max-h-96 mx-auto rounded-lg" />
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setMediaPreview('');
                            setMediaFile(null);
                          }}
                        >
                          Change Video
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="reel-media" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Click to upload video</p>
                        <input
                          id="reel-media"
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reel-caption">Caption</Label>
                  <Textarea
                    id="reel-caption"
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCreateReel}
                  disabled={!mediaPreview || isUploading}
                  className="w-full gradient-bg"
                >
                  {isUploading ? 'Creating...' : 'Create Reel'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
