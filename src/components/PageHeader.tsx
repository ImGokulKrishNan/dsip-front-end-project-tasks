import { useLocation, useNavigate } from "react-router-dom";
import { Icons } from "../constants";
import { useTrackers } from "../hooks/useTrackers";
import { useSelectedStockId } from "@/hooks/use-selected-stock-id";

function usePageTitle(): { title: string; showBack: boolean } {
  const location = useLocation();
  const selectedStockId = useSelectedStockId();
  const { stocks } = useTrackers();

  if (selectedStockId) {
    const stock = stocks.find((s) => s.id === selectedStockId);
    return {
      title: `${stock?.displayName || ""} Tracker`,
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
    <div className="flex items-center gap-3 px-1.5">
      {showBack && (
        <div onClick={() => navigate("/home")} className="cursor-pointer">
          <Icons.ArrowLeft size={22} />
        </div>
      )}
      <h1 className="text-2xl md:text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
    </div>
  );
};

export default PageHeader;
