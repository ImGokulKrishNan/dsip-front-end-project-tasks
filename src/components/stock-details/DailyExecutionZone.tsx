import React from "react";
import { Icons } from "../../constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InfoTooltip } from "./InfoTooltip";
import { ExecutionState, RecommendationResponse } from "./types";

interface DailyExecutionZoneProps {
  executionState: ExecutionState;
  setExecutionState: (state: ExecutionState) => void;
  lockInPct: string;
  setLockInPct: (val: string) => void;
  convictionOverride: number[];
  setConvictionOverride: (val: number[]) => void;
  recommendation: RecommendationResponse | null;
  isCalculating: boolean;
  calculationError: string | null;
  executedAmount: string;
  setExecutedAmount: (val: string) => void;
  executionPrice: string;
  setExecutionPrice: (val: string) => void;
  isConfirming: boolean;
  confirmError: string | null;
  onCalculate: () => void;
  onConfirm: () => void;
  totalInvested: number;
  totalShares: number;
  trackerData: any;
}

export const DailyExecutionZone: React.FC<DailyExecutionZoneProps> = ({
  executionState,
  setExecutionState,
  lockInPct,
  setLockInPct,
  convictionOverride,
  setConvictionOverride,
  recommendation,
  isCalculating,
  calculationError,
  executedAmount,
  setExecutedAmount,
  executionPrice,
  setExecutionPrice,
  isConfirming,
  confirmError,
  onCalculate,
  onConfirm,
  totalInvested,
  totalShares,
  trackerData,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/30">
          <Icons.Zap size={16} />
        </div>
        <h2 className="text-lg font-bold">Today's Execution</h2>
      </div>

      {executionState === "IDLE" && (
        <Card className="border-l-4 border-l-primary shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Market Context</CardTitle>
            <CardDescription className="text-xs">
              Enter today's price conditions to generate your smart order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-col gap-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  Price Change (%)
                  <InfoTooltip text="Enter the current percentage change in stock price. This helps calculate the optimal buy price for today's execution." />
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="-2.4"
                    className="h-9 text-sm font-semibold pl-2.5 pr-8"
                    value={lockInPct}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (
                        val === "" ||
                        val === "-" ||
                        val === "." ||
                        val === "-."
                      ) {
                        setLockInPct(val);
                        return;
                      }
                      const num = parseFloat(val);
                      if (!isNaN(num) && num >= -90 && num <= 90) {
                        setLockInPct(val);
                      }
                    }}
                    autoFocus
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">
                    %
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight hidden md:block">
                  If red, lock early. If green, wait closer to close.
                </p>
              </div>

              <div
                style={{ flex: "1 1 0%", minWidth: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center gap-2">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    Conviction
                    <InfoTooltip text="Not Recommended! Adjust your conviction level if today's market news or events significantly impact your investment thesis." />
                  </Label>
                  <Badge
                    className={
                      convictionOverride[0] < 45
                        ? "bg-red-500 hover:bg-red-600 h-5 px-1.5 text-[10px]"
                        : convictionOverride[0] > 55
                          ? "bg-emerald-500 hover:bg-emerald-600 h-5 px-1.5 text-[10px]"
                          : "bg-yellow-500 hover:bg-yellow-600 h-5 px-1.5 text-[10px]"
                    }
                  >
                    {convictionOverride[0]}%
                  </Badge>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={convictionOverride}
                  onValueChange={setConvictionOverride}
                  className="py-0.5 pt-2 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 -mx-4 -mb-4 p-4 bg-muted/40 border-t flex flex-col sm:flex-row gap-2 rounded-b-xl">
              <Button
                size="sm"
                className="py-2 flex-1 h-12 sm:h-9 text-sm font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                onClick={onCalculate}
                disabled={!lockInPct || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Icons.Refresh className="mr-2 w-4 h-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Icons.TrendUp className="mr-2 w-4 h-4" />
                    Calculate Amount
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full sm:w-auto px-4 text-xs border-dashed text-muted-foreground hover:text-foreground hover:bg-background"
              >
                Skip for Today
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {calculationError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          <div className="flex items-start gap-2">
            <Icons.AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{calculationError}</span>
          </div>
        </div>
      )}

      {executionState === "CALCULATED" && recommendation && (
        <Card className="border-l-4 border-l-emerald-500 shadow-xl animate-in fade-in zoom-in-95 duration-300">
          <CardHeader className="bg-emerald-500/5 pb-3">
            <CardTitle className="text-lg text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Icons.Check className="w-4 h-4" /> Recommendation Generated
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5 p-5">
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-start">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Recommended Amount
                </p>
                <div className="text-4xl font-black text-foreground tracking-tight">
                  ${recommendation.recommended_amount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2 leading-tight">
                  <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium">
                    Ref Price: $
                    {recommendation.signals.avg_holding_price.toFixed(2)}
                  </span>
                  <span>
                    ~{" "}
                    {(
                      recommendation.recommended_amount /
                      recommendation.signals.avg_holding_price
                    ).toFixed(2)}{" "}
                    shares
                  </span>
                </p>
              </div>

              <div className="border rounded-lg p-3.5 bg-muted/30 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground text-xs">
                    New Projected Avg
                  </span>
                  <span className="font-bold">
                    $
                    {(
                      (totalInvested + recommendation.recommended_amount) /
                      (totalShares +
                        recommendation.recommended_amount /
                          recommendation.signals.avg_holding_price)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground text-xs">
                    Remaining in Cycle
                  </span>
                  <span className="font-bold">
                    $
                    {recommendation.partition_status.capital_remaining.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground text-xs">
                    Cycle Days Left
                  </span>
                  <span className="font-bold">
                    {trackerData
                      ? Math.ceil(
                          ((100 -
                            recommendation.partition_status.time_progress_pct) *
                            trackerData.partition_days) /
                            100,
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col md:flex-row gap-3">
              <Button
                size="default"
                className="flex-1 h-11 md:h-10 bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20 shadow-md font-semibold"
                onClick={() => setExecutionState("CONFIRMING")}
              >
                <Icons.Check className="mr-2 w-4 h-4" /> Place Order & Confirm
              </Button>
              <Button
                variant="outline"
                size="default"
                className="h-11 md:h-10 w-full md:w-auto px-4"
                onClick={() => setExecutionState("IDLE")}
              >
                Recalculate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {executionState === "CONFIRMING" && recommendation && (
        <Card className="border-2 border-primary shadow-2xl animate-in slide-in-from-right-4 duration-300">
          <CardHeader className="border-b bg-muted/20 pb-3">
            <CardTitle className="text-lg">Final Confirmation</CardTitle>
            <CardDescription className="text-xs">
              Enter the actual executed values from your broker.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Actual Invested Amount ($)
                </Label>
                <Input
                  type="number"
                  className="h-11 md:h-10 text-lg font-semibold bg-background"
                  value={executedAmount}
                  onChange={(e) => setExecutedAmount(e.target.value)}
                  disabled={isConfirming}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Execution Price ($)
                </Label>
                <Input
                  type="number"
                  step="0.05"
                  className="h-11 md:h-10 text-lg font-semibold bg-background"
                  value={executionPrice}
                  onChange={(e) => setExecutionPrice(e.target.value)}
                  disabled={isConfirming}
                />
              </div>
            </div>

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
                onClick={onConfirm}
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
                onClick={() => setExecutionState("CALCULATED")}
                disabled={isConfirming}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
