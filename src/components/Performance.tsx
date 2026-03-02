import React, { useState, useMemo, useCallback } from "react";
import { Icons } from "../constants";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import InfoTooltip from "./InfoTooltip";
import { useTrackerDetails, useSyncTracker } from "../hooks/useTrackers";
import { useSelectedStockId } from "@/hooks/use-selected-stock-id";
import { useToast } from "@/hooks/use-toast";
import { Execution } from "../types/tracker.types";

const Performance: React.FC = () => {
  const { toast } = useToast();
  const selectedStockId = useSelectedStockId();
  const trackerId = selectedStockId ? parseInt(selectedStockId) : undefined;
  const validTrackerId = trackerId && !isNaN(trackerId) ? trackerId : undefined;
  const { data: selectedTracker } = useTrackerDetails(validTrackerId);
  const syncTracker = useSyncTracker();
  const [showDsipOnly, setShowDsipOnly] = useState(false);

  const [showSyncPopup, setShowSyncPopup] = useState(false);
  const [syncForm, setSyncForm] = useState({
    totalInvested: "",
    totalShares: "",
  });
  const [syncError, setSyncError] = useState<string | null>(null);

  const trackerData = selectedTracker?.tracker || null;

  const metrics = useMemo(() => {
    if (!trackerData) return null;

    let history: Array<Execution> = [];

    const totalInvested = showDsipOnly
      ? trackerData.dsip_total_capital_invested_so_far || 0
      : trackerData.total_capital_invested_so_far || 0;

    history = selectedTracker?.recentExecutions || [];

    const currentValue = showDsipOnly
      ? trackerData.dsip_total_market_value || 0
      : trackerData.total_market_value || 0;

    const totalPL = currentValue - totalInvested;
    const isProfit = totalPL >= 0;

    const percentageChange = showDsipOnly
      ? trackerData.dsip_net_profit_percentage || 0
      : trackerData.net_profit_percentage || 0;

    // Sort history once during computation
    const sortedHistory = [...history]
      .sort((a, b) => {
        const dateA = new Date(String(a.createdAt)).getTime();
        const dateB = new Date(String(b.createdAt)).getTime();
        return dateB - dateA;
      })
      .slice(0, 15);

    return {
      totalInvested,
      currentValue,
      totalPL,
      isProfit,
      percentageChange,
      sortedHistory,
    };
  }, [selectedTracker, trackerData, showDsipOnly]);

  const handleSync = useCallback(() => {
    const userInvested = Number(syncForm.totalInvested);
    const userShares = Number(syncForm.totalShares);

    if (!userInvested || !userShares) return;

    const syncTrackerId = trackerData?.trackerId;
    if (!syncTrackerId) {
      setSyncError("No tracker selected. Please select a tracker first.");
      return;
    }

    setSyncError(null);

    syncTracker.mutate(
      {
        tracker_id: syncTrackerId,
        current_total_shares: userShares,
        current_total_invested_amount: userInvested,
        reason: "Manual sync from broker statement",
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            setShowSyncPopup(false);
            setSyncForm({ totalInvested: "", totalShares: "" });
            toast({
              title: "Portfolio Synced",
              description: "Your holdings have been updated successfully.",
            });
          } else {
            setSyncError(result.message || "Sync failed");
          }
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to sync portfolio data";
          setSyncError(message);
        },
      },
    );
  }, [syncForm, trackerData, syncTracker, toast]);

  // Early return after all hooks
  if (!metrics) return null;

  const {
    totalInvested,
    currentValue,
    totalPL,
    isProfit,
    percentageChange,
    sortedHistory,
  } = metrics;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight">Investment</h3>
          <p className="text-sm text-muted-foreground">Performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="dsip-toggle-perf"
            className="text-[10px] uppercase font-bold text-muted-foreground"
          >
            DSIP Only
          </Label>
          <Switch
            id="dsip-toggle-perf"
            checked={showDsipOnly}
            onCheckedChange={setShowDsipOnly}
            className="scale-75"
          />
        </div>
      </div>

      {/* Sync Button */}
      {!showDsipOnly && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSyncPopup(true)}
          className="w-full h-8 text-xs bg-background hover:bg-muted border-dashed mb-2"
        >
          <Icons.Refresh className="mr-2 w-3.5 h-3.5" /> Sync Portfolio
        </Button>
      )}

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-card border shadow-sm space-y-1">
            <div className="flex items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Market Price
              </span>
              <InfoTooltip text="The current live market price of the stock." />
            </div>
            <div className="text-xl font-bold">
              ${" "}
              {trackerData?.current_market_price != null
                ? trackerData.current_market_price
                : "-"}
            </div>
          </div>
          {/* Hide the current average if the DSIP only capital is zero */}
          {!(
            (trackerData?.dsip_total_capital_invested_so_far ?? 0) === 0 &&
            showDsipOnly
          ) && (
            <div className="p-4 rounded-xl bg-card border shadow-sm space-y-1">
              <div className="flex items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Average
                </span>
                <InfoTooltip text="Your average buy price across all purchases for this stock." />
              </div>
              <div className="text-xl font-bold">
                ${" "}
                {showDsipOnly
                  ? trackerData?.dsip_current_avg != null
                    ? trackerData.dsip_current_avg
                    : "-"
                  : trackerData?.current_avg != null
                    ? trackerData.current_avg
                    : "-"}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-card border shadow-sm space-y-3">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {showDsipOnly ? "DSIP Invested" : "Total Invested"}
            </span>
          </div>
          <div className="text-2xl font-bold">
            $
            {totalInvested.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Current Value
            </span>
            <div className="flex items-center gap-1">
              {isProfit ? (
                <Icons.ArrowUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <Icons.ArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-xs font-bold ${isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
              >
                {isProfit ? "+" : ""}
                {percentageChange.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="text-2xl font-bold">
            $
            {currentValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div
          className={cn(
            "p-4 rounded-xl border shadow-sm space-y-1",
            isProfit
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400",
          )}
        >
          <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">
            Total P&L
          </span>
          <div className="text-3xl font-black tracking-tight">
            {isProfit ? "+" : ""}$
            {totalPL.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div className="space-y-3 pt-8">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Recent History
        </h4>
        <div className="space-y-2">
          {sortedHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No transactions recorded yet.
            </p>
          ) : (
            sortedHistory.map((tx, i) => {
              const date = String(tx.createdAt);
              const amount = Number(tx.executedAmount);

              return (
                <div
                  key={`${date}-${amount}-${i}`}
                  className="flex justify-between items-center p-3 border rounded-xl bg-card text-sm shadow-sm transition-colors hover:bg-accent/50"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {new Date(date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="font-mono font-bold">
                    ${amount.toLocaleString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sync Dialog */}
      <Dialog open={showSyncPopup} onOpenChange={setShowSyncPopup}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-slate-800 bg-[#050a10]">
          {/* Radial glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.18) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Icon with ring */}
                <div className="relative flex items-center justify-center w-11 h-11 flex-shrink-0">
                  <svg
                    className="absolute inset-0 w-full h-full animate-spin"
                    style={{ animationDuration: "8s" }}
                    viewBox="0 0 44 44"
                    fill="none"
                  >
                    <circle
                      cx="22"
                      cy="22"
                      r="20"
                      stroke="rgba(59,130,246,0.35)"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <Icons.Refresh className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    Sync Portfolio
                  </DialogTitle>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
                    Manual Override
                  </span>
                </div>
              </div>
            </div>

            {/* Info card */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3.5">
              <p className="text-xs text-slate-400 leading-relaxed">
                Match your holdings to your broker statement. Base records will
                be adjusted while keeping your{" "}
                <span className="text-slate-200 font-semibold">
                  current cycle intact
                </span>
                .
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              {/* Single unified tile */}
              <div className="bg-slate-900/60 border border-slate-800/60 focus-within:border-blue-500/40 rounded-xl overflow-hidden transition-colors duration-200">
                {/* Field 1 — Invested Amount */}
                <div className="px-4 pt-4 pb-3 focus-within:bg-slate-800/40 transition-colors duration-150">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                    Total Invested Amount
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold text-base leading-none w-4 text-center flex-shrink-0">
                      $
                    </span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="75.00"
                      value={syncForm.totalInvested}
                      onKeyDown={(e) => {
                        const blocked = ["-", "+", "e", "E"];
                        if (blocked.includes(e.key)) e.preventDefault();
                        if (
                          e.key === "." &&
                          syncForm.totalInvested.includes(".")
                        )
                          e.preventDefault();
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        const parts = val.split(".");
                        const clean =
                          parts.length > 2
                            ? parts[0] + "." + parts.slice(1).join("")
                            : val;
                        setSyncForm({ ...syncForm, totalInvested: clean });
                      }}
                      className="h-9 font-mono text-base bg-transparent border-0 rounded-xl shadow-none outline-none ring-0 pl-2 pr-0 focus-visible:ring-0 focus-visible:outline-none text-foreground placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-800/80 mx-4" />

                {/* Field 2 — Shares Quantity */}
                <div className="px-4 pt-3 pb-4 focus-within:bg-slate-800/40 transition-colors duration-150">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                    Total Shares Quantity
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold text-base leading-none w-4 text-center flex-shrink-0">
                      #
                    </span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="1.525"
                      value={syncForm.totalShares}
                      onKeyDown={(e) => {
                        const blocked = ["-", "+", "e", "E"];
                        if (blocked.includes(e.key)) e.preventDefault();
                        if (e.key === "." && syncForm.totalShares.includes("."))
                          e.preventDefault();
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        const parts = val.split(".");
                        const clean =
                          parts.length > 2
                            ? parts[0] + "." + parts.slice(1).join("")
                            : val;
                        setSyncForm({ ...syncForm, totalShares: clean });
                      }}
                      className="h-9 font-mono text-base bg-transparent border-0 rounded-xl shadow-none outline-none ring-0 pl-2 pr-0 focus-visible:ring-0 focus-visible:outline-none text-foreground placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated preview */}
            {syncForm.totalInvested && syncForm.totalShares && (
              <div className="flex items-center justify-between bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Calculated Avg Price
                </span>
                <span className="font-mono font-black text-blue-400">
                  $
                  {(
                    Number(syncForm.totalInvested) /
                    Number(syncForm.totalShares)
                  ).toFixed(2)}
                </span>
              </div>
            )}

            {/* Error */}
            {syncError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
                <div className="flex items-start gap-2.5 text-red-400">
                  <Icons.AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold">Sync Failed</p>
                    <p className="text-xs leading-relaxed text-red-400/80">
                      {syncError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="ghost"
                className="flex-1 h-10 text-sm text-slate-400 hover:text-foreground border border-slate-800 hover:bg-slate-800/50"
                onClick={() => {
                  setShowSyncPopup(false);
                  setSyncError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-10 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/20 disabled:opacity-40"
                onClick={handleSync}
                disabled={
                  !syncForm.totalInvested ||
                  !syncForm.totalShares ||
                  syncTracker.isPending
                }
              >
                {syncTracker.isPending ? (
                  <>
                    <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Icons.Refresh className="mr-2 h-4 w-4" />
                    Update Portfolio
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Manually update your total holdings to match your broker.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Performance;
