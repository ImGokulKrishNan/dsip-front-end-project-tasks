import React from 'react';
import LeftSidebar from './LeftSidebar';
import { AppView, Stock } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
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

              <div className="space-y-3 pt-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Strategies</h4>
                  {stocks.map(stock => {
                    const stockInvested = (stock.quantityOwned * stock.averagePriceOwned) + stock.deployedAmount; // Approx
                    const stockValue = ((stock.quantityOwned + stock.history.reduce((a,b)=>a+(b.amount/b.price),0)) * stock.currentPrice);
                    const stockPL = stockValue - stockInvested;
                    const stockIsProfit = stockPL >= 0;

                    return (
                      <div key={stock.id} className="flex items-center justify-between text-sm p-2 hover:bg-accent rounded-lg transition-colors">
                          <div className="flex items-center gap-2">
                             <div className={cn("w-1.5 h-1.5 rounded-full", stockIsProfit ? "bg-emerald-500" : "bg-red-500")} />
                             <span className="font-medium">{stock.symbol}</span>
                          </div>
                          <span className={cn("font-bold", stockIsProfit ? "text-emerald-600" : "text-red-600")}>
                             {stockIsProfit ? '+' : ''}₹{Math.round(stockPL).toLocaleString()}
                          </span>
                      </div>
                    )
                  })}
              </div>
           </div>
         </ScrollArea>
      </aside>
    </div>
  );
};

export default MainLayout;
