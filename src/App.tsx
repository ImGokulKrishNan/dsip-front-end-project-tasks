import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { checkAuth, setAuthSuccess, setAuthError, clearAuth } from './store/slices/authSlice';
import { updateStock, setSelectedStock, setTempStrategyConfig, setShowDsipOnly } from './store/slices/stocksSlice';
import { setView, showCelebrationModal, hideCelebrationModal, navigateToDashboard, navigateToAddStock, navigateToStockDetails } from './store/slices/uiSlice';
import { fetchTrackerDetails, createTracker, fetchAllTrackers } from './store/slices/trackersSlice';
import { setOnUnauthorized } from './lib/api';
import { Stock, LoadFactor } from './types';

import { Icons } from './constants';

import LandingPage from './components/LandingPage';
import AuthCallback from './components/AuthCallback';
import Dashboard from './components/Dashboard';
import AddStock from './components/AddStock';
import StockDetails from './components/StockDetails';
import MainLayout from './components/MainLayout';
import { ThemeProvider } from './components/theme-provider';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/toaster";

// Main app content - single page with state-based navigation
const MainApp: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const { stocks, selectedStockId, tempStrategyConfig, showDsipOnly } = useAppSelector(state => state.stocks);
  const { view, showCelebration } = useAppSelector(state => state.ui);

  // Set up API unauthorized handler
  useEffect(() => {
    setOnUnauthorized(() => {
      dispatch(clearAuth());
    });
  }, [dispatch]);

  // Check auth on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Listen for messages from auth popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'AUTH_SUCCESS') {
        dispatch(setAuthSuccess());
        dispatch(checkAuth());
      } else if (event.data?.type === 'AUTH_ERROR') {
        dispatch(setAuthError('Authentication failed'));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [dispatch]);

  // Auto-navigate to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated && view === 'LANDING') {
      dispatch(navigateToDashboard());
    }
    if (!isAuthenticated && view !== 'LANDING') {
      dispatch(setView('LANDING'));
    }
  }, [isAuthenticated, view, dispatch]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated || view === 'LANDING') {
    return <LandingPage />;
  }

  const handleAddStock = async (newStock: Stock) => {
    // Map LoadFactor enum to uppercase string values for the API
    // The backend expects: "GRADUAL", "MODERATE", "AGGRESSIVE"
    const deploymentStyleMap: Record<LoadFactor, string> = {
      [LoadFactor.GRADUAL]: 'GRADUAL',
      [LoadFactor.MODERATE]: 'MODERATE',
      [LoadFactor.AGGRESSIVE]: 'AGGRESSIVE',
    };

    try {

      // Call the createTracker API
      const requestPayload = {
        stock_symbol: newStock.symbol,
        conviction_period_years: newStock.convictionYears,
        total_capital_planned: newStock.totalBudget,
        partition_months: newStock.partitionMonths,
        deployment_style: deploymentStyleMap[newStock.loadFactor],
        base_conviction_score: newStock.convictionLevel,
        initial_invested_amount: newStock.quantityOwned * newStock.averagePriceOwned,
        initial_shares_held: newStock.quantityOwned,
        is_fractional_shares_allowed: true,
      };

      console.log('[App] Creating tracker with payload:', requestPayload);

      const result = await dispatch(createTracker(requestPayload)).unwrap();

      console.log('[App] Tracker created successfully:', result);

      // Show celebration modal if this is the first tracker
      if (stocks.length === 0) {
        dispatch(showCelebrationModal());
      }

      // Refresh the trackers list to get the new tracker
      dispatch(fetchAllTrackers());

      // Navigate to dashboard to see the new tracker
      dispatch(navigateToDashboard());
    } catch (error: any) {
      console.error('[App] Failed to create tracker:', error);
      console.error('[App] Error details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      alert(`Failed to create tracker: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateStock = (updatedStock: Stock) => {
    dispatch(updateStock(updatedStock));
  };

  const handleSelectStock = (id: string) => {
    dispatch(setSelectedStock(id));

    // Fetch tracker details from API if it's a numeric ID (from API)
    const trackerId = parseInt(id);
    if (!isNaN(trackerId)) {
      console.log('[App] Fetching tracker details for ID:', trackerId);
      dispatch(fetchTrackerDetails(trackerId));
    }

    dispatch(navigateToStockDetails());
  };

  const handleCreateNew = () => {
    dispatch(setSelectedStock(null));
    dispatch(setTempStrategyConfig(undefined));
    dispatch(navigateToAddStock());
  };

  const handleCopyStrategy = (config: Partial<Stock>) => {
    dispatch(setTempStrategyConfig(config));
    dispatch(navigateToAddStock());
  };

  return (
    <>
      <MainLayout
        stocks={stocks}
        activeView={view}
        selectedStockId={selectedStockId}
        onSelectStock={handleSelectStock}
        onCreateNew={handleCreateNew}
        onUpdateStock={handleUpdateStock}
        headerTitle={
          view === 'STOCK_DETAILS'
            ? `${stocks.find(s => s.id === selectedStockId)?.symbol || ''} Tracker`
            : undefined
        }
        headerSubtitle={
          view === 'STOCK_DETAILS'
            ? 'Daily Smart Investment Execution'
            : undefined
        }
        headerAction={
          view === 'STOCK_DETAILS' ? (
            <Button variant="ghost" size="icon" onClick={() => dispatch(navigateToDashboard())}>
              <Icons.ArrowLeft size={18} />
            </Button>
          ) : undefined
        }
        showDsipOnly={showDsipOnly}
        setShowDsipOnly={(show: boolean) => dispatch(setShowDsipOnly(show))}
      >
        {view === 'DASHBOARD' && (
          <Dashboard
            stocks={stocks}
            onAddStock={() => {
              dispatch(setTempStrategyConfig(undefined));
              dispatch(navigateToAddStock());
            }}
            onSelectStock={handleSelectStock}
          />
        )}
        {view === 'ADD_STOCK' && (
          <AddStock
            onBack={() => dispatch(navigateToDashboard())}
            onAdd={handleAddStock}
            initialValues={tempStrategyConfig}
          />
        )}
        {view === 'STOCK_DETAILS' && (() => {
          const selectedStock = stocks.find(s => s.id === selectedStockId);

          // If no stock found in hardcoded data, create a dummy stock for API data
          const stockToUse = selectedStock || {
            id: selectedStockId || '',
            symbol: 'Loading...',
            name: 'Loading...',
            convictionYears: 5,
            partitionDays: 30,
            loadFactor: 'Aggressive' as any,
            totalBudget: 0,
            deployedAmount: 0,
            currentAverage: 0,
            currentPrice: 0,
            isPaused: false,
            history: [],
            quantityOwned: 0,
            averagePriceOwned: 0,
            convictionLevel: 75,
            priceMovementPct: 0,
          };

          return stockToUse ? (
            <StockDetails
              stock={stockToUse}
              onBack={() => dispatch(navigateToDashboard())}
              onUpdate={handleUpdateStock}
              onCopyStrategy={handleCopyStrategy}
              showDsipOnly={showDsipOnly}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a strategy to view details
            </div>
          );
        })()}
      </MainLayout>

      {/* First DSIP Celebration Modal */}
      <Dialog open={showCelebration} onOpenChange={(open) => !open && dispatch(hideCelebrationModal())}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center animate-bounce">
              <span className="text-3xl">🎉</span>
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Congratulations!</DialogTitle>
            <DialogDescription className="text-center pt-2 text-lg">
              You've successfully created your first <span className="font-bold text-primary">DSIP Stock Engine</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-muted-foreground text-sm">
            Your journey to disciplined, emotion-free investing starts now.
          </div>
          <DialogFooter className="sm:justify-center">
            <Button size="lg" onClick={() => dispatch(hideCelebrationModal())} className="w-full sm:w-auto min-w-[150px]">
              Let's Go!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 font-sans">
            <Routes>
              {/* OAuth callback route - required for popup redirect */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* All other routes go to main app */}
              <Route path="*" element={<MainApp />} />
            </Routes>
            <Toaster />
          </div>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
