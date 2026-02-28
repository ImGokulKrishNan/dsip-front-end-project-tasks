import React from "react";
import { Icons } from "../../constants";
import { Stock } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { GetTrackerDetailsResponse } from "../../types/tracker.types";

interface LiveInvestmentCycleCardProps {
  currentCycle: number;
  totalCycles: number;
  daysInvested: number;
  cycleLength: number;
  displayDeployedAmount: number;
  displayTotalBudget: number;
  selectedTracker: GetTrackerDetailsResponse | null;
  totalShares: number;
  currentReturnPercent: number;
  stock: Stock;
  onPartitionClick: (index: number) => void;
  onPartitionGroupClick: (
    startIndex: number,
    endIndex: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
}

export const LiveInvestmentCycleCard: React.FC<
  LiveInvestmentCycleCardProps
> = ({
  currentCycle,
  totalCycles,
  daysInvested,
  cycleLength,
  displayDeployedAmount,
  displayTotalBudget,
  selectedTracker,
  totalShares,
  currentReturnPercent,
  stock,
  onPartitionClick,
  onPartitionGroupClick,
}) => {
  const liveCycle = selectedTracker?.tracker?.live_investment_cycle;

  const investedAmount =
    liveCycle?.total_capital_invested_so_far ??
    totalShares * stock.currentPrice;

  const profitPct = liveCycle?.net_profit_percentage ?? currentReturnPercent;

  const cycleProgress =
    liveCycle?.partition_progress ??
    (cycleLength > 0 ? ((daysInvested % cycleLength) / cycleLength) * 100 : 0);

  const progressPercentage = liveCycle?.partition_progress ?? 0;

  return (
    <Card className="border-primary/10 shadow-sm bg-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icons.Activity size={14} className="text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold">
              Live Investment Cycle
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {currentCycle}/{totalCycles}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="space-y-1 p-4 md:p-3 rounded-lg bg-gradient-to-br from-blue-500/5 to-blue-600/10 border border-blue-500/10 shadow-sm">
            <div className="flex items-center gap-2 text-xs md:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <Icons.TrendingUp size={12} className="text-blue-500" />
              Invested Amount
            </div>
            <div className="text-2xl md:text-xl font-black tracking-tight text-foreground">
              $
              {investedAmount.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div
            className={`space-y-1 p-4 md:p-3 rounded-lg border shadow-sm ${
              profitPct >= 0
                ? "bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-emerald-500/10"
                : "bg-gradient-to-br from-red-500/5 to-red-600/10 border-red-500/10"
            }`}
          >
            <div className="flex items-center gap-2 text-xs md:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <Icons.DollarSign
                size={12}
                className={profitPct >= 0 ? "text-emerald-500" : "text-red-500"}
              />
              Total P&L
            </div>
            <div
              className={`text-2xl md:text-xl font-black tracking-tight ${
                profitPct >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {profitPct >= 0 ? "+" : ""}
              {profitPct.toFixed(2)}%
            </div>
          </div>

          <div className="space-y-1 p-4 md:p-3 rounded-lg bg-gradient-to-br from-purple-500/5 to-purple-600/10 border border-purple-500/10 shadow-sm">
            <div className="flex items-center gap-2 text-xs md:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <Icons.PieChart size={12} className="text-purple-500" />
              Cycle Progress
            </div>
            <div className="text-2xl md:text-xl font-black tracking-tight text-foreground">
              {cycleProgress.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Icons.Target size={14} className="text-emerald-500" />
              Deployment Progress
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                Cycle{" "}
                <span className="font-bold text-foreground">
                  {currentCycle}
                </span>{" "}
                of{" "}
                <span className="font-bold text-foreground">{totalCycles}</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {((displayDeployedAmount / displayTotalBudget) * 100).toFixed(
                  1,
                )}
                % deployed
              </span>
            </div>
          </div>

          <PartitionProgressBar
            currentCycle={currentCycle}
            totalCycles={totalCycles}
            progressPercentage={progressPercentage}
            onPartitionClick={onPartitionClick}
            onPartitionGroupClick={onPartitionGroupClick}
          />

          <div className="flex justify-between items-center text-[10px] text-muted-foreground px-0.5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Done
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full border-2 border-emerald-400 inline-block" />
                Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-700 inline-block" />
                Ahead
              </span>
            </div>
            <span className="font-mono text-muted-foreground/60">
              {currentCycle}/{totalCycles} cycles
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PartitionProgressBarProps {
  currentCycle: number;
  totalCycles: number;
  progressPercentage: number;
  onPartitionClick: (index: number) => void;
  onPartitionGroupClick: (
    startIndex: number,
    endIndex: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
}

const PartitionPill: React.FC<{
  partitionIndex: number;
  isCompleted: boolean;
  isActive: boolean;
  isUpcoming: boolean;
  progressPercentage: number;
  onClick: () => void;
}> = ({
  partitionIndex,
  isCompleted,
  isActive,
  isUpcoming,
  progressPercentage,
  onClick,
}) => (
  <TooltipProvider key={partitionIndex} delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => {
            if (!isUpcoming) onClick();
          }}
          disabled={isUpcoming}
          className={`
            relative overflow-hidden transition-all duration-300 rounded-full h-9
            ${isActive ? "flex-[1.4]" : "flex-1"}
            ${
              isCompleted
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.45)] hover:shadow-[0_0_16px_rgba(16,185,129,0.65)] hover:scale-105 cursor-pointer"
                : isActive
                  ? "bg-slate-900 border-2 border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.55)] cursor-pointer"
                  : "bg-slate-800/60 border border-slate-700/40 cursor-not-allowed"
            }
          `}
        >
          {/* Completed: highlight sheen + check */}
          {isCompleted && (
            <>
              <span className="absolute inset-0 bg-gradient-to-t from-black/15 to-white/15 rounded-full" />
              <span className="absolute inset-0 flex items-center justify-center z-10">
                <svg
                  className="w-3.5 h-3.5 text-white drop-shadow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </>
          )}

          {/* Active: horizontal left-to-right fill + pulse ring + % label */}
          {isActive && (
            <>
              {/* Horizontal progress fill */}
              <span
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/40 to-emerald-400/25 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(progressPercentage, 4)}%` }}
              />
              {/* Outer pulse ring */}
              <span className="absolute -inset-px rounded-full border border-emerald-400/40 animate-pulse" />
              {/* Percentage text */}
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-300 z-10 tracking-wide">
                {progressPercentage.toFixed(0)}%
              </span>
            </>
          )}

          {/* Upcoming: partition number */}
          {isUpcoming && (
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-slate-500">
              {partitionIndex}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="text-xs font-semibold bg-popover text-popover-foreground border-border px-3 py-1.5"
      >
        <div className="text-center">
          <div className="font-bold">Cycle {partitionIndex}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {isCompleted
              ? "✓ Completed"
              : isActive
                ? `In progress · ${progressPercentage.toFixed(1)}% done`
                : "Upcoming"}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const PartitionProgressBar: React.FC<PartitionProgressBarProps> = ({
  currentCycle,
  totalCycles,
  progressPercentage,
  onPartitionClick,
  onPartitionGroupClick,
}) => {
  const maxPills = 8;
  const pills: React.ReactNode[] = [];

  if (totalCycles <= maxPills) {
    for (let i = 1; i <= totalCycles; i++) {
      const isCompleted = i < currentCycle;
      const isActive = i === currentCycle;
      const isUpcoming = i > currentCycle;

      pills.push(
        <PartitionPill
          key={i}
          partitionIndex={i}
          isCompleted={isCompleted}
          isActive={isActive}
          isUpcoming={isUpcoming}
          progressPercentage={isActive ? progressPercentage : 0}
          onClick={() => onPartitionClick(i)}
        />,
      );
    }
  } else {
    const prevCount = 4;
    const upcomingIndividualCount = 2;

    let startIndex = Math.max(1, currentCycle - prevCount);
    let endIndex = currentCycle + upcomingIndividualCount;

    if (currentCycle <= prevCount) {
      startIndex = 1;
      endIndex = Math.min(maxPills - 1, totalCycles);
    }

    if (currentCycle + upcomingIndividualCount >= totalCycles) {
      endIndex = totalCycles;
      startIndex = Math.max(1, totalCycles - maxPills + 1);
    }

    if (startIndex > 1) {
      const groupedStart = 1;
      const groupedEnd = startIndex - 1;
      pills.push(
        <TooltipProvider key="start-group" delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) =>
                  onPartitionGroupClick(groupedStart, groupedEnd, e)
                }
                className="flex-1 h-9 rounded-full transition-all duration-300 relative overflow-hidden cursor-pointer bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.45)] hover:shadow-[0_0_16px_rgba(16,185,129,0.65)] hover:scale-105"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-t from-black/15 to-white/15" />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white z-10">
                  {groupedStart}–{groupedEnd}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="text-xs font-semibold bg-popover text-popover-foreground border-border px-3 py-1.5"
            >
              <div className="text-center">
                <div className="font-bold">
                  Partitions {groupedStart}-{groupedEnd}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Completed · Click to view partition {groupedEnd}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
    }

    for (let i = startIndex; i <= Math.min(endIndex, totalCycles); i++) {
      const isCompleted = i < currentCycle;
      const isActive = i === currentCycle;
      const isUpcoming = i > currentCycle;

      pills.push(
        <PartitionPill
          key={i}
          partitionIndex={i}
          isCompleted={isCompleted}
          isActive={isActive}
          isUpcoming={isUpcoming}
          progressPercentage={isActive ? progressPercentage : 0}
          onClick={() => onPartitionClick(i)}
        />,
      );
    }

    if (endIndex < totalCycles) {
      const groupedStart = endIndex + 1;
      const groupedEnd = totalCycles;
      pills.push(
        <TooltipProvider key="end-group" delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled
                className="flex-1 h-9 rounded-full relative overflow-hidden bg-slate-800/60 border border-slate-700/40 cursor-not-allowed"
              >
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-slate-500">
                  {groupedStart}–{groupedEnd}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="text-xs font-semibold bg-popover text-popover-foreground border-border px-3 py-1.5"
            >
              <div className="text-center">
                <div className="font-bold">
                  Partitions {groupedStart}-{groupedEnd}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Upcoming
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
    }
  }

  return (
    <div className="relative w-full bg-slate-900/40 rounded-full p-1.5 border border-slate-800/60">
      <div className="flex gap-1.5 w-full">{pills}</div>
    </div>
  );
};
