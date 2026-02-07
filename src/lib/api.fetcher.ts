/**
 * DSIP API Fetcher
 *
 * Centralized API functions for all DSIP tracker operations.
 * Uses the axios wrapper for consistent error handling and request management.
 *
 * All functions return promises and can be used with Redux Toolkit's createAsyncThunk
 * or directly in components.
 */

import { apiRequestPromise } from './axios/apiWrapper';
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
  StockPrice,
  DeleteTrackerResponse,
  Execution,
} from '../types/tracker.types';

// ============================================================================
// 1. Create Tracker
// ============================================================================

/**
 * Creates a new DSIP tracker
 *
 * @param data - Tracker configuration data
 * @returns Created tracker details
 *
 * @example
 * ```ts
 * const tracker = await createTracker({
 *   stock_symbol: 'AAPL',
 *   conviction_period_years: 5,
 *   total_capital_planned: 100000,
 *   partition_days: 30,
 *   deployment_style: DeploymentStyle.AGGRESSIVE,
 *   base_conviction_score: 75,
 *   is_fractional_shares_allowed: true
 * });
 * ```
 */
export async function createTracker(
  data: CreateTrackerRequest
): Promise<Tracker> {
  const response = await apiRequestPromise<Tracker>(
    '/api/dsip-trackers',
    data,
    {
      method: 'POST',
      isJSON: true,
    }
  );

  if (response.status === 'success') {
    return response.data;
  }

  throw new Error(response.message || 'Failed to create tracker');
}

// ============================================================================
// 2. Get All Trackers (Portfolio)
// ============================================================================

/**
 * Fetches all trackers for the authenticated user
 *
 * @returns Array of trackers with portfolio summary
 *
 * @example
 * ```ts
 * const { trackers, summary } = await getAllTrackers();
 * console.log(`You have ${trackers.length} trackers`);
 * console.log(`Total capital: $${summary.totalCapitalPlanned}`);
 * ```
 */
export async function getAllTrackers(): Promise<GetAllTrackersResponse> {
  const response = await apiRequestPromise<GetAllTrackersResponse>(
    '/api/dsip-trackers',
    undefined,
    {
      method: 'GET',
    }
  );

  if (response.status === 'success') {
    return response.data;
  }

  throw new Error(response.message || 'Failed to fetch trackers');
}

// ============================================================================
// 3. Get Tracker Details
// ============================================================================

/**
 * Fetches detailed information for a specific tracker
 * Includes tracker data, partitions, and recent executions
 *
 * @param trackerId - The ID of the tracker
 * @returns Detailed tracker information
 *
 * @example
 * ```ts
 * const details = await getTrackerDetails(1);
 * console.log(`Stock: ${details.tracker.stockSymbol}`);
 * console.log(`Partitions: ${details.partitions.length}`);
 * console.log(`Recent trades: ${details.recentExecutions.length}`);
 * ```
 */
export async function getTrackerDetails(
  trackerId: number
): Promise<GetTrackerDetailsResponse> {
  const response = await apiRequestPromise<GetTrackerDetailsResponse>(
    `/api/dsip-trackers/${trackerId}`,
    undefined,
    {
      method: 'GET',
    }
  );

  if (response.status === 'success') {
    return response.data;
  }

  throw new Error(response.message || 'Failed to fetch tracker details');
}

// ============================================================================
// 4. Update Tracker
// ============================================================================

/**
 * Updates an existing tracker's configuration
 * Only include fields you want to update
 *
 * @param trackerId - The ID of the tracker to update
 * @param data - Partial tracker data to update
 * @returns Updated tracker details
 *
 * @example
 * ```ts
 * const updated = await updateTracker(1, {
 *   base_conviction_score: 80,
 *   status: TrackerStatus.PAUSED
 * });
 * ```
 */
export async function updateTracker(
  trackerId: number,
  data: UpdateTrackerRequest
): Promise<GetTrackerDetailsResponse> {
  const response = await apiRequestPromise<GetTrackerDetailsResponse>(
    `/api/dsip-trackers/${trackerId}`,
    data,
    {
      method: 'PUT',
      isJSON: true,
    }
  );

  if (response.status === 'success') {
    return response.data;
  }

  throw new Error(response.message || 'Failed to update tracker');
}

// ============================================================================
// 5. Execute Trade
// ============================================================================

/**
 * Executes a trade (buy) for a specific tracker
 * Records the transaction and updates tracker state
 *
 * @param trackerId - The ID of the tracker
 * @param data - Trade execution details
 * @returns Execution result with updated shares and capital
 *
 * @example
 * ```ts
 * const result = await executeTrade(1, {
 *   lock_in_percentage: 50,
 *   conviction_override: 85,
 *   executed_amount: 5000,
 *   execution_price: 176.25
 * });
 * console.log(`Bought ${result.sharesBought} shares`);
 * ```
 */
export async function executeTrade(
  trackerId: number,
  data: ExecuteTradeRequest
): Promise<ExecuteTradeResponse> {
  const response = await apiRequestPromise<ExecuteTradeResponse>(
    `/api/dsip-trackers/${trackerId}/execute`,
    data,
    {
      method: 'POST',
      isJSON: true,
    }
  );

  if (response.status === 'success') {
    return response.data;
  }

  throw new Error(response.message || 'Failed to execute trade');
}

// ============================================================================
// 6. Get Partition Details
// ============================================================================

/**
 * Fetches details for a specific partition within a tracker
 *
 * @param trackerId - The ID of the tracker
 * @param partitionIndex - The partition index (1-based)
 * @returns Partition details
 *
 * @example
 * ```ts
 * const partition = await getPartitionDetails(1, 3);
 * console.log(`Partition ${partition.partitionIndex}`);
 * console.log(`Capital allocated: $${partition.partitionCapitalAllocated}`);
 * console.log(`Status: ${partition.status}`);
 * ```
 */
export async function getPartitionDetails(
  trackerId: number,
  partitionIndex: number
): Promise<Partition> {
  const response = await apiRequestPromise<Partition>(
    `/api/dsip-trackers/${trackerId}/partitions/${partitionIndex}`,
    undefined,
    {
      method: 'GET',
    }
  );

  if (response.status === 'success') {
    return response.data;
  }

  throw new Error(response.message || 'Failed to fetch partition details');
}

// ============================================================================
// 7. Delete Tracker
// ============================================================================

/**
 * Deletes a tracker and all associated data
 * This action cannot be undone
 *
 * @param trackerId - The ID of the tracker to delete
 * @returns Success message
 *
 * @example
 * ```ts
 * const result = await deleteTracker(1);
 * console.log(result.message); // "Tracker deleted successfully"
 * ```
 */
export async function deleteTracker(
  trackerId: number
): Promise<DeleteTrackerResponse> {
  const response = await apiRequestPromise<DeleteTrackerResponse>(
    `/api/dsip-trackers/${trackerId}`,
    undefined,
    {
      method: 'DELETE',
    }
  );

  if (response.status === 'success') {
    return response.data;
  }

  throw new Error(response.message || 'Failed to delete tracker');
}

// ============================================================================
// 8. Get Stock Closing Price
// ============================================================================

/**
 * Fetches the closing price for a stock symbol
 * Checks cache first, fetches from external API if needed
 *
 * @param params - Stock symbol and exchange
 * @returns Stock price information
 *
 * @example
 * ```ts
 * const priceInfo = await getStockClosingPrice({
 *   symbol: 'AAPL',
 *   exchange: Exchange.US
 * });
 * console.log(`${priceInfo.stockName}: $${priceInfo.closePrice}`);
 * console.log(`Source: ${priceInfo.source}`); // 'cache' or 'api'
 * ```
 */
export async function getStockClosingPrice(
  params: GetStockPriceRequest
): Promise<StockPrice> {
  const response = await apiRequestPromise<StockPrice>(
    `/api/stocks/close?symbol=${params.symbol}&exchange=${params.exchange}`,
    undefined,
    {
      method: 'GET',
    }
  );

  if (response.status === 'success') {
    return response.data;
  }

  throw new Error(response.message || 'Failed to fetch stock price');
}

// ============================================================================
// Bonus: Get Tracker Executions
// ============================================================================

/**
 * Fetches recent executions/trades for a tracker
 *
 * @param trackerId - The ID of the tracker
 * @param limit - Maximum number of executions to return (default: 6)
 * @returns Array of recent executions
 *
 * @example
 * ```ts
 * const executions = await getTrackerExecutions(1, 10);
 * console.log(`Last ${executions.length} trades:`);
 * executions.forEach(exec => {
 *   console.log(`${exec.createdAt}: $${exec.executedAmount} @ $${exec.executionPrice}`);
 * });
 * ```
 */
export async function getTrackerExecutions(
  trackerId: number,
  limit: number = 6
): Promise<Execution[]> {
  const response = await apiRequestPromise<Execution[]>(
    `/api/dsip-trackers/${trackerId}/executions?limit=${limit}`,
    undefined,
    {
      method: 'GET',
    }
  );

  if (response.status === 'success') {
    return response.data;
  }

  throw new Error(response.message || 'Failed to fetch tracker executions');
}
