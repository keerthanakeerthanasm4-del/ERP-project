
import React from "react";
import {
  Bell,
  Plus,
  ArrowLeft,
  UserRound,
} from "lucide-react";

import "../CSS/Header.css";

const Header = ({
  userName = "Tech Lead",
  onAssignTask,
  onSwitchWelcome,
  onNotification,
  profileImage,
}) => {
  return (
    <header className="tl-header">

      <div className="tl-header-welcome">
        <h1>
          Welcome Back, <span>{userName}!</span>
        </h1>
        <p>Here's what's happening with your projects today.</p>
      </div>

      <div className="tl-header-actions">

        <button
          className="tl-header-btn tl-assign-btn"
          onClick={onAssignTask}
        >
          <Plus size={21} strokeWidth={2.5} />
          <span>Assign Task</span>
        </button>

        <button
          className="tl-header-btn tl-welcome-btn"
          onClick={onSwitchWelcome}
        >
          <ArrowLeft size={20} />
          <span>Switch to Welcome Page</span>
        </button>

        <button
          className="tl-notification-btn"
          onClick={onNotification}
          aria-label="Notifications"
        >
          <Bell size={23} />
          <span className="tl-notification-dot"></span>
        </button>

        <div className="tl-header-avatar">
          {profileImage ? (
            <img src={profileImage} alt="Profile" />
          ) : (
            <UserRound size={25} />
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
