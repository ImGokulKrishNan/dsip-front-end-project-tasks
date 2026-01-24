import React from 'react';
import { Icons } from '../constants';
import { Stock, AppView } from '../types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ModeToggle } from './mode-toggle';

interface LeftSidebarProps {
  stocks: Stock[];
  activeView: AppView;
  selectedStockId: string | null;
  onSelectStock: (id: string) => void;
  onCreateNew: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  stocks, 
  activeView, 
  selectedStockId, 
  onSelectStock, 
  onCreateNew 
}) => {
  return (
    <aside className="w-[300px] flex flex-col border-r bg-background">
      {/* Header / Create CTA */}
      <div className="p-4 border-b">
        <Button 
          variant={activeView === 'ADD_STOCK' ? "default" : "outline"}
          className="w-full justify-start h-auto py-3 px-4 gap-3"
          onClick={onCreateNew}
        >
          <div className="p-1 rounded-md bg-transparent">
             <Icons.Plus />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold">Activate Stock Engine</p>
            <p className="text-[10px] opacity-70 font-normal">Create DSIP instance</p>
          </div>
        </Button>
      </div>

      {/* Active Instances List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Active Strategies</p>
          
          {stocks.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md">
              <p className="text-sm text-muted-foreground font-medium">No active strategies</p>
            </div>
          ) : (
            stocks.map(stock => {
              const isActive = activeView === 'STOCK_DETAILS' && selectedStockId === stock.id;
              const profitLossPct = stock.currentAverage > 0 
                  ? ((stock.currentPrice - stock.currentAverage) / stock.currentAverage) * 100 
                  : 0;
              const isProfit = profitLossPct >= 0;

              return (
                <button
                  key={stock.id}
                  onClick={() => onSelectStock(stock.id)}
                  className={cn(
                    "w-full p-3 rounded-md text-left border transition-all hover:bg-accent hover:text-accent-foreground group",
                    isActive 
                      ? "bg-accent text-accent-foreground border-border" // Shadcn active state style
                      : "bg-transparent border-transparent"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">
                      {stock.symbol}
                    </span>
                    {stock.isPaused && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Paused" />
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Invested</span>
                      <span className="text-xs font-mono font-medium">₹{stock.deployedAmount.toLocaleString()}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-sm",
                      isProfit ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                    )}>
                      {isProfit ? '+' : ''}{profitLossPct.toFixed(1)}%
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* User Profile / Status Bottom */}
      <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted border border-border" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Alex Investor</p>
                <p className="text-[10px] text-muted-foreground truncate">Pro Account</p>
            </div>
         </div>
         <ModeToggle />
      </div>
    </aside>
  );
};

export default LeftSidebar;
