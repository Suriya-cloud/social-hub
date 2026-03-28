import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Reel, User } from '@/types/types';
import { formatDistanceToNow } from 'date-fns';

export default function ReelsPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [reels, setReels] = useState<Reel[]>([]);
  const [reelAuthors, setReelAuthors] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    const allReels = api.reels.getAll();
    setReels(allReels);

    const authorsMap = new Map<string, User>();
    allReels.forEach(reel => {
      const author = api.users.getById(reel.userId);
      if (author) {
        authorsMap.set(reel.userId, author);
      }
    });
    setReelAuthors(authorsMap);
  }, []);

  const handleLike = (reelId: string) => {
    if (!currentUser) return;

    try {
      const updatedReel = api.reels.like(reelId, currentUser.id);
      setReels(reels.map(r => r.id === reelId ? updatedReel : r));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to like reel',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-3xl font-bold gradient-text mb-6">Reels</h1>

        {reels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No reels yet. Be the first to create one!</p>
            <Link to="/create">
              <Button className="gradient-bg">Create Reel</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reels.map(reel => {
              const author = reelAuthors.get(reel.userId);
              const isLiked = reel.likes.includes(currentUser?.id || '');

              return (
                <div key={reel.id} className="bg-card rounded-lg shadow-elegant overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <Link to={`/profile/${author?.id}`}>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={author?.avatar} alt={author?.username} />
                        <AvatarFallback className="gradient-bg text-primary-foreground">
                          {author?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <Link to={`/profile/${author?.id}`}>
                        <p className="font-semibold text-sm">{author?.username}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reel.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="relative bg-black">
                    <video
                      src={reel.videoUrl}
                      controls
                      className="w-full max-h-[600px] mx-auto"
                      style={{ aspectRatio: '9/16' }}
                    />
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLike(reel.id)}
                        className={isLiked ? 'text-accent' : ''}
                      >
                        <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                      </Button>
                      <span className="text-sm font-semibold">{reel.likes.length} likes</span>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="h-6 w-6" />
                      </Button>
                    </div>

                    {reel.caption && (
                      <p className="text-sm">
                        <Link to={`/profile/${author?.id}`} className="font-semibold mr-2">
                          {author?.username}
                        </Link>
                        {reel.caption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
