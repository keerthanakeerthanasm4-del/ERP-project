import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { API_URL } from "./api.js";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Unable to read stored user:", error);
      }
    }

    fetchAssignedProjects();
  }, []);

  async function fetchAssignedProjects() {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_URL}/api/student/my-projects`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to load projects.");
        return;
      }

      setProjects(data.projects || []);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  }

  function getStatusClass(status) {
    const value = (status || "").toLowerCase();

    if (value.includes("complete")) {
      return "status-completed";
    }

    if (value.includes("progress")) {
      return "status-progress";
    }

    if (value.includes("assign")) {
      return "status-assigned";
    }

    return "status-default";
  }

  return (
    <main className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="dashboard-logo">🎓</span>
          <span>ERP Project Management</span>
        </div>

        <div className="dashboard-user">
          <div className="user-profile-icon">
            {user?.name?.charAt(0).toUpperCase() || "S"}
          </div>

          <span>{user?.name || "Student"}</span>

          <button
            className="dashboard-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* WELCOME BANNER */}

      <section className="college-welcome-banner">
        <div className="welcome-overlay" />

        <div className="dashboard-stars" />

        <div className="dashboard-light-rays" />

        {/* LEFT CONTENT */}

        <div className="welcome-left-content">
          <div className="welcome-eyebrow">
            ✦ YOUR CAMPUS PROJECT JOURNEY STARTS HERE
          </div>

          <h1>
            Welcome,
            <br />
            <span className="welcome-user-name">
              {" "}{user?.name || "Student"}!
            </span>
          </h1>

          <button
            className="welcome-explore-btn"
            onClick={() => {
              document
                .getElementById("my-projects")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore My Projects
            <span>→</span>
          </button>
        </div>

        {/* RIGHT SIDE: PROJECT ILLUSTRATION */}

        <div className="dashboard-hero-art">
          <div className="dashboard-orbit" />

          <div className="dashboard-floating-icon dashboard-icon-team">
            👥
          </div>

          <div className="dashboard-floating-icon dashboard-icon-calendar">
            📅
          </div>

          <div className="dashboard-floating-icon dashboard-icon-folder">
            📁
          </div>

          <div className="dashboard-floating-icon dashboard-icon-checklist">
            ☑
          </div>

          <div className="dashboard-laptop">
            <div className="dashboard-laptop-screen">
              <div className="dashboard-screen-top">
                <span>🎓</span>
                <strong>Project Overview</strong>
                <span>● ● ●</span>
              </div>

              <div className="dashboard-screen-content">
                <div className="dashboard-screen-sidebar">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="dashboard-screen-main">
                  <div className="dashboard-chart">
                    <div style={{ height: "35%" }} />
                    <div style={{ height: "55%" }} />
                    <div style={{ height: "45%" }} />
                    <div style={{ height: "75%" }} />
                    <div style={{ height: "95%" }} />
                  </div>

                  <div className="dashboard-screen-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

                <div className="dashboard-donut" />
              </div>
            </div>

            <div className="dashboard-laptop-base">
              <div className="dashboard-laptop-trackpad" />
            </div>
          </div>

          <div className="dashboard-platform" />
        </div>

        <div className="welcome-bottom-shape" />
      </section>

      {/* ASSIGNED PROJECTS */}

      <section
        className="assigned-projects"
        id="my-projects"
      >
        <div className="projects-heading">
          <div>
            <span className="projects-subtitle">
              YOUR WORKSPACE
            </span>

            <h2>My Assigned Projects</h2>

            <p>
              Projects assigned by your Project Lead / HOD
              will appear here.
            </p>
          </div>

          <div className="projects-count">
            <span>{projects.length}</span>
            <small>Projects</small>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="dashboard-message">
            <div className="loading-spinner" />
            <p>Loading your projects...</p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="dashboard-message dashboard-error">
            {error}
          </div>
        )}

        {/* EMPTY PROJECT STATE */}

        {!loading && !error && projects.length === 0 && (
          <div className="empty-project-state">
            <div className="empty-project-illustration">
              <div className="empty-illustration-circle">
                📁
              </div>

              <span className="empty-sparkle">✦</span>
              <span className="empty-dot" />
            </div>

            <div className="empty-project-content">
              <span className="empty-project-label">
                PROJECT WORKSPACE
              </span>

              <h3>No Projects Assigned Yet</h3>

              <p>
                Projects assigned by your Project Lead / HOD
                will appear here.
              </p>

              <div className="empty-project-status">
                <span />
                Waiting for project assignment
              </div>
            </div>
          </div>
        )}

        {/* ASSIGNED PROJECT CARDS */}

        {!loading && !error && projects.length > 0 && (
          <div className="project-list">
            {projects.map((project, index) => (
              <div
                className="student-project-card"
                key={project.project_id}
              >
                <div className="project-card-top">
                  <div className="project-card-icon">
                    {["📁", "💡", "🚀", "⚡"][index % 4]}
                  </div>

                  <span className="project-number">
                    PROJECT {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3>{project.project_name}</h3>

                <p>
                  {project.description ||
                    "No description available."}
                </p>

                <div className="project-card-footer">
                  <span className="project-status-label">
                    STATUS
                  </span>

                  <span
                    className={`project-status ${getStatusClass(
                      project.status
                    )}`}
                  >
                    {project.status || "Not specified"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}

      <footer className="dashboard-footer">
        <p>Your ideas. Your team. Your success.</p>
      </footer>
    </main>
  );
}
