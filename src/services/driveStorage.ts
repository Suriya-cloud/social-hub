/**
 * Drive Storage Service
 * 
 * This service provides a storage interface using Google Drive as the backend.
 * It maintains the same API as the localStorage storage but persists data to the cloud.
 */

import { googleDrive } from './googleDrive';
import type { User, Post, Story, Reel, Comment, Follow, Conversation, Message, SavedPost } from '@/types/types';

// File names for different data types
const FILES = {
  USERS: 'users.json',
  POSTS: 'posts.json',
  STORIES: 'stories.json',
  REELS: 'reels.json',
  COMMENTS: 'comments.json',
  POST_LIKES: 'post_likes.json',
  REEL_LIKES: 'reel_likes.json',
  COMMENT_LIKES: 'comment_likes.json',
  FOLLOWS: 'follows.json',
  CONVERSATIONS: 'conversations.json',
  MESSAGES: 'messages.json',
  SAVED_POSTS: 'saved_posts.json',
};

interface Like {
  id: string;
  postId?: string;
  reelId?: string;
  commentId?: string;
  userId: string;
  createdAt: string;
}

class DriveStorageService {
  private cache: Map<string, any> = new Map();
  private syncInProgress = false;

  /**
   * Initialize and sync with Google Drive
   */
  async init(): Promise<void> {
    if (!googleDrive.isSignedIn()) {
      throw new Error('Not signed in to Google Drive');
    }
    await this.syncFromDrive();
  }

  /**
   * Sync all data from Google Drive to local cache
   */
  private async syncFromDrive(): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const [
        users,
        posts,
        stories,
        reels,
        comments,
        postLikes,
        reelLikes,
        commentLikes,
        follows,
        conversations,
        messages,
        savedPosts,
      ] = await Promise.all([
        googleDrive.readFile<User[]>(FILES.USERS, []),
        googleDrive.readFile<Post[]>(FILES.POSTS, []),
        googleDrive.readFile<Story[]>(FILES.STORIES, []),
        googleDrive.readFile<Reel[]>(FILES.REELS, []),
        googleDrive.readFile<Comment[]>(FILES.COMMENTS, []),
        googleDrive.readFile<Like[]>(FILES.POST_LIKES, []),
        googleDrive.readFile<Like[]>(FILES.REEL_LIKES, []),
        googleDrive.readFile<Like[]>(FILES.COMMENT_LIKES, []),
        googleDrive.readFile<Follow[]>(FILES.FOLLOWS, []),
        googleDrive.readFile<Conversation[]>(FILES.CONVERSATIONS, []),
        googleDrive.readFile<Message[]>(FILES.MESSAGES, []),
        googleDrive.readFile<SavedPost[]>(FILES.SAVED_POSTS, []),
      ]);

      this.cache.set(FILES.USERS, users);
      this.cache.set(FILES.POSTS, posts);
      this.cache.set(FILES.STORIES, stories);
      this.cache.set(FILES.REELS, reels);
      this.cache.set(FILES.COMMENTS, comments);
      this.cache.set(FILES.POST_LIKES, postLikes);
      this.cache.set(FILES.REEL_LIKES, reelLikes);
      this.cache.set(FILES.COMMENT_LIKES, commentLikes);
      this.cache.set(FILES.FOLLOWS, follows);
      this.cache.set(FILES.CONVERSATIONS, conversations);
      this.cache.set(FILES.MESSAGES, messages);
      this.cache.set(FILES.SAVED_POSTS, savedPosts);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Write data to both cache and Google Drive
   */
  private async writeData<T>(fileName: string, data: T): Promise<void> {
    this.cache.set(fileName, data);
    await googleDrive.writeFile(fileName, data);
  }

  /**
   * Get data from cache (with fallback to Drive)
   */
  private async getData<T>(fileName: string, defaultValue: T): Promise<T> {
    if (this.cache.has(fileName)) {
      return this.cache.get(fileName) as T;
    }
    const data = await googleDrive.readFile<T>(fileName, defaultValue);
    this.cache.set(fileName, data);
    return data;
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.getData<User[]>(FILES.USERS, []);
  }

  async setUsers(users: User[]): Promise<void> {
    await this.writeData(FILES.USERS, users);
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    return this.getData<Post[]>(FILES.POSTS, []);
  }

  async setPosts(posts: Post[]): Promise<void> {
    await this.writeData(FILES.POSTS, posts);
  }

  // Stories
  async getStories(): Promise<Story[]> {
    return this.getData<Story[]>(FILES.STORIES, []);
  }

  async setStories(stories: Story[]): Promise<void> {
    await this.writeData(FILES.STORIES, stories);
  }

  // Reels
  async getReels(): Promise<Reel[]> {
    return this.getData<Reel[]>(FILES.REELS, []);
  }

  async setReels(reels: Reel[]): Promise<void> {
    await this.writeData(FILES.REELS, reels);
  }

  // Comments
  async getComments(): Promise<Comment[]> {
    return this.getData<Comment[]>(FILES.COMMENTS, []);
  }

  async setComments(comments: Comment[]): Promise<void> {
    await this.writeData(FILES.COMMENTS, comments);
  }

  // Post Likes
  async getPostLikes(): Promise<Like[]> {
    return this.getData<Like[]>(FILES.POST_LIKES, []);
  }

  async setPostLikes(likes: Like[]): Promise<void> {
    await this.writeData(FILES.POST_LIKES, likes);
  }

  // Reel Likes
  async getReelLikes(): Promise<Like[]> {
    return this.getData<Like[]>(FILES.REEL_LIKES, []);
  }

  async setReelLikes(likes: Like[]): Promise<void> {
    await this.writeData(FILES.REEL_LIKES, likes);
  }

  // Comment Likes
  async getCommentLikes(): Promise<Like[]> {
    return this.getData<Like[]>(FILES.COMMENT_LIKES, []);
  }

  async setCommentLikes(likes: Like[]): Promise<void> {
    await this.writeData(FILES.COMMENT_LIKES, likes);
  }

  // Follows
  async getFollows(): Promise<Follow[]> {
    return this.getData<Follow[]>(FILES.FOLLOWS, []);
  }

  async setFollows(follows: Follow[]): Promise<void> {
    await this.writeData(FILES.FOLLOWS, follows);
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return this.getData<Conversation[]>(FILES.CONVERSATIONS, []);
  }

  async setConversations(conversations: Conversation[]): Promise<void> {
    await this.writeData(FILES.CONVERSATIONS, conversations);
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    return this.getData<Message[]>(FILES.MESSAGES, []);
  }

  async setMessages(messages: Message[]): Promise<void> {
    await this.writeData(FILES.MESSAGES, messages);
  }

  // Saved Posts
  async getSavedPosts(): Promise<SavedPost[]> {
    return this.getData<SavedPost[]>(FILES.SAVED_POSTS, []);
  }

  async setSavedPosts(savedPosts: SavedPost[]): Promise<void> {
    await this.writeData(FILES.SAVED_POSTS, savedPosts);
  }

  /**
   * Clear all cached data and force re-sync
   */
  async refresh(): Promise<void> {
    this.cache.clear();
    await this.syncFromDrive();
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clearAll(): Promise<void> {
    this.cache.clear();
    await googleDrive.clearAllData();
  }
}

export const driveStorage = new DriveStorageService();
