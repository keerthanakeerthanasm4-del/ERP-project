import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ProjectLeadProfile.css";
const API_URL = "http://localhost:5000";
export default function ProjectLeadProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    usn: "",
    phone: "",
    department: "",
    designation: "Project Lead",
    employee_id: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      setProfile(previous => ({
        ...previous,
        name: user.name || "",
        email: user.email || "",
        usn: user.usn || "",
        phone: user.phone || "",
        department: user.department || "",
        designation: user.designation || "Project Lead",
        employee_id: user.employee_id || user.employeeId || ""
      }));
    } catch (err) {
      console.error("Invalid user information:", err);
    }
    fetchProfile();
  }, []);
  async function fetchProfile() {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`${API_URL}/api/project-lead/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data.profile || data;
        setProfile(previous => ({
          ...previous,
          ...userData
        }));
      }
    } catch (err) {
      console.error("Profile loading:", err);
    } finally {
      setLoading(false);
    }
  }
  function handleChange(e) {
    const {
      name,
      value
    } = e.target;
    setProfile(previous => ({
      ...previous,
      [name]: value
    }));
  }
  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/project-lead/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }
      const updatedProfile = data.user || data.profile || profile;
      setProfile(previous => ({
        ...previous,
        ...updatedProfile
      }));
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...storedUser,
        ...updatedProfile
      }));
      setMessage("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Profile update:", err);
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }
  function handleCancel() {
    setEditMode(false);
    setMessage("");
    setError("");
    fetchProfile();
  }
  function handleLogout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }
  if (loading) {
    return <main className="pl-profile-page">
        <p className="pl-profile-message">
          Loading profile...
        </p>
      </main>;
  }
  return <main className="pl-profile-page">

      {/* WELCOME BANNER */}
      <section className="pl-profile-banner">

        <div>
          <h1>My Profile 👤</h1>
          <p>
            View and manage your personal and professional
            information.
          </p>

          <div className="pl-profile-accent"></div>
        </div>

      </section>

      {/* PROFILE CONTENT */}
      <section className="pl-profile-content">

        {message && <div className="pl-profile-success">
            {message}
          </div>}

        {error && <div className="pl-profile-error">
            {error}
          </div>}

        {/* PROFILE CARD */}
        <div className="pl-profile-card">

          {/* PROFILE TOP */}
          <div className="pl-profile-card-top">

            <div className="pl-profile-avatar">
              {profile.name?.charAt(0).toUpperCase() || "P"}
            </div>

            <div className="pl-profile-heading">

              <h2>{profile.name || "Project Lead"}</h2>

              <p>{profile.designation}</p>

              <span className="pl-profile-role">
                Project Lead
              </span>

            </div>

            {!editMode && <button className="pl-edit-profile-btn" onClick={() => setEditMode(true)}>
                ✏ Edit Profile
              </button>}

          </div>

          <div className="pl-profile-divider"></div>

          {/* PERSONAL INFORMATION */}
          <section className="pl-profile-section">

            <h3>Personal Information</h3>

            <div className="pl-profile-grid">

              <div className="pl-profile-field">
                <label>Full Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleChange} disabled={!editMode} placeholder="Enter your name" />
              </div>

              <div className="pl-profile-field">
                <label>Email Address</label>
                <input type="email" name="email" value={profile.email} disabled placeholder="Enter your email" />
              </div>

              <div className="pl-profile-field">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={profile.phone} onChange={handleChange} disabled={!editMode} placeholder="Enter phone number" />
              </div>

              <div className="pl-profile-field">
                <label>USN / Employee ID</label>
                <input type="text" value={profile.usn || profile.employee_id} disabled placeholder="Not available" />
              </div>

            </div>

          </section>

          <div className="pl-profile-divider"></div>

          {/* PROFESSIONAL INFORMATION */}
          <section className="pl-profile-section">

            <h3>Professional Information</h3>

            <div className="pl-profile-grid">

              <div className="pl-profile-field">
                <label>Designation</label>
                <input type="text" value="Project Lead" disabled />
              </div>

              <div className="pl-profile-field">
                <label>Department</label>
                <input type="text" name="department" value={profile.department} onChange={handleChange} disabled={!editMode} placeholder="Enter department" />
              </div>

              <div className="pl-profile-field">
                <label>Employee ID</label>
                <input type="text" value={profile.employee_id} disabled placeholder="Not available" />
              </div>

            </div>

          </section>

          {/* EDIT ACTIONS */}
          {editMode && <div className="pl-profile-actions">

              <button className="pl-profile-cancel" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>

              <button className="pl-profile-save" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>}

        </div>

      </section>

    </main>;
}
