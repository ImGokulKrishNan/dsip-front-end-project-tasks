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
  initialInvestedAmount: any;
  initialSharesHeld: any;
}
