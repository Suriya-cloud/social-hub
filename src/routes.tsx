import type { ReactNode } from 'react';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ReelsPage from './pages/ReelsPage';
import MessagesPage from './pages/MessagesPage';
import CreatePage from './pages/CreatePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  requiresAuth?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
    requiresAuth: true,
  },
  {
    name: 'Explore',
    path: '/explore',
    element: <ExplorePage />,
    requiresAuth: true,
  },
  {
    name: 'Reels',
    path: '/reels',
    element: <ReelsPage />,
    requiresAuth: true,
  },
  {
    name: 'Messages',
    path: '/messages',
    element: <MessagesPage />,
    requiresAuth: true,
  },
  {
    name: 'Messages Conversation',
    path: '/messages/:conversationId',
    element: <MessagesPage />,
    requiresAuth: true,
    visible: false,
  },
  {
    name: 'Create',
    path: '/create',
    element: <CreatePage />,
    requiresAuth: true,
  },
  {
    name: 'Profile',
    path: '/profile/:userId',
    element: <ProfilePage />,
    requiresAuth: true,
    visible: false,
  },
  {
    name: 'Settings',
    path: '/settings',
    element: <SettingsPage />,
    requiresAuth: true,
    visible: false,
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false,
  },
  {
    name: 'Register',
    path: '/register',
    element: <RegisterPage />,
    visible: false,
  },
];

export default routes;
