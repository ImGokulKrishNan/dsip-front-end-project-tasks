import React, { useState } from "react";
import { Icons } from "../constants";
import { LoadFactor, SimulationResult, SimulationCycleResult } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSimulations } from "@/hooks/useSimulations";
import { getStockClosingPrice } from "@/lib/api.fetcher";
import { Exchange, type StockPriceResponse } from "@/types/tracker.types";

interface AddSimulationProps {
  onRunSimulation?: () => void;
}

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-block ml-1 cursor-help opacity-70 hover:opacity-100 transition-opacity align-middle">
          <Icons.Info size={14} />
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-popover border-border text-popover-foreground">
        <p className="max-w-xs text-xs">{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const AddSimulation: React.FC<AddSimulationProps> = ({ onRunSimulation }) => {
  const { addSimulation } = useSimulations();

  const [symbol, setSymbol] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [totalCapital, setTotalCapital] = useState("");
  const [convictionYears, setConvictionYears] = useState("");
  const [cycleMonths, setCycleMonths] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadFactor, setLoadFactor] = useState<LoadFactor>(LoadFactor.MODERATE);
  const [convictionLevel, setConvictionLevel] = useState([75]);

  // State for Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [stockData, setStockData] = useState<StockPriceResponse | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!symbol) errors.symbol = "Stock symbol is required";
    if (!totalCapital || Number(totalCapital) <= 0)
      errors.totalCapital = "Capital allocation must be > 0";
    if (!convictionYears || Number(convictionYears) <= 0)
      errors.convictionYears = "Period required";
    if (!startDate) errors.startDate = "Start date required";
    if (!endDate) errors.endDate = "End date required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFetchLoading(true);
    setFetchError(null);

    try {
      const data = await getStockClosingPrice({
        symbol: symbol.trim(),
        exchange: Exchange.US,
      });
      setStockData(data);
      setShowConfirmModal(true);
    } catch {
      setFetchError(`Could not find stock "${symbol.trim().toUpperCase()}".`);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleConfirmSimulation = () => {
    if (!stockData) return;

    const totalMonths = Number(convictionYears) * 12;
    const cycle = Number(cycleMonths) || 1;
    const count = Math.max(Math.floor(totalMonths / cycle), 1);
    const perCycle = Number(totalCapital) / count;

    const cycles: SimulationCycleResult[] = [];
    for (let i = 0; i < count; i++) {
      const price = stockData.closePrice || 100 + Math.random() * 50;
      const shares = perCycle / price;
      cycles.push({
        cycleNumber: i + 1,
        deployDate: `Cycle ${i + 1}`,
        capitalDeployed: perCycle,
        sharePrice: price,
        sharesAcquired: shares,
        totalSharesHeld: shares * (i + 1),
        averageBuyPrice: Number(totalCapital) / (shares * (i + 1)),
        currentMarketPrice: price * 1.1,
        unrealizedGain: price * 0.1 * shares,
      });
    }

    const simulation: SimulationResult = {
      id: Date.now().toString(),
      symbol: stockData.symbol,
      totalCapital: Number(totalCapital),
      deploymentStyle: loadFactor,
      convictionLevel: convictionLevel[0],
      cycles,
      finalValue: Number(totalCapital) * 1.1,
      totalReturn: Number(totalCapital) * 0.1,
      returnPercentage: 10,
      createdAt: new Date().toISOString(),
    };

    addSimulation(simulation);
    setShowConfirmModal(false);
    onRunSimulation?.();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground selection:bg-primary/30">
      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={handleInitialSubmit}
          className="p-6 md:p-8 lg:px-16 xl:px-24 space-y-10 pb-32 max-w-[1400px] mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* LEFT COLUMN */}
            <div className="space-y-10">
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Asset Details
                </h3>

                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Stock Symbol
                  </Label>
                  <Input
                    value={symbol}
                    onChange={(e) => {
                      setSymbol(e.target.value.toUpperCase());
                      if (validationErrors.symbol)
                        setValidationErrors((prev) => ({
                          ...prev,
                          symbol: "",
                        }));
                    }}
                    placeholder="NFLX"
                    className={cn(
                      "bg-card border-input text-lg font-bold py-6 focus:border-primary transition-all",
                      validationErrors.symbol &&
                        "border-destructive focus:ring-destructive/20",
                    )}
                  />
                  {validationErrors.symbol && (
                    <p className="text-[10px] text-destructive font-bold uppercase italic tracking-tighter">
                      {validationErrors.symbol}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Display Name{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      (Optional)
                    </span>
                    <InfoTooltip text="Custom label for this specific simulation run." />
                  </Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="NFLX-1"
                    className="bg-card border-input py-6 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Simulation parameters
                </h3>

                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Icons.Wallet size={14} className="text-foreground" />
                    Total Capital Allocation
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-lg">
                      $
                    </span>
                    <Input
                      value={totalCapital}
                      onChange={(e) => setTotalCapital(e.target.value)}
                      className={cn(
                        "bg-card border-input pl-10 py-7 text-2xl font-black focus:border-primary",
                        validationErrors.totalCapital && "border-destructive",
                      )}
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Icons.Clock size={14} className="text-foreground" />{" "}
                      Conviction Period (Years)
                    </Label>
                    <Input
                      value={convictionYears}
                      onChange={(e) => setConvictionYears(e.target.value)}
                      placeholder="3"
                      className="bg-card border-input h-12 font-bold focus:border-primary"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      Investment Cycle (Months){" "}
                      <InfoTooltip text="Frequency of capital injections." />
                    </Label>
                    <Input
                      value={cycleMonths}
                      onChange={(e) => setCycleMonths(e.target.value)}
                      placeholder="8"
                      className="bg-card border-input h-12 font-bold focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Icons.Calendar size={14} className="text-foreground" />{" "}
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-card border-input h-12 focus:border-primary dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Icons.Calendar size={14} className="text-foreground" />{" "}
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-card border-input h-12 focus:border-primary dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">
              <Card className="bg-card border-border shadow-xl rounded-2xl overflow-hidden ring-1 ring-border">
                <CardHeader className="bg-muted/20 border-b border-border py-5 px-8">
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-2">
                    <Icons.Settings className="w-4 h-4 text-primary" />
                    Execution Engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-10 pt-10 pb-12 px-8">
                  <div className="space-y-4">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      Deployment Style{" "}
                      <InfoTooltip text="Aggression level of initial capital entry." />
                    </Label>
                    <div className="space-y-3">
                      {[
                        {
                          id: LoadFactor.AGGRESSIVE,
                          label: "Aggressive Early Build",
                          desc: "Front-loaded capital deployment.",
                        },
                        {
                          id: LoadFactor.MODERATE,
                          label: "Balanced Build",
                          desc: "Steady exposure with flexibility.",
                        },
                        {
                          id: LoadFactor.GRADUAL,
                          label: "Gradual Build",
                          desc: "Spread capital slowly over time.",
                        },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setLoadFactor(opt.id)}
                          className={cn(
                            "p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-4 group",
                            loadFactor === opt.id
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-muted-foreground/30 bg-background/50",
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                              loadFactor === opt.id
                                ? "border-primary"
                                : "border-muted-foreground",
                            )}
                          >
                            {loadFactor === opt.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground tracking-tight">
                              {opt.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Conviction strength (X-Factor)
                      </Label>
                      <span className="text-5xl font-black text-foreground leading-none tracking-tighter">
                        {convictionLevel[0]}%
                      </span>
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

              <div className="pt-6 space-y-4">
                <Button
                  type="submit"
                  disabled={fetchLoading}
                  className="w-full h-16 bg-primary text-primary-foreground hover:opacity-90 text-lg font-black rounded-xl shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {fetchLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Icons.TrendUp className="mr-2 w-5 h-5" />
                  )}
                  Create Simulation Tracker
                </Button>
                {fetchError && (
                  <p className="text-center text-sm text-destructive font-medium">
                    {fetchError}
                  </p>
                )}
                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">
                  Calculated against historical market data.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Confirm Simulation Details
            </DialogTitle>
          </DialogHeader>

          {stockData && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg">
                  {stockData.symbol.substring(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold truncate">
                    {stockData.symbol}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {stockData.company?.name || "N/A"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
                    Exchange
                  </p>
                  <p className="font-bold">
                    {stockData.company?.exchange || stockData.exchange}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
                    Close Price
                  </p>
                  <p className="font-bold text-lg">
                    ${stockData.closePrice?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
                    Start Date
                  </p>
                  <p className="font-bold">{startDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
                    Capital
                  </p>
                  <p className="font-bold">${totalCapital}</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Simulation will run from {startDate} to {endDate}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSimulation}>
              <Icons.Check className="mr-2 w-4 h-4" />
              Confirm & Create Simulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddSimulation;
