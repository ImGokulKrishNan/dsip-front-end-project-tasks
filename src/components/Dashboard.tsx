import React from 'react';
import { UserProfile, Stock } from '../types';
import { Icons } from '../constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import InfoTooltip from './InfoTooltip';

interface DashboardProps {
   user: UserProfile;
   stocks: Stock[];
   onAddStock: () => void;
   onSelectStock: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, stocks, onAddStock, onSelectStock }) => {


   let totalInvestedValue = 0;
   let currentMarketValue = 0;

   stocks.forEach(stock => {
      const sipQuantity = stock.history.reduce((acc, curr) => acc + (curr.amount / curr.price), 0);
      const totalQuantity = stock.quantityOwned + sipQuantity;
      const stockInvestment = (stock.quantityOwned * stock.averagePriceOwned) + stock.deployedAmount;

      totalInvestedValue += stockInvestment;
      currentMarketValue += (totalQuantity * stock.currentPrice);
   });

   const totalProfitLossPct = totalInvestedValue > 0
      ? ((currentMarketValue - totalInvestedValue) / totalInvestedValue) * 100
      : 0;

   const isPortfolioProfit = totalProfitLossPct >= 0;

   return (
      <div className="h-full p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

         {/* Header Section */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
               <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
               <p className="text-muted-foreground text-sm">Portfolio Overview & Operations</p>
            </div>

            <div className="flex flex-wrap gap-4">
               <Button onClick={onAddStock} size="lg" className="shadow-lg">
                  <Icons.Plus />
                  <span className="ml-2">Activate Stock Engine</span>
               </Button>
            </div>
         </div>

         <Separator />

         {/* Main Content */}
         <div className="max-w-4xl mx-auto space-y-8">

            {/* Actions are removed as per request. 
            If we need to access them, we might need a dedicated page or a different entry point. 
            For now, completely removing the section. 
        */}

            {/* Portfolio Stats & Grid - Now Full Width/Centered */}
            <div className="space-y-8">

               <Card className="relative overflow-hidden border shadow-xl bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black dark:border-gray-800">
                  {/* Decorative Elements */}
                  {/* <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Icons.Activity size={100} />
                  </div> */}
                  <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                  <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

                  <div className="relative z-10 p-8">
                     <div className="flex justify-between items-start">
                        <div>
                           <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              Total Market Value
                              <InfoTooltip text="Market value as of yesterday's close + today's moves" />
                           </h3>
                           <p className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                              ₹{Math.round(currentMarketValue).toLocaleString()}
                           </p>
                        </div>
                        <div className="bg-background/50 border shadow-sm px-4 py-2 rounded-xl backdrop-blur-md">
                           <div className={isPortfolioProfit ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-400"}>
                              <span className="text-[10px] font-bold uppercase tracking-wider block text-muted-foreground mb-0.5">Net Yield</span>
                              <span className="text-xl font-black flex items-center gap-1">
                                 {isPortfolioProfit ? <Icons.TrendUp size={16} /> : <Icons.TrendDown size={16} />}
                                 {totalProfitLossPct.toFixed(2)}%
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div className="space-y-1">
                           <p className="text-[10px] Font-bold text-muted-foreground uppercase tracking-widest">Invested Capital</p>
                           <p className="text-2xl font-bold text-foreground">₹{Math.round(totalInvestedValue).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] Font-bold text-muted-foreground uppercase tracking-widest">Active Engines</p>
                           <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-foreground">{stocks.filter(s => !s.isPaused).length}</span>
                              <span className="text-xs text-muted-foreground font-medium self-end mb-1">/ {stocks.length} Total</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </Card>

               <div>
                  <h2 className="text-lg font-semibold tracking-tight mb-4">Stock Engine Performance</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {stocks.length === 0 ? (
                        <Card className="col-span-2 p-8 flex flex-col items-center justify-center text-center border-dashed bg-muted/20">
                           <p className="text-muted-foreground mb-4">No stock engines deployed yet.</p>
                           <Button onClick={onAddStock} variant="outline">Create First Stock Engine</Button>
                        </Card>
                     ) : (
                        stocks.map(stock => {
                           const sipQuantity = stock.history.reduce((acc, curr) => acc + (curr.amount / curr.price), 0);
                           const totalQuantity = stock.quantityOwned + sipQuantity;
                           const totalInvested = (stock.quantityOwned * stock.averagePriceOwned) + stock.deployedAmount;
                           const currentAvg = totalQuantity > 0 ? totalInvested / totalQuantity : stock.currentPrice;
                           const pnlPct = currentAvg > 0 ? ((stock.currentPrice - currentAvg) / currentAvg) * 100 : 0;
                           const isStockProfit = pnlPct >= 0;

                           return (
                              <Card
                                 key={stock.id}
                                 className="cursor-pointer hover:bg-accent/50 transition-colors group"
                                 onClick={() => onSelectStock(stock.id)}
                              >
                                 <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center font-bold text-secondary-foreground">
                                             {stock.symbol.substring(0, 2)}
                                          </div>
                                          <div>
                                             <h4 className="font-bold leading-none">{stock.symbol}</h4>
                                             <span className={isStockProfit ? "text-emerald-600 dark:text-emerald-400 text-xs font-bold" : "text-red-600 dark:text-red-400 text-xs font-bold"}>
                                                {isStockProfit ? '+' : ''}{pnlPct.toFixed(2)}%
                                             </span>
                                          </div>
                                       </div>
                                       {stock.isPaused && <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-sm">Paused</span>}
                                    </div>
                                    <div className="space-y-2 pt-2">
                                       <div className="flex justify-between items-end text-xs">
                                          <span className="text-muted-foreground font-medium uppercase tracking-wider">Deployment</span>
                                          <span className="font-bold text-primary">
                                             {((stock.deployedAmount / stock.totalBudget) * 100).toFixed(1)}%
                                          </span>
                                       </div>
                                       <div className="h-4 w-full bg-secondary/50 rounded-full overflow-hidden relative shadow-inner border border-black/5">
                                          <div
                                             className="h-full bg-blue-500 transition-all duration-500 ease-out"
                                             style={{ width: `${Math.min((stock.deployedAmount / stock.totalBudget) * 100, 100)}%` }}
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground/40 mix-blend-difference">
                                             ₹{stock.deployedAmount.toLocaleString()} / ₹{stock.totalBudget.toLocaleString()}
                                          </div>
                                       </div>

                                       <Button
                                          className="w-full mt-4 h-8 text-xs font-bold uppercase tracking-wider"
                                          size="sm"
                                          onClick={(e) => {
                                             e.stopPropagation(); // Prevent card click
                                             onSelectStock(stock.id);
                                          }}
                                       >
                                          <Icons.Zap className="w-3 h-3 mr-2" /> Execute
                                       </Button>
                                    </div>
                                 </CardContent>
                              </Card>
                           );
                        })
                     )}
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
};

export default Dashboard;
