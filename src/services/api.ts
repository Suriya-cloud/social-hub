import { storage } from './storage';
import { driveStorage } from './driveStorage';
import { googleDrive } from './googleDrive';
import type {
  User,
  Post,
  Story,
  Reel,
  Comment,
  Follow,
  Conversation,
  Message,
  SavedPost,
} from '@/types/types';

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Storage adapter that uses Google Drive if signed in, otherwise localStorage
const getStorage = () => {
  return googleDrive.isSignedIn() ? driveStorage : storage;
};

export const api = {
  auth: {
    register: (username: string, password: string, fullName: string): User => {
      const users = storage.getUsers();
      
      if (users.find(u => u.username === username)) {
        throw new Error('Username already exists');
      }

      const newUser: User = {
        id: generateId(),
        username,
        email: `${username}@socialhub.com`,
        fullName,
        bio: '',
        avatar: '',
        isPrivate: false,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      storage.setUsers(users);
      storage.setCurrentUser(newUser);
      
      return newUser;
    },

    login: (username: string, password: string): User => {
      const users = storage.getUsers();
      const user = users.find(u => u.username === username);
      
      if (!user) {
        throw new Error('Invalid username or password');
      }

      storage.setCurrentUser(user);
      return user;
    },

    logout: () => {
      storage.setCurrentUser(null);
    },

    getCurrentUser: (): User | null => {
      return storage.getCurrentUser();
    },

    updateProfile: (userId: string, updates: Partial<User>): User => {
      const users = storage.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      users[userIndex] = { ...users[userIndex], ...updates };
      storage.setUsers(users);
      storage.setCurrentUser(users[userIndex]);
      
      return users[userIndex];
    },
  },

  users: {
    getById: (userId: string): User | null => {
      const users = storage.getUsers();
      return users.find(u => u.id === userId) || null;
    },

    search: (query: string): User[] => {
      const users = storage.getUsers();
      const lowerQuery = query.toLowerCase();
      return users.filter(u => 
        u.username.toLowerCase().includes(lowerQuery) ||
        u.fullName.toLowerCase().includes(lowerQuery)
      );
    },

    getAll: (): User[] => {
      return storage.getUsers();
    },
  },

  posts: {
    create: (userId: string, caption: string, mediaUrl: string, mediaType: 'image' | 'video', hashtags: string[]): Post => {
      const posts = storage.getPosts();
      const newPost: Post = {
        id: generateId(),
        userId,
        caption,
        mediaUrl,
        mediaType,
        likes: [],
        createdAt: new Date().toISOString(),
        hashtags,
      };

      posts.unshift(newPost);
      storage.setPosts(posts);
      
      return newPost;
    },

    getById: (postId: string): Post | null => {
      const posts = storage.getPosts();
      return posts.find(p => p.id === postId) || null;
    },

    getByUserId: (userId: string): Post[] => {
      const posts = storage.getPosts();
      return posts.filter(p => p.userId === userId).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    getFeed: (userId: string): Post[] => {
      const follows = storage.getFollows();
      const followingIds = follows
        .filter(f => f.followerId === userId)
        .map(f => f.followingId);
      
      followingIds.push(userId);
      
      const posts = storage.getPosts();
      return posts
        .filter(p => followingIds.includes(p.userId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    getAll: (): Post[] => {
      const posts = storage.getPosts();
      return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    like: (postId: string, userId: string): Post => {
      const posts = storage.getPosts();
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) {
        throw new Error('Post not found');
      }

      const post = posts[postIndex];
      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id !== userId);
      } else {
        post.likes.push(userId);
      }

      storage.setPosts(posts);
      return post;
    },

    delete: (postId: string): void => {
      const posts = storage.getPosts();
      const filteredPosts = posts.filter(p => p.id !== postId);
      storage.setPosts(filteredPosts);
    },
  },

  stories: {
    create: (userId: string, mediaUrl: string, mediaType: 'image' | 'video', text?: string): Story => {
      const stories = storage.getStories();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const newStory: Story = {
        id: generateId(),
        userId,
        mediaUrl,
        mediaType,
        text,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        viewers: [],
      };

      stories.unshift(newStory);
      storage.setStories(stories);
      
      return newStory;
    },

    getByUserId: (userId: string): Story[] => {
      const stories = storage.getStories();
      return stories.filter(s => s.userId === userId);
    },

    getFollowingStories: (userId: string): Story[] => {
      const follows = storage.getFollows();
      const followingIds = follows
        .filter(f => f.followerId === userId)
        .map(f => f.followingId);
      
      const stories = storage.getStories();
      return stories.filter(s => followingIds.includes(s.userId));
    },

    addViewer: (storyId: string, userId: string): Story => {
      const stories = storage.getStories();
      const storyIndex = stories.findIndex(s => s.id === storyId);
      
      if (storyIndex === -1) {
        throw new Error('Story not found');
      }

      const story = stories[storyIndex];
      if (!story.viewers.includes(userId)) {
        story.viewers.push(userId);
      }

      storage.setStories(stories);
      return story;
    },
  },

  reels: {
    create: (userId: string, videoUrl: string, caption: string): Reel => {
      const reels = storage.getReels();
      const newReel: Reel = {
        id: generateId(),
        userId,
        videoUrl,
        caption,
        likes: [],
        createdAt: new Date().toISOString(),
      };

      reels.unshift(newReel);
      storage.setReels(reels);
      
      return newReel;
    },

    getAll: (): Reel[] => {
      const reels = storage.getReels();
      return reels.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    getByUserId: (userId: string): Reel[] => {
      const reels = storage.getReels();
      return reels.filter(r => r.userId === userId);
    },

    like: (reelId: string, userId: string): Reel => {
      const reels = storage.getReels();
      const reelIndex = reels.findIndex(r => r.id === reelId);
      
      if (reelIndex === -1) {
        throw new Error('Reel not found');
      }

      const reel = reels[reelIndex];
      if (reel.likes.includes(userId)) {
        reel.likes = reel.likes.filter(id => id !== userId);
      } else {
        reel.likes.push(userId);
      }

      storage.setReels(reels);
      return reel;
    },
  },

  comments: {
    create: (userId: string, text: string, postId?: string, reelId?: string): Comment => {
      const comments = storage.getComments();
      const newComment: Comment = {
        id: generateId(),
        postId,
        reelId,
        userId,
        text,
        likes: [],
        createdAt: new Date().toISOString(),
      };

      comments.push(newComment);
      storage.setComments(comments);
      
      return newComment;
    },

    getByPostId: (postId: string): Comment[] => {
      const comments = storage.getComments();
      return comments.filter(c => c.postId === postId);
    },

    getByReelId: (reelId: string): Comment[] => {
      const comments = storage.getComments();
      return comments.filter(c => c.reelId === reelId);
    },

    like: (commentId: string, userId: string): Comment => {
      const comments = storage.getComments();
      const commentIndex = comments.findIndex(c => c.id === commentId);
      
      if (commentIndex === -1) {
        throw new Error('Comment not found');
      }

      const comment = comments[commentIndex];
      if (comment.likes.includes(userId)) {
        comment.likes = comment.likes.filter(id => id !== userId);
      } else {
        comment.likes.push(userId);
      }

      storage.setComments(comments);
      return comment;
    },
  },

  follows: {
    follow: (followerId: string, followingId: string): Follow => {
      const follows = storage.getFollows();
      
      const existing = follows.find(
        f => f.followerId === followerId && f.followingId === followingId
      );

      if (existing) {
        throw new Error('Already following');
      }

      const newFollow: Follow = {
        id: generateId(),
        followerId,
        followingId,
        createdAt: new Date().toISOString(),
      };

      follows.push(newFollow);
      storage.setFollows(follows);
      
      return newFollow;
    },

    unfollow: (followerId: string, followingId: string): void => {
      const follows = storage.getFollows();
      const filtered = follows.filter(
        f => !(f.followerId === followerId && f.followingId === followingId)
      );
      storage.setFollows(filtered);
    },

    isFollowing: (followerId: string, followingId: string): boolean => {
      const follows = storage.getFollows();
      return follows.some(
        f => f.followerId === followerId && f.followingId === followingId
      );
    },

    getFollowers: (userId: string): Follow[] => {
      const follows = storage.getFollows();
      return follows.filter(f => f.followingId === userId);
    },

    getFollowing: (userId: string): Follow[] => {
      const follows = storage.getFollows();
      return follows.filter(f => f.followerId === userId);
    },
  },

  conversations: {
    create: (participantIds: string[]): Conversation => {
      const conversations = storage.getConversations();
      
      const existing = conversations.find(c => 
        c.participants.length === participantIds.length &&
        c.participants.every(p => participantIds.includes(p))
      );

      if (existing) {
        return existing;
      }

      const newConversation: Conversation = {
        id: generateId(),
        participants: participantIds,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      conversations.push(newConversation);
      storage.setConversations(conversations);
      
      return newConversation;
    },

    getByUserId: (userId: string): Conversation[] => {
      const conversations = storage.getConversations();
      return conversations
        .filter(c => c.participants.includes(userId))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },

    getById: (conversationId: string): Conversation | null => {
      const conversations = storage.getConversations();
      return conversations.find(c => c.id === conversationId) || null;
    },
  },

  messages: {
    create: (conversationId: string, senderId: string, text?: string, mediaUrl?: string, mediaType?: 'image' | 'video'): Message => {
      const messages = storage.getMessages();
      const newMessage: Message = {
        id: generateId(),
        conversationId,
        senderId,
        text,
        mediaUrl,
        mediaType,
        createdAt: new Date().toISOString(),
      };

      messages.push(newMessage);
      storage.setMessages(messages);

      const conversations = storage.getConversations();
      const convIndex = conversations.findIndex(c => c.id === conversationId);
      if (convIndex !== -1) {
        conversations[convIndex].lastMessage = newMessage;
        conversations[convIndex].updatedAt = newMessage.createdAt;
        storage.setConversations(conversations);
      }
      
      return newMessage;
    },

    getByConversationId: (conversationId: string): Message[] => {
      const messages = storage.getMessages();
      return messages
        .filter(m => m.conversationId === conversationId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },
  },

  savedPosts: {
    save: (userId: string, postId: string): SavedPost => {
      const savedPosts = storage.getSavedPosts();
      
      const existing = savedPosts.find(
        sp => sp.userId === userId && sp.postId === postId
      );

      if (existing) {
        throw new Error('Post already saved');
      }

      const newSavedPost: SavedPost = {
        id: generateId(),
        userId,
        postId,
        createdAt: new Date().toISOString(),
      };

      savedPosts.push(newSavedPost);
      storage.setSavedPosts(savedPosts);
      
      return newSavedPost;
    },

    unsave: (userId: string, postId: string): void => {
      const savedPosts = storage.getSavedPosts();
      const filtered = savedPosts.filter(
        sp => !(sp.userId === userId && sp.postId === postId)
      );
      storage.setSavedPosts(filtered);
    },

    isSaved: (userId: string, postId: string): boolean => {
      const savedPosts = storage.getSavedPosts();
      return savedPosts.some(
        sp => sp.userId === userId && sp.postId === postId
      );
    },

    getByUserId: (userId: string): SavedPost[] => {
      const savedPosts = storage.getSavedPosts();
      return savedPosts.filter(sp => sp.userId === userId);
    },
  },
};
