import React from "react";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import Performance from "./Performance";
import { Icons } from "../constants";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useTrackers } from "../hooks/useTrackers";
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

  const { stocks } = useTrackers();

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden font-sans">
      {/* Center Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Global Header with Divider */}
        <div className="px-2 md:px-6 py-1 flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
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
                <div className="p-6 space-y-6 xl:hidden border m-4 mt-0 sm:m-6 sm:mt-0 rounded-md">
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
