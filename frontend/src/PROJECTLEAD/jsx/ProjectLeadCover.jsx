import { Navigate, useLocation, useNavigate } from "react-router-dom";
import OrbitalDawn from "./OrbitalDawn.jsx";
import "../css/ProjectLeadCover.css";

const lines = ["Welcome to", "PROJECT LEAD PAGE"];
const letterCount = lines.join("").replaceAll(" ", "").length;

function SignalHeading() {
  let index = 0;

  return (
    <h1 className="pl-signal-heading" aria-label={lines.join(" ")}>
      {lines.map((line) => (
        <span className="pl-signal-line" key={line} aria-hidden="true">
          {Array.from(line, (letter, position) => {
            if (letter === " ") return " ";
            // Spread consecutive letters across the 24 reveal slots.
            const slot = (index++ * 11 + 5) % letterCount;
            return (
              <span
                className="pl-signal-letter"
                key={position}
                style={{ animationDelay: (150 + slot * 45) + "ms" }}
              >
                {letter}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

export default function ProjectLeadCover() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  let role;
  try {
    role = JSON.parse(localStorage.getItem("user"))?.role;
  } catch {
    return <Navigate to="/login" replace />;
  }
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "PROJECT_LEAD") return <Navigate to="/dashboard" replace />;
  if (!location.state?.firstLoginCover) return <Navigate to="/project-lead/dashboard" replace />;


  return (
    <main className="pl-cover">
      <button
        type="button"
        className="pl-cover-enter"
        onClick={() => navigate("/project-lead/dashboard", { replace: true })}
      >
        <OrbitalDawn />
        <span className="pl-cover-prompt">Enter project dashboard <span aria-hidden="true">→</span></span>
      </button>
      <SignalHeading />
    </main>
  );
}
