import projectLogo from "../../assets/project-logo.png";
import HODProjects from "./HODProjects";
import CreateProjectLead from "./CreateProjectLead.jsx";
import HODProfile from "./HODProfile.jsx";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  UserRound,
  CalendarDays,
  Folder,
  UserPlus,
  LogOut,
  Bell,
  Menu,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Bot,
  ChevronRight,
} from "lucide-react";

import "../HOD styles/HODDashboard.css";

function HODDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileImage, setProfileImage] = useState(
  localStorage.getItem("hodProfileImage") || null
);

useEffect(() => {
  const syncProfileImage = () => {
    setProfileImage(localStorage.getItem("hodProfileImage") || null);
  };

  window.addEventListener("profileImageUpdated", syncProfileImage);
  window.addEventListener("storage", syncProfileImage);

  return () => {
    window.removeEventListener("profileImageUpdated", syncProfileImage);
    window.removeEventListener("storage", syncProfileImage);
  };
}, []);
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      project: "QRaksha",
      time: "Nov 16, 2026 • 11:00 AM",
      status: "Pending",
    },
    {
      id: 2,
      project: "ERP",
      time: "Nov 17, 2026 • 2:00 PM",
      status: "Pending",
    },
    {
      id: 3,
      project: "AI Assistant",
      time: "Nov 18, 2026 • 10:30 AM",
      status: "Pending",
    },
  ]);

  const [projects, setProjects] = useState([]);

useEffect(() => {
  fetchHODProjects();
}, []);

const fetchHODProjects = async () => {
  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/hod/projects",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch projects");
    }

    const formattedProjects = (data.projects || []).map((project) => ({
  name: project.project_name,
  status: project.status,
  phases: project.phases || [],
  icon: project.project_name.toLowerCase().includes("qr")
    ? <ShieldCheck />
    : project.project_name.toLowerCase().includes("erp")
    ? <Cpu />
    : <Bot />,
}));

setProjects(formattedProjects);
  } catch (error) {
    console.error("HOD Projects Error:", error);
  }
};
  const timeSlots = [
    { time: "9:00 - 10:00 AM", booked: false },
    { time: "10:00 - 11:00 AM", booked: true },
    { time: "11:00 - 12:00 PM", booked: false },
    { time: "12:00 - 1:00 PM", booked: false },
    { time: "2:00 - 3:00 PM", booked: false },
    { time: "3:00 - 4:00 PM", booked: false },
    { time: "4:00 - 5:00 PM", booked: false },
  ];

  const navigation = [
    { name: "Dashboard", icon: <LayoutDashboard /> },
    { name: "Profile", icon: <UserRound /> },
    { name: "Meetings", icon: <CalendarDays /> },
    { name: "Projects", icon: <Folder /> },
    { name: "Create Project Lead", icon: <UserPlus /> },
  ];

  const handleMeetingAction = (id, status) => {
    setMeetings((previous) =>
      previous.map((meeting) =>
        meeting.id === id ? { ...meeting, status } : meeting
      )
    );
  };

  const renderPage = () => {
    if (activePage === "Create Project Lead") {
  return <CreateProjectLead />;
    }
    if (activePage === "Profile") {
  return <HODProfile />;
   }
   if (activePage === "Projects") {
  return <HODProjects />;
}
    if (activePage === "Dashboard") {
      return (
        <>
          <header className="hod-header">
            <div>
              <h1>WELCOME TO PROGRIS PROJECT PORTAL</h1>
              <p>Manage your department's projects and meetings efficiently</p>
            </div>

            <div className="hod-header-actions">
             <button
  className="notification-button"
  aria-label="Notifications"
  onClick={() => setActivePage("Notifications")}
>
  <Bell />
  <span className="notification-count">3</span>
</button>

             <button
  className="hod-avatar"
  onClick={() => setActivePage("Profile")}
  title="View Profile"
>
  {profileImage ? (
    <img src={profileImage} alt="HOD Profile" />
  ) : (
    "HOD"
  )}
</button>
            </div>
          </header>

          <section className="next-meeting-banner">
  <div className="banner-icon">
    <Bell />
  </div>

  <div className="banner-divider"></div>

  <div className="banner-content">
    <h3>Next Meeting</h3>

    <div className="banner-meeting-row">
      <h2>ERP meeting at 11:00 AM today</h2>
      <span className="banner-date">Nov 16, 2026</span>
    </div>
  </div>

  <button
    className="banner-button"
    onClick={() => setActivePage("Meetings")}
  >
    View Details <ArrowRight size={20} />
  </button>
</section>
          <section className="quick-actions">
            <button
              className="quick-action-card"
              onClick={() => setActivePage("Meetings")}
            >
              <div className="quick-icon blue-icon">
                <CalendarDays />
              </div>
              <div>
                <h3>Today's Meetings</h3>
                <p>View your scheduled meetings</p>
              </div>
              <ArrowRight className="quick-arrow" />
            </button>

            <button
              className="quick-action-card"
              onClick={() => setActivePage("Meetings")}
            >
              <div className="quick-icon purple-icon">
                <Plus />
              </div>
              <div>
                <h3>Create Meeting</h3>
                <p>Schedule a new meeting</p>
              </div>
              <ArrowRight className="quick-arrow" />
            </button>
          </section>

          <section className="slots-section">
            <div className="section-heading">
              <Clock />
              <h3>Today's Meeting Slots</h3>
            </div>

            <div className="time-slots">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`time-slot ${slot.booked ? "booked" : "available"}`}
                >
                  {slot.time}
                  {slot.booked && <span>✓</span>}
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-bottom">
            <div className="dashboard-card upcoming-card">
              <div className="section-heading card-heading">
                <CalendarDays />
                <h3>Upcoming Meetings</h3>
                <button onClick={() => setActivePage("Meetings")}>
                  View All <ArrowRight size={16} />
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Sl. No.</th>
                      <th>Project Name</th>
                      <th>Meeting Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {meetings.map((meeting, index) => (
                      <tr key={meeting.id}>
                        <td>{index + 1}</td>
                        <td>{meeting.project}</td>
                        <td>{meeting.time}</td>
                        <td>
                          <span className={`status-badge ${meeting.status.toLowerCase()}`}>
                            {meeting.status}
                          </span>
                        </td>
                        <td>
                          {meeting.status === "Pending" ? (
                            <div className="meeting-actions">
                              <button
                                className="approve-button"
                                onClick={() =>
                                  handleMeetingAction(meeting.id, "Approved")
                                }
                              >
                                Approve
                              </button>

                              <button
                                className="reject-button"
                                onClick={() =>
                                  handleMeetingAction(meeting.id, "Rejected")
                                }
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="action-result">{meeting.status}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="dashboard-card projects-card">
              <div className="section-heading card-heading">
                <Folder />
                <h3>Projects</h3>
                <button onClick={() => setActivePage("Projects")}>
                  View All <ArrowRight size={16} />
                </button>
              </div>

              {projects.map((project) => (
                <div className="project-item" key={project.name}>
                  <div className="project-icon">{project.icon}</div>

                  <div className="project-info">
  <h4>{project.name}</h4>

  <p className={project.status === "At Risk" ? "risk" : "on-track"}>
    ● Status: {project.status}
  </p>

  <div className="project-phases">
  {project.phases.map((phase) => (
    <span
      key={phase.phase_id}
      className={`phase-block ${phase.is_completed ? "completed" : "pending"}`}
      title={phase.phase_name}
    />
  ))}
</div>
</div>

                  <button
                    className="view-details-button"
                    onClick={() => setActivePage("Projects")}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      );
    }

    return (
      <div className="placeholder-page">
        <h2>{activePage}</h2>
        <p>
          The {activePage} page will be developed in the next step.
        </p>
        <button onClick={() => setActivePage("Dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="hod-layout">
      <aside className={`hod-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="sidebar-brand">
         <img
  src={projectLogo}
  alt="Project Logo"
  className="svce-logo"
/>
          {sidebarOpen && (
            <div>
              <h2>PROGRIS</h2>
              <p>Project Portal</p>
            </div>
          )}
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu />
          </button>
        </div>

        <nav className="sidebar-navigation">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`sidebar-link ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
              title={item.name}
            >
              {item.icon}
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

       <button
  className="sidebar-link logout-link"
  onClick={() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    window.location.href = "/";
  }}
>
  <LogOut />
  {sidebarOpen && <span>Logout</span>}
</button>
      </aside>

      <main className="hod-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default HODDashboard;