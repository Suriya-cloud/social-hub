import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Grid3x3, Film, Bookmark, Settings } from 'lucide-react';
import { compressImage, validateImageFile } from '@/lib/imageUtils';
import type { User, Post, Reel } from '@/types/types';

export default function ProfilePage() {
  const { userId } = useParams();
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    if (userId) {
      const fetchedUser = api.users.getById(userId);
      setUser(fetchedUser);

      if (fetchedUser) {
        const userPosts = api.posts.getByUserId(userId);
        setPosts(userPosts);

        const userReels = api.reels.getByUserId(userId);
        setReels(userReels);

        if (currentUser) {
          const following = api.follows.isFollowing(currentUser.id, userId);
          setIsFollowing(following);

          if (currentUser.id === userId) {
            const saved = api.savedPosts.getByUserId(currentUser.id);
            const savedPostsData = saved
              .map(sp => api.posts.getById(sp.postId))
              .filter(Boolean) as Post[];
            setSavedPosts(savedPostsData);
          }
        }

        const followers = api.follows.getFollowers(userId);
        setFollowersCount(followers.length);

        const following = api.follows.getFollowing(userId);
        setFollowingCount(following.length);

        setEditForm({
          fullName: fetchedUser.fullName,
          bio: fetchedUser.bio,
          avatar: fetchedUser.avatar,
        });
      }
    }
  }, [userId, currentUser]);

  const handleFollow = () => {
    if (!currentUser || !userId) return;

    try {
      if (isFollowing) {
        api.follows.unfollow(currentUser.id, userId);
        setIsFollowing(false);
        setFollowersCount(followersCount - 1);
        toast({
          title: 'Success',
          description: `Unfollowed ${user?.username}`,
        });
      } else {
        api.follows.follow(currentUser.id, userId);
        setIsFollowing(true);
        setFollowersCount(followersCount + 1);
        toast({
          title: 'Success',
          description: `Following ${user?.username}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      setEditForm({ ...editForm, avatar: compressed });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process image',
        variant: 'destructive',
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      await updateProfile(editForm);
      setUser({ ...currentUser, ...editForm });
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleMessage = () => {
    if (!currentUser || !userId) return;
    const conversation = api.conversations.create([currentUser.id, userId]);
    navigate(`/messages/${conversation.id}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-card rounded-lg p-6 shadow-elegant mb-6">
          <div className="flex flex-col xl:flex-row items-center xl:items-start gap-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="gradient-bg text-primary-foreground text-4xl">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center xl:text-left">
              <div className="flex flex-col xl:flex-row items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold">{user.username}</h1>
                {isOwnProfile ? (
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="avatar">Profile Picture</Label>
                          <div className="flex items-center gap-4">
                            <Avatar className="w-20 h-20">
                              <AvatarImage src={editForm.avatar} alt={user.username} />
                              <AvatarFallback className="gradient-bg text-primary-foreground">
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <label htmlFor="avatar">
                              <Button variant="outline" type="button" onClick={() => document.getElementById('avatar')?.click()}>
                                Change Photo
                              </Button>
                              <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={editForm.fullName}
                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={editForm.bio}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleSaveProfile} className="w-full gradient-bg">
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleFollow}
                      className={isFollowing ? '' : 'gradient-bg'}
                      variant={isFollowing ? 'outline' : 'default'}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                    <Button variant="outline" onClick={handleMessage}>
                      Message
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-center xl:justify-start gap-8 mb-4">
                <div className="text-center">
                  <p className="font-bold text-lg">{posts.length}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{followersCount}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{followingCount}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-1">{user.fullName}</p>
                {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="reels" className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              Reels
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Saved
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {posts.map(post => (
                  <div key={post.id} className="aspect-square cursor-pointer hover:opacity-80 transition-smooth">
                    {post.mediaType === 'image' ? (
                      <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" />
                    ) : (
                      <video src={post.mediaUrl} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reels" className="mt-6">
            {reels.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No reels yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {reels.map(reel => (
                  <div key={reel.id} className="aspect-[9/16] cursor-pointer hover:opacity-80 transition-smooth">
                    <video src={reel.videoUrl} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="saved" className="mt-6">
              {savedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No saved posts yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {savedPosts.map(post => (
                    <div key={post.id} className="aspect-square cursor-pointer hover:opacity-80 transition-smooth">
                      {post.mediaType === 'image' ? (
                        <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" />
                      ) : (
                        <video src={post.mediaUrl} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
