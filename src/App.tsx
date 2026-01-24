import React, { useState, useEffect } from 'react';
import { UserProfile, Stock, AppView } from './types';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import AddStock from './components/AddStock';
import StockDetails from './components/StockDetails';
import MainLayout from './components/MainLayout';
import { ThemeProvider } from './components/theme-provider';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LANDING');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);

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
      walletBalance: 250000,
      moneyParkBalance: 0,
      onboardingComplete: false
    };
    setUser(newUser);
    setView('ONBOARDING');
  };

  const completeOnboarding = () => {
    if (user) {
      const updated = { ...user, onboardingComplete: true, moneyParkBalance: 200000, walletBalance: 50000 };
      setUser(updated);
      setView('DASHBOARD');
    }
  };

  const addStock = (newStock: Stock) => {
    setStocks(prev => [...prev, newStock]);
    // After adding, select the new stock and show details
    setSelectedStockId(newStock.id);
    setView('STOCK_DETAILS');
  };

  const updateStock = (updatedStock: Stock) => {
    setStocks(prev => prev.map(s => s.id === updatedStock.id ? updatedStock : s));
  };

  const executeSip = (stockId: string, amount: number) => {
    setStocks(prev => prev.map(s => {
      if (s.id === stockId) {
        return {
          ...s,
          deployedAmount: s.deployedAmount + amount,
          history: [...s.history, { date: new Date().toISOString(), amount, price: s.currentPrice, type: 'SIP' }]
        };
      }
      return s;
    }));
    if (user) setUser({ ...user, moneyParkBalance: user.moneyParkBalance - amount });
  };

  const renderContent = () => {
    if (!user || view === 'LANDING') return <LandingPage onLogin={handleLogin} />;
    if (view === 'ONBOARDING') return <Onboarding onComplete={completeOnboarding} />;

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
          setView('ADD_STOCK');
        }}
      >
        {view === 'DASHBOARD' && (
          <Dashboard 
            user={user} 
            stocks={stocks} 
            onAddStock={() => setView('ADD_STOCK')} 
            onSelectStock={(id) => { setSelectedStockId(id); setView('STOCK_DETAILS'); }} 
            onExecute={executeSip} 
          />
        )}
        {view === 'ADD_STOCK' && (
          <AddStock 
            onBack={() => setView('DASHBOARD')} 
            onAdd={addStock} 
          />
        )}
        {view === 'STOCK_DETAILS' && (() => {
           const selectedStock = stocks.find(s => s.id === selectedStockId);
           return selectedStock ? (
             <StockDetails 
               stock={selectedStock} 
               onBack={() => setView('DASHBOARD')} 
               onUpdate={updateStock} 
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
      </div>
    </ThemeProvider>
  );
};

export default App;
