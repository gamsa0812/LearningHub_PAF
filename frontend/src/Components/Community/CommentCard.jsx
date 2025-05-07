import React, { useEffect, useState } from "react";
import { List, Avatar } from "antd";
import axios from "axios";
import UserService from "../../Services/UserService";
import { BASE_URL } from "../../constants";
import state from "../../Utils/Store";
// import "../Styles/CommentCard.css";

const CommentCard = ({ comment }) => {
  const [userData, setUserData] = useState();

  const fetchUserData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const result = await UserService.getProfileById(comment.userId);
      const result2 = await axios.get(
        `${BASE_URL}/users/${result.userId}`,
        config
      );
      setUserData({ ...result2.data, ...result });
    } catch (error) {}
  };

  useEffect(() => {
    fetchUserData();
  }, [comment.id]);

  return (
    <List.Item key={comment.id} className="comment-item">
      {userData && (
        <div className="comment-container">
          <Avatar
            className="comment-avatar"
            onClick={() => {
              state.selectedUserProfile = userData;
              state.friendProfileModalOpened = true;
            }}
            src={userData.image}
            size={40}
          />
          <div className="comment-content">
            <div className="comment-user">{userData.username || "User"}</div>
            <h4 className="comment-text">{comment.commentText}</h4>
            {comment.createdAt && (
              <div className="comment-time">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </List.Item>
  );
};

export default CommentCard;