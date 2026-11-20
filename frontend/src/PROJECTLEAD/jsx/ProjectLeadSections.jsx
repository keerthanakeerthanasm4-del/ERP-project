import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ProjectLeadSections.css";
import { API_URL as API } from "../../api.js";
function useProjects() {
  const [projects, setProjects] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    fetch(`${API}/api/project-lead/my-projects`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) throw Error(d.message || "Unable to load projects.");
      setProjects(d.projects || []);
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);
  return {
    projects,
    loading,
    error,
    navigate
  };
}
export function ProjectLeadProjects() {
  const {
    projects,
    loading,
    error,
    navigate
  } = useProjects();
  return <main className="pl-feature-page"><div className="pl-feature-heading"><div><span>YOUR WORK</span><h1>Projects</h1><p>Projects you created and manage.</p></div><button onClick={() => navigate("/project-lead/create-project")}>＋ Create Project</button></div>{loading ? <p className="pl-section-state">Loading projects…</p> : error ? <p className="pl-section-state is-error">{error}</p> : projects.length === 0 ? <p className="pl-section-state">No projects yet. Create one to get started.</p> : <div className="pl-section-project-grid">{projects.map(p => <article className="pl-section-project" key={p.project_id}><div className="pl-section-project-top"><span className="pl-project-symbol">▤</span><span className="pl-section-status">{p.status || "ACTIVE"}</span></div><h2>{p.project_name}</h2><p className="pl-section-id">Project ID: <b>{p.project_id}</b></p><div className="pl-section-detail"><span>Deadline</span><b>{p.deadline ? new Date(p.deadline).toLocaleDateString() : "Not set"}</b></div><div className="pl-section-detail"><span>Assigned users</span><b>{(p.members || []).length}</b></div><button className="pl-section-view" onClick={() => navigate(`/project-lead/projects/${encodeURIComponent(p.project_id)}`)}>View project →</button></article>)}</div>}</main>;
}
