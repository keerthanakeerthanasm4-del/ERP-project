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
} from "lucide-react";

function CreateProjectLead() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    temporaryPassword: "",
  });

  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState("");
  const [projectLeadSearch, setProjectLeadSearch] = useState("");
  const [projectLeadDropdownOpen, setProjectLeadDropdownOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:5000";

  // READ API RESPONSE
  const readApiResponse = async (response) => {
    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `Server returned HTML instead of JSON. HTTP Status: ${response.status}. Check the backend API route.`
      );
    }
  };

  // FETCH PROJECT LEAD ACCOUNTS
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

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch Project Leads");
      }

      setLeads(
        (data.leads || []).map((lead) => ({
          id: lead.user_id,
          name: lead.name,
          email: lead.email,
          department: lead.dept_name || "Not specified",
        }))
      );
    } catch (error) {
      console.error("Fetch Project Leads Error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // FETCH CURRENT DEPARTMENT ASSIGNMENT
  const fetchCurrentAssignment = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/hod/department-assignment`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch assignment");
      }

      setCurrentAssignment(data.assignment || null);
    } catch (error) {
      console.error("Fetch Assignment Error:", error);
      setMessage(error.message);
    }
  };
// FETCH PROJECT LEAD ASSIGNMENT HISTORY
const fetchAssignmentHistory = async () => {
  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/hod/department-assignment-history`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await readApiResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch assignment history");
    }

    setHistory(data || []);
  } catch (error) {
    console.error("Fetch Assignment History Error:", error);
    setMessage(error.message);
  }
};
  // LOAD DATA WHEN PAGE OPENS
  useEffect(() => {
  fetchProjectLeads();
  fetchCurrentAssignment();
  fetchAssignmentHistory();
}, []);

  // CREATE PERMANENT PROJECT LEAD MODULE ACCOUNT
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
            temporaryPassword: form.temporaryPassword,
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create Project Lead");
      }

      setForm({
        name: "",
        email: "",
        department: "",
    temporaryPassword: "",
      });

      setMessage(
        `Permanent Project Lead account created successfully! Temporary password: ${data.temporaryPassword}`
      );
    } catch (error) {
      console.error("Create Project Lead Error:", error);
      setMessage(error.message);
    }
  };

  // ASSIGN OR CHANGE DEPARTMENT PROJECT LEAD
  const handleAssignLead = async () => {
    if (!selectedLead || !studentEmail.trim() || !studentPassword) {
      setMessage(
        "Select a Project Lead account and enter its registered email and password."
      );
      return;
    }

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/hod/department-assignment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: selectedLead,
            email: studentEmail.trim(),
            password: studentPassword,
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign Project Lead");
      }

      setMessage(data.message);
      setSelectedLead("");
      setStudentEmail("");
      setStudentPassword("");

      await fetchCurrentAssignment();
      await fetchAssignmentHistory();
    } catch (error) {
      console.error("Assign Project Lead Error:", error);
      setMessage(error.message);
    }
  };

  // REMOVE DEPARTMENT PROJECT LEAD
  const handleRemoveAssignment = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove the current Project Lead assignment?"
    );

    if (!confirmed) return;

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/hod/department-assignment`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove assignment");
      }

      setCurrentAssignment(null);
      setMessage(data.message);
      await fetchAssignmentHistory();
    } catch (error) {
      console.error("Remove Project Lead Error:", error);
      setMessage(error.message);
    }
  };

  // SEARCH PROJECT LEAD ACCOUNTS
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
          <p>Create the permanent account and manage department assignments.</p>
        </div>

        <div className="pl-header-badge">
          <UserPlus size={18} />
          HOD Control Panel
        </div>
      </div>

      {/* NOTIFICATION */}
      {message && (
        <div className="pl-message">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {/* CREATE PERMANENT ACCOUNT */}
      <div className="pl-main-card">

        <div className="pl-section-title">
          <div className="pl-title-icon">
            <UserPlus size={22} />
          </div>

          <div>
            <h2>Create New Project Lead</h2>
            <p>Create the permanent Project Lead module account.</p>
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
              <label htmlFor="project-lead-temporary-password">Temporary Password</label>
              <input
                id="project-lead-temporary-password"
                type="password"
                placeholder="Set a temporary password (at least 8 characters)"
                value={form.temporaryPassword}
                onChange={(e) => setForm({ ...form, temporaryPassword: e.target.value })}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="pl-form-group">              <label>Department</label>
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

      {/* DEPARTMENT PROJECT LEAD ASSIGNMENT */}
      <div className="pl-main-card">

        <div className="pl-section-title">
          <div className="pl-title-icon purple">
            <ArrowRightLeft size={22} />
          </div>

          <div>
            <h2>Add & Manage Project Leads</h2>
            <p>Assign, view, change or remove the department Project Lead.</p>
          </div>
        </div>

        {/* ASSIGNMENT FORM */}
        <div className="pl-assignment-form">

          <div className="pl-form-group">
            <label>Select Project Lead</label>

            <div className="pl-searchable-select">
              <button
                type="button"
                className="pl-searchable-select-trigger"
                aria-haspopup="listbox"
                aria-expanded={projectLeadDropdownOpen}
                onClick={() => setProjectLeadDropdownOpen((open) => !open)}
              >
                {leads.find((lead) => String(lead.id) === selectedLead)
                  ? `${leads.find((lead) => String(lead.id) === selectedLead).name} (${leads.find((lead) => String(lead.id) === selectedLead).email})`
                  : "Choose Project Lead"}
                <span aria-hidden="true">▾</span>
              </button>

              {projectLeadDropdownOpen && (
                <div className="pl-searchable-select-menu">
                  <input
                    type="search"
                    placeholder="Search by name or email"
                    value={projectLeadSearch}
                    onChange={(e) => setProjectLeadSearch(e.target.value)}
                    aria-label="Search registered users"
                    autoFocus
                  />
                  <div role="listbox" aria-label="Registered users">
                    {leads
                      .filter((lead) =>
                        `${lead.name} ${lead.email}`
                          .toLowerCase()
                          .includes(projectLeadSearch.trim().toLowerCase())
                      )
                      .map((lead) => (
                        <button
                          type="button"
                          role="option"
                          aria-selected={String(lead.id) === selectedLead}
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(String(lead.id));
                            setStudentEmail("");
                            setStudentPassword("");
                            setProjectLeadDropdownOpen(false);
                            setProjectLeadSearch("");
                          }}
                        >
                          {lead.name} ({lead.email})
                        </button>
                      ))}
                    {leads.filter((lead) =>
                      `${lead.name} ${lead.email}`
                        .toLowerCase()
                        .includes(projectLeadSearch.trim().toLowerCase())
                    ).length === 0 && <p>No registered users found.</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pl-form-group">
            <label>Project Lead Email</label>

            <input
              type="email"
              placeholder="Enter the account email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            />
          </div>

          <div className="pl-form-group">
            <label>Project Lead Password</label>

            <input
              type="password"
              placeholder="Enter the account password"
              value={studentPassword}
              onChange={(e) => setStudentPassword(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="pl-assign-button"
            onClick={handleAssignLead}
          >
            <UserPlus size={17} />
            Assign Lead
          </button>

        </div>

        <hr className="pl-assignment-divider" />

        {/* CURRENT ASSIGNMENT */}
        <div className="pl-section-title pl-existing-heading">
          <div className="pl-title-icon">
            <FolderKanban size={22} />
          </div>

          <div>
            <h2>Current Assignment</h2>
            <p>Current department-wide Project Lead.</p>
          </div>
        </div>

        <div className="pl-project-list">

          {currentAssignment ? (

            <div className="pl-project-row">

              <div className="pl-project-icon">
                <UserRound size={22} />
              </div>

              <div className="pl-project-info">
                <h3>{currentAssignment.name}</h3>

                <p>
                  Project Lead: {currentAssignment.email}
                </p>

                <p>
                  Department: {currentAssignment.dept_name || "Not specified"}
                </p>
              </div>

              <span className="pl-assigned-status">
                Assigned
              </span>

              <button
                className="pl-remove-button"
                onClick={handleRemoveAssignment}
                title="Remove department assignment"
              >
                <Trash2 size={17} />
              </button>

            </div>

          ) : (

            <p className="pl-empty-message">
              No Project Lead is currently assigned to this department.
            </p>

          )}

        </div>

      </div>

{/* PROJECT LEAD ASSIGNMENT HISTORY */}
<div className="pl-main-card">

  <div className="pl-section-title">
    <div className="pl-title-icon">
      <Users size={22} />
    </div>

    <div>
      <h2>Project Lead Assignment History</h2>
      <p>View previously assigned department Project Leads.</p>
    </div>
  </div>

  <div className="pl-history-table-wrapper">

    <table className="pl-history-table">

      <thead>
        <tr>
          <th>Sl. No.</th>
          <th>Project Lead</th>
          <th>Email</th>
          <th>Department</th>
          <th>Assigned On</th>
          <th>Relieved On</th>
        </tr>
      </thead>

      <tbody>
        {history.length > 0 ? (
          history.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.assignedName}</td>
              <td>{item.assignedEmail}</td>
              <td>{item.department || "Not specified"}</td>
              <td>
                {new Date(item.assignedAt).toLocaleDateString("en-IN")}
              </td>
              <td>
                {item.relievedAt
                  ? new Date(item.relievedAt).toLocaleDateString("en-IN")
                  : "Currently Assigned"}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="pl-history-empty">
              No Project Lead assignment history available.
            </td>
          </tr>
        )}
      </tbody>

    </table>

  </div>

</div>

    </div>
  );
}

export default CreateProjectLead;
