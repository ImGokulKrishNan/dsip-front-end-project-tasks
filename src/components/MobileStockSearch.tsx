import React, { useState, useEffect, useRef } from "react";
import { Stock } from "../types";
import { Icons } from "../constants";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSelectedStockId } from "@/hooks/use-selected-stock-id";

interface MobileStockSearchProps {
  stocks: Stock[];
}

const MobileStockSearch: React.FC<MobileStockSearchProps> = ({ stocks }) => {
  const navigate = useNavigate();
  const selectedStockId = useSelectedStockId();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when screen reaches md breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-focus input & reset query on open/close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredStocks = stocks.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (id: string) => {
    navigate(`/tracker/${id}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/20 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Search icon trigger -- sits inside the pill bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="shrink-0 p-1 text-muted-foreground/70 hover:text-foreground transition-colors md:hidden"
      >
        <Icons.Search size={18} />
      </button>

      {/* Dropdown panel -- anchored below the pill bar */}
      {isOpen && (
        <div className="fixed left-3 right-3 top-[60px] z-50 md:hidden bg-background border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40">
            <Icons.Search
              size={16}
              className="shrink-0 text-muted-foreground/60"
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-offset-0 focus-visible:ring-0 px-0 text-sm placeholder:text-muted-foreground/50"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  inputRef.current?.focus();
                }}
                className="shrink-0 p-0.5 text-muted-foreground/50 hover:text-muted-foreground"
              >
                <Icons.Close size={14} />
              </button>
            ) : (
              <button
                onClick={() => setIsOpen(false)}
                className="shrink-0 p-0.5 text-muted-foreground/50 hover:text-muted-foreground"
              >
                <Icons.Close size={14} />
              </button>
            )}
          </div>

          {/* Stock list */}
          <ScrollArea className="max-h-[55vh]">
            <div className="px-2 pb-2 space-y-0.5">
              {filteredStocks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground/70 font-medium">
                    {searchQuery
                      ? "No stock engines found"
                      : "No active stock engines"}
                  </p>
                </div>
              ) : (
                filteredStocks.map((stock) => {
                  const isActive = selectedStockId === stock.id;
                  const isProfit = stock.net_profit_percentage
                    ? stock.net_profit_percentage >= 0
                    : false;

                  return (
                    <button
                      key={stock.id}
                      onClick={() => handleSelect(stock.id)}
                      className={cn(
                        "w-full px-3 py-2.5 rounded-xl text-left transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-secondary/80 flex items-center justify-center font-bold text-[10px] text-secondary-foreground shrink-0">
                            {stock.symbol.substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-sm block truncate">
                              {stock.symbol}
                            </span>
                            <span className="text-[10px] text-muted-foreground/70 font-medium">
                              ${stock.deployedAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {stock.isPaused && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-amber-400"
                              title="Paused"
                            />
                          )}
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded",
                              isProfit
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400",
                            )}
                          >
                            {isProfit ? "+" : ""}
                            {stock.net_profit_percentage?.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default MobileStockSearch;
