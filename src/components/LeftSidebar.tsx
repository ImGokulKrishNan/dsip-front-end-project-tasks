import React, { useMemo, useState } from "react";
import { Stock } from "../types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Icons } from "../constants";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSelectedStockId } from "@/hooks/use-selected-stock-id";

interface LeftSidebarProps {
  stocks: Stock[];
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ stocks }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStocks = useMemo(
    () =>
      stocks.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [stocks, searchQuery],
  );

  return (
    <aside className="max-w-[360px] h-full flex flex-col bg-background">
      {/* Search */}
      <div className="p-4 pb-2">
        <Input
          type="text"
          placeholder="Search stocks (e.g., AMZN)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      {/* Active Instances List */}
      <ScrollArea className="flex-1">
        <div className="border border-border rounded-md m-4 mt-0">
          <div className="p-2 space-y-1">
            {/* Add stock engine - inside list */}
            <Button
              variant="default"
              size="sm"
              className="w-full justify-start gap-2 h-9 mb-1"
              onClick={() => navigate("/create-tracker")}
            >
              <Icons.Plus className="h-4 w-4" />
              Add stock engine
            </Button>

            {filteredStocks.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-md">
                <p className="text-sm text-muted-foreground font-medium">
                  {searchQuery
                    ? "No stock engines found"
                    : "No active stock engines"}
                </p>
              </div>
            ) : (
              filteredStocks.map((stock) => {
                return <StockCard key={stock.id} stock={stock} />;
              })
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};

interface StockCardProps {
  stock: Stock;
}

const StockCard = ({ stock }: StockCardProps) => {
  const navigate = useNavigate();
  const selectedStockId = useSelectedStockId();

  const isActive = selectedStockId === stock.id;

  const isProfit = stock.net_profit_percentage
    ? stock.net_profit_percentage >= 0
    : false;

  return (
    <button
      key={stock.id}
      onClick={() => navigate(`/tracker/${stock.id}`)}
      className={cn(
        "w-full p-3 rounded-md text-left border transition-all hover:bg-accent hover:text-accent-foreground group",
        isActive
          ? "bg-accent text-accent-foreground border-border" // Shadcn active state style
          : "bg-transparent border-transparent",
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-semibold text-sm">{stock.displayName}</span>
        {stock.isPaused && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-amber-400"
            title="Paused"
          />
        )}
      </div>

      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">
            Invested
          </span>
          <span className="text-xs font-mono font-medium">
            ${stock.deployedAmount.toLocaleString()}
          </span>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-sm",
            isProfit
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400",
          )}
        >
          {isProfit ? "+" : ""}
          {stock.net_profit_percentage?.toFixed(1)}%
        </span>
      </div>
    </button>
  );
};
export default LeftSidebar;
