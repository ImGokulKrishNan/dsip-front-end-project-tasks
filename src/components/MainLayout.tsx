import React from 'react';
import LeftSidebar from './LeftSidebar';
import { AppView, Stock } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ModeToggle } from './mode-toggle';
// import { Separator } from '@/components/ui/separator';

interface MainLayoutProps {
  children: React.ReactNode;
  stocks: Stock[];
  activeView: AppView;
  selectedStockId: string | null;
  onSelectStock: (id: string) => void;
  onCreateNew: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  stocks, 
  activeView, 
  selectedStockId, 
  onSelectStock, 
  onCreateNew 
}) => {
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
      <main className="flex-1 flex flex-col min-w-0 border-r bg-background relative">
        <ScrollArea className="flex-1 w-full h-full"> 
             {children}
        </ScrollArea>
      </main>

      {/* 3. Right Sidebar */}
      <aside className="w-[320px] bg-background flex flex-col h-full hidden xl:flex border-l">
         <ScrollArea className="flex-1">
           <div className="p-6 space-y-6">
              {/* User Profile / Theme Toggle - Top Right */}
              <div className="p-4 border rounded-xl bg-muted/30 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted border border-border" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Jaya Bhuvanesh</p>
                        <p className="text-[10px] text-muted-foreground truncate">Pro Account</p>
                    </div>
                 </div>
                 <ModeToggle />
              </div>

              {/* Only show Market Overview and Recent History when viewing stock details */}
              {activeView === 'STOCK_DETAILS' && (
                <>
                  <div className="space-y-1">
                      <h3 className="text-lg font-bold tracking-tight">Market Overview</h3>
                      <p className="text-sm text-muted-foreground">Portfolio Performance</p>
                  </div>

                  <div className="grid gap-4">
                      <div className="p-4 rounded-xl bg-card border shadow-sm space-y-3">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Invested</span>
                          <div className="text-2xl font-bold">₹{totalInvested.toLocaleString()}</div>
                      </div>

                      <div className="p-4 rounded-xl bg-card border shadow-sm space-y-3">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Value</span>
                          <div className="text-2xl font-bold">₹{Math.round(currentValue).toLocaleString()}</div>
                      </div>

                      <div className={cn("p-4 rounded-xl border shadow-sm space-y-1", isProfit ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400")}>
                          <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">Total P&L</span>
                          <div className="text-3xl font-black tracking-tight">
                            {isProfit ? '+' : ''}₹{Math.round(totalPL).toLocaleString()}
                          </div>
                      </div>
                  </div>

                  <div className="space-y-3 pt-8">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                         Recent History
                      </h4>
                      <div className="space-y-2">
                         {(() => {
                            let history = selectedStockId
                               ? (stocks.find(s => s.id === selectedStockId)?.history || []).map(t => ({ ...t, symbol: stocks.find(s => s.id === selectedStockId)?.symbol }))
                               : [];

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
              )}
           </div>
         </ScrollArea>
      </aside>
    </div>
  );
};

export default MainLayout;
