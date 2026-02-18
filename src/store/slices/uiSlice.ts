import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppView } from '../../types';

interface UIState {
  view: AppView;
  showCelebration: boolean;
  sidebarCollapsed: boolean;
}

const initialState: UIState = {
  view: 'LANDING',
  showCelebration: false,
  sidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Set current view
    setView: (state, action: PayloadAction<AppView>) => {
      state.view = action.payload;
    },

    // Navigate to dashboard
    navigateToDashboard: (state) => {
      state.view = 'DASHBOARD';
    },

    // Navigate to add stock
    navigateToAddStock: (state) => {
      state.view = 'ADD_STOCK';
    },

    // Navigate to stock details
    navigateToStockDetails: (state) => {
      state.view = 'STOCK_DETAILS';
    },

    // Navigate to landing
    navigateToLanding: (state) => {
      state.view = 'LANDING';
    },

    // Show celebration modal
    showCelebrationModal: (state) => {
      state.showCelebration = true;
    },

    // Hide celebration modal
    hideCelebrationModal: (state) => {
      state.showCelebration = false;
    },

    // Toggle sidebar
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    // Set sidebar state
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const {
  setView,
  navigateToDashboard,
  navigateToAddStock,
  navigateToStockDetails,
  navigateToLanding,
  showCelebrationModal,
  hideCelebrationModal,
  toggleSidebar,
  setSidebarCollapsed,
} = uiSlice.actions;

export default uiSlice.reducer;
