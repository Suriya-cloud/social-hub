import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import PostCard from '@/components/post/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { Post, Story, User } from '@/types/types';

export default function HomePage() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [storyUsers, setStoryUsers] = useState<User[]>([]);

  useEffect(() => {
    if (currentUser) {
      const feedPosts = api.posts.getFeed(currentUser.id);
      setPosts(feedPosts);

      const followingStories = api.stories.getFollowingStories(currentUser.id);
      setStories(followingStories);

      const uniqueUserIds = Array.from(new Set(followingStories.map(s => s.userId)));
      const users = uniqueUserIds.map(id => api.users.getById(id)).filter(Boolean) as User[];
      setStoryUsers(users);
    }
  }, [currentUser]);

  const handleStoryClick = (userId: string) => {
    const userStories = stories.filter(s => s.userId === userId);
    if (userStories.length > 0 && currentUser) {
      api.stories.addViewer(userStories[0].id, currentUser.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {storyUsers.length > 0 && (
          <div className="mb-6 bg-card rounded-lg p-4 shadow-elegant">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {storyUsers.map(user => (
                <Link
                  key={user.id}
                  to={`/stories/${user.id}`}
                  onClick={() => handleStoryClick(user.id)}
                  className="flex flex-col items-center gap-2 min-w-fit"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full p-0.5 gradient-bg">
                      <Avatar className="w-full h-full border-2 border-card">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="gradient-bg text-primary-foreground">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <span className="text-xs text-center max-w-[64px] truncate">
                    {user.username}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No posts yet. Follow users to see their posts!</p>
              <Link to="/explore">
                <Button className="gradient-bg">Explore</Button>
              </Link>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} post={post} onUpdate={() => {
                const feedPosts = api.posts.getFeed(currentUser!.id);
                setPosts(feedPosts);
              }} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
