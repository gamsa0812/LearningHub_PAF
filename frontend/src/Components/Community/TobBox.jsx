import React, { useEffect } from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import StoryCard from "./StoryCard";
import { PlusOutlined } from "@ant-design/icons";
import WorkoutStoryService from "../../Services/WorkoutStoryService";

const TopBox = () => {
  const snap = useSnapshot(state);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const stories = await WorkoutStoryService.getAllWorkoutStories();
        state.storyCards = stories;
      } catch (error) {
        console.error("Error fetching workout stories:", error);
      }
    };

    fetchStories();
  }, []);

  // Only render TopBox when activeIndex is 1 (Posts section)
  if (snap.activeIndex !== 1) {
    return null;
  }

  return (
    <div className="topbox-container">
      <div className="topbox-title">Stories</div>
      <div className="stories-container">
        <div
          onClick={() => {   
            state.createWorkoutStatusModalOpened = true;
          }}
          className="my_story_card"
        >
          <div className="create-icon">
            <PlusOutlined />
          </div>
          <div className="create-text">Create Story</div>
        </div>

        {snap.storyCards &&
          snap.storyCards.map((card) => (
            <StoryCard key={card?.id} card={card} />
          ))}
      </div>
    </div>
  );
};

export default TopBox;
