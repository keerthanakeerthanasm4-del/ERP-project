
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectLeadDashboard.css";

const API_URL = window.location.hostname === "127.0.0.1" ? "http://127.0.0.1:5000" : "http://localhost:5000";

export default function ProjectLeadDashboard() {
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
      } catch {
        localStorage.removeItem("user");
      }
    }

    fetchMyProjects();
  }, []);

  async function fetchMyProjects() {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/project-lead/my-projects`,
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
    } catch (err) {
      console.error("Project Lead Dashboard:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  }

  function openProject(project) {
    navigate(
      `/project-lead/projects/${project.project_id}`
    );
  }

  // Count unique members across all projects.
  const uniqueMembers = new Set();

  projects.forEach((project) => {
    const members = project.members || project.team_members || [];

    members.forEach((member) => {
      const identifier =
        member.usn || member.email || member.user_id;

      if (identifier) {
        uniqueMembers.add(String(identifier).toLowerCase());
      }
    });
  });

  const activeProjects = projects.filter(
    (project) =>
      String(project.status || "").toLowerCase() === "active"
  ).length;

  const completedProjects = projects.filter(
    (project) =>
      String(project.status || "").toLowerCase() === "completed"
  ).length;

  function getProgress(project) {
    const progress = Number(project.progress ?? 0);
    return Math.min(100, Math.max(0, progress));
  }

  return (
    <main className="pl-dashboard-page">

      {/* NAVIGATION BAR */}
      <header className="pl-dashboard-header">

        <div className="pl-dashboard-brand">
          <span className="pl-dashboard-logo">🎓</span>
          <span>Project Portal</span>
        </div>

        <nav className="pl-header-navigation">
          <button
            className="pl-nav-link pl-nav-active"
            onClick={() => navigate("/project-lead/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="pl-nav-link"
            onClick={() => navigate("/project-lead/profile")}
          >
            Profile
          </button>
        </nav>

        <div className="pl-dashboard-user">

          <div className="pl-user-profile-icon">
            {user?.name?.charAt(0).toUpperCase() || "P"}
          </div>

          <span>{user?.name || "Project Lead"}</span>

          <button
            className="pl-dashboard-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* WELCOME BANNER */}
      <section className="pl-welcome-banner">

        <div className="pl-banner-content">

          <h1>
            Welcome, {user?.name || "Project Lead"}! 👋
          </h1>

          <p>
            Manage your projects, monitor progress and
            coordinate your project teams.
          </p>

          <div className="pl-banner-accent"></div>

        </div>

      </section>

      {/* DASHBOARD CONTENT */}
      <section className="pl-dashboard-content">

        <div className="pl-section-heading">
          <div>
            <h2>Dashboard Overview</h2>
            <p>Here is your project management summary.</p>
          </div>

          <button
            className="pl-create-project-btn"
            onClick={() => navigate("/project-lead/create-project")}
          >
            + Create Project
          </button>
        </div>

        {/* LOADING AND ERROR */}
        {loading && (
          <p className="pl-dashboard-message">
            Loading dashboard...
          </p>
        )}

        {!loading && error && (
          <p className="pl-dashboard-message pl-dashboard-error">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>

            {/* SUMMARY CARDS */}
            <div className="pl-stats-grid">

              <div className="pl-stat-card">
                <div className="pl-stat-icon">📁</div>
                <div>
                  <p>Total Projects</p>
                  <h2>{projects.length}</h2>
                  <span>Projects under your management</span>
                </div>
              </div>

              <div className="pl-stat-card">
                <div className="pl-stat-icon">🚀</div>
                <div>
                  <p>Active Projects</p>
                  <h2>{activeProjects}</h2>
                  <span>Currently in progress</span>
                </div>
              </div>

              <div className="pl-stat-card">
                <div className="pl-stat-icon">✅</div>
                <div>
                  <p>Completed Projects</p>
                  <h2>{completedProjects}</h2>
                  <span>Successfully completed</span>
                </div>
              </div>

              <div className="pl-stat-card">
                <div className="pl-stat-icon">👥</div>
                <div>
                  <p>Team Members</p>
                  <h2>{uniqueMembers.size}</h2>
                  <span>Unique assigned users</span>
                </div>
              </div>

            </div>

            {/* MY PROJECTS */}
            <section className="pl-assigned-projects">

              <div className="pl-project-heading">
                <div>
                  <h2>My Projects</h2>
                  <p>View and manage your assigned projects.</p>
                </div>

                <span className="pl-project-count">
                  {projects.length} Projects
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="pl-dashboard-message">
                  <div className="pl-empty-icon">📂</div>
                  <h3>No Projects Available</h3>
                  <p>
                    You haven't created or received any projects yet.
                  </p>

                  <button
                    className="pl-create-project-btn"
                    onClick={() =>
                      navigate("/project-lead/create-project")
                    }
                  >
                    Create Your First Project
                  </button>
                </div>
              ) : (

                <div className="pl-project-grid">

                  {projects.map((project) => (

                    <article
                      className="pl-project-card"
                      key={project.project_id}
                      onClick={() => openProject(project)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          openProject(project);
                        }
                      }}
                    >

                      <div className="pl-project-card-top">

                        <div className="pl-project-icon">
                          📋
                        </div>

                        <span
                          className={`pl-project-status ${
                            String(project.status || "")
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                          }`}
                        >
                          {project.status || "Not Started"}
                        </span>

                      </div>

                      <h3>{project.project_name}</h3>

                      <p className="pl-project-description">
                        {project.description ||
                          "No project description available."}
                      </p>

                      <div className="pl-project-meta">
                        <span>
                          Project ID: {project.project_id}
                        </span>

                        <span>
                          👥 {(project.members ||
                            project.team_members || []).length} Members
                        </span>
                      </div>

                      <div className="pl-progress-heading">
                        <span>Project Progress</span>
                        <strong>{getProgress(project)}%</strong>
                      </div>

                      <div className="pl-progress-track">
                        <div
                          className="pl-progress-fill"
                          style={{
                            width: `${getProgress(project)}%`
                          }}
                        ></div>
                      </div>

                      <button
                        className="pl-view-project-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProject(project);
                        }}
                      >
                        View Project →
                      </button>

                    </article>

                  ))}

                </div>
              )}

            </section>

          </>
        )}

      </section>

    </main>
  );
}
