import { useNavigate, useParams } from "react-router-dom";
import StockDetails from "./StockDetails";
import { useTrackers } from "@/hooks/useTrackers";

export const TrackerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stocks } = useTrackers();

  const selectedStock = stocks.find((s) => s.id === id);
  const stockToUse = selectedStock || {
    id: id || "",
    symbol: "Loading...",
    name: "Loading...",
    totalBudget: 0,
    deployedAmount: 0,
    currentPrice: 0,
    isPaused: false,
    quantityOwned: 0,
    averagePriceOwned: 0,
  };

  return <StockDetails stock={stockToUse} onBack={() => navigate("/home")} />;
};
