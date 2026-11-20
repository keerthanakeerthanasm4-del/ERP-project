import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/ProjectDetails.css";
import { API_URL } from "../../api.js";
const ROLE_LABELS = {
  TEAM_LEAD: "Team Lead",
  TECH_LEAD: "Tech Lead",
  TEAM_MEMBER: "Team Member"
};
export default function ProjectDetails() {
  const {
    projectId
  } = useParams();
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
  const [showProgress, setShowProgress] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [memberActionMessage, setMemberActionMessage] = useState("");
  const [memberActionError, setMemberActionError] = useState("");
  const token = () => localStorage.getItem("token") || sessionStorage.getItem("token");
  async function loadProject() {
    try {
      const response = await fetch(`${API_URL}/api/project-lead/projects/${encodeURIComponent(projectId)}`, {
        headers: {
          Authorization: `Bearer ${token()}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) navigate("/login", { replace: true });
        setError(data.message || "Unable to load project details.");
        return;
      }
      setProject(data.project);
      setError("");
    } catch (err) {
      console.error("Load project details:", err);
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!token()) {
      navigate("/login", { replace: true });
      return;
    }
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({
          usn: usn.trim(),
          email: email.trim(),
          role
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Unable to add user.");
        return;
      }
      setMessage(`${data.member.name} added as ${ROLE_LABELS[data.member.role]}.`);
      setUsn("");
      setEmail("");
      setRole("TEAM_MEMBER");
      setShowAddForm(false);
      await loadProject();
    } catch (err) {
      console.error("Add project member:", err);
      setError("Unable to connect to the backend.");
    } finally {
      setSaving(false);
    }
  }
  async function removeUser(member) {
    const confirmed = window.confirm(
      `Remove ${member.name} from this project? They will remain in Previous users.`
    );
    if (!confirmed) return;

    setRemovingUserId(member.user_id);
    setMemberActionMessage("");
    setMemberActionError("");
    try {
      const response = await fetch(
        `${API_URL}/api/project-lead/projects/${encodeURIComponent(projectId)}/members/${member.user_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token()}` },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to remove user.");
      }

      setMemberActionMessage(data.message);
      await loadProject();
    } catch (err) {
      console.error("Remove project member:", err);
      setMemberActionError(err.message || "Unable to connect to the backend.");
    } finally {
      setRemovingUserId(null);
    }
  }
  const phases = project?.phases || [];
  const completedPhases = phases.filter(phase => phase.is_completed).length;
  const progressPercent = phases.length
    ? Math.round((completedPhases / phases.length) * 100)
    : 0;

  return <main className="pd-page">
      <div className="pd-content">
        <button className="pd-back" onClick={() => navigate("/project-lead/dashboard")}>← Projects</button>
        {loading ? <p>Loading project…</p> : error && !project ? <p className="pd-error">{error}</p> : project && <>
          <section className="pd-project-card">
            <div className="pd-project-heading">
              <div>
                <p className="pd-eyebrow">PROJECT DETAILS</p>
                <h1>{project.project_name}</h1>
              </div>
              <div className="pd-project-actions">
                <button className="pd-add-user" type="button" onClick={() => {
                  setError("");
                  setMessage("");
                  setShowAddForm(value => !value);
                }}>
                  {showAddForm ? "Close" : "+ Add User"}
                </button>
                <button
                  className="pd-progress-button"
                  type="button"
                  aria-expanded={showProgress}
                  onClick={() => setShowProgress(value => !value)}
                >
                  {showProgress ? "Hide Progress" : "See Progress"}
                </button>
              </div>
            </div>
            <div className="pd-meta"><span><b>Project ID</b>{project.project_id}</span><span><b>Deadline</b>{project.deadline ? new Date(project.deadline).toLocaleDateString() : "Not set"}</span><span><b>Status</b>{project.status}</span></div>
            {showProgress && <section className="pd-progress-panel" aria-label="Project progress">
              <div className="pd-progress-heading">
                <h2>Project Progress</h2>
                {phases.length > 0 && <strong>{progressPercent}%</strong>}
              </div>
              {phases.length === 0 ? <p className="pd-progress-empty">No progress phases have been added yet.</p> : <>
                <progress className="pd-progress-bar" value={progressPercent} max="100" aria-label={`${progressPercent}% complete`} />
                <p className="pd-progress-summary">{completedPhases} of {phases.length} phases complete</p>
                <ol className="pd-phase-list">
                  {phases.map(phase => <li key={phase.phase_id} className={phase.is_completed ? "is-complete" : ""}>
                    <span className="pd-phase-indicator" aria-hidden="true">{phase.is_completed ? "✓" : "○"}</span>
                    <span>{phase.phase_name}</span>
                    <span className="pd-phase-status">{phase.is_completed ? "Completed" : "In progress"}</span>
                  </li>)}
                </ol>
              </>}
            </section>}
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
            {memberActionMessage && <p className="pd-success" role="status">{memberActionMessage}</p>}
            {memberActionError && <p className="pd-error" role="alert">{memberActionError}</p>}
            {project.members.length === 0 ? <p className="pd-empty">No users have been assigned yet.</p> : <div className="pd-member-list">{project.members.map(member => <article className="pd-member" key={member.user_id}><div><strong>{member.name}</strong><span>{member.usn || "No USN"} · {member.email}</span></div><div className="pd-member-actions"><b>{ROLE_LABELS[member.role]}</b><button className="pd-remove-user" type="button" onClick={() => removeUser(member)} disabled={removingUserId !== null}>{removingUserId === member.user_id ? "Removing…" : "Remove"}</button></div></article>)}</div>}
          </section>
          <section className="pd-members-card pd-previous-members-card">
            <h2>Previous users ({project.previousMembers?.length || 0})</h2>
            {!project.previousMembers?.length ? <p className="pd-empty">Users removed from this project will appear here.</p> : <div className="pd-member-list">{project.previousMembers.map((member, index) => <article className="pd-member pd-previous-member" key={`${member.user_id}-${member.removed_at}-${index}`}><div><strong>{member.name}</strong><span>{member.usn || "No USN"} · {member.email}</span><small>Added {new Date(member.added_at).toLocaleDateString()} · Removed {new Date(member.removed_at).toLocaleDateString()}</small></div><b>{ROLE_LABELS[member.role]}</b></article>)}</div>}
          </section>
        </>}
      </div>
    </main>;
}
