import React, { useEffect, useState } from "react";
import { Dropdown, Menu, Badge, Empty } from "antd";
import { BellFilled } from "@ant-design/icons";
import NotificationService from "../../Services/NotificationService";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import "../Styles/NotificationsDropdown.css";

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const snap = useSnapshot(state);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await NotificationService.getAllNotifications();
      const userNotifications = res.filter(
        (notification) => snap.currentUser?.uid === notification.userId
      );
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const notificationMenu = (
    <Menu className="notification-dropdown-menu">
      {loading ? (
        <Menu.Item disabled>Loading notifications...</Menu.Item>
      ) : notifications.length > 0 ? (
        notifications.map((notification) => (
          <Menu.Item key={notification.id} className="notification-menu-item">
            <div>
              <div className="notification-title">{notification.title || notification.message}</div>
              <p className="notification-description">{notification.description}</p>
            </div>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item disabled>
          <Empty 
            className="empty-dropdown-message" 
            description="No notifications" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </Menu.Item>
      )}
    </Menu>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dropdown overlay={notificationMenu} trigger={["click"]} placement="bottomRight">
      <div className="notification-dropdown-trigger">
        <BellFilled className="notification-icon" />
        {unreadCount > 0 && (
          <div className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>
    </Dropdown>
  );
};

export default NotificationsDropdown;