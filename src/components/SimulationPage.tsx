import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "../constants";
import { SimulationResult } from "@/types";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSimulationsApi,
  deleteSimulationApi,
} from "@/lib/simulation.fetcher";

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-block ml-1 cursor-help opacity-70 hover:opacity-100 transition-opacity align-middle">
          <Icons.Info size={14} />
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-popover border-border text-popover-foreground">
        <p className="max-w-xs text-xs font-medium">{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const SimulationPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: simulations = [], isLoading } = useQuery({
    queryKey: ["simulations"],
    queryFn: fetchSimulationsApi,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSimulationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
    },
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [simulationToDelete, setSimulationToDelete] =
    useState<SimulationResult | null>(null);
  const [showDsipOnly, setShowDsipOnly] = useState(true);

  // --- Portfolio Calculations ---
  const totalInvestedValue = simulations.reduce(
    (acc, s) => acc + (s.totalCapital || 0),
    0,
  );
  const currentMarketValue = simulations.reduce(
    (acc, s) => acc + (s.finalValue || 0),
    0,
  );
  const totalProfitLossPct =
    totalInvestedValue > 0
      ? ((currentMarketValue - totalInvestedValue) / totalInvestedValue) * 100
      : 0;

  const isPortfolioProfit = totalProfitLossPct >= 0;
  const activeCount = simulations.filter(
    (s) => (s.returnPercentage || 0) > 0,
  ).length;
  const totalCount = simulations.length;

  const handleDeleteClick = (sim: SimulationResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setSimulationToDelete(sim);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!simulationToDelete) return;
    deleteMutation.mutate(String(simulationToDelete.id));
    setDeleteDialogOpen(false);
    setSimulationToDelete(null);
  };

  return (
    <>
      <div className="h-full p-4 md:p-6 space-y-6 overflow-y-auto bg-background">
        <div className="space-y-6">
          <div className="space-y-8">
            {/* --- TOP SUMMARY CARD --- */}
            <Card className="relative overflow-hidden border shadow-xl bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black dark:border-gray-800">
              <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-50" />
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl opacity-50" />

              <div className="relative z-10 p-6 md:p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                        {showDsipOnly
                          ? "DSIP Simulated Value"
                          : "Total Simulated Value"}
                        <InfoTooltip text="Market value as of yesterday's close + today's moves" />
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <Label
                          htmlFor="dsip-toggle"
                          className="text-[10px] uppercase font-bold text-muted-foreground"
                        >
                          DSIP Only
                        </Label>
                        <Switch
                          id="dsip-toggle"
                          checked={showDsipOnly}
                          onCheckedChange={setShowDsipOnly}
                          className="scale-75"
                        />
                      </div>
                    </div>
                    <p className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                      ${Math.round(currentMarketValue).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-background/50 border shadow-sm px-4 py-2 rounded-xl backdrop-blur-md">
                    <div
                      className={
                        isPortfolioProfit
                          ? "text-emerald-600 dark:text-emerald-300"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-muted-foreground mb-0.5">
                        Net Yield
                      </span>
                      <span className="text-xl font-black flex items-center gap-1">
                        {isPortfolioProfit ? (
                          <Icons.TrendUp size={16} />
                        ) : (
                          <Icons.TrendDown size={16} />
                        )}
                        {totalProfitLossPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Invested Capital
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ${Math.round(totalInvestedValue).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Active Engines
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {activeCount}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium self-end mb-1">
                        / {totalCount} Total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* --- SIMULATION GRID SECTION --- */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-4">
                Simulation Trackers
              </h2>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center p-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Stock Cards Grid */}
              {!isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {simulations.length === 0 && (
                    <Card className="sm:col-span-2 lg:col-span-3 xl:col-span-4 p-8 flex flex-col items-center justify-center text-center border-dashed bg-muted/20">
                      <p className="text-muted-foreground mb-4">
                        No simulations deployed yet.
                      </p>
                      <Button
                        onClick={() => navigate("/create-simulation")}
                        variant="outline"
                      >
                        Create First Simulation
                      </Button>
                    </Card>
                  )}

                  {simulations.map((simulation) => (
                    <SimulationCard
                      key={simulation.id}
                      simulation={simulation}
                      onDelete={(e) => handleDeleteClick(simulation, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Icons.AlertTriangle className="w-5 h-5" />
              Delete Simulation
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete the backtest for{" "}
              <strong>{simulationToDelete?.symbol}</strong>?
              <br />
              <br />
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Simulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// --- MIRRORED SIMULATION CARD COMPONENT ---
interface SimulationCardProps {
  simulation: SimulationResult;
  onDelete: (e: React.MouseEvent) => void;
}

const SimulationCard: React.FC<SimulationCardProps> = ({
  simulation,
  onDelete,
}) => {
  const navigate = useNavigate();
  const isProfit = (simulation.returnPercentage || 0) >= 0;

  return (
    <Card
      onClick={() => navigate(`/simulation/${simulation.id}`)}
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group relative overflow-hidden"
    >
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-0.5",
          isProfit ? "bg-emerald-500/60" : "bg-red-500/60",
        )}
      />

      <CardContent className="p-4 pt-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg flex-shrink-0",
              isProfit
                ? "bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-emerald-500/20"
                : "bg-gradient-to-br from-red-400 to-red-700 shadow-red-500/20",
            )}
          >
            {simulation.symbol.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h4 className="font-bold text-foreground leading-none truncate flex-1">
                {simulation.symbol}
              </h4>
              <span
                className={cn(
                  "text-xs font-black tracking-tight flex-shrink-0",
                  isProfit
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400",
                )}
              >
                {isProfit ? "+" : ""}
                {(simulation.returnPercentage || 0).toFixed(2)}%
              </span>
            </div>
            <div className="mt-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                ● Simulated
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-accent flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Icons.MoreVertical size={14} />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/simulation/${simulation.id}`);
                }}
              >
                <Icons.Settings className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={onDelete}
              >
                <Icons.Trash className="mr-2 h-4 w-4" />
                <span>Delete Tracker</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-stretch divide-x divide-border/50 border border-border/40 rounded-xl overflow-hidden mb-4">
          <div className="flex-1 px-3 py-2.5 bg-muted/20">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Invested
            </p>
            <p className="text-sm font-bold text-foreground leading-none">
              $
              {Math.round(simulation.totalCapital || 0).toLocaleString(
                undefined,
                { maximumFractionDigits: 0 },
              )}
            </p>
          </div>
          <div className="flex-1 px-3 py-2.5 bg-muted/20">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Final
            </p>
            <p className="text-sm font-bold text-foreground leading-none">
              $
              {Math.round(simulation.finalValue || 0).toLocaleString(
                undefined,
                { maximumFractionDigits: 0 },
              )}
            </p>
          </div>
          <div className="flex-1 px-3 py-2.5 bg-muted/20">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Yield
            </p>
            <p
              className={cn(
                "text-sm font-bold leading-none",
                isProfit ? "text-emerald-500" : "text-red-500",
              )}
            >
              $
              {Math.round(Math.abs(simulation.totalReturn || 0)).toLocaleString(
                undefined,
                { maximumFractionDigits: 0 },
              )}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Progress
            </span>
            <span className="text-[10px] font-bold text-emerald-500">100%</span>
          </div>
          <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: "100%" }}
            />
          </div>
          <div className="flex justify-between text-[9px] mt-1 text-muted-foreground/60 font-mono">
            <span>${(simulation.totalCapital || 0).toLocaleString()}</span>
            <span>of ${(simulation.totalCapital || 0).toLocaleString()}</span>
          </div>
        </div>

        <Button
          className="w-full h-9 text-xs font-bold uppercase tracking-wider"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/simulation/${simulation.id}`);
          }}
        >
          <Icons.Zap className="w-3 h-3 mr-2" /> View Simulation
        </Button>
      </CardContent>
    </Card>
  );
};

export default SimulationPage;
