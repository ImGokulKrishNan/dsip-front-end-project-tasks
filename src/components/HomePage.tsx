import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Dashboard
      onAddStock={() => navigate("/create-tracker")}
      onSelectStock={(id) => navigate(`/tracker/${id}`)}
    />
  );
};
