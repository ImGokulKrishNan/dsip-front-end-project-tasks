import React, { useState, useEffect } from 'react';
import { UserProfile, Stock, AppView } from './types';
import { Icons } from './constants';
import LandingPage from './components/LandingPage';

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

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LANDING');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [tempStrategyConfig, setTempStrategyConfig] = useState<Partial<Stock> | undefined>(undefined);

  useEffect(() => {
    const savedUser = localStorage.getItem('smart_sip_user');
    const savedStocks = localStorage.getItem('smart_sip_stocks');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.onboardingComplete) setView('DASHBOARD');
    }
    if (savedStocks) setStocks(JSON.parse(savedStocks));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('smart_sip_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('smart_sip_stocks', JSON.stringify(stocks));
  }, [stocks]);

  const handleLogin = () => {
    const newUser: UserProfile = {
      name: "Alex Investor",
      email: "alex@example.com",
      onboardingComplete: true
    };
    setUser(newUser);
    setView('DASHBOARD');
  };

  const addStock = (newStock: Stock) => {
    if (stocks.length === 0) {
      setShowCelebration(true);
    }
    setStocks(prev => [...prev, newStock]);
    // After adding, select the new stock and show details
    setSelectedStockId(newStock.id);
    setTempStrategyConfig(undefined); // Clear temp config
    setView('STOCK_DETAILS');
  };

  const updateStock = (updatedStock: Stock) => {
    setStocks(prev => prev.map(s => s.id === updatedStock.id ? updatedStock : s));
  };



  const renderContent = () => {
    if (!user || view === 'LANDING') return <LandingPage onLogin={handleLogin} />;


    // Authenticated View (Split Layout)
    return (
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
            user={user}
            stocks={stocks}
            onAddStock={() => { setTempStrategyConfig(undefined); setView('ADD_STOCK'); }}
            onSelectStock={(id) => { setSelectedStockId(id); setView('STOCK_DETAILS'); }}
          // onExecute={executeSip} // Removed as requested
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
    );
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 font-sans">
        {renderContent()}

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
        <Toaster />
      </div>
    </ThemeProvider>
  );
};

export default App;
