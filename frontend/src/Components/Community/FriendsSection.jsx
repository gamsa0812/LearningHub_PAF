import React, { useEffect, useState } from "react";
import UserConnectionService from "../../Services/UserConnectionService";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import axios from "axios";
import { Button, List, Avatar, Tooltip, Badge } from "antd";
import { 
  UserDeleteOutlined, 
  MessageOutlined, 
  HeartOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  StarFilled,
  TeamOutlined
} from '@ant-design/icons';

const FriendsSection = () => {
  const snap = useSnapshot(state);
  const [friends, setFriends] = useState([]);
  const [friendsUserNameData, setFriendsUserNameData] = useState([]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    UserConnectionService.getUserConnections(snap.currentUser?.uid)
      .then(async (res) => {
        let friends = [];
        for (var friendId of res.friendIds) {
          const user = snap.users.find((user) => user.id === friendId);
          const users = await axios.get(
            "http://localhost:8080/api/users",
            config
          );

          setFriendsUserNameData(users.data);
          if (user) {
            const u = users.data.find((friend) => friend.id === user.userId);

            if (u) {
              // Add some sample data for visual enhancement
              friends.push({ 
                ...u, 
                ...user,
                lastActive: Math.floor(Math.random() * 24), // Random hours
                mutualFriends: Math.floor(Math.random() * 10),
                isFavorite: Math.random() > 0.7
              });
            }
          }
        }
        setFriends(friends);
      })
      .catch((err) => {});
  }, [snap.currentUser, snap.users]);

  const unfriend = async (friendId) => {
    try {
      await UserConnectionService.deleteUserConnection(
        snap.currentUser.uid,
        friendId
      );

      const updatedFriends = friends.filter((friend) => friend.id !== friendId);
      setFriends(updatedFriends);
    } catch (error) {
      console.error("Error unfriending:", error);
    }
  };

  return (
    <div className="friends-section">
      <div className="friends-header">
        <TeamOutlined className="friends-icon" />
        <h2>My Friends</h2>
        <span className="friends-count">{friends.length} connections</span>
      </div>
      
      <div className="friends-grid">
        {friends.map(friend => (
          <div className={`friend-card ${friend.isFavorite ? 'friend-favorite' : ''}`} key={friend.id}>
            {friend.isFavorite && (
              <div className="favorite-badge">
                <StarFilled />
              </div>
            )}
            
            <div className="friend-card-header">
              <Badge 
                dot 
                status={Math.random() > 0.5 ? "success" : "default"} 
                offset={[-5, 5]}
              >
                <Avatar 
                  src={friend.image} 
                  size={80} 
                  className="friend-avatar"
                  icon={!friend.image && <UserOutlined />}
                />
              </Badge>
            </div>
            
            <div className="friend-card-body">
              <h3 className="friend-name">{friend.username}</h3>
              
              <div className="friend-status">
                <Tooltip title="Last active">
                  <span className="friend-status-item">
                    <ClockCircleOutlined /> {friend.lastActive}h ago
                  </span>
                </Tooltip>
                
                <Tooltip title="Mutual friends">
                  <span className="friend-status-item">
                    <TeamOutlined /> {friend.mutualFriends}
                  </span>
                </Tooltip>
              </div>
              
              <div className="friend-bio">
                {friend.biography || "No bio available"}
              </div>
            </div>
            
            <div className="friend-card-footer">
              <Tooltip title="Message">
                <Button 
                  type="text" 
                  icon={<MessageOutlined />} 
                  className="friend-action-btn"
                />
              </Tooltip>
              
              <Tooltip title="Add to favorites">
                <Button 
                  type="text" 
                  icon={<HeartOutlined />} 
                  className="friend-action-btn"
                />
              </Tooltip>
              
              <Tooltip title="Unfriend">
                <Button 
                  type="text" 
                  danger
                  icon={<UserDeleteOutlined />} 
                  className="friend-action-btn"
                  onClick={() => unfriend(friend.id)}
                />
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsSection;