export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  avatar: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  likes: string[];
  createdAt: string;
  hashtags: string[];
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  text?: string;
  createdAt: string;
  expiresAt: string;
  viewers: string[];
}

export interface Reel {
  id: string;
  userId: string;
  videoUrl: string;
  caption: string;
  likes: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  postId?: string;
  reelId?: string;
  userId: string;
  text: string;
  likes: string[];
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
}

export interface SavedPost {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}
