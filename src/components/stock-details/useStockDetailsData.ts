import { useEffect } from "react";
import { Stock } from "../../types";
import { useAppSelector, useAppDispatch } from "../../store/hooks";

export function useStockDetailsData(stock: Stock) {
  const dispatch = useAppDispatch();

  const { selectedTracker, isLoadingTrackerDetails, trackerDetailsError } =
    useAppSelector((state) => state.trackers);

  useEffect(() => {
    console.log("[StockDetails] API Data:", {
      selectedTracker,
      isLoadingTrackerDetails,
      trackerDetailsError,
    });
  }, [selectedTracker, isLoadingTrackerDetails, trackerDetailsError]);

  const useApiData = selectedTracker !== null;
  const trackerData = useApiData ? selectedTracker?.tracker : null;

  console.log("[StockDetails] Using data:", useApiData ? "API" : "Hardcoded", {
    trackerData,
    stock,
  });

  const getDisplayValue = (apiValue: any, stockValue: any) => {
    return useApiData && trackerData ? apiValue : stockValue;
  };

  const displayConvictionYears = getDisplayValue(
    trackerData?.conviction_period_years,
    stock.convictionYears,
  );
  const displayTotalBudget = getDisplayValue(
    trackerData?.total_capital_planned,
    stock.totalBudget,
  );
  const displayConvictionLevel = getDisplayValue(
    trackerData?.base_conviction_score,
    stock.convictionLevel,
  );
  const displayPartitionMonths = getDisplayValue(
    trackerData?.partition_months,
    stock.partitionMonths,
  );
  const displayDeployedAmount = getDisplayValue(
    trackerData?.dsip_total_capital_invested_so_far,
    stock.deployedAmount,
  );
  const displaySharesHeld = getDisplayValue(
    trackerData?.shares_held_so_far,
    stock.quantityOwned,
  );
  const displayCurrentPrice = getDisplayValue(
    trackerData?.currentPrice,
    stock.currentPrice,
  );
  const displayInitialInvestedAmount = getDisplayValue(
    trackerData?.initial_invested_amount,
    null,
  );
  const displayInitialSharesHeld = getDisplayValue(
    trackerData?.initial_shares_held,
    null,
  );

  const getDeploymentStyleText = () => {
    if (!useApiData || !trackerData) return stock.loadFactor;
    const styleMap: Record<number, string> = {
      1: "Gradual Build",
      2: "Balanced Build",
      3: "Aggressive Early Build",
    };
    return styleMap[trackerData.deployment_style] || "Balanced Build";
  };
  const displayLoadFactor = getDeploymentStyleText();

  const totalInvested =
    useApiData && trackerData
      ? trackerData.total_capital_invested_so_far
      : stock.quantityOwned * stock.averagePriceOwned + stock.deployedAmount;

  const sipQuantity =
    useApiData && selectedTracker
      ? selectedTracker.recentExecutions.reduce(
          (acc: number, curr: any) =>
            acc + curr.executedAmount / (curr.executionPrice || 1),
          0,
        )
      : stock.history.reduce(
          (acc: number, curr: any) => acc + curr.amount / curr.price,
          0,
        );

  const totalShares = displaySharesHeld + sipQuantity;
  const currentMarketValue = totalShares * displayCurrentPrice;
  const currentReturnPercent =
    totalInvested > 0
      ? ((currentMarketValue - totalInvested) / totalInvested) * 100
      : 0;

  const currentCycle =
    useApiData && trackerData
      ? trackerData.active_partition_index || 1
      : stock.currentCycle || 10;

  const totalCycles =
    useApiData && trackerData
      ? trackerData.total_cycles
      : stock.totalCycles || 20;

  const daysInvested =
    useApiData && selectedTracker
      ? selectedTracker.recentExecutions.length
      : stock.daysInvested || 14;

  const cycleLength = displayPartitionMonths;

  return {
    dispatch,
    selectedTracker,
    isLoadingTrackerDetails,
    trackerDetailsError,
    useApiData,
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
