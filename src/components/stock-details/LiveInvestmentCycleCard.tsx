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

interface LiveInvestmentCycleCardProps {
  currentCycle: number;
  totalCycles: number;
  daysInvested: number;
  cycleLength: number;
  displayDeployedAmount: number;
  displayTotalBudget: number;
  useApiData: boolean;
  selectedTracker: any;
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
  useApiData,
  selectedTracker,
  totalShares,
  currentReturnPercent,
  stock,
  onPartitionClick,
  onPartitionGroupClick,
}) => {
  const liveCycle = selectedTracker?.tracker?.live_investment_cycle;

  const investedAmount =
    useApiData && liveCycle?.total_capital_invested_so_far
      ? liveCycle.total_capital_invested_so_far
      : totalShares * stock.currentPrice;

  const profitPct =
    useApiData && liveCycle?.net_profit_percentage !== undefined
      ? liveCycle.net_profit_percentage
      : currentReturnPercent;

  const cycleProgress =
    useApiData && liveCycle?.partition_progress
      ? liveCycle.partition_progress
      : ((daysInvested % cycleLength) / cycleLength) * 100;

  const progressPercentage =
    useApiData && liveCycle?.partition_progress
      ? liveCycle.partition_progress
      : 0;

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
              <Icons.Target size={14} className="text-cyan-500" />
              Deployment Progress
            </h3>
            <span className="text-xs font-mono font-medium text-muted-foreground">
              {((displayDeployedAmount / displayTotalBudget) * 100).toFixed(1)}%
              Complete
            </span>
          </div>

          <PartitionProgressBar
            currentCycle={currentCycle}
            totalCycles={totalCycles}
            progressPercentage={progressPercentage}
            onPartitionClick={onPartitionClick}
            onPartitionGroupClick={onPartitionGroupClick}
          />

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
            <span className="font-semibold">
              {currentCycle}/{totalCycles}
            </span>
            <span>END</span>
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
          className={`flex-1 h-8 rounded-full transition-all duration-300 relative group overflow-hidden ${
            isCompleted
              ? "bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 cursor-pointer"
              : isActive
                ? "bg-muted dark:bg-slate-800 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:shadow-[0_0_25px_rgba(34,211,238,0.8)] scale-105 cursor-pointer"
                : "bg-muted/70 dark:bg-slate-800/50 border border-border cursor-not-allowed opacity-50"
          }`}
        >
          {isActive && (
            <>
              <span
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{ clipPath: "inset(0 round 9999px)" }}
              >
                <span
                  className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500"
                  style={{
                    bottom: 0,
                    height: `${progressPercentage}%`,
                    top: "auto",
                  }}
                >
                  <span
                    className="absolute inset-x-0 -top-2"
                    style={{
                      height: "8px",
                      background:
                        "radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)",
                      animation: "wave 2s ease-in-out infinite",
                    }}
                  />
                </span>
              </span>
              <span className="absolute -inset-0.5 rounded-full bg-cyan-400/20 animate-pulse" />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground dark:text-white z-20">
                {progressPercentage.toFixed(0)}%
              </span>
            </>
          )}
          {isCompleted && (
            <span className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
          )}
          {isUpcoming && (
            <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="text-xs font-semibold bg-popover text-popover-foreground border-border px-3 py-1.5"
      >
        <div className="text-center">
          <div className="font-bold">Partition {partitionIndex}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {isCompleted
              ? "Success"
              : isActive
                ? `Active (${progressPercentage.toFixed(1)}%)`
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
                className="flex-1 h-8 rounded-full transition-all duration-300 relative group overflow-hidden cursor-pointer bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90 z-10">
                  {groupedStart}-{groupedEnd}
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
                className="flex-1 h-8 rounded-full transition-all duration-300 relative group overflow-hidden bg-muted/70 dark:bg-slate-800/50 border border-border cursor-not-allowed opacity-50"
              >
                <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                  {groupedStart}-{groupedEnd}
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
    <div className="relative w-full bg-muted/60 dark:bg-slate-900/30 rounded-full p-2 ring-1 ring-border shadow-inner">
      <div className="flex gap-2 w-full">{pills}</div>
    </div>
  );
};
