import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import Performance from "./Performance";
import { Icons } from "../constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { useAppSelector } from "../store/hooks";
import { UserDropdown } from "./UserDropdown";
import MobileStockSearch from "./MobileStockSearch";
import PageHeader from "./PageHeader";
import { useSelectedStockId } from "@/hooks/use-selected-stock-id";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const selectedStockId = useSelectedStockId();
  const isTracker = !!selectedStockId;

  const { stocks } = useAppSelector((state) => state.stocks);

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

            <PageHeader />
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                navigate("/create-tracker");
              }}
            >
              <Icons.Plus
                size={24}
                className="shrink-0 p-1 text-muted-foreground/70 hover:text-foreground transition-colors md:hidden"
              />
            </button>
            <MobileStockSearch stocks={stocks} />
            <UserDropdown />
          </div>
        </div>
        <Separator />

        <div className="flex flex-1 w-full overflow-hidden">
          <div className="hidden md:flex">
            <LeftSidebar stocks={stocks} />
          </div>
          <div className="flex-1 flex flex-col xl:flex-row min-w-0 overflow-hidden">
            <ScrollArea className="flex-1 min-w-0 h-full">
              {children}
              {isTracker && (
                <div className="p-6 space-y-6 pb-32 xl:hidden">
                  <Performance />
                </div>
              )}
            </ScrollArea>

            {isTracker && (
              <aside className="hidden xl:flex flex-col w-[400px] shrink-0 h-full border-l bg-background">
                <ScrollArea className="flex-1 h-full">
                  <div className="p-6 space-y-6 pb-6">
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
