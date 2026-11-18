import { useState, useEffect } from "react";

function HODProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
   // Project Lead assignment states
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetchProjects();
  }, []);
  useEffect(() => {
  fetchProjectLeads();
}, []);

const fetchProjectLeads = async () => {
  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/hod/project-leads`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch Project Leads");
    }

    setLeads(data.leads || []);
  } catch (error) {
    console.error("Fetch Project Leads Error:", error);
    setMessage(error.message);
  }
};
  const fetchProjects = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/hod/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch projects");
      }

      setProjects(data.projects || []);
    } catch (error) {
      console.error("Fetch Projects Error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
const handleAssignLead = async (projectId, leadId) => {
  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/hod/projects/${projectId}/lead`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadId: leadId === "" ? null : Number(leadId),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Assignment failed");
    }

    setMessage("Project Lead assignment updated successfully!");

    await fetchProjects();

  } catch (error) {
    console.error("Assignment Error:", error);
    setMessage(error.message);
  }
};
  if (loading) {
    return <div className="hod-projects-page">Loading projects...</div>;
  }

  return (
    <div className="hod-projects-page">
      <h2>Projects</h2>
      <p>View and manage all college projects.</p>

      {message && <p>{message}</p>}

      {projects.length === 0 ? (
        <div>
          <h3>No Projects Available</h3>
          <p>
            Projects created by Project Leads will appear here.
          </p>
        </div>
      ) : (
        <div>
          {projects.map((project) => (
  <div key={project.project_id} className="hod-project-card">

    <h3>{project.project_name}</h3>

    <p>
      {project.description || "No description available"}
    </p>

    <p>
      <strong>Status:</strong> {project.status}
    </p>

    <p>
      <strong>Current Project Lead:</strong>{" "}
      {project.projectLead
        ? project.projectLead.name
        : "Not Assigned"}
    </p>

    <p>
      <strong> Project Lead Email:</strong>{" "}
      {project.projectLead
        ? project.projectLead.email
        : "Not Assigned"}
    </p>
    <button
  className="view-details-button"
  onClick={() => setSelectedProject(project)}
>
  View Details
</button>
    <hr />

    <h4>Manage Project Lead</h4>

    <select
      value={
        selectedLeads[project.project_id] ??
        project.projectLead?.user_id ??
        ""
      }
      onChange={(e) =>
        setSelectedLeads({
          ...selectedLeads,
          [project.project_id]: e.target.value,
        })
      }
    >
      <option value="">Remove / No Project Lead</option>

      {leads.map((lead) => (
        <option key={lead.id} value={lead.id}>
          {lead.name} - {lead.department}
        </option>
      ))}
    </select>

    <button
      onClick={() =>
        handleAssignLead(
          project.project_id,
          selectedLeads[project.project_id] ??
          project.projectLead?.user_id ??
          ""
        )
      }
    >
      Update Project Lead
    </button>

  </div>
))}
        </div>
      )}
      {selectedProject && (
  <div className="project-modal-overlay">
    <div className="project-details-modal">

      <div className="project-modal-header">
        <div>
          <h2>{selectedProject.project_name}</h2>
          <p>Project ID: {selectedProject.project_id}</p>
        </div>

        <button
          className="project-modal-close"
          onClick={() => setSelectedProject(null)}
        >
          ×
        </button>
      </div>

      <div className="project-modal-body">

        <div className="project-detail-item">
          <label>Description</label>
          <p>{selectedProject.description || "Not available"}</p>
        </div>

        <div className="project-detail-item">
          <label>Status</label>
          <p>{selectedProject.status}</p>
        </div>

        <div className="project-detail-item">
          <label>Start Date</label>
          <p>
            {selectedProject.start_date
              ? new Date(selectedProject.start_date).toLocaleDateString()
              : "Not available"}
          </p>
        </div>

        <div className="project-detail-item">
          <label>Deadline</label>
          <p>
            {selectedProject.deadline
              ? new Date(selectedProject.deadline).toLocaleDateString()
              : "Not available"}
          </p>
        </div>

        <div className="project-detail-item">
          <label>Project Lead</label>
          <p>
            {selectedProject.projectLead?.name || "Not Assigned"}
          </p>
        </div>

        <div className="project-detail-item">
          <label>Project Lead Email</label>
          <p>
            {selectedProject.projectLead?.email || "Not Assigned"}
          </p>
        </div>

      </div>

      <button
        className="project-modal-done"
        onClick={() => setSelectedProject(null)}
      >
        Close Details
      </button>

    </div>
  </div>
)}
    </div>
  );
}

export default HODProjects;