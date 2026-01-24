
export enum LoadFactor {
  AGGRESSIVE = 'Aggressive',
  MODERATE = 'Moderate',
  GRADUAL = 'Gradual'
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  convictionYears: number;
  partitionDays: number;
  loadFactor: LoadFactor;
  totalBudget: number;
  deployedAmount: number;
  currentAverage: number;
  currentPrice: number;
  isPaused: boolean;
  history: Transaction[];
  // Strategy specific fields
  quantityOwned: number;
  averagePriceOwned: number;
  convictionLevel: number;
  priceMovementPct: number;
  // Tracker State (Mocking backend response)
  currentCycle?: number;
  totalCycles?: number;
  daysInvested?: number;
}

export interface Transaction {
  date: string;
  amount: number;
  price: number;
  type: 'SIP' | 'TOPUP';
}

export interface UserProfile {
  name: string;
  email: string;
  walletBalance: number;
  moneyParkBalance: number;
  onboardingComplete: boolean;
}

export type AppView = 'LANDING' | 'ONBOARDING' | 'DASHBOARD' | 'ADD_STOCK' | 'STOCK_DETAILS';
