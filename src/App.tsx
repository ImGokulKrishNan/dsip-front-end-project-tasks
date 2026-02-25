import React, { useState } from "react";
import { BrowserRouter, Navigate, Outlet } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "./hooks/useAuth";

import LandingPage from "./components/LandingPage";
import MainLayout from "./components/MainLayout";
import { ThemeProvider } from "./components/theme-provider";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { AppRoutes } from "./components/Router";

export const LandingGuard: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <LandingPage />;
};

export const AppShell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <MainLayout>
        <Outlet context={{ showCelebration: () => setShowCelebration(true) }} />
      </MainLayout>

      <Dialog
        open={showCelebration}
        onOpenChange={(open) => !open && setShowCelebration(false)}
      >
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center animate-bounce">
              <span className="text-3xl">🎉</span>
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Congratulations!
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-lg">
              You&apos;ve successfully created your first{" "}
              <span className="font-bold text-primary">DSIP Stock Engine</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-muted-foreground text-sm">
            Your journey to disciplined, emotion-free investing starts now.
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              size="lg"
              onClick={() => setShowCelebration(false)}
              className="w-full sm:w-auto min-w-[150px]"
            >
              Let&apos;s Go!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 font-sans">
            <AppRoutes />
            <Toaster />
          </div>
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
