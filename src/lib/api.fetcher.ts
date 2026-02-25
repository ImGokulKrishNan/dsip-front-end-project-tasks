/**
 * DSIP API Fetcher
 *
 * Centralized API functions using native fetch.
 * All functions return promises and throw on failure.
 */

import type {
  CreateTrackerRequest,
  UpdateTrackerRequest,
  ExecuteTradeRequest,
  GetStockPriceRequest,
  Tracker,
  GetAllTrackersResponse,
  GetTrackerDetailsResponse,
  ExecuteTradeResponse,
  Partition,
  StockPriceResponse,
  DeleteTrackerResponse,
  Execution,
  EndActionResponse,
  RecommendationResponse,
} from "../types/tracker.types";
import { DeploymentStyle, TrackerStatus } from "../types/tracker.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    },
    ...options,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // not JSON
    }
    if (res.status === 401 || res.status === 403) {
      window.location.href = "/auth/unauthorized";
    }
    throw new Error(message);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Tracker CRUD
// ---------------------------------------------------------------------------

export async function createTracker(
  data: CreateTrackerRequest,
): Promise<Tracker> {
  return request<Tracker>("/api/dsip-trackers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Raw API response shape for /api/dsip-trackers */
interface RawTrackersPayload {
  dsip_trackers?: RawTrackerItem[];
  total_market_value?: number;
  total_capital_invested_so_far?: number;
  dsip_total_capital_invested_so_far?: number;
  dsip_total_market_value?: number;
}

interface RawTrackerItem {
  id?: number;
  symbol?: string;
  name?: string;
  total_capital_planned?: number;
  total_capital_invested_so_far?: number;
  dsip_total_capital_invested_so_far?: number;
  createdAt?: string;
  net_profit_percentage?: number;
  dsip_net_profit_percentage?: number;
}

export async function getAllTrackers(): Promise<GetAllTrackersResponse> {
  const data = await request<RawTrackersPayload>("/api/dsip-trackers");
  const list = data.dsip_trackers ?? [];

  const trackers = list.map((tracker: RawTrackerItem) => {
    const dsipTotal = tracker.dsip_total_capital_invested_so_far ?? 0;
    const totalSoFar = tracker.total_capital_invested_so_far ?? 0;
    const sharesHeld =
      dsipTotal && totalSoFar ? totalSoFar / (dsipTotal || 1) : 0;

    return {
      trackerId: tracker.id ?? 0,
      stockSymbol: tracker.symbol ?? "",
      stockName: tracker.name ?? "",
      currentPrice: sharesHeld > 0 ? totalSoFar / sharesHeld : 0,
      totalCapitalPlanned: tracker.total_capital_planned ?? 0,
      totalCapitalInvestedSoFar: tracker.total_capital_invested_so_far ?? 0,
      dsipTotalCaptialInvestedSoFar:
        tracker.dsip_total_capital_invested_so_far ?? 0,
      sharesHeldSoFar: sharesHeld,
      status: 1,
      activePartitionIndex: 1,
      createdAt: tracker.createdAt ?? new Date().toISOString(),
      net_profit_percentage: tracker.net_profit_percentage ?? 0,
      dsip_net_profit_percentage: tracker.dsip_net_profit_percentage ?? 0,
    };
  });

  return {
    trackers,
    summary: {
      totalTrackers: trackers.length,
      activeTrackers: trackers.length,
      totalCapitalPlanned: data.total_market_value || 0,
      totalCapitalInvested: data.total_capital_invested_so_far ?? 0,
      totalCurrentValue: data.total_market_value ?? 0,
      dsipTotalCapitalInvested: data.dsip_total_capital_invested_so_far ?? 0,
      dsipTotalCurrentValue: data.dsip_total_market_value ?? 0,
    },
  };
}

/** Raw API response shape for tracker details */
interface RawTrackerDetailResponse {
  id?: number;
  user_id?: string;
  stock_id?: number;
  symbol?: string;
  conviction_period_years?: number;
  total_capital_planned?: number;
  partition_days?: number;
  partition_months?: number;
  deployment_style?: number;
  base_conviction_score?: number;
  initial_invested_amount?: number;
  initial_shares_held?: number;
  status?: number;
  active_partition_index?: number;
  total_capital_invested_so_far?: number;
  total_market_value?: number;
  net_profit_percentage?: number;
  dsip_total_capital_invested_so_far?: number;
  dsip_total_market_value?: number;
  dsip_net_profit_percentage?: number;
  shares_held_so_far?: number;
  total_cycles?: number;
  is_fractional_shares_allowed?: boolean;
  created_at?: string;
  name?: string;
  current_total_value?: number;
  current_avg?: number;
  dsip_current_avg?: number;
  current_market_price?: number;
  live_investment_cycle?: {
    total_capital_invested_so_far?: number;
    partition_progress?: number;
    net_profit_percentage?: number;
  };
  history?: RawHistoryItem[];
}

interface RawHistoryItem {
  executed_amount?: number;
  executed_price?: number;
  date?: string;
}

export async function getTrackerDetails(
  trackerId: number,
): Promise<GetTrackerDetailsResponse> {
  const data = await request<RawTrackerDetailResponse>(
    `/api/dsip-trackers/${trackerId}`,
  );
  const history = data.history ?? [];

  return {
    tracker: {
      trackerId: data.id ?? trackerId,
      userId: data.user_id ?? "",
      stock_id: data.stock_id ?? 0,
      stock_symbol: data.symbol ?? "",
      conviction_period_years: data.conviction_period_years ?? 0,
      total_capital_planned: data.total_capital_planned ?? 0,
      partition_days: data.partition_days ?? 0,
      partition_months: data.partition_months ?? 0,
      deployment_style: (data.deployment_style ?? 1) as DeploymentStyle,
      base_conviction_score: data.base_conviction_score ?? 0,
      initial_invested_amount: data.initial_invested_amount ?? 0,
      initial_shares_held: data.initial_shares_held ?? 0,
      status: (data.status ?? 1) as TrackerStatus,
      active_partition_index: data.active_partition_index ?? 1,
      total_capital_invested_so_far: data.total_capital_invested_so_far ?? 0,
      total_market_value: data.total_market_value ?? 0,
      net_profit_percentage: data.net_profit_percentage ?? 0,
      dsip_total_capital_invested_so_far:
        data.dsip_total_capital_invested_so_far ?? 0,
      dsip_total_market_value: data.dsip_total_market_value ?? 0,
      dsip_net_profit_percentage: data.dsip_net_profit_percentage ?? 0,
      shares_held_so_far: data.shares_held_so_far ?? 0,
      total_cycles: data.total_cycles ?? 0,
      is_fractional_shares_allowed: data.is_fractional_shares_allowed ?? false,
      createdAt: data.created_at ?? new Date().toISOString(),
      stockName: data.name ?? "Unknown",
      currentPrice: data.current_total_value ?? 0,
      current_avg: data.current_avg,
      dsip_current_avg: data.dsip_current_avg,
      current_market_price: data.current_market_price,
      live_investment_cycle: data.live_investment_cycle
        ? {
            total_capital_invested_so_far:
              data.live_investment_cycle.total_capital_invested_so_far ?? 0,
            partition_progress:
              data.live_investment_cycle.partition_progress ?? 0,
            net_profit_percentage:
              data.live_investment_cycle.net_profit_percentage ?? 0,
          }
        : undefined,
    },
    partitions: history.map((h, index) => ({
      partitionId: index + 1,
      trackerId: data.id ?? trackerId,
      partitionIndex: index + 1,
      expectedPartitionDays: data.partition_days ?? 0,
      partitionCapitalAllocated: 0,
      capitalInvestedSoFar: h.executed_amount ?? 0,
      noOfSharesBought: 0,
      successfulGrowthCount: 0,
      status: 2,
      partitionEndDate: h.date ?? null,
      createdAt: h.date ?? new Date().toISOString(),
    })),
    recentExecutions: history.map((h, index) => ({
      executionId: index + 1,
      trackerId: data.id ?? trackerId,
      partitionId: 0,
      lockInPercentage: 0,
      convictionOverride: 0,
      executedAmount: h.executed_amount ?? 0,
      executionPrice: h.executed_price ?? 0,
      createdAt: h.date ?? new Date().toISOString(),
    })),
  };
}

export async function updateTracker(
  trackerId: number,
  data: UpdateTrackerRequest,
): Promise<GetTrackerDetailsResponse> {
  return request<GetTrackerDetailsResponse>(`/api/dsip-trackers/${trackerId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function executeTrade(
  trackerId: number,
  data: ExecuteTradeRequest,
): Promise<ExecuteTradeResponse> {
  return request<ExecuteTradeResponse>(
    `/api/dsip-trackers/${trackerId}/execute`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function getPartitionDetails(
  trackerId: number,
  partitionIndex: number,
): Promise<Partition> {
  return request<Partition>(
    `/api/dsip-trackers/${trackerId}/partitions/${partitionIndex}`,
  );
}

export async function deleteTracker(
  trackerId: number,
): Promise<DeleteTrackerResponse> {
  return request<DeleteTrackerResponse>(`/api/dsip-trackers/${trackerId}`, {
    method: "DELETE",
  });
}

export async function getStockClosingPrice(
  params: GetStockPriceRequest,
): Promise<StockPriceResponse> {
  return request<StockPriceResponse>(
    `/api/stocks/close?symbol=${params.symbol}&exchange=${params.exchange}`,
  );
}

export async function getTrackerExecutions(
  trackerId: number,
  limit: number = 6,
): Promise<Execution[]> {
  return request<Execution[]>(
    `/api/dsip-trackers/${trackerId}/executions?limit=${limit}`,
  );
}

export async function syncTrackerData(data: {
  tracker_id: number;
  current_total_shares: number;
  current_total_invested_amount: number;
  reason?: string;
}): Promise<{
  success: boolean;
  message: string;
  dsip_shares?: number;
  dsip_capital_deployed?: number;
  total_shares?: number;
  total_invested_amount?: number;
}> {
  return request("/api/dsip/sync", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRecommendation(
  trackerId: number,
  lockInPct: number,
): Promise<RecommendationResponse> {
  return request<RecommendationResponse>(
    `/api/dsip-trackers/${trackerId}/recommendation?lock_in_pct=${lockInPct}`,
  );
}

export async function endPartitionAction(
  trackerId: number,
  partitionIndex: number,
): Promise<EndActionResponse> {
  return request<EndActionResponse>(
    `/api/dsip-trackers/end-action?trackerId=${trackerId}&partitionIndex=${partitionIndex}`,
    { method: "POST" },
  );
}

export { API_BASE_URL };
