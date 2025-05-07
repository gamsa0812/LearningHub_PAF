import React from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
// import "../Styles/MyPost.css"; (Your CSS file should be applied)

const MyPost = () => {
  const snap = useSnapshot(state);
  
  return (
    <div
      onClick={() => {
        state.createPostModalOpened = true;
      }}
      className="mypost-container"
    >
      <div className="accent-bar"></div>
      <div className="post-content">
        <div className="post-icon">
          <i className="fas fa-edit"></i>
        </div>
        <div className="post-text">
          <div className="post-description">Create a new post to share with the community</div>
        </div>
      </div>
      <div className="hover-overlay"></div>
    </div>
  );
};

export default MyPost;
