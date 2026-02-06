import React from 'react';
import LeftSidebar from './LeftSidebar';
import { AppView, Stock } from '../types';
import { Icons } from '../constants';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from './mode-toggle';
import { cn } from '@/lib/utils';
import InfoTooltip from './InfoTooltip';
import { useAuth } from '../contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface MainLayoutProps {
  children: React.ReactNode;
  stocks: Stock[];
  activeView: AppView;
  selectedStockId: string | null;
  onSelectStock: (id: string) => void;
  onCreateNew: () => void;
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
  const { user, logout } = useAuth();

  // Calculate Global Stats
  const totalInvested = stocks.reduce((acc, stock) => {
    const historicalInvested = stock.history.reduce((hAcc, t) => hAcc + t.amount, 0);
    const initialInvested = stock.quantityOwned * stock.averagePriceOwned;
    return acc + historicalInvested + initialInvested;
  }, 0);

  const currentValue = stocks.reduce((acc, stock) => {
    const sipQuantity = stock.history.reduce((qAcc, t) => qAcc + (t.amount / t.price), 0);
    const totalQuantity = stock.quantityOwned + sipQuantity;
    return acc + (totalQuantity * stock.currentPrice);
  }, 0);

  const totalPL = currentValue - totalInvested;
  const isProfit = totalPL >= 0;

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden font-sans">
      {/* 1. Left Sidebar */}
      <LeftSidebar
        stocks={stocks}
        activeView={activeView}
        selectedStockId={selectedStockId}
        onSelectStock={onSelectStock}
        onCreateNew={onCreateNew}
      />

      {/* 2. Center Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Global Header with Divider */}
        {(headerTitle || activeView === 'DASHBOARD') && (
          <>
            <div className="px-6 py-4 flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                {headerAction}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {headerTitle || 'Dashboard'}
                  </h1>
                  <p className="text-muted-foreground text-xs">
                    {headerSubtitle || 'Portfolio Overview & Operations'}
                  </p>
                </div>
              </div>

              {/* Right side: User Profile + Theme Toggle + Action Button */}
              <div className="flex items-center gap-4">
                {activeView === 'DASHBOARD' && (
                  <Button onClick={onCreateNew} className="shadow-lg">
                    <Icons.Plus />
                    <span className="ml-2">Activate Stock Engine</span>
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
                  <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
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
                if (!selectedStock) return null;

                // Independent Calculations
                const sipQuantity = selectedStock.history.reduce((acc, curr) => acc + (curr.amount / curr.price), 0);
                const deployedAmount = selectedStock.deployedAmount; // DSIP Only Invested
                const manualInvested = selectedStock.quantityOwned * selectedStock.averagePriceOwned;

                // Conditional Logic based on Toggle
                const totalInvestedStock = showDsipOnly
                  ? deployedAmount
                  : (manualInvested + deployedAmount);

                const relevantShares = showDsipOnly
                  ? sipQuantity
                  : (selectedStock.quantityOwned + sipQuantity);

                const currentValueStock = relevantShares * selectedStock.currentPrice;
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

                    <div className="grid gap-4">
                      <div className="p-4 rounded-xl bg-card border shadow-sm space-y-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {showDsipOnly ? "DSIP Invested" : "Total Invested"}
                          </span>
                          <InfoTooltip text={showDsipOnly ? "Amount invested strictly through the DSIP Tracker." : "Total amount invested including manual holdings."} />
                        </div>
                        <div className="text-2xl font-bold">₹{totalInvestedStock.toLocaleString()}</div>
                      </div>

                      <div className="p-4 rounded-xl bg-card border shadow-sm space-y-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Value</span>
                        </div>
                        <div className="text-2xl font-bold">₹{Math.round(currentValueStock).toLocaleString()}</div>
                      </div>

                      <div className={cn("p-4 rounded-xl border shadow-sm space-y-1", isProfitStock ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400")}>
                        <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">Total P&L</span>
                        <div className="text-3xl font-black tracking-tight">
                          {isProfitStock ? '+' : ''}₹{Math.round(totalPLStock).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-8">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Recent History
                      </h4>
                      <div className="space-y-2">
                        {(() => {
                          let history = selectedStock.history;

                          // Ensure Newest First
                          history = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);

                          if (history.length === 0) {
                            return <p className="text-xs text-muted-foreground italic">No transactions recorded yet.</p>;
                          }

                          return history.map((tx, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border rounded-xl bg-card text-sm shadow-sm transition-colors hover:bg-accent/50">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</span>
                              </div>
                              <span className="font-mono font-bold">₹{tx.amount.toLocaleString()}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </ScrollArea>
        </aside>
      )}
    </div>
  );
};

export default MainLayout;
