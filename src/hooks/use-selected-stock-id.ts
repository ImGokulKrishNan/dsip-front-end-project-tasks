import { useMatch } from "react-router-dom";

export const useSelectedStockId = (): string | null => {
  const trackerMatch = useMatch("/tracker/:id");
  return trackerMatch?.params.id ?? null;
};
