import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import Particles from "./Particles.jsx";
import "../css/ProjectLeadLayout.css";
import "../css/ProjectLeadMotion.css";
export default function ProjectLeadLayout() {
  const navigate = useNavigate();
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  let user = null;

  try {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "PROJECT_LEAD") {
    return <Navigate to="/dashboard" replace />;
  }
  const initials = user.name?.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase() || "PL";
  function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }
  return <main className="pl-app-shell">
    <div className="pl-global-particles" aria-hidden="true">
      <Particles
        particleColors={["#ffffff", "#d9b8ff", "#8b5cf6"]}
        particleCount={200}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={36}
        glow={0.5}
        twinkle={0.3}
        moveParticlesOnHover
        hoverEffect="parallax"
        sizeRandomness={1}
        shape="circle"
        depthOfField={0}
        connections={false}
        particleHoverFactor={1}
        hoverRadius={140}
        drift="none"
        driftSpeed={1}
        alphaParticles={false}
        disableRotation={false}
        cameraDistance={20}
        variation={0}
        opacity={0.78}
        clickBurst
        intro
        lightMode={false}
      />
    </div>
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
        <NavLink to="/project-lead/profile" end className={({
          isActive
        }) => `pl-side-link${isActive ? " is-active" : ""}`}><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg><span>Profile</span></NavLink>
        <NavLink
          to="/project-lead/create-project"
          className={({ isActive }) =>
              `pl-side-link${isActive ? " is-active" : ""}`
          }
          >
          Create Project
      </NavLink>
      </nav>
      <div className="pl-sidebar-bottom"><div className="pl-sidebar-note"><span className="pl-note-dot" /><div><strong>Project Lead</strong><small>Manage your workspace</small></div></div><button className="pl-sidebar-logout" onClick={logout}>Log out</button></div>
    </aside>
    <section className="pl-main-area">
      <header className="pl-topbar"><div className="pl-breadcrumb"><span>Workspace</span><b>/</b><strong>{location.pathname.split("/").filter(Boolean).slice(-1)[0]?.replaceAll("-", " ") || "Dashboard"}</strong></div><button className="pl-account-button" onClick={() => navigate("/project-lead/profile")}><span className="pl-account-avatar">{initials}</span><span className="pl-account-copy"><strong>{user.name || "Project Lead"}</strong><small>Project Lead</small></span><span className="pl-account-chevron">⌄</span></button></header>
      <Outlet />
    </section>
  </main>;
}
