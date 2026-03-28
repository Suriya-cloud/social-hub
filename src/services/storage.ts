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

const STORAGE_KEYS = {
  USERS: 'socialhub_users',
  POSTS: 'socialhub_posts',
  STORIES: 'socialhub_stories',
  REELS: 'socialhub_reels',
  COMMENTS: 'socialhub_comments',
  FOLLOWS: 'socialhub_follows',
  CONVERSATIONS: 'socialhub_conversations',
  MESSAGES: 'socialhub_messages',
  SAVED_POSTS: 'socialhub_saved_posts',
  CURRENT_USER: 'socialhub_current_user',
};

export const storage = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  setUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getPosts: (): Post[] => {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    return data ? JSON.parse(data) : [];
  },

  setPosts: (posts: Post[]) => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  },

  getStories: (): Story[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STORIES);
    const stories = data ? JSON.parse(data) : [];
    const now = new Date().getTime();
    const validStories = stories.filter((story: Story) => new Date(story.expiresAt).getTime() > now);
    if (validStories.length !== stories.length) {
      storage.setStories(validStories);
    }
    return validStories;
  },

  setStories: (stories: Story[]) => {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
  },

  getReels: (): Reel[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REELS);
    return data ? JSON.parse(data) : [];
  },

  setReels: (reels: Reel[]) => {
    localStorage.setItem(STORAGE_KEYS.REELS, JSON.stringify(reels));
  },

  getComments: (): Comment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    return data ? JSON.parse(data) : [];
  },

  setComments: (comments: Comment[]) => {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  },

  getFollows: (): Follow[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FOLLOWS);
    return data ? JSON.parse(data) : [];
  },

  setFollows: (follows: Follow[]) => {
    localStorage.setItem(STORAGE_KEYS.FOLLOWS, JSON.stringify(follows));
  },

  getConversations: (): Conversation[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  },

  setConversations: (conversations: Conversation[]) => {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  },

  getMessages: (): Message[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  },

  setMessages: (messages: Message[]) => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },

  getSavedPosts: (): SavedPost[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_POSTS);
    return data ? JSON.parse(data) : [];
  },

  setSavedPosts: (savedPosts: SavedPost[]) => {
    localStorage.setItem(STORAGE_KEYS.SAVED_POSTS, JSON.stringify(savedPosts));
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  clear: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};
