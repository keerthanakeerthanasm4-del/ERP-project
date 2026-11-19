import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../css/ProjectLeadLayout.css";
import "../css/ProjectLeadMotion.css";
export default function ProjectLeadLayout() {
  const navigate = useNavigate();
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {/* use default label */}
  const initials = user.name?.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase() || "PL";
  function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }
  return <main className="pl-app-shell">
    <aside className="pl-sidebar">
      <div className="pl-brand-lockup"><div className="pl-brand-mark">S</div><div><strong>SVCE</strong><span>Project Portal</span></div></div>
      <div className="pl-sidebar-rule" /><p className="pl-side-label">WORKSPACE</p>
      <nav className="pl-side-nav" aria-label="Main navigation">
        <NavLink to="/project-lead/dashboard" end className={({
          isActive
        }) => `pl-side-link${isActive ? " is-active" : ""}`}><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg><span>Dashboard</span></NavLink>
        <NavLink to="/project-lead/projects" className={({
          isActive
        }) => `pl-side-link${isActive ? " is-active" : ""}`}><svg viewBox="0 0 24 24"><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" /><path d="M3 10h18" /></svg><span>Projects</span></NavLink>
        <NavLink to="/project-lead/team" end className={({
          isActive
        }) => `pl-side-link${isActive ? " is-active" : ""}`}><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg><span>Team</span></NavLink>
        <NavLink to="/project-lead/profile" end className={({
          isActive
        }) => `pl-side-link${isActive ? " is-active" : ""}`}><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg><span>Profile</span></NavLink>
        <NavLink to="/project-lead/meetings" end className={({
          isActive
        }) => `pl-side-link${isActive ? " is-active" : ""}`}><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></svg><span>Meeting</span></NavLink>
      </nav>
      <div className="pl-sidebar-bottom"><div className="pl-sidebar-note"><span className="pl-note-dot" /><div><strong>Project Lead</strong><small>Manage your workspace</small></div></div><button className="pl-sidebar-logout" onClick={logout}>Log out</button></div>
    </aside>
    <section className="pl-main-area">
      <header className="pl-topbar"><div className="pl-breadcrumb"><span>Workspace</span><b>/</b><strong>{location.pathname.split("/").filter(Boolean).slice(-1)[0]?.replaceAll("-", " ") || "Dashboard"}</strong></div><button className="pl-account-button" onClick={() => navigate("/project-lead/profile")}><span className="pl-account-avatar">{initials}</span><span className="pl-account-copy"><strong>{user.name || "Project Lead"}</strong><small>Project Lead</small></span><span className="pl-account-chevron">⌄</span></button></header>
      <Outlet />
    </section>
  </main>;
}
