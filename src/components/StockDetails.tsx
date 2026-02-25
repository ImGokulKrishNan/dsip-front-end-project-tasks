import React, { useState, useEffect } from "react";
import { Icons } from "../constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useExecuteTrade, useEndPartition } from "@/hooks/useTrackers";
import { getRecommendation, getPartitionDetails } from "../lib/api.fetcher";

import { useStockDetailsData } from "./stock-details/useStockDetailsData";
import { DailyExecutionZone } from "./stock-details/DailyExecutionZone";
import { EngineConfigurationCard } from "./stock-details/EngineConfigurationCard";
import { LiveInvestmentCycleCard } from "./stock-details/LiveInvestmentCycleCard";
import { PartitionSection } from "./stock-details/PartitionSection";
import { ExecutionDialogs } from "./stock-details/ExecutionDialogs";
import {
  StockDetailsProps,
  RecommendationResponse,
  ExecutionState,
} from "./stock-details/types";

const StockDetails: React.FC<StockDetailsProps> = ({ stock, onBack }) => {
  const trackerId = stock.id ? parseInt(stock.id) : undefined;
  const validTrackerId = trackerId && !isNaN(trackerId) ? trackerId : undefined;
  const data = useStockDetailsData(validTrackerId);
  const executeTradeM = useExecuteTrade();
  const endPartitionM = useEndPartition();
  const {
    selectedTracker,
    isLoadingTrackerDetails,
    trackerDetailsError,
    trackerData,
    displayConvictionYears,
    displayTotalBudget,
    displayConvictionLevel,
    displayPartitionMonths,
    displayDeployedAmount,
    displayLoadFactor,
    displayInitialInvestedAmount,
    displayInitialSharesHeld,
    totalInvested,
    totalShares,
    currentReturnPercent,
    currentCycle,
    totalCycles,
    daysInvested,
    cycleLength,
  } = data;

  // ===== Execution State =====
  const [executionState, setExecutionState] = useState<ExecutionState>("IDLE");
  const [lockInPct, setLockInPct] = useState<string>("");
  const [convictionOverride, setConvictionOverride] = useState<number[]>([
    displayConvictionLevel || 50,
  ]);
  const [recommendation, setRecommendation] =
    useState<RecommendationResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Final Confirmation Inputs
  const [executedAmount, setExecutedAmount] = useState<string>("");
  const [executionPrice, setExecutionPrice] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Dialog State
  const [showDailyLimitWarning, setShowDailyLimitWarning] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showVictoryPopup, setShowVictoryPopup] = useState(false);
  const [showKillSwitchPopup, setShowKillSwitchPopup] = useState(false);
  const [executionResponse, setExecutionResponse] = useState<any>(null);

  // Partition State
  const [selectedPartition, setSelectedPartition] = useState<number | null>(
    null,
  );
  const [partitionDetails, setPartitionDetails] = useState<any>(null);
  const [isLoadingPartition, setIsLoadingPartition] = useState(false);
  const [showPartitionSelector, setShowPartitionSelector] = useState(false);
  const [selectorPartitions, setSelectorPartitions] = useState<number[]>([]);
  const [selectorAnchor, setSelectorAnchor] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    if (displayConvictionLevel) {
      setConvictionOverride([displayConvictionLevel]);
    }
  }, [displayConvictionLevel]);

  // ===== Partition Handlers =====
  const handlePartitionGroupClick = (
    startIndex: number,
    endIndex: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const partitions = [];
    for (let i = startIndex; i <= endIndex; i++) {
      partitions.push(i);
    }
    setSelectorPartitions(partitions);
    setSelectorAnchor(event.currentTarget);
    setShowPartitionSelector(true);
  };

  const getPartitionData = (index: number) => {
    if (index >= currentCycle) return null;
    const seed = index * 123;
    const amount = Math.floor(2000 + (seed % 3000));
    const variation = (seed % 20) - 10;
    const price = data.displayCurrentPrice * (1 + variation / 100);
    return {
      partitionIndex: index + 1,
      amountInvested: amount,
      avgPrice: price,
      status: "COMPLETED",
    };
  };

  const handlePartitionClick = async (index: number) => {
    setShowPartitionSelector(false);
    setSelectedPartition(index);

    if (trackerData?.trackerId) {
      setIsLoadingPartition(true);
      try {
        const details = await getPartitionDetails(trackerData.trackerId, index);
        setPartitionDetails(details);
      } catch {
        setPartitionDetails(getPartitionData(index));
      } finally {
        setIsLoadingPartition(false);
      }
    } else {
      setPartitionDetails(getPartitionData(index));
    }
  };

  // ===== Execution Handlers =====
  const performCalculation = async () => {
    setIsCalculating(true);
    setCalculationError(null);

    try {
      const trackerId = trackerData?.trackerId;
      if (!trackerId) {
        throw new Error("No tracker selected. Please select a tracker first.");
      }

      const lockIn = Number(lockInPct);
      if (isNaN(lockIn) || lockInPct === "") {
        throw new Error("Please enter a valid lock-in percentage");
      }

      const result = await getRecommendation(trackerId, lockIn);

      setRecommendation(result);
      setExecutionState("CALCULATED");
      setExecutedAmount(result.recommended_amount.toString());
      setExecutionPrice("");
    } catch (error: any) {
      setCalculationError(
        error.message || "Failed to calculate recommendation",
      );
      setExecutionState("IDLE");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCalculate = () => {
    performCalculation();
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    setConfirmError(null);

    try {
      const trackerId = trackerData?.trackerId;
      const partitionIndex = trackerData?.active_partition_index;

      if (!trackerId || !partitionIndex) {
        throw new Error("Missing tracker or partition information");
      }

      const amount = Number(executedAmount);
      const price = Number(executionPrice);
      const lockInPercentage = Number(lockInPct);
      const conviction = convictionOverride[0];

      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid invested amount");
      }
      if (isNaN(price) || price <= 0) {
        throw new Error("Please enter a valid execution price");
      }
      if (isNaN(lockInPercentage)) {
        throw new Error("Please enter a valid lock-in percentage");
      }

      const result = await executeTradeM.mutateAsync({
        trackerId,
        data: {
          lock_in_percentage: lockInPercentage,
          conviction_override: conviction,
          executed_amount: amount,
          execution_price: price,
        },
      });

      setExecutionState("IDLE");
      setLockInPct("");
      setConvictionOverride([displayConvictionLevel || 50]);
      setRecommendation(null);
      setExecutedAmount("");
      setExecutionPrice("");

      setExecutionResponse(result);

      if (result.code === "SUCCESS") {
        setShowVictoryPopup(true);
      } else if (result.code === "ONGOING") {
        setShowSuccessPopup(true);
      } else if (
        result.code === "KILL_SWITCH_STAGNATION" ||
        result.code === "KILL_SWITCH_POOR_GROWTH" ||
        result.code === "NEUTRAL_PARTITION"
      ) {
        if (result.title && result.message) {
          const shouldEndPartition = window.confirm(
            `${result.title}\n\n${result.message}\n\nCapital Deployed: $${result.deployed_amount?.toLocaleString() || "N/A"}\nNet Return: ${result.profit_pct?.toFixed(2) || "N/A"}%\n\nClick OK to acknowledge and end this partition.`,
          );

          if (shouldEndPartition) {
            await endPartitionM.mutateAsync({ trackerId, partitionIndex });

            if (
              result.code === "KILL_SWITCH_STAGNATION" ||
              result.code === "KILL_SWITCH_POOR_GROWTH"
            ) {
              setShowKillSwitchPopup(true);
            } else if (result.code === "NEUTRAL_PARTITION") {
              setShowSuccessPopup(true);
            }
          }
        }
      } else {
        setShowSuccessPopup(true);
      }
    } catch (error: any) {
      setConfirmError(error.message || "Failed to confirm execution");
    } finally {
      setIsConfirming(false);
    }
  };

  // ===== Loading / Error States =====
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

  if (trackerDetailsError) {
    return (
      <div className="flex-1 flex items-center justify-center h-full p-6">
        <Card className="max-w-md border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 text-destructive">
              <Icons.AlertCircle size={24} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Failed to load tracker details</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {trackerDetailsError?.message}
                </p>
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="mt-4"
                  size="sm"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== Main Render =====
  return (
    <div className="h-full bg-background overflow-auto">
      <div className="px-4 md:px-0 pt-5 md:p-6 md:pb-0 space-y-4 xl:pb-32">
        <div className="flex flex-col 2xl:flex-row h-full gap-1 2xl:gap-4">
          <DailyExecutionZone
            executionState={executionState}
            setExecutionState={setExecutionState}
            lockInPct={lockInPct}
            setLockInPct={setLockInPct}
            convictionOverride={convictionOverride}
            setConvictionOverride={setConvictionOverride}
            recommendation={recommendation}
            isCalculating={isCalculating}
            calculationError={calculationError}
            executedAmount={executedAmount}
            setExecutedAmount={setExecutedAmount}
            executionPrice={executionPrice}
            setExecutionPrice={setExecutionPrice}
            isConfirming={isConfirming}
            confirmError={confirmError}
            onCalculate={handleCalculate}
            onConfirm={handleConfirm}
            totalInvested={totalInvested}
            totalShares={totalShares}
            trackerData={trackerData}
          />
          <EngineConfigurationCard
            displayValues={{
              convictionYears: displayConvictionYears,
              totalBudget: displayTotalBudget,
              convictionLevel: displayConvictionLevel,
              partitionMonths: displayPartitionMonths,
              deployedAmount: displayDeployedAmount,
              sharesHeld: data.displaySharesHeld,
              currentPrice: data.displayCurrentPrice,
              loadFactor: displayLoadFactor,
              initialInvestedAmount: displayInitialInvestedAmount,
              initialSharesHeld: displayInitialSharesHeld,
            }}
            trackerData={trackerData}
          />
        </div>
        <LiveInvestmentCycleCard
          currentCycle={currentCycle}
          totalCycles={totalCycles}
          daysInvested={daysInvested}
          cycleLength={cycleLength}
          displayDeployedAmount={displayDeployedAmount}
          displayTotalBudget={displayTotalBudget}
          selectedTracker={selectedTracker}
          totalShares={totalShares}
          currentReturnPercent={currentReturnPercent}
          stock={stock}
          onPartitionClick={handlePartitionClick}
          onPartitionGroupClick={handlePartitionGroupClick}
        />

        <PartitionSection
          selectedPartition={selectedPartition}
          setSelectedPartition={setSelectedPartition}
          partitionDetails={partitionDetails}
          isLoadingPartition={isLoadingPartition}
          displayPartitionMonths={displayPartitionMonths}
          showPartitionSelector={showPartitionSelector}
          setShowPartitionSelector={setShowPartitionSelector}
          selectorPartitions={selectorPartitions}
          selectorAnchor={selectorAnchor}
          onPartitionClick={handlePartitionClick}
        />

        <ExecutionDialogs
          showDailyLimitWarning={showDailyLimitWarning}
          setShowDailyLimitWarning={setShowDailyLimitWarning}
          showSuccessPopup={showSuccessPopup}
          setShowSuccessPopup={setShowSuccessPopup}
          showVictoryPopup={showVictoryPopup}
          setShowVictoryPopup={setShowVictoryPopup}
          showKillSwitchPopup={showKillSwitchPopup}
          setShowKillSwitchPopup={setShowKillSwitchPopup}
          executionResponse={executionResponse}
          performCalculation={performCalculation}
        />
      </div>
    </div>
  );
};

export default StockDetails;
