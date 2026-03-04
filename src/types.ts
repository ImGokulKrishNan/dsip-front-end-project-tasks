export enum LoadFactor {
  AGGRESSIVE = "Aggressive",
  MODERATE = "Moderate",
  GRADUAL = "Gradual",
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  displayName: string;
  totalBudget: number;
  deployedAmount: number;
  currentPrice: number;
  isPaused: boolean;
  quantityOwned: number;
  averagePriceOwned: number;
  net_profit_percentage?: number;
  dsip_net_profit_percentage?: number;
}
