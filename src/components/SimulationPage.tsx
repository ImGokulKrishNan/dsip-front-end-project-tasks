import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "../constants";
import { useSimulations } from "@/hooks/useSimulations";
import { SimulationResult } from "@/types";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  const { simulations, isLoading, deleteSimulation } = useSimulations();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [simulationToDelete, setSimulationToDelete] =
    useState<SimulationResult | null>(null);
  const [showDsipOnly, setShowDsipOnly] = useState(true);

  // --- Portfolio Calculations ---
  const totalInvestedValue = simulations.reduce(
    (acc, s) => acc + s.totalCapital,
    0,
  );
  const currentMarketValue = simulations.reduce(
    (acc, s) => acc + s.finalValue,
    0,
  );
  const totalProfitLossPct =
    totalInvestedValue > 0
      ? ((currentMarketValue - totalInvestedValue) / totalInvestedValue) * 100
      : 0;

  const isPortfolioProfit = totalProfitLossPct >= 0;
  const activeCount = simulations.filter((s) => s.returnPercentage > 0).length;
  const totalCount = simulations.length;

  const handleDeleteClick = (sim: SimulationResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setSimulationToDelete(sim);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!simulationToDelete) return;
    deleteSimulation(simulationToDelete.id);
    setDeleteDialogOpen(false);
    setSimulationToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="h-full p-4 md:p-6 space-y-8 overflow-y-auto bg-background">
        {simulations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center min-h-[600px] py-12">
            <div className="text-center space-y-6 max-w-md">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Icons.Play size={48} className="text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                No Simulations Yet
              </h2>
              <Button
                onClick={() => navigate("/create-simulation")}
                className="gap-2"
              >
                <Icons.Plus size={18} /> Create New Simulation
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-10 max-w-7xl mx-auto">
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

            {/* --- SIMULATION GRID --- */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  Active Simualtion
                </h2>
                <Button
                  onClick={() => navigate("/create-simulation")}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Icons.Plus size={16} /> New Sim
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {simulations.map((simulation) => (
                  <SimulationCard
                    key={simulation.id}
                    simulation={simulation}
                    onDelete={(e) => handleDeleteClick(simulation, e)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Icons.Trash size={18} /> Delete Simulation
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete the backtest for{" "}
              <strong>{simulationToDelete?.symbol}</strong>? This action is
              permanent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
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
  const isProfit = simulation.returnPercentage >= 0;

  return (
    <Card
      onClick={() => navigate(`/simulation/${simulation.id}`)}
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group relative overflow-hidden bg-card border-border"
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
                ? "bg-gradient-to-br from-emerald-400 to-emerald-700"
                : "bg-gradient-to-br from-red-400 to-red-700",
            )}
          >
            {simulation.symbol.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-foreground leading-none truncate text-lg">
                {simulation.symbol}
              </h4>
              <span
                className={cn(
                  "text-xs font-black",
                  isProfit ? "text-emerald-500" : "text-red-500",
                )}
              >
                {isProfit ? "+" : ""}
                {simulation.returnPercentage.toFixed(2)}%
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
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
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Icons.MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Icons.Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-stretch divide-x divide-border/50 border border-border/40 rounded-xl overflow-hidden mb-4 bg-muted/20">
          <div className="flex-1 px-3 py-2.5">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Invested
            </p>
            <p className="text-sm font-bold">
              ${Math.round(simulation.totalCapital).toLocaleString()}
            </p>
          </div>
          <div className="flex-1 px-3 py-2.5">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Final
            </p>
            <p className="text-sm font-bold">
              ${Math.round(simulation.finalValue).toLocaleString()}
            </p>
          </div>
          <div className="flex-1 px-3 py-2.5">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Yield
            </p>
            <p
              className={cn(
                "text-sm font-bold",
                isProfit ? "text-emerald-500" : "text-red-500",
              )}
            >
              ${Math.round(Math.abs(simulation.totalReturn)).toLocaleString()}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Progress
            </span>
            <span className="text-[10px] font-bold text-emerald-500">100%</span>
          </div>
          <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-full" />
          </div>
          <div className="flex justify-between text-[9px] mt-1 text-muted-foreground/60 font-mono">
            <span>${simulation.totalCapital.toLocaleString()}</span>
            <span>of ${simulation.totalCapital.toLocaleString()}</span>
          </div>
        </div>

        <Button
          className="w-full h-9 mt-4 text-xs font-bold uppercase bg-primary text-primary-foreground hover:opacity-90 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/simulation/${simulation.id}`);
          }}
        >
          <Icons.Zap size={12} className="mr-2 fill-current" /> EXECUTE
        </Button>
      </CardContent>
    </Card>
  );
};

export default SimulationPage;
