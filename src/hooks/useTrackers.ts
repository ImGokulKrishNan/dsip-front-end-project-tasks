import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import * as trackerApi from "../lib/api.fetcher";
import { TrackerStatus } from "../types/tracker.types";
import type {
  GetAllTrackersResponse,
  GetTrackerDetailsResponse,
  UpdateTrackerRequest,
  ExecuteTradeRequest,
  ExecuteTradeResponse,
  EndActionResponse,
} from "../types/tracker.types";
import { Stock } from "../types";

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const trackerKeys = {
  all: ["trackers"] as const,
  list: () => [...trackerKeys.all, "list"] as const,
  details: (id: number) => [...trackerKeys.all, "details", id] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useTrackers() {
  const query = useQuery<GetAllTrackersResponse>({
    queryKey: trackerKeys.list(),
    queryFn: trackerApi.getAllTrackers,
  });

  const stocks: Stock[] = useMemo(() => {
    if (!query.data) return [];
    return query.data.trackers.map((tracker) => ({
      id: tracker.trackerId.toString(),
      symbol: tracker.stockSymbol,
      name: tracker.stockName,
      displayName:
        tracker.displayName || tracker.stockName || tracker.stockSymbol || "",
      totalBudget: tracker.totalCapitalPlanned,
      deployedAmount: tracker.totalCapitalInvestedSoFar,
      currentPrice: tracker.currentPrice,
      isPaused: tracker.status === TrackerStatus.PAUSED,
      quantityOwned: tracker.sharesHeldSoFar,
      averagePriceOwned:
        tracker.sharesHeldSoFar > 0
          ? tracker.totalCapitalInvestedSoFar / tracker.sharesHeldSoFar
          : 0,
      net_profit_percentage: tracker.net_profit_percentage,
      dsip_net_profit_percentage: tracker.dsip_net_profit_percentage,
    }));
  }, [query.data]);

  return {
    trackers: query.data?.trackers ?? [],
    portfolioSummary: query.data?.summary ?? null,
    stocks,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useTrackerDetails(trackerId: number | undefined) {
  return useQuery<GetTrackerDetailsResponse>({
    queryKey: trackerKeys.details(trackerId!),
    queryFn: () => trackerApi.getTrackerDetails(trackerId!),
    enabled: !!trackerId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

function useInvalidateTracker() {
  const queryClient = useQueryClient();
  return (trackerId?: number) => {
    queryClient.invalidateQueries({ queryKey: trackerKeys.list() });
    if (trackerId) {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.details(trackerId),
      });
    }
  };
}

export function useCreateTracker() {
  const invalidate = useInvalidateTracker();
  return useMutation({
    mutationFn: trackerApi.createTracker,
    onSuccess: () => invalidate(),
  });
}

export function useDeleteTracker() {
  const invalidate = useInvalidateTracker();
  return useMutation({
    mutationFn: (trackerId: number) => trackerApi.deleteTracker(trackerId),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateTracker() {
  const invalidate = useInvalidateTracker();
  return useMutation({
    mutationFn: ({
      trackerId,
      data,
    }: {
      trackerId: number;
      data: UpdateTrackerRequest;
    }) => trackerApi.updateTracker(trackerId, data),
    onSuccess: (_, { trackerId }) => invalidate(trackerId),
  });
}

export function useExecuteTrade() {
  const invalidate = useInvalidateTracker();
  return useMutation<
    ExecuteTradeResponse,
    Error,
    { trackerId: number; data: ExecuteTradeRequest }
  >({
    mutationFn: ({ trackerId, data }) =>
      trackerApi.executeTrade(trackerId, data),
    onSuccess: (_, { trackerId }) => invalidate(trackerId),
  });
}

export function useEndPartition() {
  const invalidate = useInvalidateTracker();
  return useMutation<
    EndActionResponse,
    Error,
    { trackerId: number; partitionIndex: number }
  >({
    mutationFn: ({ trackerId, partitionIndex }) =>
      trackerApi.endPartitionAction(trackerId, partitionIndex),
    onSuccess: (_, { trackerId }) => invalidate(trackerId),
  });
}

export function useSyncTracker() {
  const invalidate = useInvalidateTracker();
  return useMutation({
    mutationFn: trackerApi.syncTrackerData,
    onSuccess: (_, vars) => invalidate(vars.tracker_id),
  });
}
