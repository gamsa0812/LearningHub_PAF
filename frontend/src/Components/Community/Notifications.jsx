import React, { useEffect, useState } from "react";
import { List, Empty } from "antd";
import NotificationService from "../../Services/NotificationService";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
// import "../Styles/Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const snap = useSnapshot(state);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getAllNotifications();
      setNotifications(
        data.filter(
          (notification) => snap.currentUser?.uid === notification.userId
        )
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notifications-container">
      <h1 className="notifications-title">Notifications</h1>
      
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={notifications}
        locale={{ emptyText: <Empty description="No notifications" /> }}
        renderItem={(item) => (
          <List.Item className="notification-item">
            <List.Item.Meta
              title={<p className="notification-message">{item?.message}</p>}
              description={
                <p className="notification-description">{item.description}</p>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Notifications;