import { SimulationResult, LoadFactor } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface CreateSimulationPayload {
  symbol: string;
  totalCapital: number;
  convictionYears: number;
  cycleMonths: number;
  startDate: string;
  endDate: string;
  loadFactor: LoadFactor;
  convictionLevel: number;
}

/**
 * Executes a new simulation run on the backend.
 */
export const runSimulationApi = async (
  payload: CreateSimulationPayload,
): Promise<SimulationResult> => {
  const response = await fetch(`${API_BASE_URL}/api/simulation/runSimulation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to run simulation");
  }

  return response.json();
};

/**
 * Fetches all saved simulations for the user.
 */
export const fetchSimulationsApi = async (): Promise<SimulationResult[]> => {
  const response = await fetch(`${API_BASE_URL}/api/simulation/trackers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch simulations");
  }

  return response.json();
};

/**
 * Fetches a single simulation tracker by its ID.
 */
export const fetchSimulationByIdApi = async (
  id: string | number,
): Promise<SimulationResult> => {
  const response = await fetch(
    `${API_BASE_URL}/api/simulation/trackers/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch simulation with ID: ${id}`);
  }

  return response.json();
};

/**
 * Deletes a simulation by its ID.
 */
export const deleteSimulationApi = async (id: string): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/simulation/trackers/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete simulation");
  }
};
