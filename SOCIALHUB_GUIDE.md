# SocialHub - Social Networking Application

## Overview
SocialHub is a fully-featured social networking web application that enables users to share photos and videos, create temporary stories, post short-form video content (reels), communicate through messaging, and maintain personalized user profiles.

## Features Implemented

### ✅ User Authentication
- User registration with username, full name, and password
- Secure login system
- Profile management with avatar upload
- Route protection for authenticated users

### ✅ User Profiles
- Customizable profile with avatar, bio, and personal information
- Follow/unfollow functionality
- Display user's posts, stories, and reels
- View followers and following counts
- Edit profile information

### ✅ Photo & Video Sharing
- Upload photos and videos with automatic compression
- Create posts with captions and descriptions
- Add hashtags for content categorization
- Like, comment, and save posts
- View personalized feed from followed users

### ✅ Stories (24-Hour Content)
- Create temporary content that expires after 24 hours
- Add text overlays to stories
- View stories from followed users
- Track story viewers
- Automatic cleanup of expired stories

### ✅ Reels (Short-Form Videos)
- Create and upload short vertical videos
- Add captions to reels
- Dedicated reels feed for content discovery
- Like and comment on reels

### ✅ Messaging System
- Private one-on-one chat functionality
- Real-time message delivery
- Send text messages
- Conversation list with last message preview
- Message timestamps

### ✅ Content Discovery
- Explore page for discovering new content
- Search functionality for users and hashtags
- Trending hashtags section
- Grid view of all posts

### ✅ Engagement Features
- Like posts, reels, and comments
- Comment on posts and reels
- Save favorite posts for later viewing
- Follow/unfollow users
- View engagement statistics

## Design Features

### Color Scheme
- **Primary Gradient**: Purple (#833AB4) → Pink (#E1306C) → Orange (#FD1D1D)
- **Background**: Clean white (#FFFFFF) with light gray (#FAFAFA) accents
- **Text**: Dark gray (#262626) for primary, medium gray (#8E8E8E) for secondary

### Visual Design
- Rounded corners (8px radius) for modern, friendly interface
- Subtle shadows for depth and visual hierarchy
- Smooth transitions and hover effects
- Responsive grid layouts
- Card-based post display

## Technical Implementation

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui component library
- **Routing**: React Router v6
- **State Management**: React Context API
- **Date Formatting**: date-fns
- **Data Storage**: Browser localStorage (temporary solution)

### Key Features
- **Image Compression**: Automatic compression to keep files under 1MB
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Type Safety**: Full TypeScript implementation
- **Component Architecture**: Modular, reusable components
- **Route Protection**: Authentication-based access control

## Important Notes

### ⚠️ Data Persistence
This application currently uses **browser localStorage** for data storage because Supabase was unavailable during development. This means:

- All data is stored locally in your browser
- Data will be lost if you clear browser cache
- Data is not shared between devices or browsers
- This is a **prototype/demo implementation**

### 🔄 Production Deployment
For production use, you should:
1. **Contact Miaoda official support** to enable Supabase
2. Migrate from localStorage to Supabase database
3. Enable real-time features with Supabase subscriptions
4. Set up proper file storage with Supabase Storage
5. Implement proper authentication with Supabase Auth

## Getting Started

### First Time Use
1. Open the application in your browser
2. Click "Sign up" to create a new account
3. Enter a username (letters, numbers, and underscores only)
4. Enter your full name and password
5. Start exploring and creating content!

### Creating Content
- **Posts**: Click "Create" → "Post" → Upload image/video → Add caption → Create
- **Stories**: Click "Create" → "Story" → Upload media → Add text → Create
- **Reels**: Click "Create" → "Reel" → Upload video → Add caption → Create

### Social Features
- **Follow Users**: Visit their profile → Click "Follow"
- **Like Content**: Click the heart icon on posts/reels
- **Comment**: Click the comment icon → Type your comment → Post
- **Save Posts**: Click the bookmark icon to save for later
- **Message Users**: Visit their profile → Click "Message"

### Discovering Content
- **Home Feed**: See posts from users you follow
- **Explore**: Discover new content, users, and trending hashtags
- **Reels**: Browse short-form video content
- **Search**: Use the search bar to find users, posts, or hashtags

## File Structure

```
src/
├── components/
│   ├── common/
│   │   └── Header.tsx          # Navigation header
│   ├── post/
│   │   └── PostCard.tsx        # Reusable post component
│   └── ui/                     # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx         # Authentication context
├── lib/
│   ├── imageUtils.ts           # Image compression utilities
│   └── utils.ts                # General utilities
├── pages/
│   ├── HomePage.tsx            # Feed page
│   ├── ExplorePage.tsx         # Discovery page
│   ├── ReelsPage.tsx           # Reels feed
│   ├── MessagesPage.tsx        # Messaging interface
│   ├── CreatePage.tsx          # Content creation
│   ├── ProfilePage.tsx         # User profiles
│   ├── LoginPage.tsx           # Login form
│   └── RegisterPage.tsx        # Registration form
├── services/
│   ├── api.ts                  # API layer
│   └── storage.ts              # localStorage wrapper
├── types/
│   └── types.ts                # TypeScript interfaces
├── App.tsx                     # Main app component
├── routes.tsx                  # Route definitions
└── index.css                   # Design system & styles
```

## Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

## Data Privacy
Since this application uses localStorage:
- All data stays on your device
- No data is sent to external servers
- Clear browser data will delete all content
- Use incognito/private mode for temporary sessions

## Future Enhancements (Requires Supabase)
- Real-time messaging updates
- Push notifications
- Cloud storage for media files
- Multi-device synchronization
- Advanced search and filtering
- User verification badges
- Content moderation tools
- Analytics and insights

## Support
For production deployment and Supabase integration, please contact **Miaoda official support**.
