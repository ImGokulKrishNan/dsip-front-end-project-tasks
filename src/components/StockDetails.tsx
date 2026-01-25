import React, { useState } from 'react';
import { Icons } from '../constants';
import { Stock } from '../types';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface StockDetailsProps {
   stock: Stock;
   onBack: () => void;
   onUpdate: (stock: Stock) => void;
   onCopyStrategy?: (config: Partial<Stock>) => void;
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

const StockDetails: React.FC<StockDetailsProps> = ({ stock, onBack, onUpdate, onCopyStrategy }) => {
   // Execution State: 'IDLE' -> 'CALCULATED' -> 'CONFIRMING'
   const [executionState, setExecutionState] = useState<'IDLE' | 'CALCULATED' | 'CONFIRMING'>('IDLE');
   const { toast } = useToast();

   // Edit Mode State
   const [isEditing, setIsEditing] = useState(false);
   const [editConfig, setEditConfig] = useState({
      totalBudget: stock.totalBudget,
      convictionYears: stock.convictionYears,
      loadFactor: stock.loadFactor,
      partitionDays: stock.partitionDays
   });
   const [showWarning, setShowWarning] = useState(false);
   const [showDailyLimitWarning, setShowDailyLimitWarning] = useState(false);

   // Daily Context Inputs
   const [lockInPct, setLockInPct] = useState<string>('');
   const [convictionOverride, setConvictionOverride] = useState<number[]>([50]); // 50 means neutral (1.0x)

   // Calculated Recommendation (Mock)
   const [recommendation, setRecommendation] = useState<{ amount: number; price: number; shares: number } | null>(null);

   // Final Confirmation Inputs
   const [executedAmount, setExecutedAmount] = useState<string>('');
   const [executionPrice, setExecutionPrice] = useState<string>('');

   // Partition State & Data Helper
   const [selectedPartition, setSelectedPartition] = useState<number | null>(null);

   const getPartitionData = (index: number) => {
      // Mock Data Generation based on index
      if (index >= (stock.currentCycle || 2)) return null; // Future partitions have no data

      // Deterministic pseudo-random for consistent demo feel
      const seed = index * 123;
      const amount = Math.floor(2000 + (seed % 3000));
      const variation = (seed % 20) - 10;
      const price = stock.currentAverage * (1 + (variation / 100));

      return {
         partitionIndex: index + 1,
         amountInvested: amount,
         avgPrice: price,
         status: 'COMPLETED'
      };
   };

   // Derived Stats
   const totalInvested = (stock.quantityOwned * stock.averagePriceOwned) + stock.deployedAmount;
   const sipQuantity = stock.history.reduce((acc, curr) => acc + (curr.amount / curr.price), 0);
   const totalShares = stock.quantityOwned + sipQuantity;
   const avgBuyPrice = totalShares > 0 ? totalInvested / totalShares : 0;

   // Progress Mocks (In real app, comes from backend)
   const currentCycle = stock.currentCycle || 10;
   const totalCycles = stock.totalCycles || 20;
   const daysInvested = stock.daysInvested || 14;
   const cycleLength = stock.partitionDays; // e.g. 60
   const daysRemaining = cycleLength - (daysInvested % cycleLength);

   const performCalculation = () => {
      // Mock Calculation Logic based on spec
      // In reality, this would call the "Daily Calculation API"
      const refPrice = stock.currentPrice * (1 + (Number(lockInPct) / 100)); // Apply lock-in context
      const baseAmount = stock.totalBudget / (stock.convictionYears * 250); // Daily spread roughly

      // Confidence Logic: 0 -> 0x, 50 -> 1x, 100 -> 2x
      const confidenceFactor = (convictionOverride[0] - 50) / 50;
      const adjustedAmount = Math.round(baseAmount * (1 + confidenceFactor));

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

   const handleCalculate = () => {
      // Check if executed today
      // Check if executed today
      const alreadyExecutedToday = stock.history.some(h =>
         new Date(h.date).toDateString() === new Date().toDateString()
      );

      if (alreadyExecutedToday) {
         setShowDailyLimitWarning(true);
      } else {
         performCalculation();
      }
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
      setConvictionOverride([50]);
      setRecommendation(null);
      toast({
         title: "Successfully Implemented",
         description: "Your strategy execution has been recorded.",
         duration: 3000,
         className: "bg-emerald-50 border-emerald-200"
      });
   };

   return (
      <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">

         {/* Header */}
         <div className="px-6 py-4 border-b flex items-center justify-between bg-background/95 backdrop-blur z-20 sticky top-0">
            <div className="flex items-center gap-3">
               <Button variant="ghost" size="icon" onClick={onBack}>
                  <Icons.ArrowLeft size={18} />
               </Button>
               <div>
                  <h1 className="text-xl font-bold tracking-tight">{stock.symbol} Tracker</h1>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Daily Smart Investment Execution</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="h-6 px-2.5 text-[10px] font-semibold">
                  Tracker Active
               </Badge>
            </div>
         </div>

         <ScrollArea className="flex-1">
            <div className="p-5 md:p-6 max-w-5xl mx-auto space-y-6 pb-32">

               {/* 1. Daily Execution Zone */}
               <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                     <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/30">
                        <Icons.Zap size={16} />
                     </div>
                     <h2 className="text-lg font-bold">Today's Execution</h2>
                  </div>

                  {executionState === 'IDLE' && (
                     <Card className="border-l-4 border-l-primary shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="pb-3">
                           <CardTitle className="text-lg">Market Context</CardTitle>
                           <CardDescription className="text-xs">Enter today's price conditions to generate your smart order.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 p-5">

                           <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                              {/* Left Column: Main Controls */}
                              <div className="space-y-4">
                                 {/* Lock-In Context */}
                                 <div className="space-y-2">
                                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                                       Current Price Change (%) [lock in %]
                                       <InfoTooltip text="Approximate change at the moment you are ready to buy." />
                                    </Label>
                                    <div className="relative">
                                       <Input
                                          type="number"
                                          step="0.1"
                                          placeholder="-2.4"
                                          className="h-10 text-lg font-semibold pl-3 pr-10"
                                          value={lockInPct}
                                          onChange={e => setLockInPct(e.target.value)}
                                          autoFocus
                                       />
                                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">%</div>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-tight">
                                       Tip: If red, lock early. If green, you may wait closer to close.
                                    </p>
                                 </div>

                                 {/* Conviction Override */}
                                 <div className="space-y-3">
                                    <div className="flex justify-between items-center gap-3">
                                       <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                          Conviction Adjustment (Optional)
                                          <InfoTooltip text="Only use if today's news significantly changes your view." />
                                       </Label>
                                       <Badge className={
                                          convictionOverride[0] < 45 ? "bg-red-500 hover:bg-red-600 h-6 px-2 text-xs" :
                                             convictionOverride[0] > 55 ? "bg-emerald-500 hover:bg-emerald-600 h-6 px-2 text-xs" :
                                                "bg-yellow-500 hover:bg-yellow-600 h-6 px-2 text-xs"
                                       }>
                                          {convictionOverride[0]}% Confidence
                                       </Badge>
                                    </div>
                                    <Slider
                                       min={0}
                                       max={100}
                                       step={5}
                                       value={convictionOverride}
                                       onValueChange={setConvictionOverride}
                                       className="py-1"
                                    />
                                    <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                                       <span>0% (LOW)</span>
                                       <span>50% (NEUTRAL)</span>
                                       <span>100% (HIGH)</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Right Column: Quick Stats */}
                              <div className="rounded-lg border bg-muted/30 p-4 space-y-3 h-fit">
                                 <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Icons.Activity size={12} />
                                    Quick Context
                                 </h4>
                                 <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-muted-foreground text-xs">Current Price</span>
                                       <span className="font-semibold">₹{stock.currentPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-muted-foreground text-xs">Avg Buy Price</span>
                                       <span className="font-semibold">₹{avgBuyPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-muted-foreground text-xs">Total Invested</span>
                                       <span className="font-semibold">₹{totalInvested.toLocaleString()}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-muted-foreground text-xs">Days Invested</span>
                                       <span className="font-semibold font-mono">{daysInvested}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                       <span className="text-muted-foreground text-xs">Days Remaining</span>
                                       <span className="font-semibold font-mono">{daysRemaining}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Action Buttons */}
                           <div className="flex gap-3 pt-1">
                              <Button size="default" className="flex-1 h-10" onClick={handleCalculate} disabled={!lockInPct}>
                                 <Icons.TrendUp className="mr-2 w-4 h-4" /> Calculate Amount
                              </Button>
                              <Button variant="ghost" size="default" className="h-10 px-4">
                                 Skip Today
                              </Button>
                           </div>

                        </CardContent>
                     </Card>
                  )}

                  {executionState === 'CALCULATED' && recommendation && (
                     <Card className="border-l-4 border-l-emerald-500 shadow-xl animate-in fade-in zoom-in-95 duration-300">
                        <CardHeader className="bg-emerald-500/5 pb-3">
                           <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                              <Icons.Check className="w-4 h-4" /> Recommendation Generated
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5 p-5">

                           <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-start">
                              <div className="space-y-1">
                                 <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Recommended Amount</p>
                                 <div className="text-4xl font-black text-foreground tracking-tight">
                                    ₹{recommendation.amount.toLocaleString()}
                                 </div>
                                 <p className="text-xs text-muted-foreground flex items-center gap-2 leading-tight">
                                    <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium">Ref Price: ₹{recommendation.price.toFixed(2)}</span>
                                    <span>~ {recommendation.shares.toFixed(2)} shares</span>
                                 </p>
                              </div>

                              <div className="border rounded-lg p-3.5 bg-muted/30 space-y-2">
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground text-xs">New Projected Avg</span>
                                    <span className="font-bold">₹{((totalInvested + recommendation.amount) / (totalShares + recommendation.shares)).toFixed(2)}</span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground text-xs">Remaining in Cycle</span>
                                    <span className="font-bold">₹{(stock.totalBudget / 4 - stock.deployedAmount % (stock.totalBudget / 4)).toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground text-xs">Cycle Days Left</span>
                                    <span className="font-bold">{daysRemaining - 1}</span>
                                 </div>
                              </div>
                           </div>

                           <Separator />

                           <div className="flex gap-3">
                              <Button
                                 size="default"
                                 className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 shadow-md"
                                 onClick={() => setExecutionState('CONFIRMING')}
                              >
                                 <Icons.Check className="mr-2 w-4 h-4" /> Place Order & Confirm
                              </Button>
                              <Button variant="outline" size="default" className="h-10 px-4" onClick={() => setExecutionState('IDLE')}>
                                 Recalculate
                              </Button>
                           </div>

                        </CardContent>
                     </Card>
                  )}

                  {executionState === 'CONFIRMING' && recommendation && (
                     <Card className="border-2 border-primary shadow-2xl animate-in slide-in-from-right-4 duration-300">
                        <CardHeader className="border-b bg-muted/20 pb-3">
                           <CardTitle className="text-lg">Final Confirmation</CardTitle>
                           <CardDescription className="text-xs">Enter the actual executed values from your broker.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5 p-5">

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="space-y-2">
                                 <Label className="text-sm font-semibold">Actual Invested Amount (₹)</Label>
                                 <Input
                                    type="number"
                                    className="h-10 text-lg font-semibold bg-background"
                                    value={executedAmount}
                                    onChange={e => setExecutedAmount(e.target.value)}
                                 />
                              </div>
                              <div className="space-y-2">
                                 <Label className="text-sm font-semibold">Execution Price (₹)</Label>
                                 <Input
                                    type="number"
                                    step="0.05"
                                    className="h-10 text-lg font-semibold bg-background"
                                    value={executionPrice}
                                    onChange={e => setExecutionPrice(e.target.value)}
                                 />
                              </div>
                           </div>

                           <div className="flex gap-3 pt-2">
                              <Button
                                 size="default"
                                 className="flex-1 h-11 font-semibold shadow-lg"
                                 onClick={handleConfirm}
                              >
                                 <Icons.Check className="mr-2 w-4 h-4" /> Confirm & Record
                              </Button>
                              <Button variant="ghost" size="default" className="h-11 px-4" onClick={() => setExecutionState('CALCULATED')}>
                                 Cancel
                              </Button>
                           </div>

                        </CardContent>
                     </Card>
                  )}

               </div>
               <Separator />
               {/* 2. Tracker Summary & Progress (Read-Only) */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Summary Card */}
                  <Card className="bg-muted/20 border-border/50 shadow-sm">
                     <CardHeader className="pb-2.5 pt-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between w-full">
                           <span className="flex items-center gap-1.5">Tracker Configuration <InfoTooltip text="Approximate change at the moment you are ready to buy." /></span>
                           {!isEditing && (
                              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => setIsEditing(true)}>
                                 Edit
                              </Button>
                           )}
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-3.5 pb-4">
                        <div className="grid grid-cols-2 gap-y-3.5 text-sm">
                           {!isEditing ? (
                              // READ ONLY VIEW
                              <>
                                 <div>
                                    <p className="text-xs text-muted-foreground">Conviction Period</p>
                                    <p className="font-semibold">{stock.convictionYears} years</p>
                                 </div>
                                 <div>
                                    <p className="text-xs text-muted-foreground">Total Budget</p>
                                    <p className="font-semibold">₹{stock.totalBudget.toLocaleString()}</p>
                                 </div>
                                 <div>
                                    <p className="text-xs text-muted-foreground">Load Factor</p>
                                    <p className="font-semibold capitalize">{stock.loadFactor.toLowerCase().replace('_', ' ')}</p>
                                 </div>
                                 <div>
                                    <p className="text-xs text-muted-foreground">Partition Length</p>
                                    <p className="font-semibold">{stock.partitionDays} trading days</p>
                                 </div>
                              </>
                           ) : (
                              // EDIT VIEW
                              <>
                                 <div className="space-y-1">
                                    <Label className="text-xs">Conviction (Yrs)</Label>
                                    <Input
                                       type="number"
                                       className="h-8"
                                       value={editConfig.convictionYears}
                                       onChange={e => setEditConfig({ ...editConfig, convictionYears: Number(e.target.value) })}
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <Label className="text-xs">Total Budget (₹)</Label>
                                    <Input
                                       type="number"
                                       className="h-8"
                                       value={editConfig.totalBudget}
                                       onChange={e => setEditConfig({ ...editConfig, totalBudget: Number(e.target.value) })}
                                    />
                                 </div>
                                 <div className="space-y-1 col-span-2">
                                    <Label className="text-xs flex justify-between">
                                       Load Factor
                                       <span className="text-[10px] text-amber-600 font-normal">*Not recommended to change</span>
                                    </Label>
                                    <Select
                                       value={editConfig.loadFactor}
                                       onValueChange={(val: any) => setEditConfig({ ...editConfig, loadFactor: val })}
                                    >
                                       <SelectTrigger className="h-8">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="AGGRESSIVE">Aggressive</SelectItem>
                                          <SelectItem value="MODERATE">Moderate</SelectItem>
                                          <SelectItem value="GRADUAL">Gradual</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                                 <div className="space-y-1 col-span-2">
                                    <Label className="text-xs">Partition Length (Days)</Label>
                                    <Input
                                       type="number"
                                       className="h-8"
                                       value={editConfig.partitionDays}
                                       onChange={e => setEditConfig({ ...editConfig, partitionDays: Number(e.target.value) })}
                                    />
                                 </div>
                              </>
                           )}
                        </div>

                        {isEditing && (
                           <div className="flex gap-2 pt-2">
                              <Button size="sm" onClick={() => {
                                 // Validation Logic
                                 const isSafe =
                                    editConfig.totalBudget >= stock.totalBudget &&
                                    editConfig.convictionYears >= stock.convictionYears &&
                                    editConfig.partitionDays === stock.partitionDays &&
                                    editConfig.loadFactor === stock.loadFactor;

                                 if (isSafe) {
                                    onUpdate({ ...stock, ...editConfig });
                                    setIsEditing(false);
                                 } else {
                                    setShowWarning(true);
                                 }
                              }}>Save Changes</Button>
                              <Button size="sm" variant="ghost" onClick={() => {
                                 setEditConfig({
                                    totalBudget: stock.totalBudget,
                                    convictionYears: stock.convictionYears,
                                    loadFactor: stock.loadFactor,
                                    partitionDays: stock.partitionDays
                                 });
                                 setIsEditing(false);
                              }}>Cancel</Button>
                           </div>
                        )}
                     </CardContent>
                  </Card>

                  {/* Warning Modal */}
                  <Dialog open={showWarning} onOpenChange={setShowWarning}>
                     <DialogContent>
                        <DialogHeader>
                           <DialogTitle className="flex items-center gap-2 text-amber-600">
                              <Icons.AlertTriangle className="w-5 h-5" />
                              Strategy Modification Warning
                           </DialogTitle>
                           <DialogDescription className="pt-2">
                              This change is not recommended for an existing strategy. Reducing budget, conviction, or changing structural parameters can disrupt the mathematical execution.
                           </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                           <Button variant="outline" onClick={() => {
                              // Discard
                              setEditConfig({
                                 totalBudget: stock.totalBudget,
                                 convictionYears: stock.convictionYears,
                                 loadFactor: stock.loadFactor,
                                 partitionDays: stock.partitionDays
                              });
                              setShowWarning(false);
                              setIsEditing(false);
                           }}>
                              Discard Changes
                           </Button>
                           <Button onClick={() => {
                              // Redirect
                              if (onCopyStrategy) {
                                 onCopyStrategy({
                                    symbol: stock.symbol,
                                    name: stock.name,
                                    ...editConfig
                                 });
                              }
                           }}>
                              Activate Stock Engine
                           </Button>
                        </DialogFooter>
                     </DialogContent>
                  </Dialog>

                  {/* Daily Limit Warning Modal */}
                  <Dialog open={showDailyLimitWarning} onOpenChange={setShowDailyLimitWarning}>
                     <DialogContent>
                        <DialogHeader>
                           <DialogTitle className="flex items-center gap-2 text-amber-600">
                              <Icons.AlertTriangle className="w-5 h-5" />
                              Not Recommended for This Strategy
                           </DialogTitle>
                           <DialogDescription className="pt-2">
                              DSIP is designed for one disciplined execution per day.
                              Multiple executions within the same day may accelerate capital deployment.
                           </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                           <Button variant="outline" onClick={() => setShowDailyLimitWarning(false)}>
                              Cancel
                           </Button>
                           <Button variant="destructive" onClick={() => {
                              setShowDailyLimitWarning(false);
                              performCalculation();
                           }}>
                              Execute Anyway
                           </Button>
                        </DialogFooter>
                     </DialogContent>
                  </Dialog>

                  {/* Progress & Position Card */}
                  <Card className="border-primary/10 shadow-sm bg-background">
                     <CardHeader className="pb-2.5 pt-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                           <Icons.Activity size={12} /> Live Snapshot
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4 pb-4">

                        {/* Progress Bar Mockup */}
                        <div className="space-y-3.5">
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
                                    <Icons.PieChart size={16} className="text-purple-500" />
                                    Partition Progress
                                 </h3>
                                 <span className="text-xs font-mono font-medium text-muted-foreground">
                                    {((currentCycle / totalCycles) * 100).toFixed(1)}% Complete
                                 </span>
                              </div>

                              {/* Segmented Progress Bar */}
                              <div className="relative w-full h-10 flex items-center bg-secondary/30 rounded-full p-1 ring-1 ring-black/5 dark:ring-white/10 shadow-inner">
                                 {/* Track Background is handled by container */}
                                 <div className="flex gap-1.5 w-full h-full">
                                    {Array.from({ length: totalCycles }).map((_, i) => {
                                       const isCompleted = i < currentCycle;
                                       const isCurrent = i === currentCycle;
                                       const partitionNum = i + 1;
                                       return (
                                          <TooltipProvider key={i} delayDuration={0}>
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <div
                                                      onClick={() => setSelectedPartition(i)}
                                                      className={`flex-1 rounded-full cursor-pointer transition-all duration-300 relative group ${isCompleted
                                                         ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110"
                                                         : isCurrent
                                                            ? "bg-background border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10 scale-110"
                                                            : "bg-transparent hover:bg-white/10 dark:hover:bg-white/5 border border-transparent hover:border-white/10"
                                                         }`}
                                                   >
                                                      {/* Active Breathing Ring */}
                                                      {isCurrent && (
                                                         <span className="absolute -inset-1 rounded-full bg-cyan-500/30 animate-pulse" />
                                                      )}
                                                      {/* Future Ghost Dot */}
                                                      {!isCompleted && !isCurrent && (
                                                         <div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-muted-foreground/20 group-hover:bg-muted-foreground/40 transition-colors" />
                                                      )}
                                                   </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs font-bold bg-foreground text-background">
                                                   Partition #{partitionNum} {isCompleted ? "(Verified)" : isCurrent ? "(Active)" : "(Upcoming)"}
                                                </TooltipContent>
                                             </Tooltip>
                                          </TooltipProvider>
                                       );
                                    })}
                                 </div>
                              </div>
                              <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-1">
                                 <span>START</span>
                                 <span>{currentCycle}/{totalCycles}</span>
                                 <span>END</span>
                              </div>
                           </div>

                           {/* Partition Details Modal - Trading Card Style */}
                           <Dialog open={selectedPartition !== null} onOpenChange={(open) => !open && setSelectedPartition(null)}>
                              <DialogContent className="max-w-sm p-0 overflow-hidden bg-background border-border shadow-2xl rounded-2xl">
                                 <div className="relative bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background p-6 space-y-6">

                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${getPartitionData(selectedPartition!) ? 'bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-muted text-muted-foreground'
                                             }`}>
                                             <span className="font-mono font-bold text-lg">#{selectedPartition !== null ? selectedPartition + 1 : 0}</span>
                                          </div>
                                          <div>
                                             <h3 className="font-bold text-lg leading-none">Partition Cert</h3>
                                             <p className="text-xs text-muted-foreground font-mono mt-1">
                                                DSIP-{stock.symbol}-{(selectedPartition || 0) + 1}
                                             </p>
                                          </div>
                                       </div>
                                       <Badge variant={getPartitionData(selectedPartition!) ? "default" : "outline"} className={getPartitionData(selectedPartition!) ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" : ""}>
                                          {getPartitionData(selectedPartition!) ? 'EXECUTED' : 'PENDING'}
                                       </Badge>
                                    </div>

                                    <Separator className="bg-border/50" />

                                    {selectedPartition !== null && (
                                       <div className="space-y-6">
                                          {getPartitionData(selectedPartition) ? (
                                             <>
                                                <div className="grid grid-cols-2 gap-4">
                                                   <div className="space-y-1.5 p-3 rounded-xl bg-background/50 border shadow-sm">
                                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                                         <Icons.Wallet size={12} /> Invested
                                                      </div>
                                                      <div className="text-xl font-black tracking-tight">
                                                         ₹{getPartitionData(selectedPartition)?.amountInvested.toLocaleString()}
                                                      </div>
                                                   </div>
                                                   <div className="space-y-1.5 p-3 rounded-xl bg-background/50 border shadow-sm">
                                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                                         <Icons.Target size={12} /> Avg Price
                                                      </div>
                                                      <div className="text-xl font-black tracking-tight">
                                                         ₹{getPartitionData(selectedPartition)?.avgPrice.toFixed(2)}
                                                      </div>
                                                   </div>
                                                </div>

                                                <div className="space-y-2">
                                                   <div className="flex justify-between text-sm">
                                                      <span className="text-muted-foreground">Executed On</span>
                                                      <span className="font-mono font-medium">May 12, 2024</span>
                                                   </div>
                                                   <div className="flex justify-between text-sm">
                                                      <span className="text-muted-foreground">Units Acquired</span>
                                                      <span className="font-mono font-medium">
                                                         {(getPartitionData(selectedPartition)!.amountInvested / getPartitionData(selectedPartition)!.avgPrice).toFixed(2)}
                                                      </span>
                                                   </div>
                                                </div>
                                             </>
                                          ) : (
                                             <div className="py-6 text-center space-y-3">
                                                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto text-muted-foreground/40 border-2 border-dashed border-muted-foreground/20">
                                                   <Icons.Clock className="w-8 h-8" />
                                                </div>
                                                <div className="space-y-1">
                                                   <p className="font-medium text-foreground">Awaiting Execution</p>
                                                   <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                                                      This partition is scheduled for a future date.
                                                   </p>
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    )}
                                 </div>
                                 <div className="bg-muted/30 p-4 flex justify-between items-center border-t">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50"></p>
                                    <Button size="sm" variant="outline" onClick={() => setSelectedPartition(null)}>Close</Button>
                                 </div>
                              </DialogContent>
                           </Dialog>

                           <Separator />

                           {/* P&L Bar - Simplified & Straightforward */}

                        </div>



                     </CardContent>
                  </Card>
               </div>

               {/* History List (Moved to bottom) */}


            </div>
         </ScrollArea >
      </div >
   );
};

export default StockDetails;

