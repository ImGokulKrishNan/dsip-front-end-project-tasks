import React from 'react';
import { UserProfile, Stock } from '../types';
import { Icons } from '../constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
   <TooltipProvider>
      <Tooltip>
         <TooltipTrigger asChild>
            <div className="inline-block ml-1 cursor-help opacity-70 hover:opacity-100 transition-opacity align-middle">
               <Icons.Info size={14} />
            </div>
         </TooltipTrigger>
         <TooltipContent>
            <p className="max-w-xs text-foreground">{text}</p>
         </TooltipContent>
      </Tooltip>
   </TooltipProvider>
);

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
    <div className="h-full p-6 space-y-6">
      
      {/* Main Content */}
      <div className="space-y-6">
        
        {/* Actions are removed as per request. 
            If we need to access them, we might need a dedicated page or a different entry point. 
            For now, completely removing the section. 
        */}

        {/* Portfolio Stats & Grid - Now Full Width/Centered */}
        <div className="space-y-8">
           
           <Card className="bg-primary text-primary-foreground p-6 overflow-hidden relative border-none shadow-2xl max-w-3xl mx-auto">

              <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                      Total Market Value
                      <InfoTooltip text="Market value as of yesterday's close + today's moves" />
                    </h3>
                    <p className="text-3xl font-bold tracking-tight">₹{Math.round(currentMarketValue).toLocaleString()}</p>
                  </div>
                  <div className="bg-primary-foreground/10 px-4 py-2 rounded-md backdrop-blur-sm">
                    <div className={isPortfolioProfit ? "text-emerald-300" : "text-red-300"}>
                      <span className="text-xs font-bold uppercase tracking-wider block opacity-70">Net Yield</span>
                      <span className="text-lg font-bold">
                        {isPortfolioProfit ? '+' : ''}{totalProfitLossPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
              </div>

               

              <div className="relative z-10 mt-6 grid grid-cols-3 gap-4 border-t border-primary-foreground/20 pt-6">
                 <div>
                    <p className="text-xs font-medium opacity-70 uppercase tracking-wider mb-1">Invested</p>
                    <p className="text-xl font-bold">₹{Math.round(totalInvestedValue).toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-xs font-medium opacity-70 uppercase tracking-wider mb-1">Active</p>
                    <p className="text-xl font-bold">{stocks.filter(s => !s.isPaused).length}</p>
                 </div>
              </div>
           </Card>

           <div>
              <h2 className="text-lg font-semibold tracking-tight mb-4">Strategy Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {stocks.length === 0 ? (
                    <Card className="md:col-span-2 lg:col-span-3 p-8 flex flex-col items-center justify-center text-center border-dashed bg-muted/20">
                       <p className="text-muted-foreground mb-4">No strategies deployed yet.</p>
                       <Button onClick={onAddStock} variant="outline">Create First Strategy</Button>
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
                           <CardContent className="p-4">
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


// Design 4
// import React from 'react';
// import { UserProfile, Stock } from '../types';
// import { Icons } from '../constants';
// import DailyActionCard from './DailyActionCard';

// interface DashboardProps {
//   user: UserProfile;
//   stocks: Stock[];
//   onAddStock: () => void;
//   onSelectStock: (id: string) => void;
//   onExecute: (id: string, amount: number) => void;
// }

// const ProfileIcon: React.FC<{ user: UserProfile }> = ({ user }) => (
//   <div className="group relative">
//     <div className="w-10 h-10 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 font-black cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5">
//       {user.name.charAt(0)}
//     </div>
//     <div className="absolute top-full right-0 mt-3 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all scale-95 group-hover:scale-100 z-50 shadow-2xl">
//       {user.name}
//       <div className="absolute bottom-full right-4 w-2 h-2 bg-slate-900 rotate-45 -mb-1 translate-y-1" />
//     </div>
//   </div>
// );

// const Dashboard: React.FC<DashboardProps> = ({ user, stocks, onAddStock, onSelectStock, onExecute }) => {
//   const pendingStocks = stocks.filter(stock => 
//     !stock.isPaused && 
//     !stock.history.some(h => new Date(h.date).toDateString() === new Date().toDateString())
//   );

//   let totalInvestedValue = 0;
//   let currentMarketValue = 0;

//   stocks.forEach(stock => {
//     const sipQuantity = stock.history.reduce((acc, curr) => acc + (curr.amount / curr.price), 0);
//     const totalQuantity = stock.quantityOwned + sipQuantity;
//     const stockInvestment = (stock.quantityOwned * stock.averagePriceOwned) + stock.deployedAmount;
    
//     totalInvestedValue += stockInvestment;
//     currentMarketValue += (totalQuantity * stock.currentPrice);
//   });

//   const totalProfitLossPct = totalInvestedValue > 0 
//     ? ((currentMarketValue - totalInvestedValue) / totalInvestedValue) * 100 
//     : 0;
  
//   const isPortfolioProfit = totalProfitLossPct >= 0;
//   const hasStocks = stocks.length > 0;

//   return (
//     <div className="min-h-screen p-6 md:p-12 max-w-[1200px] mx-auto space-y-12">
      
//       {/* ROW 1: Sleek Header with Integrated Capital & Actions */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-slate-100">
//         <div className="space-y-1">
//           <h1 className="text-4xl font-black text-slate-900 tracking-tightest">Strategy.</h1>
//           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Deployment Intelligence</p>
//         </div>

//         <div className="flex flex-wrap items-center gap-4 md:gap-8">
//           {/* Compact Money Park */}
//           <div className="flex items-center gap-3 group">
//             <div className="w-9 h-9 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
//               <Icons.Park />
//             </div>
//             <div>
//               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Park</p>
//               <p className="text-base font-black text-slate-900">₹{user.moneyParkBalance.toLocaleString()}</p>
//             </div>
//           </div>

//           {/* Compact Wallet */}
//           <div className="flex items-center gap-3 group">
//             <div className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
//               <Icons.Wallet />
//             </div>
//             <div>
//               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Wallet</p>
//               <p className="text-base font-black text-slate-900">₹{user.walletBalance.toLocaleString()}</p>
//             </div>
//           </div>

//           {/* New Strategy Button */}
//           <button 
//             onClick={onAddStock}
//             className="bg-slate-900 text-white rounded-xl h-11 px-5 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.97] shadow-lg shadow-slate-100 group"
//           >
//             <div className="group-hover:rotate-90 transition-transform duration-300">
//               <Icons.Plus />
//             </div>
//             <span className="text-[10px] font-black uppercase tracking-widest">New Engine</span>
//           </button>

//           <div className="pl-6 border-l border-slate-100 ml-2">
//             <ProfileIcon user={user} />
//           </div>
//         </div>
//       </div>

//       {/* ROW 2: Aggregate Portfolio (Luxurious & Conditional) */}
//       {hasStocks && (
//         <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
//           <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] relative overflow-hidden group">
//             <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-sky-50 transition-colors duration-1000" />
            
//             <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
//               <div className="space-y-2">
//                 <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Master Portfolio Appraisal</h3>
//                 <div className="flex items-baseline gap-4">
//                   <p className="text-6xl font-black text-slate-900 tracking-tighter">₹{Math.round(currentMarketValue).toLocaleString()}</p>
//                   <span className={`text-xl font-black ${isPortfolioProfit ? 'text-emerald-500' : 'text-red-500'}`}>
//                     {isPortfolioProfit ? '▲' : '▼'} {totalProfitLossPct.toFixed(2)}%
//                   </span>
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <span className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-slate-200">
//                   Precision Gating
//                 </span>
//               </div>
//             </div>

//             <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-50 pt-10">
//               <div>
//                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deployed Capital</p>
//                 <p className="text-lg font-bold text-slate-600">₹{Math.round(totalInvestedValue).toLocaleString()}</p>
//               </div>
//               <div>
//                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Variance</p>
//                 <p className={`text-lg font-bold ${isPortfolioProfit ? 'text-emerald-500' : 'text-red-500'}`}>
//                   {isPortfolioProfit ? '+' : ''}₹{Math.round(currentMarketValue - totalInvestedValue).toLocaleString()}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Engines Active</p>
//                 <p className="text-lg font-bold text-slate-900">{stocks.length}</p>
//               </div>
//               <div className="hidden md:block">
//                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Average Alpha</p>
//                 <p className="text-lg font-bold text-sky-500">94.2%</p>
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* EMPTY STATE (Conditional) */}
//       {!hasStocks && (
//         <div className="bg-white border-2 border-dashed border-slate-100 rounded-[4rem] p-24 text-center">
//           <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-10">
//             <Icons.Plus />
//           </div>
//           <h3 className="text-xl font-black text-slate-900 mb-2">No Active Strategies</h3>
//           <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-10">Mathematical partition deck is empty</p>
//           <button 
//             onClick={onAddStock}
//             className="px-12 py-5 bg-sky-500 text-white font-black rounded-2xl hover:bg-sky-600 transition-all shadow-2xl shadow-sky-100 uppercase text-xs tracking-[0.2em] active:scale-95"
//           >
//             Launch First Engine
//           </button>
//         </div>
//       )}

//       {/* ROW 3: Daily Recommendations (The Critical "Now" State) */}
//       {hasStocks && <section className="space-y-8">
//         <div className="flex justify-between items-center px-2">
//           <div className="flex items-center gap-3">
//             <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
//             <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Execution Queue</h2>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {pendingStocks.length === 0 ? (
//             <div className="lg:col-span-2 bg-white rounded-[3rem] p-16 border border-slate-100 flex flex-col items-center text-center shadow-sm">
//               <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mb-8 border border-emerald-100 shadow-inner group transition-all">
//                 <Icons.Check />
//               </div>
//               <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">System Optimal</h3>
//               <p className="text-slate-500 text-sm max-w-[320px] leading-relaxed font-medium">Your mathematical deployments for this trading cycle are fully satisfied.</p>
//             </div>
//           ) : (
//             pendingStocks.map(stock => (
//               <DailyActionCard key={stock.id} stock={stock} onExecute={onExecute} />
//             ))
//           )}
//         </div>
//       </section>}

//       {/* ROW 4: Active Portfolio Engines */}
//       {hasStocks && (
//         <section className="space-y-8">
//           <div className="flex items-center gap-3 px-2">
//              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
//              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Partition Engines</h2>
//           </div>
          
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {stocks.map(stock => {
//               const sipQuantity = stock.history.reduce((acc, curr) => acc + (curr.amount / curr.price), 0);
//               const totalQuantity = stock.quantityOwned + sipQuantity;
//               const totalInvested = (stock.quantityOwned * stock.averagePriceOwned) + stock.deployedAmount;
//               const currentAvg = totalQuantity > 0 ? totalInvested / totalQuantity : stock.currentPrice;
//               const pnlPct = currentAvg > 0 ? ((stock.currentPrice - currentAvg) / currentAvg) * 100 : 0;
//               const isStockProfit = pnlPct >= 0;

//               return (
//                 <div 
//                   key={stock.id} 
//                   onClick={() => onSelectStock(stock.id)}
//                   className="group bg-white border border-slate-100 p-8 rounded-[3rem] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden"
//                 >
//                   <div className="absolute top-0 right-0 p-8">
//                     {stock.isPaused ? (
//                       <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Standby</span>
//                     ) : (
//                       <div className="flex items-center gap-1.5">
//                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
//                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Live</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex justify-between items-start mb-10">
//                     <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center font-black text-xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
//                       {stock.symbol.substring(0, 2)}
//                     </div>
//                     <div className="text-right mt-1">
//                       <h3 className="font-black text-slate-900 text-xl tracking-tighter">{stock.symbol}</h3>
//                       <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${isStockProfit ? 'text-emerald-500' : 'text-red-500'}`}>
//                         {isStockProfit ? '+' : ''}{pnlPct.toFixed(2)}%
//                       </p>
//                     </div>
//                   </div>

//                   <div className="space-y-6">
//                     <div className="flex justify-between items-end">
//                       <div className="space-y-1">
//                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Deployment Status</p>
//                          <p className="text-2xl font-black text-slate-900">₹{stock.deployedAmount.toLocaleString()}</p>
//                       </div>
//                       <span className="text-xs font-black text-sky-600">{Math.round((stock.deployedAmount / stock.totalBudget) * 100)}%</span>
//                     </div>
//                     <div className="h-2 bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100/50">
//                       <div 
//                         className="h-full bg-sky-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(14,165,233,0.4)]"
//                         style={{ width: `${(stock.deployedAmount / stock.totalBudget) * 100}%` }}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </section>
//       )}

    
//     </div>
//   );
// };

// export default Dashboard;
