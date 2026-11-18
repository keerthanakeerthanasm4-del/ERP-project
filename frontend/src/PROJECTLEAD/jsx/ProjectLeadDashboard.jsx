import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectLeadHorizon from "./ProjectLeadHorizon.jsx";
import "../css/ProjectLeadDashboard.css";

const API_URL =
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5000"
    : "http://localhost:5000";

export default function ProjectLeadDashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {
      setUser(null);
    }

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function loadProjects() {
      try {
        const response = await fetch(
          `${API_URL}/api/project-lead/my-projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load dashboard.");
        }

        setProjects(data.projects || []);
      } catch (requestError) {
        setError(
          requestError.message || "Unable to connect to the backend."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [navigate]);

  const members = new Set();
  projects.forEach((project) => {
    (project.members || []).forEach((member) => {
      members.add(member.user_id);
    });
  });

  const activeProjects = projects.filter(
    (project) => String(project.status).toLowerCase() === "active"
  ).length;
  const completedProjects = projects.filter(
    (project) => String(project.status).toLowerCase() === "completed"
  ).length;

  return (
    <div className="pl-dashboard-content">
      <section className="pl-landing-hero">
        <div className="pl-landing-backdrop" aria-hidden="true">
          <ProjectLeadHorizon />
        </div>
        <div className="pl-landing-overlay" aria-hidden="true" />
        <div className="pl-landing-content">
          <span className="pl-landing-eyebrow">SVCE · PROJECT LEAD WORKSPACE</span>
          <h1>Welcome back{user?.name ? `, ${user.name}` : ""}</h1>
          <p>Keep your projects moving. Check progress, support your team, and stay ahead of deadlines.</p>
          <button
            className="pl-primary-action"
            onClick={() => navigate("/project-lead/create-project")}
          >
            <span aria-hidden="true">＋</span> Create Project
          </button>
        </div>
        <div className="pl-landing-glance" aria-label="Workspace summary">
          <div>
            <strong>{projects.length}</strong>
            <span>Projects</span>
          </div>
          <div>
            <strong>{members.size}</strong>
            <span>Team members</span>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="pl-state-panel">Loading your dashboard…</div>
      ) : error ? (
        <div className="pl-state-panel pl-error-panel">{error}</div>
      ) : (
        <>
          <section className="pl-stats-grid">
            <article className="pl-stat-card">
              <span className="pl-stat-icon blue">▤</span>
              <div>
                <span>Total projects</span>
                <strong>{projects.length}</strong>
                <small>Under your management</small>
              </div>
            </article>

            <article className="pl-stat-card">
              <span className="pl-stat-icon cyan">●</span>
              <div>
                <span>Active projects</span>
                <strong>{activeProjects}</strong>
                <small>Currently in progress</small>
              </div>
            </article>

            <article className="pl-stat-card">
              <span className="pl-stat-icon violet">✓</span>
              <div>
                <span>Completed</span>
                <strong>{completedProjects}</strong>
                <small>Successfully finished</small>
              </div>
            </article>

            <article className="pl-stat-card">
              <span className="pl-stat-icon indigo">♧</span>
              <div>
                <span>Team members</span>
                <strong>{members.size}</strong>
                <small>Across your projects</small>
              </div>
            </article>
          </section>

          <section className="pl-dashboard-actions">
            <button
              className="pl-action-card"
              onClick={() => navigate("/project-lead/projects")}
            >
              <span className="pl-action-icon">▤</span>
              <span className="pl-action-copy">
                <strong>View projects</strong>
                <small>Open project list and details</small>
              </span>
              <b>→</b>
            </button>

            <button
              className="pl-action-card"
              onClick={() => navigate("/project-lead/team")}
            >
              <span className="pl-action-icon purple">♧</span>
              <span className="pl-action-copy">
                <strong>Manage your team</strong>
                <small>See assigned users and roles</small>
              </span>
              <b>→</b>
            </button>
          </section>
        </>
      )}
    </div>
  );
}



