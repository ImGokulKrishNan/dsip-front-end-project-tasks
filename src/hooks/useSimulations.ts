import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchSimulationsApi,
  deleteSimulationApi,
  fetchSimulationByIdApi,
} from "@/lib/simulation.fetcher";
import { SimulationResult, Stock } from "@/types";

interface PortfolioSummary {
  totalInvestedValue: number;
  finalMarketValue: number;
  winningSimulations: number;
  totalSimulations: number;
}

interface UseSimulationsResult {
  simulations: SimulationResult[];
  portfolioSummary: PortfolioSummary | null;
  stocks: Stock[];
  isLoading: boolean;
  error: Error | null;
}

export const useSimulations = (): UseSimulationsResult => {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery<SimulationResult[], Error>({
    queryKey: ["simulations"],
    queryFn: fetchSimulationsApi,
  });

  const sanitizedSimulations: SimulationResult[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((sim: any) => {
      const totalCapital = Number(
        sim.totalCapital ??
          sim.total_capital_invested_so_far ??
          sim.totalCapitalInvestedSoFar ??
          0,
      );
      const returnPercentage = Number(
        sim.returnPercentage ??
          sim.net_profit_percentage ??
          sim.netProfitPercentage ??
          0,
      );
      const explicitFinalValue = Number(
        sim.finalValue ??
          sim.total_market_value ??
          sim.current_total_value ??
          sim.totalMarketValue ??
          0,
      );
      const finalValue =
        explicitFinalValue ||
        totalCapital + totalCapital * (returnPercentage / 100);

      return {
        ...sim,
        id: String(sim.id ?? sim.trackerId ?? sim.tracker_id ?? ""),
        symbol: String(
          sim.symbol ?? sim.stockSymbol ?? sim.stock_symbol ?? "Unknown",
        ),
        displayName: String(
          sim.display_name ??
            sim.displayName ??
            sim.name ??
            sim.symbol ??
            sim.stockSymbol ??
            sim.stock_symbol ??
            "Unknown",
        ),
        totalCapital,
        totalCapitalPlanned: Number(
          sim.totalCapitalPlanned ??
            sim.total_capital_planned ??
            sim.totalCapital ??
            0,
        ),
        finalValue,
        returnPercentage,
        totalReturn: Number(
          sim.totalReturn ?? sim.total_profit ?? finalValue - totalCapital,
        ),
      };
    });
  }, [data]);

  const portfolioSummary: PortfolioSummary | null =
    sanitizedSimulations.length > 0
      ? {
          totalInvestedValue: sanitizedSimulations.reduce(
            (acc, s) => acc + s.totalCapital,
            0,
          ),
          finalMarketValue: sanitizedSimulations.reduce(
            (acc, s) => acc + s.finalValue,
            0,
          ),
          winningSimulations: sanitizedSimulations.filter(
            (s) => s.returnPercentage > 0,
          ).length,
          totalSimulations: sanitizedSimulations.length,
        }
      : null;

  const stocks: Stock[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((sim: any) => {
      const id = sim.id ?? sim.trackerId ?? sim.tracker_id ?? "";
      const symbol =
        sim.symbol ?? sim.stockSymbol ?? sim.stock_symbol ?? "Unknown";
      const name = sim.name ?? sim.stockName ?? sim.stock_name ?? symbol;
      const displayName = sim.display_name ?? sim.displayName ?? name;

      const totalBudget =
        sim.totalCapitalPlanned ??
        sim.total_capital_planned ??
        sim.totalCapital ??
        0;
      const deployedAmount =
        sim.totalCapitalInvestedSoFar ??
        sim.total_capital_invested_so_far ??
        sim.totalCapital ??
        0;

      const lastCycle = sim.cycles?.[sim.cycles?.length - 1];
      const currentPrice =
        sim.currentPrice ??
        sim.current_market_price ??
        sim.currentMarketPrice ??
        lastCycle?.currentMarketPrice ??
        0;
      const quantityOwned =
        sim.sharesHeldSoFar ??
        sim.shares_held_so_far ??
        lastCycle?.totalSharesHeld ??
        0;
      const averagePriceOwned =
        sim.currentAvg ??
        sim.current_avg ??
        sim.averageBuyPrice ??
        lastCycle?.averageBuyPrice ??
        0;

      const net_profit_percentage =
        sim.netProfitPercentage ??
        sim.net_profit_percentage ??
        sim.returnPercentage ??
        0;
      const dsip_net_profit_percentage =
        sim.dsipNetProfitPercentage ??
        sim.dsip_net_profit_percentage ??
        sim.returnPercentage ??
        0;

      return {
        id: id.toString(),
        symbol,
        name,
        displayName,
        totalBudget,
        deployedAmount,
        currentPrice,
        isPaused: sim.status === "PAUSED" || sim.status === 2 || false,
        quantityOwned,
        averagePriceOwned,
        net_profit_percentage,
        dsip_net_profit_percentage,
      };
    });
  }, [data]);

  return {
    simulations: sanitizedSimulations,
    portfolioSummary,
    stocks,
    isLoading,
    error: error ?? null,
  };
};

export const useDeleteSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSimulationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
    },
  });
};
export const useSimulationById = (id: string | undefined) => {
  return useQuery<SimulationResult, Error>({
    queryKey: ["simulation", id],
    queryFn: () => {
      if (!id) throw new Error("No simulation ID provided");
      return fetchSimulationByIdApi(id);
    },
    enabled: !!id, // Only run the query if an ID is actually provided
    staleTime: 1000 * 60 * 5, // Cache the result for 5 minutes
  });
};
