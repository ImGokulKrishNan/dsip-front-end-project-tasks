import React, { useState } from 'react';
import { Icons } from '../constants';
import { Stock } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StockDetailsProps {
   stock: Stock;
   onBack: () => void;
   onUpdate: (stock: Stock) => void;
}

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
   <TooltipProvider>
      <Tooltip>
         <TooltipTrigger asChild>
            <div className="inline-block ml-1 cursor-help opacity-70 hover:opacity-100 transition-opacity align-middle">
               <Icons.Info size={14} />
            </div>
         </TooltipTrigger>
         <TooltipContent>
            <p className="max-w-xs">{text}</p>
         </TooltipContent>
      </Tooltip>
   </TooltipProvider>
);

const StockDetails: React.FC<StockDetailsProps> = ({ stock, onBack, onUpdate }) => {
   // Execution State: 'IDLE' -> 'CALCULATED' -> 'CONFIRMING'
   const [executionState, setExecutionState] = useState<'IDLE' | 'CALCULATED' | 'CONFIRMING'>('IDLE');

   // Daily Context Inputs
   const [lockInPct, setLockInPct] = useState<string>('');
   const [convictionOverride, setConvictionOverride] = useState<number[]>([0]); // 0 means neutral/unchanged

   // Calculated Recommendation (Mock)
   const [recommendation, setRecommendation] = useState<{ amount: number; price: number; shares: number } | null>(null);

   // Final Confirmation Inputs
   const [executedAmount, setExecutedAmount] = useState<string>('');
   const [executionPrice, setExecutionPrice] = useState<string>('');

   // Derived Stats
   const totalInvested = (stock.quantityOwned * stock.averagePriceOwned) + stock.deployedAmount;
   const sipQuantity = stock.history.reduce((acc, curr) => acc + (curr.amount / curr.price), 0);
   const totalShares = stock.quantityOwned + sipQuantity;
   const avgBuyPrice = totalShares > 0 ? totalInvested / totalShares : 0;

   // Progress Mocks (In real app, comes from backend)
   const currentCycle = stock.currentCycle || 2;
   const totalCycles = stock.totalCycles || 18;
   const daysInvested = stock.daysInvested || 14;
   const cycleLength = stock.partitionDays; // e.g. 60
   const daysRemaining = cycleLength - (daysInvested % cycleLength);

   const handleCalculate = () => {
      // Mock Calculation Logic based on spec
      // In reality, this would call the "Daily Calculation API"
      const refPrice = stock.currentPrice * (1 + (Number(lockInPct) / 100)); // Apply lock-in context
      const baseAmount = stock.totalBudget / (stock.convictionYears * 250); // Daily spread roughly
      const adjustedAmount = Math.round(baseAmount * (1 + (convictionOverride[0] / 10))); // Adjust by conviction

      setRecommendation({
         amount: Math.max(500, adjustedAmount), // Min floor
         price: refPrice,
         shares: adjustedAmount / refPrice
      });
      setExecutionState('CALCULATED');

      // Pre-fill confirmation inputs for UX convenience
      setExecutedAmount(Math.max(500, adjustedAmount).toString());
      setExecutionPrice(refPrice.toFixed(2));
   };

   const handleConfirm = () => {
      // Mock Execution API
      const newTx = {
         date: new Date().toISOString(),
         amount: Number(executedAmount),
         price: Number(executionPrice),
         type: 'SIP' as const
      };

      const updatedStock = {
         ...stock,
         deployedAmount: stock.deployedAmount + newTx.amount,
         daysInvested: (stock.daysInvested || 0) + 1,
         history: [...stock.history, newTx]
      };

      onUpdate(updatedStock);
      setExecutionState('IDLE');
      setLockInPct('');
      setConvictionOverride([0]);
      setRecommendation(null);
   };

   return (
      <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">

         {/* Header */}
         <div className="p-6 border-b flex items-center justify-between bg-background/95 backdrop-blur z-20 sticky top-0">
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={onBack}>
                  <Icons.ArrowLeft size={20} />
               </Button>
               <div>
                  <h1 className="text-2xl font-bold tracking-tight">{stock.symbol} Tracker</h1>
                  <p className="text-xs text-muted-foreground">Daily Smart Investment Execution</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="h-7 px-3 text-xs font-mono">
                  Tracker Active
               </Badge>
            </div>
         </div>

         <ScrollArea className="flex-1">
            <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 pb-32">

               {/* 1. Daily Execution Zone */}
               <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/30">
                        <Icons.Zap size={18} />
                     </div>
                     <h2 className="text-xl font-bold">Today's Execution</h2>
                  </div>

                  {executionState === 'IDLE' && (
                     <Card className="border-l-4 border-l-primary shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader>
                           <CardTitle>Market Context</CardTitle>
                           <CardDescription>Enter today's price conditions to generate your smart order.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                           {/* Lock-In Context */}
                           <div className="space-y-3">
                              <Label className="font-bold flex items-center gap-2">
                                 Current Price Change (%)  [lock in %]
                                 <InfoTooltip text="Approximate change at the moment you are ready to buy." />
                              </Label>
                              <div className="relative max-w-sm">
                                 <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="-2.4"
                                    className="h-14 text-2xl font-bold pl-4 pr-12"
                                    value={lockInPct}
                                    onChange={e => setLockInPct(e.target.value)}
                                    autoFocus
                                 />
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                 Tip: If red, lock early. If green, you may wait closer to close.
                              </p>
                           </div>

                           {/* Conviction Override */}
                           <div className="space-y-4 max-w-md">
                              <div className="flex justify-between items-center">
                                 <Label className="flex items-center gap-2 text-muted-foreground">
                                    Conviction Adjustment (Optional) [x factor]
                                    <InfoTooltip text="Only use if today's news significantly changes your view." />
                                 </Label>
                                 <Badge variant={convictionOverride[0] === 0 ? "secondary" : "default"}>
                                    {convictionOverride[0] === 0 ? "Neutral" : (convictionOverride[0] > 0 ? "Stronger" : "Weaker")}
                                 </Badge>
                              </div>
                              <Slider
                                 min={-5}
                                 max={5}
                                 step={1}
                                 value={convictionOverride}
                                 onValueChange={setConvictionOverride}
                                 className="py-2"
                              />
                              <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground px-1">
                                 <span>Low Confidence</span>
                                 <span>Neutral</span>
                                 <span>High Confidence</span>
                              </div>
                           </div>

                           <div className="pt-4 flex gap-4">
                              <Button size="lg" className="w-full md:w-auto min-w-[200px] text-lg h-12 shadow-md" onClick={handleCalculate} disabled={!lockInPct}>
                                 <Icons.TrendUp className="mr-2 w-5 h-5" /> Calculate Amount
                              </Button>
                              <Button variant="ghost" size="lg" className="text-muted-foreground">
                                 Skip Today
                              </Button>
                           </div>

                        </CardContent>
                     </Card>
                  )}

                  {executionState === 'CALCULATED' && recommendation && (
                     <Card className="border-l-4 border-l-emerald-500 shadow-xl animate-in fade-in zoom-in-95 duration-300">
                        <CardHeader className="bg-emerald-500/5 pb-4">
                           <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                              <Icons.Check className="w-5 h-5" /> Recommendation Generated
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                              <div className="space-y-1">
                                 <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Recommended Amount</p>
                                 <div className="text-5xl font-black text-foreground tracking-tighter">
                                    ₹{recommendation.amount.toLocaleString()}
                                 </div>
                                 <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span className="bg-muted px-1.5 py-0.5 rounded text-xs">Ref Price: ₹{recommendation.price.toFixed(2)}</span>
                                    <span>~ {recommendation.shares.toFixed(2)} shares</span>
                                 </p>
                              </div>

                              <div className="border rounded-xl p-4 bg-muted/30 space-y-2">
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">New Projected Avg</span>
                                    <span className="font-bold">₹{((totalInvested + recommendation.amount) / (totalShares + recommendation.shares)).toFixed(2)}</span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Remaining in Cycle</span>
                                    <span className="font-bold">₹{(stock.totalBudget / 4 - stock.deployedAmount % (stock.totalBudget / 4)).toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Cycle Days Left</span>
                                    <span className="font-bold">{daysRemaining - 1}</span>
                                 </div>
                              </div>
                           </div>

                           <Separator />

                           <div className="flex gap-4">
                              <Button
                                 size="lg"
                                 className="w-full md:w-auto min-w-[200px] text-lg h-12 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 shadow-lg"
                                 onClick={() => setExecutionState('CONFIRMING')}
                              >
                                 Place Order & Confirm
                              </Button>
                              <Button variant="outline" size="lg" onClick={() => setExecutionState('IDLE')}>
                                 Recalculate
                              </Button>
                           </div>

                        </CardContent>
                     </Card>
                  )}

                  {executionState === 'CONFIRMING' && recommendation && (
                     <Card className="border-2 border-primary shadow-2xl animate-in slide-in-from-right-4 duration-300">
                        <CardHeader className="border-b bg-muted/20">
                           <CardTitle>Final Confirmation</CardTitle>
                           <CardDescription>Enter the actual executed values from your broker.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                 <Label className="font-bold">Actual Invested Amount (₹)</Label>
                                 <Input
                                    type="number"
                                    className="h-12 text-xl font-bold bg-background"
                                    value={executedAmount}
                                    onChange={e => setExecutedAmount(e.target.value)}
                                 />
                              </div>
                              <div className="space-y-3">
                                 <Label className="font-bold">Execution Price (₹)</Label>
                                 <Input
                                    type="number"
                                    step="0.05"
                                    className="h-12 text-xl font-bold bg-background"
                                    value={executionPrice}
                                    onChange={e => setExecutionPrice(e.target.value)}
                                 />
                              </div>
                           </div>

                           <div className="flex gap-4 pt-4">
                              <Button
                                 size="lg"
                                 className="w-full h-14 text-lg font-bold shadow-xl"
                                 onClick={handleConfirm}
                              >
                                 <Icons.Check className="mr-2" /> Confirm & Record
                              </Button>
                              <Button variant="ghost" size="lg" className="w-full" onClick={() => setExecutionState('CALCULATED')}>
                                 Cancel
                              </Button>
                           </div>

                        </CardContent>
                     </Card>
                  )}

               </div>
               <Separator />
               {/* 2. Tracker Summary & Progress (Read-Only) */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Summary Card */}
                  <Card className="bg-muted/20 border-border/50 shadow-sm">
                     <CardHeader className="pb-3 pt-5">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            Tracker Configuration <InfoTooltip text="Approximate change at the moment you are ready to buy." />
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                           <div>
                              <p className="text-xs text-muted-foreground">Conviction Period</p>
                              <p className="font-semibold">{stock.convictionYears} years</p>
                           </div>
                           <div>
                              <p className="text-xs text-muted-foreground">Total Budget</p>
                              <p className="font-semibold">₹{stock.totalBudget.toLocaleString()}</p>
                           </div>
                           <div>
                              <p className="text-xs text-muted-foreground">Deployment Style</p>
                              <p className="font-semibold capitalize">{stock.loadFactor.toLowerCase().replace('_', ' ')}</p>
                           </div>
                           <div>
                              <p className="text-xs text-muted-foreground">Partition Length</p>
                              <p className="font-semibold">{stock.partitionDays} trading days</p>
                           </div>
                        </div>
                     </CardContent>
                  </Card>

                  {/* Progress & Position Card */}
                  <Card className="border-primary/10 shadow-sm bg-background">
                     <CardHeader className="pb-3 pt-5">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                           <Icons.Activity size={14} /> Live Snapshot
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-5">

                        {/* Progress Bar Mockup */}
                        <div className="space-y-4">
                           {/* P&L & Market Value Header */}
                           <div className="flex justify-between items-end">
                              <div>
                                 <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Market Value</p>
                                 <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold tracking-tight">
                                       ₹{((totalShares * stock.currentPrice)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                    <span className={`text-sm font-bold ${((totalShares * stock.currentPrice) - totalInvested) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                       {((totalShares * stock.currentPrice) - totalInvested) >= 0 ? "+" : ""}
                                       {totalInvested > 0 ? (((totalShares * stock.currentPrice) - totalInvested) / totalInvested * 100).toFixed(2) : "0.00"}%
                                       <InfoTooltip text={`Net Profit/Loss: ₹${((totalShares * stock.currentPrice) - totalInvested).toFixed(2)}`} />
                                    </span>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-end gap-1">
                                    Partition %
                                    <InfoTooltip text={`Partition percent as of yesterday: ${daysInvested > 0 ? (((daysInvested - 1) / cycleLength) * 100).toFixed(1) : 0}%`} />
                                 </p>
                                 <p className="font-mono text-sm font-bold">
                                    {((daysInvested % cycleLength) / cycleLength * 100).toFixed(1)}%
                                 </p>
                              </div>
                           </div>

                           {/* 2. Allocation Progress Section (New) */}
                           <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                 <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Icons.Target size={16} className="text-blue-500" />
                                    Allocation Progress
                                 </h3>
                                 <span className="text-xs font-mono font-medium text-muted-foreground">
                                    {((stock.deployedAmount / stock.totalBudget) * 100).toFixed(1)}% Deployed
                                 </span>
                              </div>

                              <div className="relative h-6 w-full bg-secondary/50 rounded-full overflow-hidden shadow-inner">
                                 {/* Deployment Fill */}
                                 <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700 ease-out flex items-center justify-end pr-2"
                                    style={{ width: `${Math.min((stock.deployedAmount / stock.totalBudget) * 100, 100)}%` }}
                                 >
                                 </div>
                                 <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/60">
                                    ₹{stock.deployedAmount.toLocaleString()} / ₹{stock.totalBudget.toLocaleString()}
                                 </div>
                              </div>
                           </div>

                           <Separator />

                           {/* P&L Bar - Simplified & Straightforward */}
                           <div className="space-y-2">
                              {/* Labels */}
                              <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                 <span>{((totalShares * stock.currentPrice) - totalInvested) >= 0 ? "Invested" : "Current Value"}</span>
                                 <span>{((totalShares * stock.currentPrice) - totalInvested) >= 0 ? "Profit" : "Loss"}</span>
                              </div>

                              <div className="h-6 w-full bg-secondary/50 rounded-md overflow-hidden flex text-xs font-bold text-white leading-none shadow-inner border border-black/5">
                                 {((totalShares * stock.currentPrice) >= totalInvested) ? (
                                    // PROFIT SCENARIO: [ Invested (Slate) ][ Profit (Green) ]
                                    <>
                                       <div
                                          className="h-full bg-slate-500 flex items-center justify-center text-slate-100 shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)]"
                                          style={{ width: `${(totalInvested / (totalShares * stock.currentPrice)) * 100}%` }}
                                       >
                                          {/* Only show label if width is sufficient */}
                                          {(totalInvested / (totalShares * stock.currentPrice)) > 0.15 && "Invested"}
                                       </div>
                                       <div
                                          className="h-full bg-emerald-500 flex items-center justify-center text-emerald-50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                                          style={{ width: `${(1 - (totalInvested / (totalShares * stock.currentPrice))) * 100}%` }}
                                       >
                                          +₹{((totalShares * stock.currentPrice) - totalInvested).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                       </div>
                                    </>
                                 ) : (
                                    // LOSS SCENARIO: [ Current (Slate) ][ Loss (Red) ]
                                    <>
                                       <div
                                          className="h-full bg-slate-500 flex items-center justify-center text-slate-100 shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)]"
                                          style={{ width: `${((totalShares * stock.currentPrice) / totalInvested) * 100}%` }}
                                       >
                                          {(totalShares * stock.currentPrice / totalInvested) > 0.15 && "Current"}
                                       </div>
                                       <div
                                          className="h-full bg-red-500 flex items-center justify-center text-red-50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                                          style={{ width: `${((totalInvested - (totalShares * stock.currentPrice)) / totalInvested) * 100}%` }}
                                       >
                                          -₹{(totalInvested - (totalShares * stock.currentPrice)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                       </div>
                                    </>
                                 )}
                              </div>

                              <div className="flex justify-between text-xs font-medium pt-1">
                                 <div className="flex flex-col">
                                    <span className="text-muted-foreground text-[10px]">Invested Capital</span>
                                    <span>₹{totalInvested.toLocaleString()}</span>
                                 </div>
                                 <div className="flex flex-col items-end">
                                    <span className="text-muted-foreground text-[10px]">Current Value</span>
                                    <span>₹{(totalShares * stock.currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 text-center divide-x">
                           <div className="px-2">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Invested</p>
                              <p className="font-bold text-lg">₹{totalInvested.toLocaleString()}</p>
                           </div>
                           <div className="px-2">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Price</p>
                              <p className="font-bold text-lg">₹{avgBuyPrice.toFixed(2)}</p>
                           </div>
                           <div className="px-2">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Shares</p>
                              <p className="font-bold text-lg">{totalShares.toFixed(2)}</p>
                           </div>
                        </div>

                     </CardContent>
                  </Card>
               </div>

               {/* History List (Moved to bottom) */}
               <div className="pt-8">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 opacity-50">Recent History</h3>
                  <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                     {stock.history.slice().reverse().map((tx, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border rounded bg-muted/10 text-sm">
                           <span>{new Date(tx.date).toLocaleDateString()}</span>
                           <span className="font-medium">₹{tx.amount.toLocaleString()}</span>
                        </div>
                     ))}
                     {stock.history.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
                  </div>
               </div>

            </div>
         </ScrollArea>
      </div>
   );
};

export default StockDetails;
