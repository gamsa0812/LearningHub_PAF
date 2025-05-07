import React from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
// import "./top-menu.css";

const LeftMenu = () => {
  const snap = useSnapshot(state);

  const handleClick = (index) => {
    state.activeIndex = index;
  };

  return (
    <div className="top-menu">
      <div className="top-menu-header">
        <div className="logo-container">
          <img src="./assets/icon2.png" alt="LearnHub Logo" />
        </div>
        <h3 className="top-menu-title">LearnHub</h3>
      </div>
      <ul className="top-menu-list">
        {[
          "Posts",
          "Skill Plans",
          "Learning Tracking",
          "Friends",
          "Notifications",
        ].map((item, index) => (
          <li
            key={index}
            onClick={() => handleClick(index + 1)}
            className={`top-menu-item ${snap.activeIndex === index + 1 ? "active" : ""}`}
          >
            <a href="#" className="top-menu-link">
              {item}
            </a>
            {snap.activeIndex === index + 1 && (
              <div className="top-menu-active-indicator" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftMenu;