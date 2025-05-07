import React, { useEffect } from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";

const StateDebugger = () => {
  const snap = useSnapshot(state);
  
  return (
    <div style={{ display: "none" }}>
      {/* This component doesn't render anything visible */}
    </div>
  );
};

export default StateDebugger;