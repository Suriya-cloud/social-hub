import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Post, User, Comment } from '@/types/types';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser?.id || ''));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [isSaved, setIsSaved] = useState(
    currentUser ? api.savedPosts.isSaved(currentUser.id, post.id) : false
  );
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [author, setAuthor] = useState<User | null>(null);

  useEffect(() => {
    const user = api.users.getById(post.userId);
    setAuthor(user);
    const postComments = api.comments.getByPostId(post.id);
    setComments(postComments);
  }, [post.userId, post.id]);

  const handleLike = () => {
    if (!currentUser) return;

    try {
      api.posts.like(post.id, currentUser.id);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to like post',
        variant: 'destructive',
      });
    }
  };

  const handleSave = () => {
    if (!currentUser) return;

    try {
      if (isSaved) {
        api.savedPosts.unsave(currentUser.id, post.id);
        setIsSaved(false);
        toast({
          title: 'Success',
          description: 'Post removed from saved',
        });
      } else {
        api.savedPosts.save(currentUser.id, post.id);
        setIsSaved(true);
        toast({
          title: 'Success',
          description: 'Post saved',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive',
      });
    }
  };

  const handleComment = () => {
    if (!currentUser || !commentText.trim()) return;

    try {
      const newComment = api.comments.create(currentUser.id, commentText, post.id);
      setComments([...comments, newComment]);
      setCommentText('');
      toast({
        title: 'Success',
        description: 'Comment added',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <Link to={`/profile/${author?.id}`} className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author?.avatar} alt={author?.username} />
            <AvatarFallback className="gradient-bg text-primary-foreground">
              {author?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{author?.username}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {post.mediaType === 'image' ? (
          <img
            src={post.mediaUrl}
            alt={post.caption}
            className="w-full aspect-square object-cover"
          />
        ) : (
          <video
            src={post.mediaUrl}
            controls
            className="w-full aspect-square object-cover"
          />
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start p-4 gap-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={isLiked ? 'text-accent' : ''}
            >
              <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className={isSaved ? 'text-accent' : ''}
          >
            <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="w-full">
          <p className="font-semibold text-sm mb-1">{likesCount} likes</p>
          {post.caption && (
            <p className="text-sm">
              <Link to={`/profile/${author?.id}`} className="font-semibold mr-2">
                {author?.username}
              </Link>
              {post.caption}
            </p>
          )}
          {post.hashtags.length > 0 && (
            <p className="text-sm text-primary mt-1">
              {post.hashtags.map(tag => `#${tag}`).join(' ')}
            </p>
          )}
        </div>

        {showComments && (
          <div className="w-full space-y-3 border-t border-border pt-3">
            {comments.map(comment => {
              const commentAuthor = api.users.getById(comment.userId);
              return (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={commentAuthor?.avatar} alt={commentAuthor?.username} />
                    <AvatarFallback className="text-xs">
                      {commentAuthor?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <Link to={`/profile/${commentAuthor?.id}`} className="font-semibold mr-2">
                        {commentAuthor?.username}
                      </Link>
                      {comment.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              />
              <Button onClick={handleComment} disabled={!commentText.trim()}>
                Post
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
