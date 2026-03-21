import React from "react";
import { useNavigate } from "react-router-dom";
import AddSimulation from "./AddSimulation";

const AddSimulationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <AddSimulation onRunSimulation={() => navigate("/simulation")} />
      </div>
    </div>
  );
};

export default AddSimulationPage;
