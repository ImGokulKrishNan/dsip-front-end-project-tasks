import React, { useState, useEffect } from 'react';
import { useNavigate, useMatch, useLocation } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import { Icons } from '../constants';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from './mode-toggle';
import { cn } from '@/lib/utils';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { setSelectedStock, setTempStrategyConfig } from '../store/slices/stocksSlice';
import { fetchTrackerDetails } from '../store/slices/trackersSlice';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const trackerMatch = useMatch('/tracker/:id');

  // Derive active view from route
  const isHome = location.pathname === '/home';
  const isTracker = !!trackerMatch;
  const selectedStockId = trackerMatch?.params.id ?? null;

  // Redux state
  const user = useAppSelector(state => state.auth.user);
  const { stocks } = useAppSelector(state => state.stocks);

  // Derive header content from route
  const headerStock = isTracker ? stocks.find(s => s.id === selectedStockId) : null;
  const headerTitle = isTracker
    ? `${headerStock?.symbol || ''} Tracker`
    : isHome
      ? 'Home'
      : undefined;
  const headerSubtitle = isTracker
    ? 'Daily Smart Investment Execution'
    : isHome
      ? 'Portfolio Overview & Operations'
      : undefined;

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSelectStock = (id: string) => {
    dispatch(setSelectedStock(id));
    const trackerId = parseInt(id);
    if (!isNaN(trackerId)) {
      dispatch(fetchTrackerDetails(trackerId));
    }
    navigate(`/tracker/${id}`);
  };

  const handleCreateNew = () => {
    dispatch(setSelectedStock(null));
    dispatch(setTempStrategyConfig(undefined));
    navigate('/create-tracker');
  };



  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleMobileSelectStock = (id: string) => {
    handleSelectStock(id);
    setIsMobileMenuOpen(false);
  };



  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden font-sans">
      {/* 1. Left Sidebar - Desktop */}
      <div className="hidden md:flex h-full w-[300px] shrink-0">
        <LeftSidebar
          stocks={stocks}
          onSelectStock={handleSelectStock}
          onCreateNew={handleCreateNew}
        />
      </div>

      {/* 1b. Left Sidebar - Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-background border-r shadow-lg transition-transform duration-300 ease-in-out md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <LeftSidebar
          stocks={stocks}
          onSelectStock={handleMobileSelectStock}
          onCreateNew={() => {
            handleCreateNew();
            setIsMobileMenuOpen(false);
          }}
        />
      </div>

      {/* 2. Center Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Global Header with Divider */}
        {(headerTitle || isHome) && (
          <>
            <div className="px-6 py-4 flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                {/* Mobile Hamburger Menu */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden -ml-2"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Icons.Menu className="h-6 w-6" />
                </Button>

                {isTracker && (
                  <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
                    <Icons.ArrowLeft size={18} />
                  </Button>
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    {headerTitle || 'Home'}
                  </h1>
                  <p className="text-muted-foreground text-xs">
                    {headerSubtitle || 'Portfolio Overview & Operations'}
                  </p>
                </div>
              </div>

              {/* Right side: User Profile + Theme Toggle + Action Button */}
              <div className="flex items-center gap-2 md:gap-4">
                <div className='xl:hidden'>
                  <ModeToggle />
                </div>

                {isHome && (
                  <Button onClick={handleCreateNew} className="shadow-lg h-9 w-9 p-0 md:h-10 md:w-auto md:px-4 rounded-full md:rounded-md">
                    <Icons.Plus className="h-5 w-5" />
                    <span className="ml-2 hidden md:inline">Activate Stock Engine</span>
                  </Button>
                )}

                {/* User Profile */}
                <div className="hidden xl:flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 border">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="" className="w-8 h-8 rounded-full border border-border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold border border-border">
                      {user?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email || ''}</p>
                  </div>
                  <ModeToggle />
                  <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        <ScrollArea className="flex-1 w-full h-full">
          {children}
        </ScrollArea>
      </main>
    </div>
  );
};

export default MainLayout;
