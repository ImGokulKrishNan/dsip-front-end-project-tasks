import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Stock } from '../../types';

interface StocksState {
  stocks: Stock[];
  selectedStockId: string | null;
  tempStrategyConfig: Partial<Stock> | undefined;
  showDsipOnly: boolean;
}

const initialState: StocksState = {
  stocks: [],
  selectedStockId: null,
  tempStrategyConfig: undefined,
  showDsipOnly: false,
};

// Load stocks from localStorage on initialization
const loadStocksFromStorage = (): Stock[] => {
  try {
    const savedStocks = localStorage.getItem('smart_sip_stocks');
    return savedStocks ? JSON.parse(savedStocks) : [];
  } catch (error) {
    console.error('Failed to load stocks from localStorage:', error);
    return [];
  }
};

// Save stocks to localStorage
const saveStocksToStorage = (stocks: Stock[]) => {
  try {
    localStorage.setItem('smart_sip_stocks', JSON.stringify(stocks));
  } catch (error) {
    console.error('Failed to save stocks to localStorage:', error);
  }
};

const stocksSlice = createSlice({
  name: 'stocks',
  initialState: {
    ...initialState,
    stocks: loadStocksFromStorage(),
  },
  reducers: {
    // Add a new stock
    addStock: (state, action: PayloadAction<Stock>) => {
      state.stocks.push(action.payload);
      state.selectedStockId = action.payload.id;
      state.tempStrategyConfig = undefined;
      saveStocksToStorage(state.stocks);
    },

    // Update an existing stock
    updateStock: (state, action: PayloadAction<Stock>) => {
      const index = state.stocks.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.stocks[index] = action.payload;
        saveStocksToStorage(state.stocks);
      }
    },

    // Delete a stock
    deleteStock: (state, action: PayloadAction<string>) => {
      state.stocks = state.stocks.filter(s => s.id !== action.payload);
      if (state.selectedStockId === action.payload) {
        state.selectedStockId = null;
      }
      saveStocksToStorage(state.stocks);
    },

    // Set selected stock
    setSelectedStock: (state, action: PayloadAction<string | null>) => {
      state.selectedStockId = action.payload;
    },

    // Set temporary strategy config for copying
    setTempStrategyConfig: (state, action: PayloadAction<Partial<Stock> | undefined>) => {
      state.tempStrategyConfig = action.payload;
    },

    // Toggle DSIP only view
    setShowDsipOnly: (state, action: PayloadAction<boolean>) => {
      state.showDsipOnly = action.payload;
    },

    // Load stocks from storage (useful for manual refresh)
    loadStocks: (state) => {
      state.stocks = loadStocksFromStorage();
    },

    // Clear all stocks
    clearStocks: (state) => {
      state.stocks = [];
      state.selectedStockId = null;
      state.tempStrategyConfig = undefined;
      saveStocksToStorage([]);
    },
  },
});

export const {
  addStock,
  updateStock,
  deleteStock,
  setSelectedStock,
  setTempStrategyConfig,
  setShowDsipOnly,
  loadStocks,
  clearStocks,
} = stocksSlice.actions;

export default stocksSlice.reducer;
