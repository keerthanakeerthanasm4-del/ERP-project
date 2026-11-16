import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ProjectLeadDashboard.css";
const API_URL = window.location.hostname === "127.0.0.1" ? "http://127.0.0.1:5000" : "http://localhost:5000";
export default function ProjectLeadDashboard() {
  const [user, setUser] = useState(null),
    [projects, setProjects] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {}
    ;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetch(`${API_URL}/api/project-lead/my-projects`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) throw Error(d.message || "Unable to load dashboard.");
      setProjects(d.projects || []);
    }).catch(e => setError(e.message || "Unable to connect to the backend.")).finally(() => setLoading(false));
  }, []);
  const members = new Set();
  projects.forEach(p => (p.members || []).forEach(m => members.add(m.user_id)));
  const active = projects.filter(p => String(p.status).toLowerCase() === "active").length;
  const done = projects.filter(p => String(p.status).toLowerCase() === "completed").length;
  return <div className="pl-dashboard-content"><section className="pl-page-intro"><div><span className="pl-kicker">PROJECT WORKSPACE</span><h1>Welcome{user?.name ? `, ${user.name}` : " to SVCE Project Portal"}</h1><p>Manage your projects, coordinate your team, and keep work moving.</p></div><button className="pl-primary-action" onClick={() => navigate("/project-lead/create-project")}>＋ Create Project</button></section>
 <section className="pl-summary-banner"><div className="pl-summary-icon">▤</div><div className="pl-summary-copy"><span>YOUR WORKSPACE</span><h2>Project activity at a glance</h2><p>Review progress across projects and the people assigned to them.</p></div><div className="pl-summary-highlight"><strong>{String(projects.length).padStart(2, "0")}</strong><span>Projects you lead</span></div></section>
 {loading ? <div className="pl-state-panel">Loading your dashboard…</div> : error ? <div className="pl-state-panel pl-error-panel">{error}</div> : <>
 <section className="pl-stats-grid"><article className="pl-stat-card"><span className="pl-stat-icon blue">▤</span><div><span>Total projects</span><strong>{projects.length}</strong><small>Under your management</small></div></article><article className="pl-stat-card"><span className="pl-stat-icon cyan">●</span><div><span>Active projects</span><strong>{active}</strong><small>Currently in progress</small></div></article><article className="pl-stat-card"><span className="pl-stat-icon violet">✓</span><div><span>Completed</span><strong>{done}</strong><small>Successfully finished</small></div></article><article className="pl-stat-card"><span className="pl-stat-icon indigo">♧</span><div><span>Team members</span><strong>{members.size}</strong><small>Across your projects</small></div></article></section>
 <section className="pl-dashboard-actions"><button className="pl-action-card" onClick={() => navigate("/project-lead/projects")}><span className="pl-action-icon">▤</span><span><strong>View projects</strong><small>Open project list and details</small></span><b>→</b></button><button className="pl-action-card" onClick={() => navigate("/project-lead/team")}><span className="pl-action-icon purple">♧</span><span><strong>Manage your team</strong><small>See assigned users and roles</small></span><b>→</b></button></section>
 </>}</div>;
}
