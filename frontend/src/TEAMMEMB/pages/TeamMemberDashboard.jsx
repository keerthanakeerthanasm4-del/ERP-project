import Astronaut3D from "../components/Astronaut3D.jsx";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../api.js";

import {
  LayoutDashboard,
  UserRound,
  Layers3,
  ClipboardList,
  LogOut,
  Menu,
  Bell,
  Activity,
  Clock3,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Zap,
} from "lucide-react";

import "../styles/TeamMemberDashboard.css";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "My Profile", icon: UserRound },
  { name: "Submission History", icon: Layers3 },
  { name: "My Tasks", icon: ClipboardList },
];

function TeamMemberDashboard() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // DATABASE DATA
  // Empty until connected to backend APIs.
  const [tasks] = useState([]);
  const [notifications] = useState([]);
  const [profile] = useState(null);
    // TEAM MEMBER PROJECT DATA
  const [projects, setProjects] = useState([]);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // Find the existing login token
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          throw new Error("Login token not found. Please log in again.");
        }

        const response = await fetch(
          `${API_URL}/api/student/my-projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch projects.");
        }

        setProjects(data.projects || []);
      } catch (error) {
        console.error("Team Member Project Fetch Error:", error);
        setProjectError(error.message);
      } finally {
        setProjectLoading(false);
      }
    };

    loadProjects();
  }, []);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN PROGRESS"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "ASSIGNED"
  ).length;

  const progress =
    totalTasks === 0
      ? null
      : Math.round((completedTasks / totalTasks) * 100);

  const upcomingDeadlines = tasks
    .filter((task) => task.status !== "COMPLETED")
    .sort((a, b) => a.due.localeCompare(b.due));

  const handleLogout = () => {
    // Replace with your existing authentication logout logic.
    navigate("/login");
  };

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks === 0 ? null : totalTasks,
      icon: ClipboardList,
      color: "cyan",
    },
    {
      label: "In Progress",
      value: totalTasks === 0 ? null : inProgressTasks,
      icon: Clock3,
      color: "purple",
    },
    {
      label: "Completed",
      value: totalTasks === 0 ? null : completedTasks,
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Pending Tasks",
      value: totalTasks === 0 ? null : pendingTasks,
      icon: AlertCircle,
      color: "orange",
    },
  ];

  return (
    <div className="tm-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`tm-sidebar ${
          sidebarOpen ? "" : "tm-sidebar-collapsed"
        }`}
      >
        <div className="tm-brand">
          <div className="tm-brand-logo">
            <Zap size={23} />
          </div>

          {sidebarOpen && <h2>ERP</h2>}
        </div>

        <nav className="tm-navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                type="button"
                className={`tm-nav-item ${
                  activeMenu === item.name ? "active" : ""
                }`}
                onClick={() => setActiveMenu(item.name)}
              >
                <Icon size={21} />

                {sidebarOpen && (
                  <span>{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="tm-sidebar-bottom">

          {/* CODE-BASED ANIMATED ASTRONAUT */}
{sidebarOpen && (
  <div className="tm-astronaut">
    <Astronaut3D />
  </div>
)}

          <button
            type="button"
            className="tm-logout"
            onClick={handleLogout}
          >
            <LogOut size={20} />

            {sidebarOpen && <span>Logout</span>}
          </button>

          <div className="tm-sidebar-user">
            <div className="tm-avatar">
              {profile?.name?.charAt(0)?.toUpperCase() || "T"}
            </div>

            {sidebarOpen && (
              <span>{profile?.name || "Team Member"}</span>
            )}
          </div>

        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <div className="tm-main">

        {/* HEADER */}

        <header className="tm-header">

          <div className="tm-header-left">

            <button
              type="button"
              className="tm-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <Menu size={25} />
            </button>

            <div>
              <h2>Team Member Dashboard</h2>

              <div className="tm-breadcrumb">
                Home <ChevronRight size={14} /> Team Workspace
              </div>
            </div>

          </div>

          <div className="tm-header-right">

            <div className="tm-notification-wrapper">

              <button
                type="button"
                className="tm-notification"
                onClick={() =>
                  setNotificationsOpen(!notificationsOpen)
                }
                aria-label="Notifications"
              >
                <Bell size={22} />

                {notifications.length > 0 && (
                  <span className="tm-notification-count">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="tm-notification-panel">
                  <h4>Notifications</h4>

                  {notifications.map((notification) => (
                    <p key={notification.id}>
                      {notification.message}
                    </p>
                  ))}
                </div>
              )}

            </div>

            <div className="tm-avatar">
              {profile?.name?.charAt(0)?.toUpperCase() || "T"}
            </div>

            <span className="tm-header-username">
              {profile?.name || "Team Member"}
            </span>

          </div>

        </header>

        <main className="tm-content">

          {activeMenu === "Dashboard" ? (
            <>

              {/* ================= WELCOME ================= */}

              <section className="tm-welcome">

                <div className="tm-welcome-content">

                  <div className="tm-workspace-badge">
                    <Activity size={18} />
                    TEAM MEMBER WORKSPACE
                  </div>

                  <h1>
                    Welcome Back,{" "}
                    <span>Team 👋</span>
                  </h1>

                  <p>
                    Track your assigned tasks, monitor your progress
                    and collaborate with your project team.
                  </p>

                </div>

                {/* EXISTING HERO ANIMATION */}

                <div className="tm-hero-illustration">

                  <div className="tm-orbit tm-orbit-one"></div>
                  <div className="tm-orbit tm-orbit-two"></div>

                  <div className="tm-floating-card">
                    <Activity size={85} strokeWidth={1.8} />
                  </div>

                </div>

              </section>

              {/* ================= STATISTICS ================= */}

              <section className="tm-stats-grid">

                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div className="tm-stat-card" key={stat.label}>

                      <div className={`tm-stat-icon ${stat.color}`}>
                        <Icon />
                      </div>

                      <div className="tm-stat-details">

                        {stat.value !== null && (
                          <h2>{stat.value}</h2>
                        )}

                        <p>{stat.label}</p>

                      </div>

                    </div>
                  );
                })}

              </section>

              {/* ================= BOTTOM PANELS ================= */}

              <section className="tm-bottom-grid">

                {/* MY PROGRESS */}

                <div className="tm-panel">

                  <div className="tm-panel-heading">

                    <div className="tm-panel-icon">
                      <Activity />
                    </div>

                    <div>
                      <h3>My Progress</h3>
                      <p>Your task completion overview</p>
                    </div>

                  </div>

                  {progress !== null && (
                    <>
                      <div className="tm-progress-value">
                        {progress}%
                      </div>

                      <div className="tm-progress-track">
                        <div
                          className="tm-progress-fill"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      <div className="tm-progress-list">

                        <div>
                          <span>
                            <i className="tm-dot green-dot"></i>
                            Completed
                          </span>
                          <strong>{completedTasks}</strong>
                        </div>

                        <div>
                          <span>
                            <i className="tm-dot purple-dot"></i>
                            In Progress
                          </span>
                          <strong>{inProgressTasks}</strong>
                        </div>

                        <div>
                          <span>
                            <i className="tm-dot orange-dot"></i>
                            Pending
                          </span>
                          <strong>{pendingTasks}</strong>
                        </div>

                      </div>
                    </>
                  )}

                </div>

                {/* MY TASKS */}

                <div className="tm-panel">

                  <div className="tm-panel-heading">

                    <div className="tm-panel-icon">
                      <ClipboardList />
                    </div>

                    <div>
                      <h3>My Tasks</h3>
                      <p>Your recent assignments</p>
                    </div>

                  </div>

                  <div className="tm-task-list">

                    {tasks.map((task) => (
                      <div className="tm-task-row" key={task.id}>

                        <div className="tm-task-info">
                          <h4>{task.title}</h4>

                          <p>
                            <CalendarDays size={13} />
                            Due: {task.due}
                          </p>
                        </div>

                        <span
                          className={`tm-status ${
                            task.status === "COMPLETED"
                              ? "completed"
                              : task.status === "IN PROGRESS"
                              ? "inprogress"
                              : "assigned"
                          }`}
                        >
                          {task.status}
                        </span>

                      </div>
                    ))}

                  </div>

                  {tasks.length > 0 && (
                    <button
                      type="button"
                      className="tm-view-all"
                      onClick={() => setActiveMenu("My Tasks")}
                    >
                      View all tasks
                      <ChevronRight size={19} />
                    </button>
                  )}

                </div>

                {/* UPCOMING DEADLINES */}

                <div className="tm-panel">

                  <div className="tm-panel-heading">

                    <div className="tm-panel-icon">
                      <CalendarDays />
                    </div>

                    <div>
                      <h3>Upcoming Deadlines</h3>
                      <p>Your next due dates.</p>
                    </div>

                  </div>

                  <div className="tm-deadline-list">

                    {upcomingDeadlines.map((task) => (
                      <div
                        className="tm-deadline-row"
                        key={task.id}
                      >

                        <div className="tm-deadline-icon">
                          <CalendarDays size={23} />
                        </div>

                        <div className="tm-deadline-info">
                          <h4>{task.title}</h4>
                          <p>Due: {task.due}</p>
                        </div>

                        <span>{task.due}</span>

                      </div>
                    ))}

                  </div>

                </div>

              </section>

            </>
          ) : (

            /* ================= OTHER SIDEBAR SECTIONS ================= */

            <section className="tm-other-page">

              <div className="tm-panel-heading">

                <div className="tm-panel-icon">
                  <Layers3 />
                </div>

                <div>
                  <h3>{activeMenu}</h3>
                  <p>Team Member Workspace</p>
                </div>

              </div>

              {activeMenu === "My Profile" && (
                <div className="tm-profile-details">

                  <div className="tm-avatar">
                    {profile?.name?.charAt(0)?.toUpperCase() || "T"}
                  </div>

                  {profile && (
                    <>
                      <h2>{profile.name}</h2>
                      <p>{profile.email}</p>
                    </>
                  )}

                </div>
              )}

              {activeMenu === "Submission History" && (
                <div className="tm-placeholder">
                  <Layers3 size={42} />
                  <h3>Submission History</h3>
                </div>
              )}

              {activeMenu === "My Tasks" && (
                <div className="tm-full-tasks">

                  {tasks.map((task) => (
                    <div className="tm-full-task" key={task.id}>

                      <div>
                        <h3>{task.title}</h3>
                        <p>Deadline: {task.due}</p>
                      </div>

                      <span>{task.status}</span>

                    </div>
                  ))}

                </div>
              )}

            </section>

          )}

        </main>

      </div>

    </div>
    
  );
}

export default TeamMemberDashboard;