import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Dashboard from "./Dashboard";
import AssignedTasks from "./AssignedTasks";

import "../CSS/TechLead.css";

const TechLead = () => {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("Dashboard");

  // Temporary empty data for the initial layout preview.
  // We will replace this with real API data in the next steps.
  const [dashboardData] = useState({
    totalProjects: 0,
    totalTeamLeads: 0,
    totalTeamMembers: 0,
    projects: [],
    deadlines: [],
    activities: [],
  });

  const storedUser =
    JSON.parse(
      localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "{}"
    );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  const handleNavigation = (page) => {
    setActivePage(page);
  };

  const handleAssignTask = () => {
    setActivePage("Assigned Tasks");
  };

  const handleSwitchWelcome = () => {
    navigate("/");
  };

  const handleNotification = () => {
    alert("No new notifications.");
  };

  return (
    <div className="tl-app-layout">

      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />

      <main className="tl-main-content">

        <Header
          userName={storedUser.name || "Tech Lead"}
          onAssignTask={handleAssignTask}
          onSwitchWelcome={handleSwitchWelcome}
          onNotification={handleNotification}
          profileImage={storedUser.profileImage}
        />

        {/* Dashboard Page */}
        {activePage === "Dashboard" && (
          <Dashboard
            {...dashboardData}
            onViewAllProjects={() =>
              setActivePage("My Projects")
            }
            onViewAllDeadlines={() =>
              setActivePage("My Projects")
            }
            onViewAllActivity={() =>
              setActivePage("Proofs and History")
            }
          />
        )}

        {/* Assigned Tasks Page */}
        {activePage === "Assigned Tasks" && (
          <AssignedTasks />
        )}

        {/* Other Pages */}
        {activePage !== "Dashboard" &&
          activePage !== "Assigned Tasks" && (
            <div className="tl-page-placeholder">
              <h2>{activePage}</h2>
              <p>This section will be implemented next.</p>
            </div>
          )}

      </main>
    </div>
  );
};

export default TechLead;