import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Search, PlusSquare, Film, MessageCircle, User, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-elegant">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-2xl font-bold gradient-text">
            SocialHub
          </Link>

          <nav className="hidden xl:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-smooth">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link to="/explore" className="flex items-center gap-2 text-foreground hover:text-primary transition-smooth">
              <Search className="w-5 h-5" />
              <span>Explore</span>
            </Link>
            <Link to="/reels" className="flex items-center gap-2 text-foreground hover:text-primary transition-smooth">
              <Film className="w-5 h-5" />
              <span>Reels</span>
            </Link>
            <Link to="/messages" className="flex items-center gap-2 text-foreground hover:text-primary transition-smooth">
              <MessageCircle className="w-5 h-5" />
              <span>Messages</span>
            </Link>
            <Link to="/create" className="flex items-center gap-2 text-foreground hover:text-primary transition-smooth">
              <PlusSquare className="w-5 h-5" />
              <span>Create</span>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <nav className="flex xl:hidden items-center gap-4">
              <Link to="/" className="text-foreground hover:text-primary transition-smooth">
                <Home className="w-6 h-6" />
              </Link>
              <Link to="/explore" className="text-foreground hover:text-primary transition-smooth">
                <Search className="w-6 h-6" />
              </Link>
              <Link to="/reels" className="text-foreground hover:text-primary transition-smooth">
                <Film className="w-6 h-6" />
              </Link>
              <Link to="/messages" className="text-foreground hover:text-primary transition-smooth">
                <MessageCircle className="w-6 h-6" />
              </Link>
              <Link to="/create" className="text-foreground hover:text-primary transition-smooth">
                <PlusSquare className="w-6 h-6" />
              </Link>
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.username} />
                    <AvatarFallback className="gradient-bg text-primary-foreground">
                      {currentUser?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate(`/profile/${currentUser?.id}`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
