import { useState, useEffect } from "react";
import {
  UserPlus,
  Users,
  Search,
  Mail,
  Building2,
  FolderKanban,
  Plus,
  Trash2,
  UserRound,
  ArrowRightLeft,
  CheckCircle,
} from "lucide-react";

function CreateProjectLead() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

 const [projects, setProjects] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
  });

  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedLead, setSelectedLead] = useState("");
  const [message, setMessage] = useState("");
  const API_URL = "http://localhost:5000";

useEffect(() => {
  fetchProjectLeads();
}, []);
useEffect(() => {
  fetchProjects();
}, []);
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

    const formattedProjects = (data.projects || []).map((project) => ({
      id: project.project_id,
      name: project.project_name,
      leadEmail: project.projectLead?.email || "",
    }));

    setProjects(formattedProjects);
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    setMessage(error.message);
  }
};
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
  } finally {
    setLoading(false);
  }
};
  // CREATE PROJECT LEAD
const handleCreateLead = async (e) => {
  e.preventDefault();

  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/hod/create-project-lead`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          department: form.department,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Failed to create Project Lead.");
      return;
    }

    await fetchProjectLeads();

    setForm({
      name: "",
      email: "",
      department: "",
    });

    setMessage(
      `Project Lead created successfully! Temporary password: ${data.temporaryPassword}`
    );

  } catch (error) {
    console.error("Create Project Lead Error:", error);
    setMessage("Unable to connect to the server.");
  }
};

  // ASSIGN OR CHANGE PROJECT LEAD
  const handleAssignLead = () => {
    if (!selectedProject || !selectedLead) {
      setMessage("Please select both project and project lead.");
      return;
    }

    setProjects((previousProjects) =>
      previousProjects.map((project) =>
        project.id === Number(selectedProject)
          ? { ...project, leadEmail: selectedLead }
          : project
      )
    );

    setMessage("Project Lead assigned successfully!");
    setSelectedProject("");
    setSelectedLead("");
  };

  // REMOVE PROJECT LEAD FROM PROJECT
  const handleRemoveAssignment = (projectId) => {
    setProjects((previousProjects) =>
      previousProjects.map((project) =>
        project.id === projectId
          ? { ...project, leadEmail: "" }
          : project
      )
    );

    setMessage("Project Lead assignment removed successfully.");
  };

  // SEARCH PROJECT LEADS
  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="project-lead-page">

      {/* PAGE HEADER */}
      <div className="pl-page-header">
        <div>
          <h1>Create Project Lead</h1>
          <p>Create accounts and manage project lead assignments.</p>
        </div>

        <div className="pl-header-badge">
          <UserPlus size={18} />
          HOD Control Panel
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="pl-summary-grid">

        <div className="pl-summary-card">
          <div className="pl-summary-icon blue">
            <Users size={23} />
          </div>
          <div>
            <h3>{leads.length}</h3>
            <p>Total Project Leads</p>
          </div>
        </div>

        <div className="pl-summary-card">
          <div className="pl-summary-icon purple">
            <FolderKanban size={23} />
          </div>
          <div>
            <h3>{projects.filter((p) => p.leadEmail).length}</h3>
            <p>Assigned Projects</p>
          </div>
        </div>

        <div className="pl-summary-card">
          <div className="pl-summary-icon green">
            <CheckCircle size={23} />
          </div>
          <div>
            <h3>{projects.filter((p) => !p.leadEmail).length}</h3>
            <p>Unassigned Projects</p>
          </div>
        </div>

      </div>

      {/* NOTIFICATION */}
      {message && (
        <div className="pl-message">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {/* CREATE ACCOUNT */}
      <div className="pl-main-card">

        <div className="pl-section-title">
          <div className="pl-title-icon">
            <UserPlus size={22} />
          </div>

          <div>
            <h2>Create New Project Lead</h2>
            <p>Enter the details to create a Project Lead account.</p>
          </div>
        </div>

        <form onSubmit={handleCreateLead}>

          <div className="pl-form-grid">

            <div className="pl-form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />
            </div>

            <div className="pl-form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter college email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </div>

            <div className="pl-form-group">
              <label>Department</label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                required
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Science">Information Science</option>
                <option value="Electronics and Communication">
                  Electronics and Communication
                </option>
                <option value="Mechanical Engineering">
                  Mechanical Engineering
                </option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electrical and Electronics">
                  Electrical and Electronics
                </option>
              </select>
            </div>

          </div>

          <button type="submit" className="pl-create-button">
            <Plus size={18} />
            Create Project Lead
          </button>

        </form>

      </div>

      {/* ASSIGN PROJECT LEAD */}
      <div className="pl-main-card">

        <div className="pl-section-title">
          <div className="pl-title-icon purple">
            <ArrowRightLeft size={22} />
          </div>

          <div>
            <h2>Assign Project Lead</h2>
            <p>Assign or change the lead responsible for a project.</p>
          </div>
        </div>

        <div className="pl-assignment-form">

          <div className="pl-form-group">
            <label>Select Project</label>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Choose Project</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pl-form-group">
            <label>Select Project Lead</label>

            <select
              value={selectedLead}
              onChange={(e) => setSelectedLead(e.target.value)}
            >
              <option value="">Choose Project Lead</option>

              {leads.map((lead) => (
                <option key={lead.id} value={lead.email}>
                  {lead.name} ({lead.email})
                </option>
              ))}
            </select>
          </div>

          <button
            className="pl-assign-button"
            onClick={handleAssignLead}
          >
            <UserPlus size={17} />
            Assign Lead
          </button>

        </div>

      </div>

      {/* PROJECT ASSIGNMENT LIST */}
      <div className="pl-main-card">

        <div className="pl-section-title">
          <div className="pl-title-icon">
            <FolderKanban size={22} />
          </div>

          <div>
            <h2>Project Assignments</h2>
            <p>View and manage existing project lead assignments.</p>
          </div>
        </div>

        <div className="pl-project-list">

          {projects.map((project) => {
            const assignedLead = leads.find(
              (lead) => lead.email === project.leadEmail
            );

            return (
              <div className="pl-project-row" key={project.id}>

                <div className="pl-project-icon">
                  <FolderKanban size={22} />
                </div>

                <div className="pl-project-info">
                  <h3>{project.name}</h3>

                  <p>
                    {assignedLead
                      ? `Project Lead: ${assignedLead.name} (${assignedLead.email})`
                      : "No Project Lead assigned"}
                  </p>
                </div>

                <span
                  className={
                    assignedLead
                      ? "pl-assigned-status"
                      : "pl-unassigned-status"
                  }
                >
                  {assignedLead ? "Assigned" : "Unassigned"}
                </span>

                {assignedLead && (
                  <button
                    className="pl-remove-button"
                    onClick={() => handleRemoveAssignment(project.id)}
                    title="Remove assignment"
                  >
                    <Trash2 size={17} />
                  </button>
                )}

              </div>
            );
          })}

        </div>

      </div>

      {/* PROJECT LEAD ACCOUNTS */}
      <div className="pl-main-card">

        <div className="pl-section-title">
          <div className="pl-title-icon">
            <Users size={22} />
          </div>

          <div>
            <h2>Created Project Leads</h2>
            <p>Manage all Project Lead accounts.</p>
          </div>
        </div>

        <div className="pl-search-box">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search by name, email or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="pl-lead-list">

          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <div className="pl-lead-row" key={lead.id}>

                <div className="pl-lead-avatar">
                  <UserRound size={23} />
                </div>

                <div className="pl-lead-info">
                  <h3>{lead.name}</h3>

                  <p>
                    <Mail size={14} />
                    {lead.email}
                  </p>

                  <p>
                    <Building2 size={14} />
                    {lead.department}
                  </p>
                </div>

                <span className="pl-assigned-status">
                  {lead.status}
                </span>

              </div>
            ))
          ) : (
            <p className="pl-empty-message">No Project Leads found.</p>
          )}

        </div>

      </div>

    </div>
  );
}

export default CreateProjectLead;