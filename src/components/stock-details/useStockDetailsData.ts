import { useTrackerDetails } from "../../hooks/useTrackers";

const DEPLOYMENT_STYLE_LABELS: Record<number, string> = {
  1: "Gradual Build",
  2: "Balanced Build",
  3: "Aggressive Early Build",
};

export function useStockDetailsData(trackerId: number | undefined) {
  const {
    data: selectedTracker,
    isLoading: isLoadingTrackerDetails,
    error: trackerDetailsError,
  } = useTrackerDetails(trackerId);

  const trackerData = selectedTracker?.tracker ?? null;

  const displayConvictionYears = trackerData?.conviction_period_years ?? 0;
  const displayTotalBudget = trackerData?.total_capital_planned ?? 0;
  const displayConvictionLevel = trackerData?.base_conviction_score ?? 0;
  const displayPartitionMonths = trackerData?.partition_months ?? 0;
  const displayDeployedAmount =
    trackerData?.dsip_total_capital_invested_so_far ?? 0;
  const displaySharesHeld = trackerData?.shares_held_so_far ?? 0;
  const displayCurrentPrice = trackerData?.currentPrice ?? 0;
  const displayInitialInvestedAmount =
    trackerData?.initial_invested_amount ?? null;
  const displayInitialSharesHeld = trackerData?.initial_shares_held ?? null;
  const displayLoadFactor =
    DEPLOYMENT_STYLE_LABELS[trackerData?.deployment_style ?? 2] ??
    "Balanced Build";

  const totalInvested = trackerData?.total_capital_invested_so_far ?? 0;

  const sipQuantity = selectedTracker
    ? selectedTracker.recentExecutions.reduce(
        (acc, curr) => acc + curr.executedAmount / (curr.executionPrice || 1),
        0,
      )
    : 0;

  const totalShares = displaySharesHeld + sipQuantity;
  const currentMarketValue = totalShares * displayCurrentPrice;
  const currentReturnPercent =
    totalInvested > 0
      ? ((currentMarketValue - totalInvested) / totalInvested) * 100
      : 0;

  const currentCycle = trackerData?.active_partition_index ?? 1;
  const totalCycles = trackerData?.total_cycles ?? 0;
  const daysInvested = selectedTracker?.recentExecutions.length ?? 0;
  const cycleLength = displayPartitionMonths;

  return {
    selectedTracker: selectedTracker ?? null,
    isLoadingTrackerDetails,
    trackerDetailsError,
    trackerData,
    displayConvictionYears,
    displayTotalBudget,
    displayConvictionLevel,
    displayPartitionMonths,
    displayDeployedAmount,
    displaySharesHeld,
    displayCurrentPrice,
    displayInitialInvestedAmount,
    displayInitialSharesHeld,
    displayLoadFactor,
    totalInvested,
    sipQuantity,
    totalShares,
    currentMarketValue,
    currentReturnPercent,
    currentCycle,
    totalCycles,
    daysInvested,
    cycleLength,
  };
}
