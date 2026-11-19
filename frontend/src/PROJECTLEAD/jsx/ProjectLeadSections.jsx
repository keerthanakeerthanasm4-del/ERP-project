import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ProjectLeadSections.css";
const API = window.location.hostname === "127.0.0.1" ? "http://127.0.0.1:5000" : "http://localhost:5000";
function useProjects() {
  const [projects, setProjects] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
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
export function ProjectLeadTeam() {
  const {
    projects,
    loading,
    error,
    navigate
  } = useProjects();
  const members = new Map();
  projects.forEach(p => (p.members || []).forEach(m => {
    const old = members.get(m.user_id) || {
      ...m,
      projects: []
    };
    old.projects.push(p);
    members.set(m.user_id, old);
  }));
  return <main className="pl-feature-page"><div className="pl-feature-heading"><div><span>PEOPLE</span><h1>Team</h1><p>Users assigned to your projects and their roles.</p></div></div>{loading ? <p className="pl-section-state">Loading team…</p> : error ? <p className="pl-section-state is-error">{error}</p> : members.size === 0 ? <p className="pl-section-state">No users assigned yet. Open a project to add team members.</p> : <section className="pl-section-team-list">{[...members.values()].map(m => <article key={m.user_id} className="pl-section-team-row"><span className="pl-section-avatar">{m.name?.charAt(0)?.toUpperCase() || "U"}</span><div className="pl-section-team-info"><strong>{m.name}</strong><span>{m.usn || "USN not set"} · {m.email}</span><small>Projects: {m.projects.map(p => p.project_name).join(", ")}</small></div><span className="pl-section-role">{m.role?.replaceAll("_", " ")}</span><button onClick={() => navigate(`/project-lead/projects/${encodeURIComponent(m.projects[0].project_id)}`)}>View project</button></article>)}</section>}</main>;
}

export function ProjectLeadMeetings() {
  const { projects, loading, error } = useProjects();
  let user = {};
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { /* use the default storage key */ }
  const storageKey = `project-lead-meetings-${user.user_id || user.email || "default"}`;
  const [meetings, setMeetings] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); }
    catch { return []; }
  });
  const [form, setForm] = useState({ title: "", projectId: "", date: "", time: "", location: "", agenda: "" });
  const [saved, setSaved] = useState(false);

  function saveMeetings(next) {
    setMeetings(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const project = projects.find(item => String(item.project_id) === form.projectId);
    const meeting = { ...form, id: crypto.randomUUID(), projectName: project?.project_name || "General meeting" };
    saveMeetings([...meetings, meeting].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)));
    setForm({ title: "", projectId: "", date: "", time: "", location: "", agenda: "" });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }

  function removeMeeting(id) {
    saveMeetings(meetings.filter(meeting => meeting.id !== id));
  }

  const now = new Date();
  const upcoming = meetings.filter(meeting => new Date(`${meeting.date}T${meeting.time}`) >= now);
  const past = meetings.filter(meeting => new Date(`${meeting.date}T${meeting.time}`) < now).reverse();

  return <main className="pl-feature-page">
    <div className="pl-feature-heading"><div><span>WORKSPACE</span><h1>Meetings</h1><p>Schedule project meetings and keep the details in one place.</p></div></div>
    <div className="pl-meetings-layout">
      <form className="pl-meeting-form" onSubmit={handleSubmit}>
        <div className="pl-meeting-form-heading"><span className="pl-meetings-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg></span><div><h2>Schedule a meeting</h2><p>Add a meeting to your workspace calendar.</p></div></div>
        {saved && <p className="pl-meeting-success" role="status">Meeting scheduled successfully.</p>}
        {error && <p className="pl-section-state is-error">Projects could not be loaded. You can still schedule a general meeting.</p>}
        <label>Meeting title<input required maxLength="100" placeholder="e.g. Project progress review" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
        <label>Project<select value={form.projectId} onChange={event => setForm({ ...form, projectId: event.target.value })}><option value="">General meeting</option>{projects.map(project => <option key={project.project_id} value={project.project_id}>{project.project_name}</option>)}</select>{loading && <small>Loading your projects…</small>}</label>
        <div className="pl-meeting-form-row"><label>Date<input type="date" required min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} /></label><label>Time<input type="time" required value={form.time} onChange={event => setForm({ ...form, time: event.target.value })} /></label></div>
        <label>Location or meeting link<input maxLength="240" placeholder="Room number or video call URL" value={form.location} onChange={event => setForm({ ...form, location: event.target.value })} /></label>
        <label>Agenda / details<textarea rows="4" maxLength="1000" placeholder="Topics to discuss, notes, or preparation…" value={form.agenda} onChange={event => setForm({ ...form, agenda: event.target.value })} /></label>
        <button className="pl-meeting-submit" type="submit">＋ Schedule meeting</button>
      </form>
      <section className="pl-meeting-list-section">
        <div className="pl-meeting-list-heading"><div><span>YOUR CALENDAR</span><h2>Scheduled meetings</h2></div><b>{upcoming.length} upcoming</b></div>
        {upcoming.length === 0 ? <div className="pl-meeting-list-empty"><h3>No upcoming meetings</h3><p>Schedule a meeting to see it here.</p></div> : <div className="pl-meeting-cards">{upcoming.map(meeting => <article className="pl-meeting-card" key={meeting.id}>
          <div className="pl-meeting-card-top"><span className="pl-meeting-date">{new Date(`${meeting.date}T${meeting.time}`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span><button type="button" className="pl-meeting-delete" onClick={() => removeMeeting(meeting.id)} aria-label={`Delete ${meeting.title}`}>Delete</button></div>
          <h3>{meeting.title}</h3><p className="pl-meeting-project">{meeting.projectName} · {new Date(`${meeting.date}T${meeting.time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
          {meeting.location && <p className="pl-meeting-detail"><strong>Location:</strong> {/^https?:\/\//i.test(meeting.location) ? <a href={meeting.location} target="_blank" rel="noreferrer">Join meeting ↗</a> : meeting.location}</p>}
          {meeting.agenda && <p className="pl-meeting-agenda">{meeting.agenda}</p>}
        </article>)}</div>}
        {past.length > 0 && <details className="pl-meetings-past"><summary>Past meetings ({past.length})</summary><div className="pl-meeting-cards">{past.map(meeting => <article className="pl-meeting-card is-past" key={meeting.id}><span className="pl-meeting-date">{new Date(`${meeting.date}T${meeting.time}`).toLocaleString()}</span><h3>{meeting.title}</h3><p className="pl-meeting-project">{meeting.projectName}</p>{meeting.agenda && <p className="pl-meeting-agenda">{meeting.agenda}</p>}<button type="button" className="pl-meeting-delete" onClick={() => removeMeeting(meeting.id)}>Delete</button></article>)}</div></details>}
      </section>
    </div>
  </main>;
}
