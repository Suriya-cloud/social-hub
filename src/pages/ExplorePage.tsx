import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Search, Users, Hash } from 'lucide-react';
import type { Post, User } from '@/types/types';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    const posts = api.posts.getAll();
    setAllPosts(posts);
    setFilteredPosts(posts);

    const users = api.users.getAll();
    setAllUsers(users);
    setFilteredUsers(users);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const users = api.users.search(searchQuery);
      setFilteredUsers(users);

      const posts = allPosts.filter(post => 
        post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPosts(posts);
    } else {
      setFilteredUsers(allUsers);
      setFilteredPosts(allPosts);
    }
  }, [searchQuery, allUsers, allPosts]);

  const trendingHashtags = Array.from(
    new Set(allPosts.flatMap(post => post.hashtags))
  ).slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search users, posts, or hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {filteredPosts.map(post => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    className="aspect-square cursor-pointer hover:opacity-80 transition-smooth"
                  >
                    {post.mediaType === 'image' ? (
                      <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" />
                    ) : (
                      <video src={post.mediaUrl} className="w-full h-full object-cover" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredUsers.map(user => (
                  <Link key={user.id} to={`/profile/${user.id}`}>
                    <Card className="hover:shadow-glow transition-smooth cursor-pointer">
                      <CardContent className="flex items-center gap-4 p-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="gradient-bg text-primary-foreground">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.fullName}</p>
                          {user.bio && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{user.bio}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            {trendingHashtags.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No trending hashtags yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {trendingHashtags.map(hashtag => {
                  const postsCount = allPosts.filter(post => 
                    post.hashtags.includes(hashtag)
                  ).length;

                  return (
                    <Card
                      key={hashtag}
                      className="hover:shadow-glow transition-smooth cursor-pointer"
                      onClick={() => setSearchQuery(hashtag)}
                    >
                      <CardContent className="p-4">
                        <p className="font-semibold text-lg text-primary">#{hashtag}</p>
                        <p className="text-sm text-muted-foreground">{postsCount} posts</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
