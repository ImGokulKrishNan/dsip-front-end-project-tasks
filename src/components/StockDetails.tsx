import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { Stock } from '../types';
import { useAppSelector, useAppDispatch } from '../store/hooks';

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
   showDsipOnly?: boolean;
}

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
   const [open, setOpen] = React.useState(false);

   return (
      <TooltipProvider>
         <Tooltip open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
               <button
                  type="button"
                  onClick={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     setOpen(!open);
                  }}
                  className="inline-flex items-center justify-center ml-1.5 w-4 h-4 rounded-full bg-muted hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer align-middle ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
               >
                  <Icons.Info size={11} className="shrink-0" />
               </button>
            </TooltipTrigger>
            <TooltipContent
               side="top"
               className="max-w-xs bg-popover text-popover-foreground border shadow-lg"
               sideOffset={5}
            >
               <p className="text-xs leading-relaxed font-normal normal-case">{text}</p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   );
};

const StockDetails: React.FC<StockDetailsProps> = ({ stock, onBack, onUpdate, onCopyStrategy, showDsipOnly }) => {
   // Redux dispatch
   const dispatch = useAppDispatch();

   // Get tracker data from Redux store
   const {
      selectedTracker,
      isLoadingTrackerDetails,
      trackerDetailsError,
   } = useAppSelector((state) => state.trackers);

   // Debug: Log API data
   useEffect(() => {
      console.log('[StockDetails] API Data:', {
         selectedTracker,
         isLoadingTrackerDetails,
         trackerDetailsError,
      });
   }, [selectedTracker, isLoadingTrackerDetails, trackerDetailsError]);

   // ===== SETUP API DATA FIRST (BEFORE USING IN CALCULATIONS) =====
   // Use API data if available, otherwise fall back to stock prop
   const useApiData = selectedTracker !== null;
   const trackerData = useApiData ? selectedTracker?.tracker : null;

   // Log which data source we're using
   console.log('[StockDetails] Using data:', useApiData ? 'API' : 'Hardcoded', { trackerData, stock });

   // Helper function to get display values (API data takes precedence)
   const getDisplayValue = (apiValue: any, stockValue: any) => {
      return useApiData && trackerData ? apiValue : stockValue;
   };

   // Display values for UI
   const displaySymbol = getDisplayValue(trackerData?.stock_symbol, stock.symbol);
   const displayName = getDisplayValue(trackerData?.stockName, stock.name);
   const displayConvictionYears = getDisplayValue(trackerData?.conviction_period_years, stock.convictionYears);
   const displayTotalBudget = getDisplayValue(trackerData?.total_capital_planned, stock.totalBudget);
   const displayConvictionLevel = getDisplayValue(trackerData?.base_conviction_score, stock.convictionLevel);
   const displayPartitionMonths = getDisplayValue(trackerData?.partition_months, stock.partitionMonths);
   const displayDeployedAmount = getDisplayValue(trackerData?.total_capital_invested_so_far, stock.deployedAmount);
   const displaySharesHeld = getDisplayValue(trackerData?.shares_held_so_far, stock.quantityOwned);
   const displayCurrentPrice = getDisplayValue(trackerData?.currentPrice, stock.currentPrice);

   // Get deployment style as text
   const getDeploymentStyleText = () => {
      if (!useApiData || !trackerData) return stock.loadFactor;
      // API mapping: 1=GRADUAL, 2=MODERATE, 3=AGGRESSIVE
      const styleMap: Record<number, string> = {
         1: 'Gradual',
         2: 'Moderate',
         3: 'Aggressive',
      };
      return styleMap[trackerData.deployment_style] || 'Moderate';
   };
   const displayLoadFactor = getDeploymentStyleText();
   // ===== END API DATA SETUP =====

   // Execution State: 'IDLE' -> 'CALCULATED' -> 'CONFIRMING'
   const [executionState, setExecutionState] = useState<'IDLE' | 'CALCULATED' | 'CONFIRMING'>('IDLE');


   // Edit Mode State
   const [isEditing, setIsEditing] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [isConfirming, setIsConfirming] = useState(false);
   const [editConfig, setEditConfig] = useState({
      totalBudget: stock.totalBudget,
      convictionYears: stock.convictionYears,
      loadFactor: stock.loadFactor,
      partitionMonths: stock.partitionMonths,
      convictionLevel: stock.convictionLevel,
   });
   const [showWarning, setShowWarning] = useState(false);
   const [showDailyLimitWarning, setShowDailyLimitWarning] = useState(false);
   const [showSuccessPopup, setShowSuccessPopup] = useState(false);
   const [showVictoryPopup, setShowVictoryPopup] = useState(false);
   const [showKillSwitchPopup, setShowKillSwitchPopup] = useState(false);
   const [confirmError, setConfirmError] = useState<string | null>(null);
   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

   // Daily Context Inputs
   const [lockInPct, setLockInPct] = useState<string>('');
   // Initialize with base_conviction_score from tracker data, default to 50 if not available
   const [convictionOverride, setConvictionOverride] = useState<number[]>([displayConvictionLevel || 50]);

   // Sync convictionOverride with API data when it loads
   useEffect(() => {
      if (displayConvictionLevel) {
         setConvictionOverride([displayConvictionLevel]);
      }
   }, [displayConvictionLevel]);

   // Calculated Recommendation from API
   type RecommendationResponse = {
      tracker_id: number;
      recommended_amount: number;
      breakdown: {
         neutral_capital: number;
         opportunity_multiplier: number;
         contingency_multiplier: number;
         final_multiplier: number;
      };
      signals: {
         avg_holding_price: number;
         avg_deviation_pct: number;
         avg_signal: number;
         lock_in_pct: number;
         lock_in_signal: number;
         raw_opportunity_signal: number;
         conviction_amplifier: number;
         is_abnormal_dip: boolean;
      };
      partition_status: {
         partition_index: number;
         partition_progress_pct: number;
         return_progress_pct: number;
         growth_persistence_pct: number;
         time_progress_pct: number;
         capital_progress_pct: number;
         capital_deployed: number;
         capital_remaining: number;
         cumulative_return_pct: number;
      };
   };
   const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
   const [isCalculating, setIsCalculating] = useState(false);
   const [calculationError, setCalculationError] = useState<string | null>(null);

   // Final Confirmation Inputs
   const [executedAmount, setExecutedAmount] = useState<string>('');
   const [executionPrice, setExecutionPrice] = useState<string>('');



   // Partition State & Data Helper
   const [selectedPartition, setSelectedPartition] = useState<number | null>(null);
   const [partitionDetails, setPartitionDetails] = useState<any>(null);
   const [isLoadingPartition, setIsLoadingPartition] = useState(false);

   // Fetch partition details when a partition is selected
   const handlePartitionClick = async (index: number) => {
      setSelectedPartition(index);

      // If we have API data, fetch partition details
      if (useApiData && trackerData?.trackerId) {
         setIsLoadingPartition(true);
         try {
            const { getPartitionDetails } = await import('../lib/api.fetcher');
            const details = await getPartitionDetails(trackerData.trackerId, trackerData.active_partition_index);
            setPartitionDetails(details);
            console.log('[Partition Details]', details);
         } catch (error) {
            console.error('[Partition Details Error]', error);
            // Fall back to mock data
            setPartitionDetails(getPartitionData(index));
         } finally {
            setIsLoadingPartition(false);
         }
      } else {
         // Use mock data
         setPartitionDetails(getPartitionData(index));
      }
   };

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

   // Derived Stats - Use API data if available
   const totalInvested = useApiData && trackerData
      ? trackerData.total_capital_invested_so_far
      : (stock.quantityOwned * stock.averagePriceOwned) + stock.deployedAmount;

   const sipQuantity = useApiData && selectedTracker
      ? selectedTracker.recentExecutions.reduce((acc, curr) => acc + (curr.executedAmount / (curr.executionPrice || 1)), 0)
      : stock.history.reduce((acc, curr) => acc + (curr.amount / curr.price), 0);

   const totalShares = displaySharesHeld + sipQuantity;

   const currentMarketValue = totalShares * displayCurrentPrice;

   const currentReturnPercent = totalInvested > 0
      ? ((currentMarketValue - totalInvested) / totalInvested * 100)
      : 0;

   const avgBuyPrice = totalShares > 0 ? totalInvested / totalShares : 0;

   // Progress - Use API data if available
   const currentCycle = useApiData && trackerData
      ? trackerData.active_partition_index || 1
      : stock.currentCycle || 10;

   const totalCycles = useApiData && trackerData
      ? trackerData.total_cycles
      : stock.totalCycles || 20;

   const daysInvested = useApiData && selectedTracker
      ? selectedTracker.recentExecutions.length
      : stock.daysInvested || 14;

   const cycleLength = displayPartitionMonths;
   const daysRemaining = cycleLength - (daysInvested % cycleLength);

   const performCalculation = async () => {
      setIsCalculating(true);
      setCalculationError(null);

      try {
         // Get tracker ID from Redux state
         const trackerId = trackerData?.trackerId;
         if (!trackerId) {
            throw new Error('No tracker selected. Please select a tracker first.');
         }

         const lockIn = Number(lockInPct);
         if (isNaN(lockIn) || lockInPct === '') {
            throw new Error('Please enter a valid lock-in percentage');
         }

         // Import and call the API
         const { getRecommendation } = await import('../lib/api.fetcher');
         const result = await getRecommendation(trackerId, lockIn);

         setRecommendation(result);
         setExecutionState('CALCULATED');

         // Pre-fill confirmation inputs for UX convenience
         // Actual Invested Amount is auto-filled from recommendation
         setExecutedAmount(result.recommended_amount.toString());
         // Execution Price will be blank for user to fill
         setExecutionPrice('');
      } catch (error: any) {
         setCalculationError(error.message || 'Failed to calculate recommendation');
         setExecutionState('IDLE');
      } finally {
         setIsCalculating(false);
      }
   };

   const handleCalculate = () => {
      // Check if executed today
      const alreadyExecutedToday = stock.history.some(h =>
         new Date(h.date).toDateString() === new Date().toDateString()
      );
      // Kill Switch Logic: Check if we should stop execution
      // Condition: > 50% through cycle AND negative return
      if (daysInvested > (stock.partitionDays / 2) && currentReturnPercent < 0) {
         setShowKillSwitchPopup(true);
         return; // Block execution
      }

      if (alreadyExecutedToday) {
         setShowDailyLimitWarning(true);
      } else {
         performCalculation();
      }
   };



   const handleConfirm = async () => {
      setIsConfirming(true);
      setConfirmError(null);

      try {
         // Validate inputs
         const trackerId = trackerData?.trackerId;
         const partitionIndex = trackerData?.active_partition_index;

         if (!trackerId || !partitionIndex) {
            throw new Error('Missing tracker or partition information');
         }

         const amount = Number(executedAmount);
         const price = Number(executionPrice);
         const lockInPercentage = Number(lockInPct);
         const conviction = convictionOverride[0];

         if (isNaN(amount) || amount <= 0) {
            throw new Error('Please enter a valid invested amount');
         }

         if (isNaN(price) || price <= 0) {
            throw new Error('Please enter a valid execution price');
         }

         if (isNaN(lockInPercentage)) {
            throw new Error('Please enter a valid lock-in percentage');
         }

         // Call the execute trade API
         const { executeTrade } = await import('../lib/api.fetcher');
         const result = await executeTrade(trackerId, {
            lock_in_percentage: lockInPercentage,
            conviction_override: conviction,
            executed_amount: amount,
            execution_price: price,
         });

         console.log('[Execute Trade Response]', result);

         // Reset form state
         setExecutionState('IDLE');
         setLockInPct('');
         setConvictionOverride([displayConvictionLevel || 50]);
         setRecommendation(null);
         setExecutedAmount('');
         setExecutionPrice('');

         // Refresh tracker details to get updated data
         const { fetchTrackerDetails } = await import('../store/slices/trackersSlice');
         dispatch(fetchTrackerDetails(trackerId));
         
         // Handle the response scenarios based on code
         if (result.code === 'SUCCESS' || result.code === 'ONGOING') {
            // SUCCESS or ONGOING: Show Order Executed popup immediately
            setShowSuccessPopup(true);
         } else if (result.code === 'KILL_SWITCH_STAGNATION' || result.code === 'KILL_SWITCH_POOR_GROWTH' || result.code === 'NEUTRAL_PARTITION') {
            // KILL_SWITCH_* or NEUTRAL_PARTITION: Show alert with response details, then call endPartitionAction
            if (result.title && result.message) {
               const shouldEndPartition = window.confirm(
                  `${result.title}\n\n${result.message}\n\nCapital Deployed: $${result.deployed_amount.toLocaleString()}\nNet Return: ${result.profit_pct}%\n\nClick OK to acknowledge and end this partition.`
               );

               if (shouldEndPartition) {
                  // Call end-action API to finalize the partition
                  const { endPartitionAction } = await import('../lib/api.fetcher');
                  await endPartitionAction(trackerId, partitionIndex);
                  
                  // Refresh tracker details again to show new partition state
                  dispatch(fetchTrackerDetails(trackerId));
                  
                  console.log('[Partition Ended]');

                  // Show appropriate popup based on code
                  if (result.code === 'KILL_SWITCH_STAGNATION' || result.code === 'KILL_SWITCH_POOR_GROWTH') {
                     setShowKillSwitchPopup(true);
                  } else if (result.code === 'NEUTRAL_PARTITION') {
                     setShowSuccessPopup(true);
                  }
               }
            }
         } else {
            // Fallback: Show success popup for any unknown response
            setShowSuccessPopup(true);
         }

         // Refresh tracker details to get updated data
         // This will be handled by Redux if you have the action set up
         // For now, we'll rely on the parent component to refresh
      } catch (error: any) {
         console.error('[Confirm Error]', error);
         setConfirmError(error.message || 'Failed to confirm execution');
      } finally {
         setIsConfirming(false);
      }
   };



   // Show loading state while fetching tracker details
   if (isLoadingTrackerDetails) {
      return (
         <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center space-y-4">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
               <p className="text-muted-foreground">Loading tracker details...</p>
            </div>
         </div>
      );
   }

   // Show error state if API call failed
   if (trackerDetailsError) {
      return (
         <div className="flex-1 flex items-center justify-center h-full p-6">
            <Card className="max-w-md border-destructive/50 bg-destructive/5">
               <CardContent className="p-6">
                  <div className="flex items-start gap-3 text-destructive">
                     <Icons.AlertCircle size={24} className="shrink-0 mt-0.5" />
                     <div>
                        <p className="font-semibold">Failed to load tracker details</p>
                        <p className="text-sm text-muted-foreground mt-1">{trackerDetailsError}</p>
                        <Button onClick={onBack} variant="outline" className="mt-4" size="sm">
                           Back to Dashboard
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      );
   }

   return (
      <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
         <ScrollArea className="flex-1">
            <div className="px-4 py-5 md:p-6 space-y-6 pb-32">

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
                        <CardHeader className="pb-2">
                           <CardTitle className="text-base">Market Context</CardTitle>
                           <CardDescription className="text-xs">Enter today's price conditions to generate your smart order.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4">

                           {/* Main Controls - Side by Side */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-4">
                              {/* Current Price Change */}
                              <div className="space-y-2">
                                 <Label className="text-sm font-semibold flex items-center gap-1.5">
                                    Current Price Change (%)
                                    <span className="text-muted-foreground font-normal text-xs">[Lock in %]</span>
                                    <InfoTooltip text="Enter the current percentage change in stock price. This helps calculate the optimal buy price for today's execution." />
                                 </Label>
                                 <div className="relative">
                                    <Input
                                       type="number"
                                       step="0.1"
                                       placeholder="-2.4"
                                       className="h-11 md:h-8 text-base md:text-sm font-semibold pl-3 md:pl-2.5 pr-8"
                                       value={lockInPct}
                                       onChange={e => setLockInPct(e.target.value)}
                                       autoFocus
                                    />
                                    <div className="absolute right-3 md:right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">%</div>
                                 </div>
                                 <p className="text-[10px] text-muted-foreground leading-tight">
                                    Tip: If red, lock early. If green, you may wait closer to close.
                                 </p>
                              </div>

                              {/* Conviction Adjustment */}
                              <div className="space-y-2">
                                 <div className="flex justify-between items-center gap-2">
                                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                       Daily Conviction
                                       <InfoTooltip text="Not Recommended! Adjust your conviction level if today's market news or events significantly impact your investment thesis." />
                                    </Label>
                                    <Badge className={
                                       convictionOverride[0] < 45 ? "bg-red-500 hover:bg-red-600 h-6 md:h-5 px-2 md:px-1.5 text-xs md:text-[10px]" :
                                          convictionOverride[0] > 55 ? "bg-emerald-500 hover:bg-emerald-600 h-6 md:h-5 px-2 md:px-1.5 text-xs md:text-[10px]" :
                                             "bg-yellow-500 hover:bg-yellow-600 h-6 md:h-5 px-2 md:px-1.5 text-xs md:text-[10px]"
                                    }>
                                       {convictionOverride[0]}% Confidence
                                    </Badge>
                                 </div>
                                 <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={convictionOverride}
                                    onValueChange={setConvictionOverride}
                                    className="py-1 md:py-0.5 pt-3 md:pt-2 cursor-pointer"
                                 />
                              </div>
                           </div>



                           {/* Actions Footer */}
                           <div className="mt-6 -mx-4 -mb-4 p-4 bg-muted/40 border-t flex flex-col md:flex-row gap-3 md:gap-2 rounded-b-xl">
                              <Button
                                 size="sm"
                                 className="py-2 flex-1 h-16 md:h-9 text-base md:text-sm font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                 onClick={handleCalculate}
                                 disabled={!lockInPct || isCalculating}
                              >
                                 {isCalculating ? (
                                    <>
                                       <Icons.Refresh className="mr-2 w-5 h-5 md:w-4 md:h-4 animate-spin" />
                                       Calculating...
                                    </>
                                 ) : (
                                    <>
                                       <Icons.TrendUp className="mr-2 w-5 h-5 md:w-4 md:h-4" />
                                       Calculate Amount
                                    </>
                                 )}
                              </Button>

                              <Button
                                 variant="outline"
                                 size="sm"
                                 className="h-12 md:h-9 w-full md:w-auto px-4 text-sm md:text-xs border-dashed text-muted-foreground hover:text-foreground hover:bg-background"
                              >
                                 Skip for Today
                              </Button>
                           </div>

                        </CardContent>
                     </Card>
                  )}

                  {/* Error Display */}
                  {calculationError && (
                     <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                        <div className="flex items-start gap-2">
                           <Icons.AlertCircle size={14} className="mt-0.5 shrink-0" />
                           <span>{calculationError}</span>
                        </div>
                     </div>
                  )}

                  {executionState === 'CALCULATED' && recommendation && (
                     <Card className="border-l-4 border-l-emerald-500 shadow-xl animate-in fade-in zoom-in-95 duration-300">
                        <CardHeader className="bg-emerald-500/5 pb-3">
                           <CardTitle className="text-lg text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                              <Icons.Check className="w-4 h-4" /> Recommendation Generated
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5 p-5">

                           <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-start">
                              <div className="space-y-1">
                                 <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Recommended Amount</p>
                                 <div className="text-4xl font-black text-foreground tracking-tight">
                                    ${recommendation.recommended_amount.toLocaleString()}
                                 </div>
                                 <p className="text-xs text-muted-foreground flex items-center gap-2 leading-tight">
                                    <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium">Ref Price: ${recommendation.signals.avg_holding_price.toFixed(2)}</span>
                                    <span>~ {(recommendation.recommended_amount / recommendation.signals.avg_holding_price).toFixed(2)} shares</span>
                                 </p>
                              </div>

                              <div className="border rounded-lg p-3.5 bg-muted/30 space-y-2">
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground text-xs">New Projected Avg</span>
                                    <span className="font-bold">${((totalInvested + recommendation.recommended_amount) / (totalShares + (recommendation.recommended_amount / recommendation.signals.avg_holding_price))).toFixed(2)}</span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground text-xs">Remaining in Cycle</span>
                                    <span className="font-bold">${recommendation.partition_status.capital_remaining.toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground text-xs">Cycle Days Left</span>
                                    <span className="font-bold">{trackerData ? Math.ceil((100 - recommendation.partition_status.time_progress_pct) * trackerData.partition_days / 100) : 'N/A'}</span>
                                 </div>
                              </div>
                           </div>

                           <Separator />

                           <div className="flex flex-col md:flex-row gap-3">
                              <Button
                                 size="default"
                                 className="flex-1 h-11 md:h-10 bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20 shadow-md font-semibold"
                                 onClick={() => setExecutionState('CONFIRMING')}
                              >
                                 <Icons.Check className="mr-2 w-4 h-4" /> Place Order & Confirm
                              </Button>
                              <Button variant="outline" size="default" className="h-11 md:h-10 w-full md:w-auto px-4" onClick={() => setExecutionState('IDLE')}>
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
                                 <Label className="text-sm font-semibold">Actual Invested Amount ($)</Label>
                                 <Input
                                    type="number"
                                    className="h-11 md:h-10 text-lg font-semibold bg-background"
                                    value={executedAmount}
                                    onChange={e => setExecutedAmount(e.target.value)}
                                    disabled={isConfirming}
                                 />
                              </div>
                              <div className="space-y-2">
                                 <Label className="text-sm font-semibold">Execution Price ($)</Label>
                                 <Input
                                    type="number"
                                    step="0.05"
                                    className="h-11 md:h-10 text-lg font-semibold bg-background"
                                    value={executionPrice}
                                    onChange={e => setExecutionPrice(e.target.value)}
                                    disabled={isConfirming}
                                 />
                              </div>
                           </div>

                           {/* Error Display */}
                           {confirmError && (
                              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                                 <div className="flex items-start gap-2">
                                    <Icons.AlertCircle size={14} className="mt-0.5 shrink-0" />
                                    <span>{confirmError}</span>
                                 </div>
                              </div>
                           )}

                           <div className="flex flex-col md:flex-row gap-3 pt-2">
                              <Button
                                 size="default"
                                 className="flex-1 h-11 font-semibold shadow-lg"
                                 onClick={handleConfirm}
                                 disabled={isConfirming || !executedAmount || !executionPrice}
                              >
                                 {isConfirming ? (
                                    <>
                                       <Icons.Refresh className="mr-2 w-4 h-4 animate-spin" />
                                       Confirming...
                                    </>
                                 ) : (
                                    <>
                                       <Icons.Check className="mr-2 w-4 h-4" /> Confirm & Record
                                    </>
                                 )}
                              </Button>
                              <Button
                                 variant="ghost"
                                 size="default"
                                 className="h-11 w-full md:w-auto px-4"
                                 onClick={() => setExecutionState('CALCULATED')}
                                 disabled={isConfirming}
                              >
                                 Cancel
                              </Button>
                           </div>

                        </CardContent>
                     </Card>
                  )}

               </div>

               {/* 2. Tracker Summary & Progress (Read-Only) */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Summary Card */}
                  <Card className="bg-muted/20 border-border/50 shadow-sm">
                     <CardHeader className="pb-3">
                        <div className="flex items-center justify-between w-full">
                           <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                                 <Icons.Settings size={14} className="text-muted-foreground" />
                              </div>
                              <div>
                                 <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                    Engine Configuration
                                    <InfoTooltip text="Your investment strategy parameters. These define how your capital is deployed over time." />
                                 </CardTitle>
                              </div>
                           </div>
                           {!isEditing && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs px-2.5" onClick={() => {
                                 // Initialize edit form with current display values (API or hardcoded)
                                 // Map displayLoadFactor to correct uppercase format for dropdown
                                 // API mapping: 1=GRADUAL, 2=MODERATE, 3=AGGRESSIVE
                                 const loadFactorMap: Record<string, string> = {
                                    'Gradual': 'GRADUAL',
                                    'Moderate': 'MODERATE',
                                    'Aggressive': 'AGGRESSIVE',
                                 };

                                 setEditConfig({
                                    totalBudget: displayTotalBudget,
                                    convictionYears: displayConvictionYears,
                                    loadFactor: (loadFactorMap[displayLoadFactor] || displayLoadFactor) as any,
                                    partitionMonths: displayPartitionMonths,
                                    convictionLevel: displayConvictionLevel,
                                 });
                                 setValidationErrors({});
                                 setIsEditing(true);
                              }}>
                                 Edit
                              </Button>
                           )}
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-y-3.5 text-sm">
                           {!isEditing ? (
                              // READ ONLY VIEW
                              <>
                                 <div className="flex justify-between md:block border-b md:border-0 pb-2 md:pb-0 border-dashed border-muted">
                                    <p className="text-xs text-muted-foreground">Conviction Period</p>
                                    <p className="font-semibold">{displayConvictionYears} years</p>
                                 </div>
                                 <div className="flex justify-between md:block border-b md:border-0 pb-2 md:pb-0 border-dashed border-muted">
                                    <p className="text-xs text-muted-foreground">Total Budget</p>
                                    <p className="font-semibold">${displayTotalBudget.toLocaleString()}</p>
                                 </div>
                                 <div className="flex justify-between md:block border-b md:border-0 pb-2 md:pb-0 border-dashed border-muted">
                                    <p className="text-xs text-muted-foreground">Overall Conviction</p>
                                    <p className="font-semibold">{displayConvictionLevel}%</p>
                                 </div>
                                 <div className="flex justify-between md:block border-b md:border-0 pb-2 md:pb-0 border-dashed border-muted">
                                    <p className="text-xs text-muted-foreground">Load Factor</p>
                                    <p className="font-semibold capitalize">{displayLoadFactor}</p>
                                 </div>
                                 <div className="flex justify-between md:block pt-1 md:pt-0">
                                    <p className="text-xs text-muted-foreground">Investment Cycle Length</p>
                                    <p className="font-semibold">{displayPartitionMonths} trading months</p>
                                 </div>
                              </>
                           ) : (
                              // EDIT VIEW
                              <>
                                 <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Cycle Length (Months)</Label>
                                    <Input
                                       type="number"
                                       className="h-10 md:h-8"
                                       value={editConfig.partitionMonths || ''}
                                       onChange={e => setEditConfig({ ...editConfig, partitionMonths: e.target.value === '' ? 0 : Number(e.target.value) })}
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Total Budget ($)</Label>
                                    <Input
                                       type="number"
                                       className="h-10 md:h-8"
                                       value={editConfig.totalBudget || ''}
                                       onChange={e => setEditConfig({ ...editConfig, totalBudget: e.target.value === '' ? 0 : Number(e.target.value) })}
                                       placeholder="Enter total budget"
                                    />
                                 </div>
                                 <div className="space-y-3 md:col-span-2 pt-2 md:pt-0">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                       Conviction Adjustment
                                       <InfoTooltip text="Your overall conviction strength (X-Factor). Higher values execute more aggressively." />
                                    </Label>
                                    <div className="flex items-center gap-3">
                                       <Slider
                                          min={0}
                                          max={100}
                                          step={1}
                                          className="flex-1 py-1"
                                          value={[editConfig.convictionLevel || 50]}
                                          onValueChange={(val) => setEditConfig({ ...editConfig, convictionLevel: val[0] })}
                                       />
                                       <span className="w-12 text-center text-sm font-bold bg-muted p-1 rounded">
                                          {editConfig.convictionLevel}%
                                       </span>
                                    </div>
                                 </div>
                                 <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-semibold flex justify-between">
                                       Load Factor
                                       <span className="text-[10px] text-amber-600 font-normal">*Not recommended to change</span>
                                    </Label>
                                    <Select
                                       value={editConfig.loadFactor}
                                       onValueChange={(val: any) => setEditConfig({ ...editConfig, loadFactor: val })}
                                    >
                                       <SelectTrigger className="h-10 md:h-8">
                                          <SelectValue placeholder="Select load factor" />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="GRADUAL">Gradual</SelectItem>
                                          <SelectItem value="MODERATE">Moderate</SelectItem>
                                          <SelectItem value="AGGRESSIVE">Aggressive</SelectItem>


                                       </SelectContent>
                                    </Select>
                                 </div>
                                 <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-semibold">Investment Cycle Length (Months)</Label>
                                    <Input
                                       type="number"
                                       className="h-10 md:h-8"
                                       value={editConfig.partitionMonths || ''}
                                       onChange={e => setEditConfig({ ...editConfig, partitionMonths: e.target.value === '' ? 0 : Number(e.target.value) })}
                                    />
                                 </div>
                              </>
                           )}
                        </div>

                        {isEditing && (
                           <div className="space-y-3 pt-2">
                              {/* Validation Errors/Info */}
                              {Object.keys(validationErrors).length > 0 && (
                                 <div className={`p-3 rounded-lg border ${validationErrors['Info']
                                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                                    : 'bg-destructive/10 border-destructive/20'
                                    }`}>
                                    <div className={`flex items-start gap-2 ${validationErrors['Info']
                                       ? 'text-blue-700 dark:text-blue-300'
                                       : 'text-destructive'
                                       }`}>
                                       <Icons.AlertCircle size={16} className="mt-0.5 shrink-0" />
                                       <div className="space-y-1 text-xs">
                                          {Object.entries(validationErrors).map(([field, error]) => (
                                             <p key={field}>{field === 'Info' ? error : <><strong>{field}:</strong> {error}</>}</p>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              )}

                              <div className="flex gap-2">
                                 <Button
                                    size="sm"
                                    disabled={isSaving}
                                    onClick={async () => {
                                       // Frontend Validation (matching backend rules)
                                       const errors: Record<string, string> = {};

                                       // Get current values for comparison
                                       const currentTotalBudget = displayTotalBudget;
                                       const currentConvictionYears = displayConvictionYears;
                                       const currentPartitionMonths = displayPartitionMonths;

                                       // Rule 1: total_capital_planned can only INCREASE
                                       if (editConfig.totalBudget < currentTotalBudget) {
                                          errors['Total Budget'] = `Can only increase (current: $${currentTotalBudget.toLocaleString()})`;
                                       }

                                       // Rule 2: conviction_period_years can only INCREASE
                                       if (editConfig.convictionYears < currentConvictionYears) {
                                          errors['Conviction Period'] = `Can only increase (current: ${currentConvictionYears} years)`;
                                       }

                                       // Rule 3: partition_months can only INCREASE
                                       if (editConfig.partitionMonths < currentPartitionMonths) {
                                          errors['Investment Cycle Length'] = `Can only increase (current: ${currentPartitionMonths} months)`;
                                       }

                                       // Rule 4: base_conviction_score must be 0-100
                                       if (editConfig.convictionLevel < 0 || editConfig.convictionLevel > 100) {
                                          errors['Overall Conviction'] = 'Must be between 0-100%';
                                       }

                                       // If there are validation errors, show them and stop
                                       if (Object.keys(errors).length > 0) {
                                          setValidationErrors(errors);
                                          return;
                                       }

                                       // Clear validation errors if all pass
                                       setValidationErrors({});

                                       // Check if any values have actually changed
                                       const currentLoadFactor = useApiData && trackerData ?
                                          (['GRADUAL', 'MODERATE', 'AGGRESSIVE'][trackerData.deployment_style - 1] || 'MODERATE') :
                                          stock.loadFactor;

                                       const hasChanges =
                                          editConfig.totalBudget !== currentTotalBudget ||
                                          editConfig.convictionYears !== currentConvictionYears ||
                                          editConfig.partitionMonths !== currentPartitionMonths ||
                                          editConfig.loadFactor !== currentLoadFactor ||
                                          editConfig.convictionLevel !== displayConvictionLevel;

                                       // If no changes, show info message and exit
                                       if (!hasChanges) {
                                          setValidationErrors({
                                             'Info': 'No changes detected. Please update at least one value to save.'
                                          });
                                          return;
                                       }

                                       // Legacy validation for warning modal
                                       const isSafe =
                                          editConfig.totalBudget >= stock.totalBudget &&
                                          editConfig.convictionYears >= stock.convictionYears &&
                                          editConfig.partitionMonths === stock.partitionMonths &&
                                          editConfig.loadFactor === stock.loadFactor &&
                                          editConfig.convictionLevel === stock.convictionLevel;

                                       if (isSafe || useApiData) {
                                          // If using API data, call the update API
                                          if (useApiData && trackerData?.trackerId) {
                                             setIsSaving(true);
                                             try {
                                                const { updateTracker } = await import('../lib/api.fetcher');

                                                // Map loadFactor to deployment_style number
                                                // API mapping: 1=GRADUAL, 2=MODERATE, 3=AGGRESSIVE
                                                const deploymentStyleMap: Record<string, number> = {
                                                   'GRADUAL': 1,
                                                   'MODERATE': 2,
                                                   'AGGRESSIVE': 3,
                                                };

                                                await updateTracker(trackerData.trackerId, {
                                                   total_capital_planned: editConfig.totalBudget,
                                                   conviction_period_years: editConfig.convictionYears,
                                                   partition_months: editConfig.partitionMonths,
                                                   deployment_style: deploymentStyleMap[editConfig.loadFactor] ?? 1,
                                                   base_conviction_score: editConfig.convictionLevel,
                                                });

                                                // Refresh tracker data
                                                const { fetchTrackerDetails } = await import('../store/slices/trackersSlice');
                                                dispatch(fetchTrackerDetails(trackerData.trackerId));

                                                console.log('[StockDetails] Tracker updated successfully');
                                             } catch (error) {
                                                console.error('[StockDetails] Failed to update tracker:', error);
                                                alert('Failed to update tracker. Please try again.');
                                                return;
                                             } finally {
                                                setIsSaving(false);
                                             }
                                          }

                                          onUpdate({ ...stock, ...editConfig });
                                          setIsEditing(false);
                                       } else {
                                          setShowWarning(true);
                                       }
                                    }}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                 </Button>
                                 <Button size="sm" variant="ghost" onClick={() => {
                                    setEditConfig({
                                       totalBudget: stock.totalBudget,
                                       convictionYears: stock.convictionYears,
                                       loadFactor: stock.loadFactor,
                                       partitionMonths: stock.partitionMonths,
                                       convictionLevel: stock.convictionLevel
                                    });
                                    setValidationErrors({});
                                    setIsEditing(false);
                                 }}>Cancel</Button>
                              </div>
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
                              Stock Engine Modification Warning
                           </DialogTitle>
                           <DialogDescription className="pt-2">
                              This change is not recommended for an existing stock engine. Reducing budget, conviction, or changing structural parameters can disrupt the mathematical execution.
                           </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                           <Button variant="outline" onClick={() => {
                              // Discard
                              setEditConfig({
                                 totalBudget: stock.totalBudget,
                                 convictionYears: stock.convictionYears,
                                 loadFactor: stock.loadFactor,
                                 partitionMonths: stock.partitionMonths,
                                 convictionLevel: stock.convictionLevel
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

                  {/* Success Popup */}
                  <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
                     <DialogContent className="sm:max-w-md text-center border-0 bg-background/95 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

                        <div className="flex flex-col items-center justify-center space-y-5 px-6 py-10 relative z-10">
                           {/* Animated Icon Container */}
                           <div className="relative">
                              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-in zoom-in-50 duration-500 delay-150">
                                 <Icons.Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
                              </div>
                              <div className="absolute -inset-2 rounded-full border border-emerald-500/10 animate-pulse" />
                           </div>

                           <div className="space-y-2 max-w-xs mx-auto animate-in slide-in-from-bottom-5 fade-in duration-700 delay-200">
                              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                                 Order Executed!
                              </DialogTitle>
                              <DialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
                                 Great discipline! Your investment has been successfully recorded for today.
                              </DialogDescription>
                           </div>

                           <div className="pt-2 w-full animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
                              <Button
                                 onClick={() => setShowSuccessPopup(false)}
                                 className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold tracking-wide"
                              >
                                 Continue
                              </Button>
                           </div>
                        </div>
                     </DialogContent>
                  </Dialog>

                  {/* Progress & Position Card */}
                  <Card className="border-primary/10 shadow-sm bg-background">
                     <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                 <Icons.Activity size={14} className="text-primary" />
                              </div>
                              <CardTitle className="text-sm font-semibold">Live Investment Cycle</CardTitle>
                           </div>
                           <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                 {currentCycle}/{totalCycles}
                              </Badge>
                           </div>
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-5 pb-4">

                        {/* Key Metrics Grid - Mobile Optimized */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                           {/* Invested Amount */}
                           <div className="space-y-1 p-4 md:p-3 rounded-lg bg-gradient-to-br from-blue-500/5 to-blue-600/10 border border-blue-500/10 shadow-sm">
                              <div className="flex items-center gap-2 text-xs md:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                 <Icons.TrendingUp size={12} className="text-blue-500" />
                                 Invested Amount
                              </div>
                              <div className="text-2xl md:text-xl font-black tracking-tight text-foreground">
                                 ${(useApiData && selectedTracker?.tracker?.live_investment_cycle?.total_capital_invested_so_far
                                    ? selectedTracker.tracker.live_investment_cycle.total_capital_invested_so_far
                                    : (totalShares * stock.currentPrice)
                                 ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </div>
                           </div>

                           {/* Total P&L */}
                           <div className={`space-y-1 p-4 md:p-3 rounded-lg border shadow-sm ${
                              (useApiData && selectedTracker?.tracker?.live_investment_cycle?.net_profit_percentage !== undefined
                                 ? selectedTracker.tracker.live_investment_cycle.net_profit_percentage
                                 : currentReturnPercent
                              ) >= 0
                              ? 'bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-emerald-500/10'
                              : 'bg-gradient-to-br from-red-500/5 to-red-600/10 border-red-500/10'
                              }`}>
                              <div className="flex items-center gap-2 text-xs md:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                 <Icons.DollarSign size={12} className={
                                    (useApiData && selectedTracker?.tracker?.live_investment_cycle?.net_profit_percentage !== undefined
                                       ? selectedTracker.tracker.live_investment_cycle.net_profit_percentage
                                       : currentReturnPercent
                                    ) >= 0 ? 'text-emerald-500' : 'text-red-500'
                                 } />
                                 Total P&L
                              </div>
                              <div className={`text-2xl md:text-xl font-black tracking-tight ${
                                 (useApiData && selectedTracker?.tracker?.live_investment_cycle?.net_profit_percentage !== undefined
                                    ? selectedTracker.tracker.live_investment_cycle.net_profit_percentage
                                    : currentReturnPercent
                                 ) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                 }`}>
                                 {(useApiData && selectedTracker?.tracker?.live_investment_cycle?.net_profit_percentage !== undefined
                                    ? selectedTracker.tracker.live_investment_cycle.net_profit_percentage
                                    : currentReturnPercent
                                 ) >= 0 ? '+' : ''}
                                 {(useApiData && selectedTracker?.tracker?.live_investment_cycle?.net_profit_percentage !== undefined
                                    ? selectedTracker.tracker.live_investment_cycle.net_profit_percentage
                                    : currentReturnPercent
                                 ).toFixed(2)}%
                              </div>
                           </div>

                           {/* Investment Cycle Progress */}
                           <div className="space-y-1 p-4 md:p-3 rounded-lg bg-gradient-to-br from-purple-500/5 to-purple-600/10 border border-purple-500/10 shadow-sm">
                              <div className="flex items-center gap-2 text-xs md:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                 <Icons.PieChart size={12} className="text-purple-500" />
                                 Cycle Progress
                              </div>
                              <div className="text-2xl md:text-xl font-black tracking-tight text-foreground">
                                 {useApiData && selectedTracker?.tracker?.live_investment_cycle?.partition_progress
                                    ? selectedTracker.tracker.live_investment_cycle.partition_progress.toFixed(1)
                                    : ((daysInvested % cycleLength) / cycleLength * 100).toFixed(1)
                                 }%
                              </div>
                           </div>
                        </div>

                        {/* Segmented Progress Bar */}
                        <div className="space-y-3">
                           <div className="flex justify-between items-center">
                              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                                 <Icons.Target size={14} className="text-cyan-500" />
                                 Deployment Progress
                              </h3>
                              <span className="text-xs font-mono font-medium text-muted-foreground">
                                 {((currentCycle / totalCycles) * 100).toFixed(1)}% Complete
                              </span>
                           </div>

                           {/* Progress Bar - Smart Windowing (Max 8 Pills) */}
                           <div className="relative w-full bg-slate-900/30 rounded-full p-2 ring-1 ring-slate-800/50 shadow-inner">
                              <div className="flex gap-2 w-full">
                                 {(() => {
                                    const maxPills = 8;
                                    const pills = [];
                                    
                                    // If total cycles <= 8, show all individual pills
                                    if (totalCycles <= maxPills) {
                                       for (let i = 1; i <= totalCycles; i++) {
                                          const partitionIndex = i;
                                          const isCompleted = partitionIndex < currentCycle;
                                          const isActive = partitionIndex === currentCycle;
                                          const isUpcoming = partitionIndex > currentCycle;
                                          
                                          const progressPercentage = isActive && useApiData && selectedTracker?.tracker?.live_investment_cycle?.partition_progress
                                             ? selectedTracker.tracker.live_investment_cycle.partition_progress
                                             : 0;
                                          
                                          pills.push(
                                             <TooltipProvider key={partitionIndex} delayDuration={0}>
                                                <Tooltip>
                                                   <TooltipTrigger asChild>
                                                      <button
                                                         onClick={() => {
                                                            if (!isUpcoming) {
                                                               handlePartitionClick(partitionIndex);
                                                            }
                                                         }}
                                                         disabled={isUpcoming}
                                                         className={`flex-1 h-8 rounded-full transition-all duration-300 relative group overflow-hidden ${
                                                            isCompleted
                                                               ? "bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 cursor-pointer"
                                                               : isActive
                                                                  ? "bg-slate-800 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:shadow-[0_0_25px_rgba(34,211,238,0.8)] scale-105 cursor-pointer"
                                                                  : "bg-slate-800/50 border border-slate-700 cursor-not-allowed opacity-50"
                                                         }`}
                                                      >
                                                         {isActive && (
                                                            <>
                                                               {/* Water wave fill */}
                                                               <span 
                                                                  className="absolute inset-0 rounded-full overflow-hidden"
                                                                  style={{ 
                                                                     clipPath: 'inset(0 round 9999px)'
                                                                  }}
                                                               >
                                                                  <span
                                                                     className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500"
                                                                     style={{ 
                                                                        bottom: 0,
                                                                        height: `${progressPercentage}%`,
                                                                        top: 'auto'
                                                                     }}
                                                                  >
                                                                     {/* Wave animation overlay */}
                                                                     <span 
                                                                        className="absolute inset-x-0 -top-2"
                                                                        style={{
                                                                           height: '8px',
                                                                           background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
                                                                           animation: 'wave 2s ease-in-out infinite'
                                                                        }}
                                                                     />
                                                                  </span>
                                                               </span>
                                                               
                                                               {/* Pulsing glow */}
                                                               <span className="absolute -inset-0.5 rounded-full bg-cyan-400/20 animate-pulse" />
                                                               
                                                               {/* Percentage text */}
                                                               <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white z-20">
                                                                  {progressPercentage.toFixed(0)}%
                                                               </span>
                                                            </>
                                                         )}
                                                         {isCompleted && (
                                                            <span className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
                                                         )}
                                                         {isUpcoming && (
                                                            <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-slate-600" />
                                                         )}
                                                      </button>
                                                   </TooltipTrigger>
                                                   <TooltipContent side="top" className="text-xs font-semibold bg-slate-900 text-white border-slate-700 px-3 py-1.5">
                                                      <div className="text-center">
                                                         <div className="font-bold">Partition {partitionIndex}</div>
                                                         <div className="text-[10px] text-slate-400 mt-0.5">
                                                            {isCompleted ? "Completed" : isActive ? `Active (${progressPercentage.toFixed(1)}%)` : "Upcoming"}
                                                         </div>
                                                      </div>
                                                   </TooltipContent>
                                                </Tooltip>
                                             </TooltipProvider>
                                          );
                                       }
                                       return pills;
                                    }
                                    
                                    // Smart windowing for > 8 total cycles
                                    // Strategy: Show 4 previous + 1 active + 2 upcoming + 1 grouped range
                                    const prevCount = 4;
                                    const upcomingIndividualCount = 2;
                                    
                                    // Calculate window boundaries
                                    let startIndex = Math.max(1, currentCycle - prevCount);
                                    let endIndex = currentCycle + upcomingIndividualCount;
                                    
                                    // Adjust if near the start
                                    if (currentCycle <= prevCount) {
                                       startIndex = 1;
                                       endIndex = Math.min(maxPills - 1, totalCycles); // Leave room for grouped pill
                                    }
                                    
                                    // Adjust if near the end
                                    if (currentCycle + upcomingIndividualCount >= totalCycles) {
                                       endIndex = totalCycles;
                                       startIndex = Math.max(1, totalCycles - maxPills + 1);
                                    }
                                    
                                    const progressPercentage = useApiData && selectedTracker?.tracker?.live_investment_cycle?.partition_progress
                                       ? selectedTracker.tracker.live_investment_cycle.partition_progress
                                       : 0;
                                    
                                    // Add grouped pill at start if needed
                                    if (startIndex > 1) {
                                       const groupedStart = 1;
                                       const groupedEnd = startIndex - 1;
                                       pills.push(
                                          <TooltipProvider key="start-group" delayDuration={0}>
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <button
                                                      onClick={() => handlePartitionClick(groupedEnd)}
                                                      className="flex-1 h-8 rounded-full transition-all duration-300 relative group overflow-hidden cursor-pointer bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
                                                   >
                                                      <span className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
                                                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90 z-10">
                                                         {groupedStart}-{groupedEnd}
                                                      </span>
                                                   </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs font-semibold bg-slate-900 text-white border-slate-700 px-3 py-1.5">
                                                   <div className="text-center">
                                                      <div className="font-bold">Partitions {groupedStart}-{groupedEnd}</div>
                                                      <div className="text-[10px] text-slate-400 mt-0.5">Completed · Click to view partition {groupedEnd}</div>
                                                   </div>
                                                </TooltipContent>
                                             </Tooltip>
                                          </TooltipProvider>
                                       );
                                    }
                                    
                                    // Add individual pills in the window
                                    for (let i = startIndex; i <= Math.min(endIndex, totalCycles); i++) {
                                       const partitionIndex = i;
                                       const isCompleted = partitionIndex < currentCycle;
                                       const isActive = partitionIndex === currentCycle;
                                       const isUpcoming = partitionIndex > currentCycle;
                                       
                                       pills.push(
                                          <TooltipProvider key={partitionIndex} delayDuration={0}>
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <button
                                                      onClick={() => {
                                                         if (!isUpcoming) {
                                                            handlePartitionClick(partitionIndex);
                                                         }
                                                      }}
                                                      disabled={isUpcoming}
                                                      className={`flex-1 h-8 rounded-full transition-all duration-300 relative group overflow-hidden ${
                                                         isCompleted
                                                            ? "bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 cursor-pointer"
                                                            : isActive
                                                               ? "bg-slate-800 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:shadow-[0_0_25px_rgba(34,211,238,0.8)] scale-105 cursor-pointer"
                                                               : "bg-slate-800/50 border border-slate-700 cursor-not-allowed opacity-50"
                                                      }`}
                                                   >
                                                      {isActive && (
                                                         <>
                                                            {/* Water wave fill */}
                                                            <span 
                                                               className="absolute inset-0 rounded-full overflow-hidden"
                                                               style={{ 
                                                                  clipPath: 'inset(0 round 9999px)'
                                                               }}
                                                            >
                                                               <span
                                                                  className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500"
                                                                  style={{ 
                                                                     bottom: 0,
                                                                     height: `${progressPercentage}%`,
                                                                     top: 'auto'
                                                                  }}
                                                               >
                                                                  {/* Wave animation overlay */}
                                                                  <span 
                                                                     className="absolute inset-x-0 -top-2"
                                                                     style={{
                                                                        height: '8px',
                                                                        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
                                                                        animation: 'wave 2s ease-in-out infinite'
                                                                     }}
                                                                  />
                                                               </span>
                                                            </span>
                                                            
                                                            {/* Pulsing glow */}
                                                            <span className="absolute -inset-0.5 rounded-full bg-cyan-400/20 animate-pulse" />
                                                            
                                                            {/* Percentage text */}
                                                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white z-20">
                                                               {progressPercentage.toFixed(0)}%
                                                            </span>
                                                         </>
                                                      )}
                                                      {isCompleted && (
                                                         <span className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
                                                      )}
                                                      {isUpcoming && (
                                                         <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-slate-600" />
                                                      )}
                                                   </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs font-semibold bg-slate-900 text-white border-slate-700 px-3 py-1.5">
                                                   <div className="text-center">
                                                      <div className="font-bold">Partition {partitionIndex}</div>
                                                      <div className="text-[10px] text-slate-400 mt-0.5">
                                                         {isCompleted ? "Completed" : isActive ? `Active (${progressPercentage.toFixed(1)}%)` : "Upcoming"}
                                                      </div>
                                                   </div>
                                                </TooltipContent>
                                             </Tooltip>
                                          </TooltipProvider>
                                       );
                                    }
                                    
                                    // Add grouped pill at end if needed
                                    if (endIndex < totalCycles) {
                                       const groupedStart = endIndex + 1;
                                       const groupedEnd = totalCycles;
                                       pills.push(
                                          <TooltipProvider key="end-group" delayDuration={0}>
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <button
                                                      disabled
                                                      className="flex-1 h-8 rounded-full transition-all duration-300 relative group overflow-hidden bg-slate-800/50 border border-slate-700 cursor-not-allowed opacity-50"
                                                   >
                                                      <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-slate-600" />
                                                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                                         {groupedStart}-{groupedEnd}
                                                      </span>
                                                   </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs font-semibold bg-slate-900 text-white border-slate-700 px-3 py-1.5">
                                                   <div className="text-center">
                                                      <div className="font-bold">Partitions {groupedStart}-{groupedEnd}</div>
                                                      <div className="text-[10px] text-slate-400 mt-0.5">Upcoming</div>
                                                   </div>
                                                </TooltipContent>
                                             </Tooltip>
                                          </TooltipProvider>
                                       );
                                    }
                                    
                                    return pills;
                                 })()}
                              </div>
                           </div>
                           
                           {/* Add animation keyframes */}
                           <style>{`
                              @keyframes wave {
                                 0%, 100% { 
                                    transform: translateX(-50%) translateY(0);
                                 }
                                 50% { 
                                    transform: translateX(-50%) translateY(-2px);
                                 }
                              }
                           `}</style>

                           <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-1">
                              <span>START</span>
                              <span className="font-semibold">{currentCycle}/{totalCycles}</span>
                              <span>END</span>
                           </div>
                        </div>
                     </CardContent>
                  </Card>

                  {/* Partition Details Modal - Premium Design */}
                  <Dialog open={selectedPartition !== null} onOpenChange={(open) => !open && setSelectedPartition(null)}>
                     <DialogContent hideCloseButton className="max-w-lg p-0 overflow-hidden bg-slate-950 border-slate-800 shadow-2xl rounded-3xl">
                        {isLoadingPartition ? (
                           <div className="py-12 text-center">
                              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                              <p className="text-sm text-muted-foreground mt-3">Loading partition details...</p>
                           </div>
                        ) : selectedPartition !== null && (
                           <>
                              {/* Header */}
                              <div className="relative bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent p-6 pb-8">
                                 {/* Close Button - Absolute Top Right */}
                                 <button
                                    onClick={() => setSelectedPartition(null)}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all z-10 backdrop-blur-sm"
                                 >
                                    ✕
                                 </button>

                                 <div className="flex items-start gap-4 pr-8">
                                    {/* Partition Badge */}
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                                       <span className="font-mono font-black text-2xl text-white">I{partitionDetails?.partition_index || (selectedPartition + 1)}</span>
                                    </div>

                                    {/* Title and Info */}
                                    <div className="flex-1 min-w-0">
                                       {/* Title with Status Badge */}
                                       <div className="flex items-center gap-2 mb-1.5">
                                          <h3 className="font-bold text-xl text-white leading-none">Investment Cycle</h3>
                                          <Badge
                                             variant={partitionDetails?.status === 2 ? "default" : "outline"}
                                             className={partitionDetails?.status === 2
                                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30 px-3 py-0.5 text-xs font-semibold"
                                                : partitionDetails?.status === 1
                                                   ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border-cyan-500/30 px-3 py-0.5 text-xs font-semibold"
                                                   : "bg-slate-700/50 text-slate-400 border-slate-600 px-3 py-0.5 text-xs font-semibold"
                                             }
                                          >
                                             {partitionDetails?.status}
                                          </Badge>
                                       </div>

                                       {/* Current Cycle Info */}
                                       <p className="text-sm text-slate-400 font-mono">
                                          Current Cycle {partitionDetails?.partition_index || (selectedPartition + 1)} • {partitionDetails?.expected_days || displayPartitionMonths} days
                                       </p>
                                    </div>
                                 </div>
                              </div>

                              {/* Content */}
                              <div className="p-6 pb-8 space-y-6">
                                 {partitionDetails ? (
                                    <>
                                       {/* Main Metrics Grid */}
                                       <div className="grid grid-cols-2 gap-4">
                                          {/* Capital Invested */}
                                          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                                             <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
                                                <Icons.Wallet size={14} />
                                                Capital Invested
                                             </div>
                                             <div className="text-3xl font-black text-white tracking-tight">
                                                ${(partitionDetails?.capital_deployed || 0).toLocaleString()}
                                             </div>
                                             <div className="text-xs text-slate-500 mt-1">
                                                of ${(partitionDetails?.capital_allocated || 0).toLocaleString()} allocated
                                             </div>
                                          </div>





                                          {/* Net Return */}
                                          <div className={`p-4 rounded-2xl border ${(partitionDetails?.net_profit_percentage || 0) >= 0
                                             ? 'bg-emerald-500/10 border-emerald-500/30'
                                             : 'bg-red-500/10 border-red-500/30'
                                             }`}>
                                             <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
                                                <Icons.Activity size={14} />
                                                Net Return
                                             </div>
                                             <div className={`text-3xl font-black tracking-tight ${(partitionDetails?.net_profit_percentage || 0) >= 0
                                                ? 'text-emerald-400'
                                                : 'text-red-400'
                                                }`}>
                                                {(partitionDetails?.net_profit_percentage || 0) >= 0 ? '+' : ''}{(partitionDetails?.net_profit_percentage || 0).toFixed(2)}%
                                             </div>
                                          </div>
                                       </div>

                                       {/* Additional Details */}
                                       <div className="space-y-3 pt-2">
                                          {partitionDetails?.end_date && (
                                             <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                                <span className="text-sm text-slate-400">End Date</span>
                                                <span className="text-sm font-semibold text-white font-mono">
                                                   {new Date(partitionDetails.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                             </div>
                                          )}
                                          <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                             <span className="text-sm text-slate-400">Days Active</span>
                                             <span className="text-sm font-semibold text-white">{partitionDetails?.expected_days || displayPartitionMonths} days</span>
                                          </div>
                                          <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                             <span className="text-sm text-slate-400">Units Acquired</span>
                                             <span className="text-sm font-semibold text-white font-mono">{(partitionDetails?.shares_bought || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                          </div>
                                          {partitionDetails?.start_date && (
                                             <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-slate-400">Start Date</span>
                                                <span className="text-sm font-semibold text-white font-mono">
                                                   {new Date(partitionDetails.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                             </div>
                                          )}
                                       </div>
                                    </>
                                 ) : (
                                    <div className="py-12 text-center space-y-4">
                                       <div className="w-20 h-20 rounded-full bg-slate-800/30 flex items-center justify-center mx-auto text-slate-600 border-2 border-dashed border-slate-700">
                                          <Icons.Clock className="w-10 h-10" />
                                       </div>
                                       <div className="space-y-2">
                                          <p className="font-semibold text-white text-lg">Awaiting Execution</p>
                                          <p className="text-sm text-slate-400 max-w-[250px] mx-auto">
                                             This investment cycle is scheduled for a future date.
                                          </p>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </>
                        )}
                     </DialogContent>
                  </Dialog>

                  {/* Victory Popup - Completing a Cycle */}
                  <Dialog open={showVictoryPopup} onOpenChange={setShowVictoryPopup}>
                     <DialogContent className="sm:max-w-md text-center border-0 bg-background/95 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden">
                        {/* Golden/Amber Gradient for Victory */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />


                        <div className="flex flex-col items-center justify-center space-y-5 px-6 py-10 relative z-10">
                           <div className="relative">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in zoom-in-50 duration-700">
                                 <Icons.Target className="w-12 h-12 text-amber-600 dark:text-amber-400 drop-shadow-sm" />
                              </div>
                              <div className="absolute -inset-2 rounded-full border border-amber-500/20 animate-spin-slow duration-[10s]" />
                              <div className="absolute -inset-4 rounded-full border border-amber-500/10 animate-pulse duration-[3s]" />
                           </div>

                           <div className="space-y-2 max-w-sm mx-auto animate-in slide-in-from-bottom-5 fade-in duration-700 delay-200">
                              <DialogTitle className="text-2xl font-black tracking-tight text-foreground uppercase">
                                 Partition Completed!
                              </DialogTitle>
                              <DialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
                                 Outstanding discipline! You have successfully completed a full investment cycle.
                              </DialogDescription>
                           </div>

                           <div className="pt-2 w-full animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
                              <Button
                                 onClick={() => setShowVictoryPopup(false)}
                                 className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-bold tracking-wide"
                              >
                                 Proceed to Next Cycle
                              </Button>
                           </div>
                        </div>
                     </DialogContent>
                  </Dialog>

                  {/* Kill Switch Popup - Negative Return Warning */}
                  <Dialog open={showKillSwitchPopup} onOpenChange={setShowKillSwitchPopup}>
                     <DialogContent className="sm:max-w-md text-center border-l-4 border-l-red-500">
                        <DialogHeader>
                           <DialogTitle className="flex items-center justify-center gap-2 text-red-600 text-xl">
                              <Icons.AlertTriangle className="w-6 h-6" />
                              Stop Execution Warning
                           </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                           <p className="text-sm text-muted-foreground">
                              We noticed your portfolio is currently down by <span className="font-bold text-red-500">{currentReturnPercent.toFixed(2)}%</span>.
                              Since you are more than halfway through the cycle, it is recommended to halt further investment to protect capital.
                           </p>
                           <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                              <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                                 "Good traders know when to throttle down."
                              </p>
                           </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                           <Button
                              variant="destructive"
                              className="w-full sm:w-auto flex-1 shadow-md"
                              onClick={() => setShowKillSwitchPopup(false)}
                           >
                              <Icons.Zap className="w-4 h-4 mr-2" /> Kill Switch (Stop)
                           </Button>
                           <Button
                              variant="ghost"
                              className="w-full sm:w-auto"
                              onClick={() => {
                                 setShowKillSwitchPopup(false);
                                 // Allow implementation if user insists (optional based on strictness)
                                 performCalculation();
                              }}
                           >
                              Ignore & Execute
                           </Button>
                        </DialogFooter>
                     </DialogContent>
                  </Dialog>



               </div>


            </div>
         </ScrollArea>
      </div>
   );
};

export default StockDetails;
