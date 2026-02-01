import React, { useState } from 'react';
import { Icons } from '../constants';
import { LoadFactor, Stock } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface AddStockProps {
   onBack: () => void;
   onAdd: (stock: Stock) => void;
   initialValues?: Partial<Stock>;
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

const AddStock: React.FC<AddStockProps> = ({ onBack, onAdd, initialValues }) => {
   // const [step, setStep] = useState<1 | 2>(1); // Removed stepper
   const [alreadyInvested, setAlreadyInvested] = useState<boolean>(false);

   const [symbol, setSymbol] = useState(initialValues?.symbol || '');
   const [budget, setBudget] = useState(initialValues?.totalBudget?.toString() || '50000');
   const [partition, setPartition] = useState(initialValues?.partitionDays?.toString() || '22');
   const [convictionYears, setConvictionYears] = useState(initialValues?.convictionYears?.toString() || '3');
   const [loadFactor, setLoadFactor] = useState<LoadFactor>(initialValues?.loadFactor || LoadFactor.MODERATE);

   const [quantityOwned, setQuantityOwned] = useState('0');
   const [averagePriceOwned, setAveragePriceOwned] = useState('0');

   const [convictionLevel, setConvictionLevel] = useState([initialValues?.convictionLevel || 75]);
   // const [priceMovementPct, setPriceMovementPct] = useState('0'); // Removed as requested

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!symbol) return;

      const newStock: Stock = {
         id: Date.now().toString(),
         symbol: symbol.toUpperCase(),
         name: symbol.toUpperCase(),
         totalBudget: Number(budget),
         partitionDays: Number(partition),
         convictionYears: Number(convictionYears),
         loadFactor,
         deployedAmount: 0,
         currentAverage: Number(averagePriceOwned),
         currentPrice: 1250.45, // Mock price
         isPaused: false,
         history: [],
         quantityOwned: alreadyInvested ? Number(quantityOwned) : 0,
         averagePriceOwned: alreadyInvested ? Number(averagePriceOwned) : 0,
         convictionLevel: convictionLevel[0],
         priceMovementPct: 0, // Default to 0 for new strategies
      };
      onAdd(newStock);
   };

   return (
      <div className="flex-1 flex flex-col h-full bg-background">
         <div className="p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur z-10 transition-all">
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
               <Icons.ArrowLeft size={20} />
            </Button>
            <div>
               <h1 className="text-xl font-bold tracking-tight">New Stock Engine</h1>
               <p className="text-xs text-muted-foreground">Configure Dynamic SIP Parameters</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 md:p-8 lg:px-16 xl:px-24 w-full space-y-8 pb-32">

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-primary" />
                           Asset Details
                        </h3>
                        <div className="grid gap-2">
                           <Label>Stock Symbol</Label>
                           <Input
                              required
                              autoFocus
                              placeholder="e.g. NFLX"
                              value={symbol}
                              onChange={e => setSymbol(e.target.value)}
                              className="text-lg font-bold uppercase tracking-wider"
                           />
                        </div>

                        <div className="flex items-center space-x-2 border p-4 rounded-lg bg-card/50">
                           <Checkbox
                              id="fresh"
                              checked={!alreadyInvested}
                              onCheckedChange={(checked) => setAlreadyInvested(checked === false)}
                           />
                           <Label htmlFor="fresh" className="font-medium cursor-pointer">
                              This is a fresh investment (I don't own this stock yet)
                           </Label>
                        </div>

                        {alreadyInvested && (
                           <Card className="bg-secondary/20 border-dashed animate-in slide-in-from-top-2 fade-in duration-300">
                              <CardContent className="pt-6 grid grid-cols-2 gap-4">
                                 <div className="grid gap-2">
                                    <Label>Total amount invested so far</Label>
                                    <Input
                                       type="number"
                                       value={averagePriceOwned ? (Number(quantityOwned) * Number(averagePriceOwned)).toString() : ''}
                                       onChange={e => {
                                          const total = Number(e.target.value);
                                          if (Number(quantityOwned) > 0) {
                                             setAveragePriceOwned((total / Number(quantityOwned)).toString());
                                          }
                                       }}
                                       placeholder="₹ Total"
                                       className="bg-background"
                                    />
                                 </div>
                                 <div className="grid gap-2">
                                    <Label>Total shares currently held</Label>
                                    <Input
                                       type="number"
                                       value={quantityOwned}
                                       onChange={e => setQuantityOwned(e.target.value)}
                                       className="bg-background"
                                    />
                                 </div>
                                 <p className="text-xs text-muted-foreground col-span-2">
                                    *Inferred Avg Price: ₹{quantityOwned && averagePriceOwned ? Number(averagePriceOwned).toFixed(2) : '0.00'}
                                 </p>
                              </CardContent>
                           </Card>
                        )}
                     </div>

                     <Separator />

                     <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-primary" />
                           Stock Engine Parameters
                        </h3>

                        <div className="grid gap-2">
                           <Label className="flex items-center gap-2">
                              <Icons.Wallet size={16} />
                              Total capital allocation
                              <InfoTooltip text="How much total capital do you want to deploy over this conviction period?" />
                           </Label>
                           <Input
                              type="number"
                              className="text-lg font-bold"
                              value={budget}
                              onChange={e => setBudget(e.target.value)}
                           />
                        </div>

                        <div className="grid gap-2">
                           <Label className="flex items-center gap-2">
                              <Icons.Clock size={16} />
                              Conviction period (Years)
                              <InfoTooltip text="How long do you strongly believe in this stock?" />
                           </Label>
                           <Input
                              type="number"
                              value={convictionYears}
                              onChange={e => setConvictionYears(e.target.value)}
                              placeholder="e.g. 3"
                           />
                        </div>



                        <div className="grid gap-2">
                           <div className="flex items-center gap-2">
                              <Label>Investment Cycle Length (Days)</Label>
                              <InfoTooltip text="How often do you expect this stock to show meaningful growth phases? (Trading Days)" />
                           </div>
                           <Input
                              type="number"
                              value={partition}
                              onChange={e => setPartition(e.target.value)}
                              placeholder="e.g. 60"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <Card className="border-primary/20 shadow-md">
                        <CardHeader className="pb-4 border-b bg-muted/20">
                           <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                              <Icons.Settings className="w-4 h-4" />
                              Execution Engine
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-8">

                           <div className="space-y-4">
                              <Label className="flex items-center gap-2">
                                 Deployment style
                                 <InfoTooltip text="How aggressively should the system deploy capital in early phases?" />
                              </Label>
                              <div className="grid grid-cols-1 gap-3">
                                 {[
                                    { id: LoadFactor.AGGRESSIVE, label: 'Aggressive Early Build', desc: 'Invest more in early phases to capture early growth' },
                                    { id: LoadFactor.MODERATE, label: 'Balanced Build', desc: 'Steady early exposure with flexibility to adapt' },
                                    { id: LoadFactor.GRADUAL, label: 'Gradual Build', desc: 'Spread capital slowly and evenly over time' }
                                 ].map(option => (
                                    <div
                                       key={option.id}
                                       onClick={() => setLoadFactor(option.id)}
                                       className={cn(
                                          "cursor-pointer border rounded-lg p-3 transition-all hover:bg-accent",
                                          loadFactor === option.id ? "border-primary bg-primary/5 shadow-sm" : "border-border"
                                       )}
                                    >
                                       <div className="flex items-center gap-2 mb-1">
                                          <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", loadFactor === option.id ? "border-primary" : "border-muted-foreground")}>
                                             {loadFactor === option.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                          </div>
                                          <span className="font-bold text-sm">{option.label}</span>
                                       </div>
                                       <p className="text-xs text-muted-foreground pl-6">{option.desc}</p>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <Separator />

                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                 <Label className="font-bold">Conviction strength (X-Factor)</Label>
                                 <span className="text-3xl font-black text-primary">{convictionLevel[0]}%</span>
                              </div>
                              <Slider
                                 value={convictionLevel}
                                 onValueChange={setConvictionLevel}
                                 max={100}
                                 step={1}
                                 className="py-4"
                              />
                           </div>

                        </CardContent>
                     </Card>

                     <div className="pt-4">
                        <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-xl shadow-xl hover:scale-[1.02] transition-transform">
                           <Icons.TrendUp className="mr-2" />
                           Create DSIP Tracker
                        </Button>
                        <p className="text-center text-xs text-muted-foreground mt-4">
                           Smart deployment will be active from the next trading day.
                        </p>
                     </div>
                  </div>
               </div>
            </form>
         </div>
      </div>
   );
};

export default AddStock;
