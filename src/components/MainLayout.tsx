import React, { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import { AppView, Stock } from '../types';
import { Icons } from '../constants';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from './mode-toggle';
import { cn } from '@/lib/utils';
import InfoTooltip from './InfoTooltip';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { syncTrackerData } from '../lib/api.fetcher';
import { fetchTrackerDetails } from '../store/slices/trackersSlice';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: React.ReactNode;
  stocks: Stock[];
  activeView: AppView;
  selectedStockId: string | null;
  onSelectStock: (id: string) => void;
  onCreateNew: () => void;
  onUpdateStock: (stock: Stock) => void;
  headerTitle?: string;
  headerSubtitle?: string;
  headerAction?: React.ReactNode;
  showDsipOnly: boolean;
  setShowDsipOnly: (show: boolean) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  stocks,
  activeView,
  selectedStockId,
  onSelectStock,
  onCreateNew,

  headerTitle,
  headerSubtitle,
  headerAction,
  showDsipOnly,
  setShowDsipOnly
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  // Get tracker data from Redux (must be at top level, not inside callback)
  const { selectedTracker } = useAppSelector((state) => state.trackers);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Sync Feature State
  const [showSyncPopup, setShowSyncPopup] = useState(false);
  const [syncForm, setSyncForm] = useState({ totalInvested: '', totalShares: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { toast } = useToast();

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
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

  // Handle stock selection and close mobile menu
  const handleSelectStock = (id: string) => {
    onSelectStock(id);
    setIsMobileMenuOpen(false);
  };

  const handleSync = async () => {
    const userInvested = Number(syncForm.totalInvested);
    const userShares = Number(syncForm.totalShares);

    if (!userInvested || !userShares) {
      return;
    }

    // Get tracker ID from Redux state
    const trackerId = selectedTracker?.tracker?.trackerId;

    if (!trackerId) {
      setSyncError('No tracker selected. Please select a tracker first.');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Call the sync API
      const result = await syncTrackerData({
        tracker_id: trackerId,
        current_total_shares: userShares,
        current_total_invested_amount: userInvested,
        reason: 'Manual sync from broker statement', // Hardcoded reason
      });

      if (result.success) {
        // Show success toast
        toast({
          title: 'Sync Successful',
          description: result.message,
          variant: 'default',
        });

        // Refresh tracker details to get updated data
        dispatch(fetchTrackerDetails(trackerId));

        // Close popup and reset form
        setShowSyncPopup(false);
        setSyncForm({ totalInvested: '', totalShares: '' });
      } else {
        setSyncError(result.message || 'Sync failed');
        toast({
          title: 'Sync Failed',
          description: result.message || 'Unable to sync portfolio data',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sync portfolio data';
      setSyncError(errorMessage);
      toast({
        title: 'Sync Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };




  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden font-sans">
      {/* 1. Left Sidebar - Desktop */}
      <div className="hidden md:flex h-full w-[300px] shrink-0">
        <LeftSidebar
          stocks={stocks}
          activeView={activeView}
          selectedStockId={selectedStockId}
          onSelectStock={onSelectStock}
          onCreateNew={onCreateNew}
        />
      </div>

      {/* 1b. Left Sidebar - Mobile Drawer */}
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-background border-r shadow-lg transition-transform duration-300 ease-in-out md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <LeftSidebar
          stocks={stocks}
          activeView={activeView}
          selectedStockId={selectedStockId}
          onSelectStock={handleSelectStock}
          onCreateNew={() => {
            onCreateNew();
            setIsMobileMenuOpen(false);
          }}
        />
      </div>

      {/* 2. Center Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Global Header with Divider */}
        {(headerTitle || activeView === 'DASHBOARD') && (
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

                {headerAction}
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    {headerTitle || 'Dashboard'}
                  </h1>
                  <p className="text-muted-foreground text-xs">
                    {headerSubtitle || 'Portfolio Overview & Operations'}
                  </p>
                </div>
              </div>

              {/* Right side: User Profile + Theme Toggle + Action Button */}
              <div className="flex items-center gap-2 md:gap-4">
                {activeView === 'DASHBOARD' && (
                  <Button onClick={onCreateNew} className="shadow-lg h-9 w-9 p-0 md:h-10 md:w-auto md:px-4 rounded-full md:rounded-md">
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

      {/* 3. Right Sidebar - Market Overview & Recent History */}
      {activeView === 'STOCK_DETAILS' && (
        <aside className="w-[320px] bg-background flex flex-col h-full hidden xl:flex border-l">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {selectedStockId && (() => {
                const selectedStock = stocks.find(s => s.id === selectedStockId);

                // Use tracker data from Redux (already retrieved at top level)
                const useApiData = selectedTracker !== null;
                const trackerData = useApiData ? selectedTracker?.tracker : null;

                // If neither hardcoded stock nor API data, return null
                if (!selectedStock && !useApiData) return null;

                // Calculate values from API data or hardcoded stock
                let sipQuantity = 0;
                let deployedAmount = 0;
                let manualInvested = 0;
                let currentPrice = 0;
                let history: any[] = [];

                if (useApiData && trackerData) {
                  // Use API data
                  sipQuantity = selectedTracker?.recentExecutions.reduce((acc, curr) => acc + (curr.executedAmount / (curr.executionPrice || 1)), 0) || 0;
                  deployedAmount = trackerData.total_capital_invested_so_far;
                  manualInvested = 0; // API doesn't have manual holdings
                  currentPrice = trackerData.currentPrice || 0;
                  history = selectedTracker?.recentExecutions || [];
                } else if (selectedStock) {
                  // Use hardcoded stock data
                  sipQuantity = selectedStock.history.reduce((acc, curr) => acc + (curr.amount / curr.price), 0);
                  deployedAmount = selectedStock.deployedAmount;
                  manualInvested = selectedStock.quantityOwned * selectedStock.averagePriceOwned;
                  currentPrice = selectedStock.currentPrice;
                  history = selectedStock.history;
                }

                // Conditional Logic based on Toggle
                const totalInvestedStock = showDsipOnly
                  ? deployedAmount
                  : (manualInvested + deployedAmount);

                const relevantShares = showDsipOnly
                  ? sipQuantity
                  : ((selectedStock?.quantityOwned || 0) + sipQuantity);

                const currentValueStock = relevantShares * currentPrice;
                const totalPLStock = currentValueStock - totalInvestedStock;
                const isProfitStock = totalPLStock >= 0;

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold tracking-tight">Investment</h3>
                        <p className="text-sm text-muted-foreground">Performance</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="dsip-toggle" className="text-[10px] uppercase font-bold text-muted-foreground">DSIP Only</Label>
                        <Switch
                          id="dsip-toggle"
                          checked={showDsipOnly}
                          onCheckedChange={setShowDsipOnly}
                          className="scale-75"
                        />
                      </div>
                    </div>

                    {/* Sync Button */}
                    {!showDsipOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSyncPopup(true)}
                        className="w-full h-8 text-xs bg-background hover:bg-muted border-dashed mb-2"
                      >
                        <Icons.Refresh className="mr-2 w-3.5 h-3.5" /> Sync Portfolio
                      </Button>
                    )}

                    <div className="grid gap-4">
                      <div className="p-4 rounded-xl bg-card border shadow-sm space-y-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {showDsipOnly ? "DSIP Invested" : "Total Invested"}
                          </span>
                          
                        </div>
                        <div className="text-2xl font-bold">${totalInvestedStock.toLocaleString()}</div>
                      </div>

                      <div className="p-4 rounded-xl bg-card border shadow-sm space-y-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Value</span>
                          <InfoTooltip text={showDsipOnly ? "Amount invested strictly through the DSIP Tracker." : "Total amount invested including manual holdings."} />
                        </div>
                        
                        <div className="text-2xl font-bold">${Math.round(currentValueStock).toLocaleString()}</div>
                      </div>

                      <div className={cn("p-4 rounded-xl border shadow-sm space-y-1", isProfitStock ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400")}>
                        <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">Total P&L</span>
                        <div className="text-3xl font-black tracking-tight">
                          {isProfitStock ? '+' : ''}${Math.round(totalPLStock).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-8">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Recent History
                      </h4>
                      <div className="space-y-2">
                        {(() => {
                          if (history.length === 0) {
                            return <p className="text-xs text-muted-foreground italic">No transactions recorded yet.</p>;
                          }

                          // Sort and slice history
                          const sortedHistory = [...history]
                            .sort((a, b) => {
                              const dateA = useApiData ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
                              const dateB = useApiData ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
                              return dateB - dateA;
                            })
                            .slice(0, 15);

                          return sortedHistory.map((tx, i) => {
                            // Handle both API format and hardcoded format
                            const date = useApiData ? tx.createdAt : tx.date;
                            const amount = useApiData ? tx.executedAmount : tx.amount;

                            return (
                              <div key={i} className="flex justify-between items-center p-3 border rounded-xl bg-card text-sm shadow-sm transition-colors hover:bg-accent/50">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-semibold text-muted-foreground">{new Date(date).toLocaleDateString()}</span>
                                </div>
                                <span className="font-mono font-bold">${amount.toLocaleString()}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </ScrollArea>

          {/* Sync Popup - Manual Calibration */}
          <Dialog open={showSyncPopup} onOpenChange={setShowSyncPopup}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icons.Refresh className="w-5 h-5 text-primary" />
                  Sync Portfolio
                </DialogTitle>
                <DialogDescription>
                  Manually update your total holdings to match your broker. We'll adjust the base records while keeping your current cycle intact.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Total Invested Amount ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 150000"
                    value={syncForm.totalInvested}
                    onChange={(e) => setSyncForm({ ...syncForm, totalInvested: e.target.value })}
                    className="h-11 font-mono text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Total Shares Quantity</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 50.5"
                    value={syncForm.totalShares}
                    onChange={(e) => setSyncForm({ ...syncForm, totalShares: e.target.value })}
                    className="h-11 font-mono text-lg"
                  />
                </div>

                {/* Preview Diff Calculation */}
                {(syncForm.totalInvested && syncForm.totalShares) && (
                  <div className="rounded-md bg-muted/50 p-3 text-xs space-y-1 border border-dashed">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Calculated Avg Price:</span>
                      <span className="font-mono font-bold">
                        ${(Number(syncForm.totalInvested) / Number(syncForm.totalShares)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {syncError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                    <div className="flex items-start gap-2">
                      <Icons.AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">Sync Error</p>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{syncError}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => {
                  setShowSyncPopup(false);
                  setSyncError(null);
                }}>Cancel</Button>
                <Button
                  onClick={handleSync}
                  disabled={!syncForm.totalInvested || !syncForm.totalShares || isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Update Portfolio'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </aside>
      )}
    </div>
  );
};

export default MainLayout;
