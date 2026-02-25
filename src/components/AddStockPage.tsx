import { useNavigate, useOutletContext } from "react-router-dom";
import { useCreateTracker, useTrackers } from "@/hooks/useTrackers";
import AddStock from "./AddStock";
import type { CreateTrackerRequest } from "@/types/tracker.types";

export const AddStockPage: React.FC = () => {
  const navigate = useNavigate();
  const { trackers } = useTrackers();
  const outletContext = useOutletContext<{ showCelebration?: () => void }>();
  const createTracker = useCreateTracker();

  const handleAddStock = async (request: CreateTrackerRequest) => {
    try {
      await createTracker.mutateAsync(request);

      if (trackers.length === 0) {
        outletContext?.showCelebration?.();
      }

      navigate("/home");
    } catch (error: any) {
      alert(`Failed to create tracker: ${error.message || "Unknown error"}`);
    }
  };

  return <AddStock onBack={() => navigate("/home")} onAdd={handleAddStock} />;
};
