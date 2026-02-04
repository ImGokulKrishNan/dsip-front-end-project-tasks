import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Stock, AppView } from './types';
import { Icons } from './constants';
import LandingPage from './components/LandingPage';
import AuthCallback from './components/AuthCallback';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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
  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState<AppView>('LANDING');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [tempStrategyConfig, setTempStrategyConfig] = useState<Partial<Stock> | undefined>(undefined);

  // Load stocks from localStorage
  useEffect(() => {
    const savedStocks = localStorage.getItem('smart_sip_stocks');
    if (savedStocks) setStocks(JSON.parse(savedStocks));
  }, []);

  // Save stocks to localStorage
  useEffect(() => {
    localStorage.setItem('smart_sip_stocks', JSON.stringify(stocks));
  }, [stocks]);

  // Auto-navigate to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated && view === 'LANDING') {
      setView('DASHBOARD');
    }
    if (!isAuthenticated && view !== 'LANDING') {
      setView('LANDING');
    }
  }, [isAuthenticated, view]);

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

  const addStock = (newStock: Stock) => {
    if (stocks.length === 0) {
      setShowCelebration(true);
    }
    setStocks(prev => [...prev, newStock]);
    setSelectedStockId(newStock.id);
    setTempStrategyConfig(undefined);
    setView('STOCK_DETAILS');
  };

  const updateStock = (updatedStock: Stock) => {
    setStocks(prev => prev.map(s => s.id === updatedStock.id ? updatedStock : s));
  };

  return (
    <>
      <MainLayout
        stocks={stocks}
        activeView={view}
        selectedStockId={selectedStockId}
        onSelectStock={(id) => {
          setSelectedStockId(id);
          setView('STOCK_DETAILS');
        }}
        onCreateNew={() => {
          setSelectedStockId(null);
          setTempStrategyConfig(undefined);
          setView('ADD_STOCK');
        }}
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
            <Button variant="ghost" size="icon" onClick={() => setView('DASHBOARD')}>
              <Icons.ArrowLeft size={18} />
            </Button>
          ) : undefined
        }
      >
        {view === 'DASHBOARD' && (
          <Dashboard
            stocks={stocks}
            onAddStock={() => { setTempStrategyConfig(undefined); setView('ADD_STOCK'); }}
            onSelectStock={(id) => { setSelectedStockId(id); setView('STOCK_DETAILS'); }}
          />
        )}
        {view === 'ADD_STOCK' && (
          <AddStock
            onBack={() => setView('DASHBOARD')}
            onAdd={addStock}
            initialValues={tempStrategyConfig}
          />
        )}
        {view === 'STOCK_DETAILS' && (() => {
          const selectedStock = stocks.find(s => s.id === selectedStockId);
          return selectedStock ? (
            <StockDetails
              stock={selectedStock}
              onBack={() => setView('DASHBOARD')}
              onUpdate={updateStock}
              onCopyStrategy={(config) => {
                setTempStrategyConfig(config);
                setView('ADD_STOCK');
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a strategy to view details
            </div>
          );
        })()}
      </MainLayout>

      {/* First DSIP Celebration Modal */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
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
            <Button size="lg" onClick={() => setShowCelebration(false)} className="w-full sm:w-auto min-w-[150px]">
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
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 font-sans">
            <Routes>
              {/* OAuth callback route - required for popup redirect */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* All other routes go to main app */}
              <Route path="*" element={<MainApp />} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
