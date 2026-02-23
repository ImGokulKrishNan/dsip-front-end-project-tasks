import { useLocation, useNavigate } from "react-router-dom";
import { Icons } from "../constants";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "../store/hooks";
import { useSelectedStockId } from "@/hooks/use-selected-stock-id";

function usePageTitle(): { title: string; showBack: boolean } {
  const location = useLocation();
  const selectedStockId = useSelectedStockId();
  const { stocks } = useAppSelector((state) => state.stocks);

  if (selectedStockId) {
    const stock = stocks.find((s) => s.id === selectedStockId);
    return {
      title: `${stock?.symbol || ""} Tracker`,
      showBack: true,
    };
  }

  if (location.pathname === "/create-tracker") {
    return { title: "Create Tracker", showBack: true };
  }

  return { title: "Home", showBack: false };
}

const PageHeader: React.FC = () => {
  const navigate = useNavigate();
  const { title, showBack } = usePageTitle();

  return (
    <div className="flex items-center gap-3">
      {showBack && (
        <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
          <Icons.ArrowLeft size={18} />
        </Button>
      )}
      <h1 className="text-xl md:text-xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
    </div>
  );
};

export default PageHeader;
