import React from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

const StoryCard = ({ card }) => {
  const snap = useSnapshot(state);

  const handleClick = () => {
    state.selectedWorkoutStory = card;
    state.workoutStoryOpen = true;
  };

  return (
    <div className="story-card" onClick={handleClick}>
      <div className="story-image-container">
        <img src={card.image} alt={card.title} className="story-image" />
        <div className="story-author">
          <Avatar 
            src={snap.users?.find(user => user.id === card.userId)?.image} 
            icon={<UserOutlined />} 
            size="small"
          />
        </div>
      </div>
      <div className="story-title">{card.title}</div>
    </div>
  );
};

export default StoryCard;