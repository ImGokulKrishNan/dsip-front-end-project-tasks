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

export interface SimulationRequest {
  symbol: string;
  totalCapital: number;
  convictionPeriodMonths: number;
  investmentCycleMonths: number;
  deploymentStyle: LoadFactor;
  convictionLevel: number;
  startDate: string;
  endDate: string;
}

export interface SimulationCycleResult {
  cycleNumber: number;
  deployDate: string;
  capitalDeployed: number;
  sharePrice: number;
  sharesAcquired: number;
  totalSharesHeld: number;
  averageBuyPrice: number;
  currentMarketPrice: number;
  unrealizedGain: number;
}

export interface SimulationResult {
  id: string;
  symbol: string;
  totalCapital: number;
  deploymentStyle: LoadFactor;
  convictionLevel: number;
  cycles: SimulationCycleResult[];
  finalValue: number;
  totalReturn: number;
  returnPercentage: number;
  createdAt: string;
}

export interface SimulationHistory {
  simulations: SimulationResult[];
}
