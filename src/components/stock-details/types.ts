import { Stock } from "../../types";

export type { RecommendationResponse } from "../../types/tracker.types";

export interface StockDetailsProps {
  stock: Stock;
  onBack: () => void;
}

export type ExecutionState = "IDLE" | "CALCULATED" | "CONFIRMING";

export interface DisplayValues {
  convictionYears: number;
  totalBudget: number;
  convictionLevel: number;
  partitionMonths: number;
  deployedAmount: number;
  sharesHeld: number;
  currentPrice: number;
  loadFactor: string;
  initialInvestedAmount: number | null;
  initialSharesHeld: number | null;
  displayName: string;
}

/** Partition details as shown in UI (supports both API shapes) */
export interface PartitionDetailsView {
  partition_index?: number;
  partitionIndex?: number;
  status?: number | string;
  expected_days?: number;
  expectedPartitionDays?: number;
  capital_deployed?: number;
  capitalInvestedSoFar?: number;
  capital_allocated?: number;
  partitionCapitalAllocated?: number;
  net_profit_percentage?: number;
  end_date?: string;
  partitionEndDate?: string | null;
  shares_bought?: number;
  noOfSharesBought?: number;
  start_date?: string;
  createdAt?: string;
}
