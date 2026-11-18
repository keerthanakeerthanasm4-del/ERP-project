
import { useCallback, useState, useEffect } from "react";
import projectLogo from "../../assets/project-logo.png";

import HODProjects from "./HODProjects";
import CreateProjectLead from "./CreateProjectLead.jsx";
import HODProfile from "./HODProfile.jsx";
import HODMeetings from "./HODMeetings.jsx";

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
  X
} from "lucide-react";

import "../HOD styles/HODDashboard.css";

const getHodAuthHeaders = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

function HODDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openCreateMeeting, setOpenCreateMeeting] = useState(false);

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("hodProfileImage") || null
  );

  const [meetings, setMeetings] = useState([]);

  const [projects, setProjects] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // =====================================
  // DATE AND TIME HELPERS
  // =====================================

  const getLocalDate = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getMeetingDate = (meeting) => {
    const rawDate =
      meeting.date ||
      meeting.meetingDate ||
      meeting.meeting_date ||
      meeting.scheduledDate ||
      "";

    if (!rawDate) return "";

    const value = String(rawDate).trim();

    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    const otherMatch = value.match(
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
    );

    if (otherMatch) {
      return `${otherMatch[3]}-${String(otherMatch[2]).padStart(
        2,
        "0"
      )}-${String(otherMatch[1]).padStart(2, "0")}`;
    }

    return "";
  };

  // Supports 24-hour and AM/PM formats
  const getTimeMinutes = (time) => {
    if (!time) return null;

    const value = String(time).trim();

    const match = value.match(
      /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i
    );

    if (!match) return null;

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3]?.toUpperCase();

    if (minutes > 59) return null;

    if (period) {
      if (hours < 1 || hours > 12) return null;

      if (period === "PM" && hours < 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }
    } else if (hours > 23) {
      return null;
    }

    return hours * 60 + minutes;
  };

  const normalize = (value) =>
    String(value || "").trim().toLowerCase();

  // =====================================
  // FORMAT TIME
  // =====================================

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${String(mins).padStart(2, "0")} ${period}`;
  };

  const formatTime = (time) => {
    if (!time) return "";

    const minutes = getTimeMinutes(time);

    if (minutes === null) return time;

    return formatMinutes(minutes);
  };

  // =====================================
  // DYNAMIC MEETING TIME SLOTS
  // =====================================

  const getTodayTimeBlocks = () => {
    const today = getLocalDate();

    const DAY_START = 9 * 60;
    const DAY_END = 17 * 60;

    const todayMeetings = meetings
      .filter((meeting) => {
        if (getMeetingDate(meeting) !== today) {
          return false;
        }

        if (normalize(meeting.status) === "rejected") {
          return false;
        }

        return true;
      })
      .map((meeting) => {
        const start = getTimeMinutes(meeting.startTime);
        const end = getTimeMinutes(meeting.endTime);

        if (
          start === null ||
          end === null ||
          end <= start ||
          start >= DAY_END ||
          end <= DAY_START
        ) {
          return null;
        }

        return {
          start: Math.max(start, DAY_START),
          end: Math.min(end, DAY_END),
          title: meeting.title || "Scheduled Meeting"
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);

    const blocks = [];
    let currentTime = DAY_START;

    todayMeetings.forEach((meeting) => {
      // Add one continuous available block before the meeting
      if (meeting.start > currentTime) {
        blocks.push({
          type: "available",
          start: currentTime,
          end: meeting.start
        });
      }

      // Add booked meeting, handling overlapping meetings
      if (meeting.end > currentTime) {
        blocks.push({
          type: "booked",
          start: Math.max(meeting.start, currentTime),
          end: meeting.end,
          title: meeting.title
        });

        currentTime = meeting.end;
      }
    });

    // Add one continuous available block after the last meeting
    if (currentTime < DAY_END) {
      blocks.push({
        type: "available",
        start: currentTime,
        end: DAY_END
      });
    }

    return blocks;
  };

  const timeBlocks = getTodayTimeBlocks();

  // =====================================
  // FETCH PROJECTS
  // =====================================

  const fetchHODProjects = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/hod/projects",
        {
          headers: getHodAuthHeaders()
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch projects");
      }

      const formattedProjects = (data.projects || []).map(
        (project) => {
          const name = project.project_name || "Unnamed Project";

          let icon = <Bot />;

          if (name.toLowerCase().includes("qr")) {
            icon = <ShieldCheck />;
          } else if (name.toLowerCase().includes("erp")) {
            icon = <Cpu />;
          }

          return {
            ...project,
            name,
            status: project.status || "Not available",
            phases: project.phases || [],
            icon
          };
        }
      );

      setProjects(formattedProjects);
    } catch (error) {
      console.error("HOD Projects Error:", error);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const fetchHODMeetings = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/hod/meetings", { headers: getHodAuthHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch meetings");
      setMeetings(data.meetings || []);
    } catch (error) {
      console.error("HOD meetings error:", error);
    }
  }, []);

  useEffect(() => {
    const refreshDashboardData = () => {
      fetchHODProjects();
      fetchHODMeetings();
    };
    const refreshMeetings = () => fetchHODMeetings();
    refreshDashboardData();
    const interval = window.setInterval(refreshDashboardData, 15000);
    window.addEventListener("focus", refreshDashboardData);
    window.addEventListener("hodMeetingsUpdated", refreshMeetings);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshDashboardData);
      window.removeEventListener("hodMeetingsUpdated", refreshMeetings);
    };
  }, [fetchHODMeetings, fetchHODProjects]);

  // =====================================
  // SYNCHRONIZE MEETINGS AND PROFILE IMAGE
  // =====================================

  useEffect(() => {
    const syncProfileImage = () => {
      setProfileImage(
        localStorage.getItem("hodProfileImage") || null
      );
    };

    window.addEventListener("profileImageUpdated", syncProfileImage);

    return () => {
      window.removeEventListener("profileImageUpdated", syncProfileImage);
    };
  }, []);

  // =====================================
  // APPROVE OR REJECT MEETING
  // =====================================

  const updateMeetingStatus = async (meetingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/hod/meetings/${meetingId}/status`, {
        method: "PATCH",
        headers: { ...getHodAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update meeting status.");
      await fetchHODMeetings();
    } catch (error) {
      console.error("Update meeting status:", error);
      window.alert(error.message || "Unable to update meeting status.");
    }
  };

  // =====================================
  // SIDEBAR NAVIGATION
  // =====================================

  const navigation = [
    { name: "Dashboard", icon: <LayoutDashboard /> },
    { name: "Profile", icon: <UserRound /> },
    { name: "Meetings", icon: <CalendarDays /> },
    { name: "Projects", icon: <Folder /> },
    { name: "Create Project Lead", icon: <UserPlus /> }
  ];

  const openMeetingsPage = (createForm = false) => {
    setOpenCreateMeeting(createForm);
    setActivePage("Meetings");
  };

  // =====================================
  // GET MEETINGS FOR SELECTED PROJECT
  // =====================================

  const getProjectMeetings = (project) => {
    if (!project) return [];

    const projectNames = [
      project.name,
      project.project_name,
      project.project_id,
      project.project_code
    ]
      .map(normalize)
      .filter(Boolean);

    return meetings.filter((meeting) => {
      const meetingNames = [
        meeting.project,
        meeting.projectName,
        meeting.project_name,
        meeting.project_id,
        meeting.projectId
      ]
        .map(normalize)
        .filter(Boolean);

      return meetingNames.some((meetingName) =>
        projectNames.includes(meetingName)
      );
    });
  };

  // =====================================
  // GET UPCOMING MEETINGS
  // =====================================

  const getUpcomingMeetings = () => {
    const today = getLocalDate();
    const now = new Date();

    const currentMinutes =
      now.getHours() * 60 + now.getMinutes();

    return meetings
      .map((meeting) => ({
        ...meeting,
        normalizedDate: getMeetingDate(meeting)
      }))
      .filter((meeting) => {
        if (!meeting.normalizedDate) return false;

        if (normalize(meeting.status) === "rejected") {
          return false;
        }

        if (meeting.normalizedDate > today) {
          return true;
        }

        if (meeting.normalizedDate === today) {
          const start = getTimeMinutes(meeting.startTime);

          return start !== null && start >= currentMinutes;
        }

        return false;
      })
      .sort((a, b) => {
        const first =
          `${a.normalizedDate}T${a.startTime || "00:00"}`;

        const second =
          `${b.normalizedDate}T${b.startTime || "00:00"}`;

        return first.localeCompare(second);
      });
  };

  const upcomingMeetings = getUpcomingMeetings();

  // =====================================
  // GET NEXT MEETING
  // =====================================

  const nextMeeting = upcomingMeetings[0] || null;

  // =====================================
  // GET TEAM NAME
  // =====================================

  const getTeamName = (meeting) =>
    meeting.team ||
    meeting.project ||
    meeting.projectName ||
    meeting.project_name ||
    "Team";

  // =====================================
  // FORMAT MEETING DATE
  // =====================================

  const formatMeetingDate = (meeting) => {
    const dateKey = getMeetingDate(meeting);

    if (!dateKey) return "Date not available";

    const [year, month, day] = dateKey.split("-");

    return new Date(`${year}-${month}-${day}T00:00:00`).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  // =====================================
  // MEETING DETAILS POPUP
  // =====================================

  const renderMeetingDetails = (meeting) => {
    if (!meeting) return null;

    return (
      <div
        className="meeting-detail-overlay"
        onClick={() => setSelectedMeeting(null)}
      >
        <div
          className="meeting-detail-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="meeting-detail-heading">
            <div>
              <h2>Meeting Details</h2>
              <p>Complete meeting information</p>
            </div>

            <button
              onClick={() => setSelectedMeeting(null)}
              className="detail-close"
            >
              <X />
            </button>
          </div>

          <div className="meeting-detail-body">
            <p>
              <strong>Team / Project:</strong>{" "}
              {getTeamName(meeting)}
            </p>

            <p>
              <strong>Meeting Title:</strong>{" "}
              {meeting.title || "Not available"}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {formatMeetingDate(meeting)}
            </p>

            <p>
              <strong>Start Time:</strong>{" "}
              {formatTime(meeting.startTime) || "Not available"}
            </p>

            <p>
              <strong>End Time:</strong>{" "}
              {formatTime(meeting.endTime) || "Not available"}
            </p>

            <p>
              <strong>Venue:</strong>{" "}
              {meeting.venue || "Not available"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {meeting.status || "Pending"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // =====================================
  // PROJECT DETAILS POPUP
  // =====================================

  const renderProjectDetails = (project) => {
    const projectMeetings = getProjectMeetings(project);

    return (
      <div
        className="meeting-detail-overlay"
        onClick={() => setSelectedProject(null)}
      >
        <div
          className="meeting-detail-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="meeting-detail-heading">
            <div>
              <h2>{project.name}</h2>
              <p>Meeting Details</p>
            </div>

            <button
              onClick={() => setSelectedProject(null)}
              className="detail-close"
            >
              <X />
            </button>
          </div>

          <div className="meeting-detail-body">
            {projectMeetings.length === 0 ? (
              <p>No meetings scheduled for this project.</p>
            ) : (
              projectMeetings.map((meeting, index) => (
                <div
                  className="project-meeting-detail"
                  key={meeting.meeting_id || index}
                >
                  <h3>{meeting.title || "Untitled Meeting"}</h3>

                  <p>
                    <strong>Team / Project:</strong>{" "}
                    {getTeamName(meeting)}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {formatMeetingDate(meeting)}
                  </p>

                  <p>
                    <strong>Start Time:</strong>{" "}
                    {formatTime(meeting.startTime)}
                  </p>

                  <p>
                    <strong>End Time:</strong>{" "}
                    {formatTime(meeting.endTime)}
                  </p>

                  <p>
                    <strong>Venue:</strong> {meeting.venue}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {meeting.status || "Pending"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // =====================================
  // PAGE RENDERING
  // =====================================

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

    if (activePage === "Meetings") {
      return (
        <HODMeetings
          key={openCreateMeeting ? "create-meeting" : "meetings-list"}
          initialShowForm={openCreateMeeting}
        />
      );
    }

    if (activePage === "Dashboard") {
      return (
        <>
          {/* HEADER */}

          <header className="hod-header">
            <div>
              <h1>WELCOME TO PROGRIS PROJECT PORTAL</h1>
              <p>
                Manage your department's projects and meetings efficiently
              </p>
            </div>

            <div className="hod-header-actions">
              <button
                className="notification-button"
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

          {/* NEXT MEETING BANNER */}

          <section
            className="next-meeting-banner"
            onClick={() => {
              if (nextMeeting) {
                setSelectedMeeting(nextMeeting);
              } else {
                openMeetingsPage(false);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="banner-icon">
              <Bell />
            </div>

            <div className="banner-divider"></div>

            <div className="banner-content">
              <h3>Next Meeting</h3>

              <div className="banner-meeting-row">
                <h2>
                  {nextMeeting
                    ? `${getTeamName(nextMeeting)} - ${
                        nextMeeting.title || "Meeting"
                      }`
                    : "No meetings scheduled"}
                </h2>

                {nextMeeting && (
                  <span className="banner-date">
                    {formatMeetingDate(nextMeeting)} •{" "}
                    {formatTime(nextMeeting.startTime)}
                  </span>
                )}
              </div>
            </div>

            <button
              className="banner-button"
              onClick={(e) => {
                e.stopPropagation();

                if (nextMeeting) {
                  setSelectedMeeting(nextMeeting);
                } else {
                  openMeetingsPage(false);
                }
              }}
            >
              View Details <ArrowRight size={20} />
            </button>
          </section>

          {/* QUICK ACTIONS */}

          <section className="quick-actions">
            <button
              className="quick-action-card"
              onClick={() => openMeetingsPage(false)}
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
              onClick={() => openMeetingsPage(true)}
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

          {/* TODAY'S DYNAMIC MEETING SLOTS */}

          <section className="slots-section">
            <div className="section-heading">
              <Clock />
              <h3>Today's Meeting Slots</h3>
            </div>

            <div className="time-slots">
              {timeBlocks.length === 0 ? (
                <p>No time slots available.</p>
              ) : (
                timeBlocks.map((block, index) => {
                  const booked = block.type === "booked";

                  return (
                    <div
                      className={`time-slot ${
                        booked ? "booked" : "available"
                      }`}
                      key={`${block.start}-${block.end}-${index}`}
                      title={booked ? block.title : "Available time"}
                    >
                      <strong>
                        {formatMinutes(block.start)} -{" "}
                        {formatMinutes(block.end)}
                      </strong>

                      <span>
                        {booked ? "Booked" : "Available"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* DASHBOARD BOTTOM */}

          <section className="dashboard-bottom">

            {/* UPCOMING MEETINGS */}

            <div className="dashboard-card upcoming-card">
              <div className="section-heading card-heading">
                <CalendarDays />
                <h3>Upcoming Meetings</h3>

                <button onClick={() => openMeetingsPage(false)}>
                  View All <ArrowRight size={16} />
                </button>
              </div>

              <div className="table-wrapper">
                <table className="dashboard-meetings-table">
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
                    {upcomingMeetings.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="no-meetings">
                          No upcoming meetings found.
                        </td>
                      </tr>
                    ) : (
                      upcomingMeetings.map((meeting, index) => {
                        const status = meeting.status || "Pending";

                        return (
                          <tr
                            key={meeting.meeting_id}
                          >
                            <td>{index + 1}</td>

                            <td className="meeting-project-name">
                              {getTeamName(meeting)}
                            </td>

                            <td>
                              {formatMeetingDate(meeting)}
                              {" • "}
                              {formatTime(meeting.startTime) ||
                                "Time not set"}
                            </td>

                            <td>
                              <span
                                className={`dashboard-status ${normalize(
                                  status
                                )}`}
                              >
                                {status}
                              </span>
                            </td>

                            <td>
                              <div className="meeting-action-buttons">
                                <button
                                  className="approve-button"
                                  disabled={normalize(status) !== "pending"}
                                  onClick={() =>
                                    updateMeetingStatus(
                                      meeting.meeting_id,
                                      "Approved"
                                    )
                                  }
                                >
                                  Approve
                                </button>

                                <button
                                  className="reject-button"
                                  disabled={normalize(status) !== "pending"}
                                  onClick={() =>
                                    updateMeetingStatus(
                                      meeting.meeting_id,
                                      "Rejected"
                                    )
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PROJECTS */}

            <div className="dashboard-card projects-card">
              <div className="section-heading card-heading">
                <Folder />
                <h3>Projects</h3>

                <button onClick={() => setActivePage("Projects")}>
                  View All <ArrowRight size={16} />
                </button>
              </div>

              {projectsLoading ? (
                <p>Loading projects...</p>
              ) : projects.length === 0 ? (
                <p>No projects found.</p>
              ) : (
                projects.map((project) => (
                  <div
                    className="project-item"
                    key={project.project_id || project.name}
                  >
                    <div className="project-icon">
                      {project.icon}
                    </div>

                    <div className="project-info">
                      <h4>{project.name}</h4>

                      <p
                        className={
                          project.status === "At Risk"
                            ? "risk"
                            : "on-track"
                        }
                      >
                        ● Status: {project.status}
                      </p>

                      <div className="project-phases">
                        {project.phases.map((phase, index) => (
                          <span
                            key={phase.phase_id || index}
                            className={`phase-block ${
                              phase.is_completed
                                ? "completed"
                                : "pending"
                            }`}
                            title={phase.phase_name}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      className="view-details-button"
                      onClick={() => setSelectedProject(project)}
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
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

  // =====================================
  // MAIN RETURN
  // =====================================

  return (
    <div className="hod-layout">

      {/* SIDEBAR */}

      <aside
        className={`hod-sidebar ${sidebarOpen ? "" : "collapsed"}`}
      >
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
              onClick={() => {
                if (item.name === "Meetings") {
                  openMeetingsPage(false);
                } else {
                  setActivePage(item.name);
                }
              }}
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

      {/* MAIN CONTENT */}

      <main className="hod-main">
        {renderPage()}
      </main>

      {/* MEETING DETAILS POPUP */}

      {selectedMeeting && renderMeetingDetails(selectedMeeting)}

      {/* PROJECT DETAILS POPUP */}

      {selectedProject && renderProjectDetails(selectedProject)}

    </div>
  );
}

export default HODDashboard;
