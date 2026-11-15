import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProjectDetails.css";

const API_URL = window.location.hostname === "127.0.0.1" ? "http://127.0.0.1:5000" : "http://localhost:5000";
const ROLE_LABELS = { TEAM_LEAD: "Team Lead", TECH_LEAD: "Tech Lead", TEAM_MEMBER: "Team Member" };

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [usn, setUsn] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TEAM_MEMBER");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const token = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  async function loadProject() {
    try {
      const response = await fetch(`${API_URL}/api/project-lead/projects/${encodeURIComponent(projectId)}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) navigate("/login");
        setError(data.message || "Unable to load project details.");
        return;
      }
      setProject(data.project);
    } catch (err) {
      console.error("Load project details:", err);
      setError("Unable to connect to the backend.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (!token()) { navigate("/login"); return; }
    loadProject();
  }, [projectId]);

  async function addUser(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/project-lead/projects/${encodeURIComponent(projectId)}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ usn: usn.trim(), email: email.trim(), role }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message || "Unable to add user."); return; }
      setMessage(`${data.member.name} added as ${ROLE_LABELS[data.member.role]}.`);
      setUsn(""); setEmail(""); setRole("TEAM_MEMBER");
      setShowAddForm(false);
      await loadProject();
    } catch (err) {
      console.error("Add project member:", err);
      setError("Unable to connect to the backend.");
    } finally { setSaving(false); }
  }

  return (
    <main className="pd-page">
      <header className="pd-header"><strong>🎓 Project Portal</strong><button onClick={() => navigate("/project-lead/dashboard")}>Back to Dashboard</button></header>
      <div className="pd-content">
        <button className="pd-back" onClick={() => navigate("/project-lead/dashboard")}>← Projects</button>
        {loading ? <p>Loading project…</p> : error && !project ? <p className="pd-error">{error}</p> : project && <>
          <section className="pd-project-card">
            <div className="pd-project-heading">
              <div>
                <p className="pd-eyebrow">PROJECT DETAILS</p>
                <h1>{project.project_name}</h1>
              </div>
              <button className="pd-add-user" onClick={() => { setError(""); setMessage(""); setShowAddForm(value => !value); }}>
                {showAddForm ? "Close" : "+ Add User"}
              </button>
            </div>
            <div className="pd-meta"><span><b>Project ID</b>{project.project_id}</span><span><b>Deadline</b>{project.deadline ? new Date(project.deadline).toLocaleDateString() : "Not set"}</span><span><b>Status</b>{project.status}</span></div>
            {showAddForm && <div className="pd-add-user-panel">
              <p>Add a registered user by matching their USN and email.</p>
              {message && <div className="pd-success" role="status">{message}</div>}
              {error && <div className="pd-error" role="alert">{error}</div>}
              <form className="pd-form" onSubmit={addUser}>
                <label htmlFor="member-usn">USN</label><input id="member-usn" value={usn} onChange={e => setUsn(e.target.value)} required placeholder="Enter user's USN" />
                <label htmlFor="member-email">Email</label><input id="member-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter user's registered email" />
                <label htmlFor="member-role">Role</label><select id="member-role" value={role} onChange={e => setRole(e.target.value)}><option value="TEAM_LEAD">Team Lead</option><option value="TECH_LEAD">Tech Lead</option><option value="TEAM_MEMBER">Team Member</option></select>
                <div className="pd-form-actions"><button type="button" className="pd-cancel" onClick={() => setShowAddForm(false)} disabled={saving}>Cancel</button><button className="pd-submit" disabled={saving}>{saving ? "Adding user…" : "Add User"}</button></div>
              </form>
            </div>}
          </section>
          <section className="pd-members-card">
            <h2>Assigned users ({project.members.length})</h2>
            {project.members.length === 0 ? <p className="pd-empty">No users have been assigned yet.</p> : <div className="pd-member-list">{project.members.map(member => <article className="pd-member" key={member.user_id}><div><strong>{member.name}</strong><span>{member.usn || "No USN"} · {member.email}</span></div><b>{ROLE_LABELS[member.role]}</b></article>)}</div>}
          </section>
        </>}
      </div>
    </main>
  );
}
