import { useState, useEffect } from "react";
import { SimulationResult } from "@/types";

const SIMULATIONS_STORAGE_KEY = "dsip_simulations";

export const useSimulations = () => {
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load simulations from localStorage on mount
  useEffect(() => {
    const loadSimulations = () => {
      try {
        const stored = localStorage.getItem(SIMULATIONS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSimulations(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error("Failed to load simulations:", error);
        setSimulations([]);
      }
      setIsLoading(false);
    };

    loadSimulations();
  }, []);

  const addSimulation = (simulation: SimulationResult) => {
    const updated = [simulation, ...simulations];
    setSimulations(updated);
    localStorage.setItem(SIMULATIONS_STORAGE_KEY, JSON.stringify(updated));
    return simulation;
  };

  const deleteSimulation = (id: string) => {
    const updated = simulations.filter((s) => s.id !== id);
    setSimulations(updated);
    localStorage.setItem(SIMULATIONS_STORAGE_KEY, JSON.stringify(updated));
  };

  const getSimulation = (id: string) => {
    return simulations.find((s) => s.id === id);
  };

  return {
    simulations,
    isLoading,
    addSimulation,
    deleteSimulation,
    getSimulation,
  };
};
