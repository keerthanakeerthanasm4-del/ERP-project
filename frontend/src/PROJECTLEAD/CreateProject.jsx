import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateProject.css";

const API_URL = "http://localhost:5000";

export default function CreateProject() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`${API_URL}/api/project-lead/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), projectId: projectId.trim(), deadline }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not create the project.");
        return;
      }
      navigate("/project-lead/dashboard", { state: { created: true } });
    } catch (err) {
      console.error("Create project:", err);
      setError("Unable to connect to the backend.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="create-project-page">
      <header className="cp-header">
        <span>🎓 Project Portal</span>
        <button type="button" onClick={() => navigate("/project-lead/dashboard")}>Back to Dashboard</button>
      </header>
      <section className="cp-card">
        <p className="cp-eyebrow">PROJECT LEAD</p>
        <h1>Create a project</h1>
        <p className="cp-intro">Enter the details to add a new project to your dashboard.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="project-name">Project name</label>
          <input id="project-name" value={name} onChange={e => setName(e.target.value)} required maxLength={150} placeholder="e.g. Campus Resource Portal" />
          <label htmlFor="project-id">Project ID</label>
          <input id="project-id" value={projectId} onChange={e => setProjectId(e.target.value)} required maxLength={80} placeholder="e.g. ERP-2026-01" />
          <label htmlFor="project-deadline">Deadline</label>
          <input id="project-deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required />
          {error && <p className="cp-error" role="alert">{error}</p>}
          <div className="cp-actions">
            <button type="button" className="cp-cancel" onClick={() => navigate("/project-lead/dashboard")}>Cancel</button>
            <button type="submit" className="cp-submit" disabled={saving}>{saving ? "Creating…" : "Create Project"}</button>
          </div>
        </form>
      </section>
    </main>
  );
}
