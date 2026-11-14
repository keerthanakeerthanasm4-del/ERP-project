import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://localhost:5000";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchAssignedProjects();
  }, []);

  async function fetchAssignedProjects() {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
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

    navigate("/login");
  }

  return (
    <main className="dashboard-page">

      {/* NAVIGATION BAR */}
      <header className="dashboard-header">

        <div className="dashboard-brand">
          <span className="dashboard-logo">🎓</span>
          <span>Project Portal</span>
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

      {/* COLLEGE WELCOME BANNER */}
      <section className="college-welcome-banner">

        <div className="college-banner-content">

          <h1>
            Welcome, {user?.name || "Student"}! 👋
          </h1>

          <p>
            You have successfully logged in.
          </p>

          <div className="college-banner-accent"></div>

        </div>

      </section>

      {/* ASSIGNED PROJECTS */}
      <section className="assigned-projects">

        <h2>My Assigned Projects</h2>

        {loading && (
          <p className="dashboard-message">
            Loading your projects...
          </p>
        )}

        {!loading && error && (
          <p className="dashboard-message dashboard-error">
            {error}
          </p>
        )}

        {!loading && !error && projects.length === 0 && (
          <p className="dashboard-message">
            No projects assigned yet. Please wait for your
            Project Lead to assign a project.
          </p>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="project-list">

            {projects.map((project) => (
              <div
                className="student-project-card"
                key={project.project_id}
              >

                <h3>{project.project_name}</h3>

                <p>
                  {project.description ||
                    "No description available."}
                </p>

                <span className="project-status">
                  {project.status}
                </span>

              </div>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}