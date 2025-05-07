import React from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";

const MyLearning = () => {
  const snap = useSnapshot(state);
  
  return (
    <div className="mylearning-container">
      <div className="accent-bar"></div>
      <div className="learning-content">
        <div className="learning-icon">
          <i className="fas fa-graduation-cap"></i>
        </div>
        <div className="learning-text">
          <div className="learning-description">
            Track a new learning achievement or progress
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLearning;