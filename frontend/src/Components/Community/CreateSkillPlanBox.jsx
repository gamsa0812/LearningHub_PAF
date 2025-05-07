import React from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";

const CreateSkillPlanBox = () => {
  const snap = useSnapshot(state);
  
  return (
    <div
      className="skill-plan-box"
      onClick={() => {
        state.createSkillPlanOpened = true;
      }}
    >
      <div className="post_top">
        <img
          alt="Profile"
          src={snap.currentUser?.image}
          className="user-image"
        />
        <input
          type="text"
          placeholder={`Share your skill plan, ${snap.currentUser?.username}`}
          className="skill-input"
          readOnly
        />
      </div>
    </div>
  );
};

export default CreateSkillPlanBox;