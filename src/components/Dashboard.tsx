import React, { useState } from "react";
import { Icons } from "../constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InfoTooltip from "./InfoTooltip";
import { useTrackers, useDeleteTracker } from "@/hooks/useTrackers";
import { TrackerStatus } from "@/types/tracker.types";

interface DashboardProps {
  onAddStock: () => void;
  onSelectStock: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAddStock, onSelectStock }) => {
  const {
    trackers,
    portfolioSummary,
    isLoading: isLoadingTrackers,
    error: trackersError,
  } = useTrackers();
  const deleteTracker = useDeleteTracker();

  const [showDsipOnly, setShowDsipOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trackerToDelete, setTrackerToDelete] = useState<{
    id: number;
    symbol: string;
    displayName: string;
  } | null>(null);

  const handleDeleteClick = (
    trackerId: number,
    symbol: string,
    displayName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setTrackerToDelete({ id: trackerId, symbol, displayName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!trackerToDelete) return;

    deleteTracker.mutate(trackerToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setTrackerToDelete(null);
      },
      onError: () => {
        alert(
          `Failed to delete tracker ${trackerToDelete.displayName}. Please try again.`,
        );
      },
    });
  };

  let totalInvestedValue = 0;
  let currentMarketValue = 0;
  let activeCount = 0;
  let totalCount = 0;

  if (portfolioSummary) {
    totalInvestedValue = showDsipOnly
      ? portfolioSummary.dsipTotalCapitalInvested
      : portfolioSummary.totalCapitalInvested;
    currentMarketValue = showDsipOnly
      ? portfolioSummary.dsipTotalCurrentValue
      : portfolioSummary.totalCurrentValue;
    activeCount = portfolioSummary.activeTrackers;
    totalCount = portfolioSummary.totalTrackers;
  }

  const totalProfitLossPct =
    totalInvestedValue > 0
      ? ((currentMarketValue - totalInvestedValue) / totalInvestedValue) * 100
      : 0;

  const isPortfolioProfit = totalProfitLossPct >= 0;

  return (
    <>
      <div className="h-full p-4 md:p-6 space-y-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Actions are removed as per request. 
            If we need to access them, we might need a dedicated page or a different entry point. 
            For now, completely removing the section. 
        */}

          {/* Portfolio Stats & Grid - Now Full Width/Centered */}
          <div className="space-y-8">
            {/* <Card className="bg-primary text-primary-foreground p-6 overflow-hidden relative border-none shadow-2xl max-w-3xl mx-auto">

              <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                      Total Market Value
                      <InfoTooltip text="Market value as of yesterday's close + today's moves" />
                    </h3>
                    <p className="text-3xl font-bold tracking-tight">${Math.round(currentMarketValue).toLocaleString()}</p>
                  </div>
              </div>

              <div className="relative z-10 mt-6 grid grid-cols-3 gap-4 border-t border-primary-foreground/20 pt-6">
                 <div>
                    <p className="text-xs font-medium opacity-70 uppercase tracking-wider mb-1">Invested</p>
                    <p className="text-xl font-bold">${Math.round(totalInvestedValue).toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-xs font-medium opacity-70 uppercase tracking-wider mb-1">Active</p>
                    <p className="text-xl font-bold">{stocks.filter(s => !s.isPaused).length}</p>
                 </div>
              </div>
           </Card> */}

            <Card className="relative overflow-hidden border shadow-xl bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black dark:border-gray-800">
              {/* Decorative Elements */}
              {/* <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Icons.Activity size={100} />
                  </div> */}
              <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 p-6 md:p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                        {showDsipOnly
                          ? "DSIP Market Value"
                          : "Total Market Value"}
                        <InfoTooltip text="Market value as of yesterday's close + today's moves" />
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <Label
                          htmlFor="dsip-toggle-dashboard"
                          className="text-[10px] uppercase font-bold text-muted-foreground"
                        >
                          DSIP Only
                        </Label>
                        <Switch
                          id="dsip-toggle-dashboard"
                          checked={showDsipOnly}
                          onCheckedChange={setShowDsipOnly}
                          className="scale-75"
                        />
                      </div>
                    </div>
                    <p className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                      ${currentMarketValue}
                    </p>
                  </div>
                  <div className="bg-background/50 border shadow-sm px-4 py-2 rounded-xl backdrop-blur-md">
                    <div
                      className={
                        isPortfolioProfit
                          ? "text-emerald-600 dark:text-emerald-300"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-muted-foreground mb-0.5">
                        Net Yield
                      </span>
                      <span className="text-xl font-black flex items-center gap-1">
                        {isPortfolioProfit ? (
                          <Icons.TrendUp size={16} />
                        ) : (
                          <Icons.TrendDown size={16} />
                        )}
                        {totalProfitLossPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] Font-bold text-muted-foreground uppercase tracking-widest">
                      {showDsipOnly ? "DSIP Invested" : "Invested Capital"}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ${totalInvestedValue}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] Font-bold text-muted-foreground uppercase tracking-widest">
                      Active Engines
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {activeCount}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium self-end mb-1">
                        / {totalCount} Total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-4">
                Stock Engine Performance
              </h2>

              {/* Loading State */}
              {isLoadingTrackers && (
                <div className="flex items-center justify-center p-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Error State */}
              {trackersError && !isLoadingTrackers && (
                <Card className="p-6 border-destructive/50 bg-destructive/5">
                  <div className="flex items-center gap-3 text-destructive">
                    <Icons.AlertCircle size={20} />
                    <div>
                      <p className="font-semibold">Failed to load trackers</p>
                      <p className="text-sm text-muted-foreground">
                        {trackersError.message}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Stock Cards Grid */}
              {!isLoadingTrackers && !trackersError && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {trackers.length === 0 && (
                    <Card className="sm:col-span-2 lg:col-span-3 xl:col-span-4 p-8 flex flex-col items-center justify-center text-center border-dashed bg-muted/20">
                      <p className="text-muted-foreground mb-4">
                        No stock engines deployed yet.
                      </p>
                      <Button onClick={onAddStock} variant="outline">
                        Create First Stock Engine
                      </Button>
                    </Card>
                  )}

                  {trackers.map((tracker) => {
                    const totalInvested = showDsipOnly
                      ? tracker.dsipTotalCaptialInvestedSoFar
                      : tracker.totalCapitalInvestedSoFar;
                    const pnlPct = showDsipOnly
                      ? (tracker.dsip_net_profit_percentage ?? 0)
                      : (tracker.net_profit_percentage ?? 0);
                    const isStockProfit = pnlPct >= 0;
                    const isPaused = tracker.status === TrackerStatus.PAUSED;

                    const deploymentPct =
                      tracker.totalCapitalPlanned > 0
                        ? (tracker.dsipTotalCaptialInvestedSoFar /
                            tracker.totalCapitalPlanned) *
                          100
                        : 0;

                    return (
                      <Card
                        key={tracker.trackerId}
                        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group relative overflow-hidden"
                        onClick={() =>
                          onSelectStock(tracker.trackerId.toString())
                        }
                      >
                        {/* Subtle top accent stripe */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-0.5 ${
                            isPaused
                              ? "bg-amber-500/60"
                              : isStockProfit
                                ? "bg-emerald-500/60"
                                : "bg-red-500/60"
                          }`}
                        />

                        <CardContent className="p-4 pt-5">
                          {/* Header row: badge + name/status + P&L + menu */}
                          <div className="flex items-center gap-3 mb-4">
                            {/* Gradient badge */}
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg flex-shrink-0 ${
                                isPaused
                                  ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20"
                                  : isStockProfit
                                    ? "bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-emerald-500/20"
                                    : "bg-gradient-to-br from-red-400 to-red-700 shadow-red-500/20"
                              }`}
                            >
                              {tracker.stockSymbol.substring(0, 2)}
                            </div>

                            {/* Ticker + status */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <h4 className="font-bold text-foreground leading-none truncate flex-1">
                                  {tracker.displayName}
                                </h4>
                                <span
                                  className={`text-xs font-black tracking-tight flex-shrink-0 ${
                                    isStockProfit
                                      ? "text-emerald-500 dark:text-emerald-400"
                                      : "text-red-500 dark:text-red-400"
                                  }`}
                                >
                                  {isStockProfit ? "+" : ""}
                                  {pnlPct.toFixed(2)}%
                                </span>
                              </div>
                              <div className="mt-1">
                                {isPaused ? (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                                    Paused
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                                    ● Active
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 3-Dot Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-accent flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Icons.MoreVertical size={14} />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectStock(tracker.trackerId.toString());
                                  }}
                                >
                                  <Icons.Settings className="mr-2 h-4 w-4" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                  onClick={(e) =>
                                    handleDeleteClick(
                                      tracker.trackerId,
                                      tracker.stockSymbol,
                                      tracker.displayName,
                                      e,
                                    )
                                  }
                                >
                                  <Icons.Trash className="mr-2 h-4 w-4" />
                                  <span>Delete Tracker</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* 3 micro-stat chips */}
                          <div className="flex items-stretch divide-x divide-border/50 border border-border/40 rounded-xl overflow-hidden mb-4">
                            <div className="flex-1 px-3 py-2.5 bg-muted/20">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                                Invested
                              </p>
                              <p className="text-sm font-bold text-foreground leading-none">
                                $
                                {totalInvested.toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </p>
                            </div>
                            <div className="flex-1 px-3 py-2.5 bg-muted/20">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                                Budget
                              </p>
                              <p className="text-sm font-bold text-foreground leading-none">
                                $
                                {tracker.totalCapitalPlanned.toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 0 },
                                )}
                              </p>
                            </div>
                            <div className="flex-1 px-3 py-2.5 bg-muted/20">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                                Remaining
                              </p>
                              <p className="text-sm font-bold text-foreground leading-none">
                                $
                                {Math.max(
                                  0,
                                  tracker.totalCapitalPlanned - totalInvested,
                                ).toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Deployment bar */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                Deployment
                              </span>
                              <span className="text-[10px] font-bold text-emerald-500">
                                {deploymentPct.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width: `${Math.min(deploymentPct, 100)}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] mt-1 text-muted-foreground/60 font-mono">
                              <span>
                                $
                                {tracker.dsipTotalCaptialInvestedSoFar.toLocaleString()}
                              </span>
                              <span>
                                of $
                                {tracker.totalCapitalPlanned.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Execute button */}
                          <Button
                            className="w-full h-9 text-xs font-bold uppercase tracking-wider"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStock(tracker.trackerId.toString());
                            }}
                          >
                            <Icons.Zap className="w-3 h-3 mr-2" /> Execute
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Icons.AlertTriangle className="w-5 h-5" />
              Delete Tracker
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete the tracker for{" "}
              <strong>{trackerToDelete?.displayName}</strong>?
              <br />
              <br />
              This action cannot be undone. All execution history and
              configuration will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTrackerToDelete(null);
              }}
              disabled={deleteTracker.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteTracker.isPending}
            >
              {deleteTracker.isPending ? "Deleting..." : "Delete Tracker"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
