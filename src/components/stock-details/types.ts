import { Stock } from "../../types";

export interface StockDetailsProps {
  stock: Stock;
  onBack: () => void;
  onUpdate: (stock: Stock) => void;
  onCopyStrategy?: (config: Partial<Stock>) => void;
}

export type RecommendationResponse = {
  tracker_id: number;
  recommended_amount: number;
  breakdown: {
    neutral_capital: number;
    opportunity_multiplier: number;
    contingency_multiplier: number;
    final_multiplier: number;
  };
  signals: {
    avg_holding_price: number;
    avg_deviation_pct: number;
    avg_signal: number;
    lock_in_pct: number;
    lock_in_signal: number;
    raw_opportunity_signal: number;
    conviction_amplifier: number;
    is_abnormal_dip: boolean;
  };
  partition_status: {
    partition_index: number;
    partition_progress_pct: number;
    return_progress_pct: number;
    growth_persistence_pct: number;
    time_progress_pct: number;
    capital_progress_pct: number;
    capital_deployed: number;
    capital_remaining: number;
    cumulative_return_pct: number;
  };
};

export type ExecutionState = "IDLE" | "CALCULATED" | "CONFIRMING";

export interface EditConfig {
  totalBudget: number;
  convictionYears: number;
  loadFactor: string;
  partitionMonths: number;
  convictionLevel: number;
}

export interface DisplayValues {
  convictionYears: number;
  totalBudget: number;
  convictionLevel: number;
  partitionMonths: number;
  deployedAmount: number;
  sharesHeld: number;
  currentPrice: number;
  loadFactor: string;
  initialInvestedAmount: any;
  initialSharesHeld: any;
}
