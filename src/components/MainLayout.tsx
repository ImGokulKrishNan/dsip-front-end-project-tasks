import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import Performance from "./Performance";
import { Icons } from "../constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { useAppSelector } from "../store/hooks";
import { UserDropdown } from "./UserDropdown";
import { AppView } from "@/types";
import MobileStockSearch from "./MobileStockSearch";
import useSelectedStockId from "@/hooks/use-selected-stock-id";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function deriveActiveView(pathname: string): AppView {
  if (pathname === "/" || pathname === "") return "DASHBOARD";
  if (pathname.startsWith("/add")) return "ADD_STOCK";
  if (pathname.startsWith("/stock/")) return "STOCK_DETAILS";
  return "DASHBOARD";
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active view from route
  const isHome = location.pathname === "/home";

  const selectedStockId = useSelectedStockId();
  const isTracker = !!selectedStockId;

  // Redux state
  const { stocks } = useAppSelector((state) => state.stocks);

  // Derive header content from route
  const headerStock = isTracker
    ? stocks.find((s) => s.id === selectedStockId)
    : null;
  const headerTitle = isTracker
    ? `${headerStock?.symbol || ""} Tracker`
    : isHome
      ? "Home"
      : undefined;
  // const headerSubtitle = isTracker
  //   ? 'Daily Smart Investment Execution'
  //   : isHome
  //     ? 'Portfolio Overview & Operations'
  //     : undefined;

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden font-sans">
      {/* 1b. Left Sidebar - Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-background border-r shadow-lg transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <LeftSidebar stocks={stocks} />
      </div>

      {/* 2. Center Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Global Header with Divider */}
        <div className="px-2 md:px-6 py-1 flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden -ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Icons.Menu className="h-6 w-6" />
            </Button>

            {isTracker && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/home")}
              >
                <Icons.ArrowLeft size={18} />
              </Button>
            )}
            <div>
              <h1 className="text-xl md:text-xl font-bold tracking-tight text-foreground">
                {headerTitle || "Home"}
              </h1>
              {/* <p className="text-muted-foreground text-xs">
                    {headerSubtitle || 'Portfolio Overview & Operations'}
                  </p> */}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <MobileStockSearch stocks={stocks} />
            <UserDropdown />
          </div>
        </div>
        <Separator />

        <div className="flex flex-1 w-full overflow-hidden">
          <div className="hidden md:flex">
            <LeftSidebar stocks={stocks} />
          </div>
          <div
            className={cn(
              "flex-1 flex min-w-0",
              isTracker
                ? "flex-col xl:flex-row overflow-y-auto xl:overflow-hidden"
                : "flex-col overflow-hidden",
            )}
          >
            <div
              className={cn(
                "flex-1 min-w-0",
                isTracker ? "xl:overflow-auto" : "overflow-auto",
              )}
            >
              {children}
            </div>
            {isTracker && (
              <aside className="flex flex-col w-full xl:w-[400px] shrink-0 h-auto xl:h-full border-t xl:border-t-0 xl:border-l bg-background">
                <ScrollArea className="flex-none xl:flex-1 h-auto xl:h-full">
                  <div className="p-6 space-y-6 xl:pb-6 pb-32">
                    <Performance />
                  </div>
                </ScrollArea>
              </aside>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
