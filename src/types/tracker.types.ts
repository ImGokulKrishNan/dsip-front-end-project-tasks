/**
 * DSIP Tracker Types
 * TypeScript definitions for all tracker-related API requests and responses
 */

// ============================================================================
// Enums
// ============================================================================

export enum DeploymentStyle {
  UNIFORM = 0,
  AGGRESSIVE = 1,
  CONSERVATIVE = 2,
}

export enum TrackerStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  PAUSED = 3,
}

export enum PartitionStatus {
  PENDING = 0,
  ACTIVE = 1,
  COMPLETED = 2,
}

export enum Exchange {
  US = 'US',
  NSE = 'NSE',
  BSE = 'BSE',
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateTrackerRequest {
  stock_symbol: string;
  conviction_period_years: number;
  total_capital_planned: number;
  partition_days: number;
  deployment_style: DeploymentStyle;
  base_conviction_score: number;
  initial_invested_amount?: number;
  initial_shares_held?: number;
  is_fractional_shares_allowed?: boolean;
}

export interface UpdateTrackerRequest {
  deployment_style?: DeploymentStyle;
  base_conviction_score?: number;
  status?: TrackerStatus;
  total_capital_planned?: number;
  conviction_period_years?: number;
  partition_days?: number;
}

export interface ExecuteTradeRequest {
  lock_in_percentage: number;
  conviction_override: number;
  executed_amount: number;
  execution_price: number;
}

export interface GetStockPriceRequest {
  symbol: string;
  exchange: Exchange;
}

// ============================================================================
// Response Types
// ============================================================================

export interface Tracker {
  trackerId: number;
  userId: string;
  stock_id: number;
  stock_symbol: string;
  conviction_period_years: number;
  total_capital_planned: number;
  partition_days: number;
  deployment_style: DeploymentStyle;
  base_conviction_score: number;
  initial_invested_amount: number;
  initial_shares_held: number;
  status: TrackerStatus;
  active_partition_index: number;
  total_capital_invested_so_far: number;
  shares_held_so_far: number;
  is_fractional_shares_allowed: boolean;
  createdAt: string;
  live_investment_cycle?: {
    total_capital_invested_so_far: number;
    partition_progress: number;
    net_profit_percentage: number;
  };
}

export interface TrackerSummary {
  trackerId: number;
  stockSymbol: string;
  stockName: string;
  currentPrice: number;
  totalCapitalPlanned: number;
  totalCapitalInvestedSoFar: number;
  sharesHeldSoFar: number;
  status: TrackerStatus;
  activePartitionIndex: number;
  createdAt: string;
}

export interface PortfolioSummary {
  totalTrackers: number;
  activeTrackers: number;
  totalCapitalPlanned: number;
  totalCapitalInvested: number;
  totalCurrentValue: number;
}

export interface GetAllTrackersResponse {
  trackers: TrackerSummary[];
  summary: PortfolioSummary;
}

export interface Partition {
  partitionId: number;
  trackerId?: number;
  partitionIndex: number;
  expectedPartitionDays: number;
  partitionCapitalAllocated: number;
  capitalInvestedSoFar: number;
  noOfSharesBought: number;
  successfulGrowthCount: number;
  status: PartitionStatus;
  partitionEndDate: string | null;
  createdAt: string;
}

export interface Execution {
  executionId: number;
  trackerId: number;
  partitionId: number;
  lockInPercentage: number;
  convictionOverride: number;
  executedAmount: number;
  executionPrice: number;
  createdAt: string;
}

export interface GetTrackerDetailsResponse {
  tracker: Tracker & {
    stockName: string;
    currentPrice: number;
  };
  partitions: Partition[];
  recentExecutions: Execution[];
}

export interface ExecuteTradeResponse {
  executionId: number;
  trackerId: number;
  partitionId: number;
  sharesBought: number;
  newTotalShares: number;
  newTotalCapitalInvested: number;
  message: string;
}

export interface StockPrice {
  symbol: string;
  stockName: string;
  closePrice: number;
  lastUpdatedDate: string;
  source: 'cache' | 'api';
}

export interface DeleteTrackerResponse {
  message: string;
}

// ============================================================================
// State Management Types
// ============================================================================

export interface TrackersState {
  // Portfolio data
  trackers: TrackerSummary[];
  portfolioSummary: PortfolioSummary | null;

  // Selected tracker details
  selectedTracker: GetTrackerDetailsResponse | null;
  selectedTrackerId: number | null;

  // Partition details (when viewing specific partition)
  selectedPartition: Partition | null;

  // Loading states
  isLoadingTrackers: boolean;
  isLoadingTrackerDetails: boolean;
  isLoadingPartition: boolean;
  isCreatingTracker: boolean;
  isUpdatingTracker: boolean;
  isExecutingTrade: boolean;
  isDeletingTracker: boolean;

  // Error states
  error: string | null;
  trackerDetailsError: string | null;
  partitionError: string | null;

  // Success messages
  successMessage: string | null;

  // Stock prices cache (for quick lookups)
  stockPrices: Record<string, StockPrice>;
  isLoadingStockPrice: boolean;
  stockPriceError: string | null;
}
