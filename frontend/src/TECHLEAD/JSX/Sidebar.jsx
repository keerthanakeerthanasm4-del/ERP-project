
import React from "react";
import {
  LayoutDashboard,
  UserRound,
  ClipboardList,
  Folder,
  History,
  LogOut,
  Menu,
} from "lucide-react";

import Robot from "./Robot";
import "../CSS/Sidebar.css";

const Sidebar = ({ activePage, onNavigate, onLogout }) => {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Profile", icon: UserRound },
    { name: "Assigned Tasks", icon: ClipboardList },
    { name: "My Projects", icon: Folder },
    { name: "Proofs and History", icon: History },
  ];

  return (
    <aside className="tl-sidebar">
      <div className="tl-sidebar-brand">
        <div className="tl-logo">TL</div>

        <div className="tl-brand-text">
          <h2>Tech Lead</h2>
          <p>Project Portal</p>
        </div>

        <Menu className="tl-menu-icon" size={25} />
      </div>

      <nav className="tl-navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={`tl-nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => onNavigate?.(item.name)}
            >
              <Icon size={24} strokeWidth={2.2} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="tl-sidebar-bottom">
        <Robot />

        <div className="tl-online-status">
          <span className="tl-online-dot"></span>
          <span>Tech Lead Portal Online</span>
        </div>

        <button className="tl-logout-button" onClick={onLogout}>
          <LogOut size={22} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
