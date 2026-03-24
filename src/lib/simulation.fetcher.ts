import { SimulationResult } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Payload for POST /api/dsip/simulation/createSimulation
 */
export interface CreateSimulationPayload {
  stockSymbol: string;
  startDate: string;
  endDate: string;
  convictionPeriodYears: number;
  totalCapitalPlanned: number;
  partitionMonths: number;
  baseConvictionScore: number;
  deploymentStyle: number;
  initialInvestedAmount: number;
  initialSharesHeld: number;
  isFractionalSharesAllowed: boolean;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * POST /api/dsip/simulation/createSimulation
 *
 * Sends simulation parameters to the backend.
 * The backend responds with a CSV file — returned here as a Blob for download.
 */
export const runSimulationApi = async (
  payload: CreateSimulationPayload,
): Promise<Blob> => {
  const response = await fetch(
    `${API_BASE_URL}/api/dsip/simulation/createSimulation`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    let message = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch {
      // response body is not JSON
    }
    throw new Error(message);
  }

  return response.blob();
};

/**
 * GET /api/dsip/simulation/trackers
 *
 * Fetches all existing simulation tracker results.
 * Backend returns SimulationPortfolioResponseDto — we extract the simulations array from it.
 *
 * FIX: Previously called `.json()` and used the raw object as SimulationResult[],
 * which meant `simulations` was always an object, never an array → nothing rendered.
 */
export const fetchSimulationsApi = async (): Promise<SimulationResult[]> => {
  const response = await fetch(`${API_BASE_URL}/api/dsip/simulation/trackers`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Fetch failed");

  const data = await response.json();
  console.log("Debug - Backend Simulation Data:", data);

  // 1. If the response itself is an array, return it directly
  if (Array.isArray(data)) {
    return data;
  }

  // 2. Unwrap common response wrappers (e.g. { data: { ... } })
  const unwrapped = data?.data ?? data;
  if (Array.isArray(unwrapped)) {
    return unwrapped;
  }

  // 3. Scan the object to find the first array property
  if (unwrapped && typeof unwrapped === "object") {
    const knownKeys = [
      "simulation_trackers",
      "simulationTrackers",
      "simulations",
      "trackers",
      "dsip_trackers",
      "content",
    ];
    for (const key of knownKeys) {
      if (Array.isArray(unwrapped[key])) {
        return unwrapped[key];
      }
    }
    // 4. Fallback: literally just find the first property that is an array
    for (const key in unwrapped) {
      if (Array.isArray(unwrapped[key])) return unwrapped[key];
    }
  }

  return [];
};
/**
 * DELETE /api/dsip/simulation/:id
 *
 * Deletes a specific simulation tracker by its ID.
 */
export const deleteSimulationApi = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/dsip/simulation/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Failed to delete simulation: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch {
      // not JSON
    }
    throw new Error(message);
  }
};

/**
 * GET /api/dsip/simulation/:id
 *
 * Fetches details for a specific simulation.
 */
export const fetchSimulationByIdApi = async (
  id: string,
): Promise<SimulationResult> => {
  const response = await fetch(`${API_BASE_URL}/api/dsip/simulation/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Failed to fetch simulation ${id}: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch {
      /* ignored */
    }
    throw new Error(message);
  }

  return response.json();
};
