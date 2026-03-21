import React, { useMemo, useState } from "react";
import { SimulationResult } from "../types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Icons } from "../constants";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface LeftSimulationSidebarProps {
  simulations: SimulationResult[];
  onSelectSimulation?: (id: string) => void;
}

const LeftSimulationSidebar: React.FC<LeftSimulationSidebarProps> = ({
  simulations,
  onSelectSimulation,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSimulations = useMemo(
    () =>
      simulations.filter(
        (sim) =>
          sim.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sim.deploymentStyle.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [simulations, searchQuery],
  );

  return (
    <aside className="max-w-[360px] h-full flex flex-col bg-background">
      {/* Search */}
      <div className="p-4 pb-2">
        <Input
          type="text"
          placeholder="Search simulations (e.g., AMZN)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      {/* Active Simulations List */}
      <ScrollArea className="flex-1">
        <div className="border border-border rounded-md m-4 mt-0">
          <div className="p-2 space-y-1">
            {/* Create new simulation - inside list */}
            <Button
              variant="default"
              size="sm"
              className="w-full justify-start gap-2 h-9 mb-1"
              onClick={() => navigate("/create-simulation")}
            >
              <Icons.Plus className="h-4 w-4" />
              Create Simulation
            </Button>

            {filteredSimulations.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-md">
                <p className="text-sm text-muted-foreground font-medium">
                  {searchQuery ? "No simulations found" : "No simulations yet"}
                </p>
              </div>
            ) : (
              filteredSimulations.map((simulation) => {
                return (
                  <SimulationCard
                    key={simulation.id}
                    simulation={simulation}
                    onSelect={() => onSelectSimulation?.(simulation.id)}
                  />
                );
              })
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};

interface SimulationCardProps {
  simulation: SimulationResult;
  onSelect: () => void;
}

const SimulationCard = ({ simulation }: SimulationCardProps) => {
  const isProfit = simulation.returnPercentage >= 0;

  return (
    <button
      onClick={() => {}}
      className={cn(
        "w-full p-3 rounded-md text-left border transition-all hover:bg-accent hover:text-accent-foreground group",
        "bg-transparent border-transparent",
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-semibold text-sm">{simulation.symbol}</span>
        <span className="text-[10px] text-muted-foreground font-medium">
          {new Date(simulation.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">
            Capital
          </span>
          <span className="text-xs font-mono font-medium">
            ${simulation.totalCapital.toLocaleString()}
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
          {simulation.returnPercentage.toFixed(1)}%
        </span>
      </div>
    </button>
  );
};

export default LeftSimulationSidebar;
