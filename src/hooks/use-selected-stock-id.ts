import { useMatch } from "react-router-dom";

const useSelectedStockId = (): string | null => {
  const trackerMatch = useMatch("/tracker/:id");
  const selectedStockId = trackerMatch?.params.id ?? null;
  return selectedStockId;
};

export default useSelectedStockId;
