import { useState, useRef, useEffect } from "react";

import {
  UserRound,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  ShieldCheck,
  Camera,
  Pencil,
  Save,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function HODProfile() {
  const [profileImage, setProfileImage] = useState(null);

  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // FETCH PROFILE FROM DATABASE
  const fetchProfile = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/hod/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load profile");
      }

      setProfile(data.profile);

setProfileImage(data.profile.profileImage || null);

if (data.profile.profileImage) {
  localStorage.setItem(
    "hodProfileImage",
    data.profile.profileImage
  );
} else {
  localStorage.removeItem("hodProfileImage");
}
    } catch (error) {
      console.error("Fetch HOD Profile Error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // HANDLE INPUT CHANGES
  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // SAVE PROFILE
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/hod/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          designation: profile.designation,
          employeeId: profile.employeeId,
          joiningDate: profile.joiningDate.slice(0, 10),
          email: profile.email,
          phone: profile.phone,
          department: profile.department,
          institution: profile.institution,
          location: profile.location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setProfile(data.profile);
      setEditMode(false);
      setMessage("Profile updated successfully!");

    } catch (error) {
      console.error("Update HOD Profile Error:", error);
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  // CANCEL EDITING
  const handleCancel = () => {
    setEditMode(false);
    setMessage("");
    fetchProfile();
  };

  // HANDLE PROFILE IMAGE
const handleImageChange = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image.");
    event.target.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Image size must be less than 2 MB.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onloadend = async () => {
    try {
      const imageURL = reader.result;

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/hod/profile/image`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profileImage: imageURL,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed");
      }

      setProfileImage(data.profileImage);

      localStorage.setItem(
        "hodProfileImage",
        data.profileImage
      );

      window.dispatchEvent(new Event("profileImageUpdated"));

      alert("Profile picture updated successfully!");

    } catch (error) {
      console.error("Profile image upload error:", error);
      alert(error.message || "Failed to update profile picture.");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsDataURL(file);
};

  // REUSABLE PROFILE FIELD
  const renderField = (label, name, icon = null, type = "text") => (
    <div className="profile-detail">
      <label>{label}</label>

      {editMode ? (
        <input
          className="profile-edit-input"
          type={type}
          name={name}
          value={
            type === "date"
              ? profile[name]?.slice(0, 10) || ""
              : profile[name] || ""
          }
          onChange={handleChange}
        />
      ) : (
        <p>
          {icon}
          {type === "date"
            ? new Date(profile[name]).toLocaleDateString("en-IN")
            : profile[name]}
        </p>
      )}
    </div>
  );

  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="profile-page">
        {message || "Unable to load HOD profile."}
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* PAGE HEADER */}
      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your personal information</p>
        </div>

        <div className="profile-role-badge">
          <ShieldCheck size={18} />
          HOD Account
        </div>
      </div>

      {/* PROFILE OVERVIEW */}
      <section className="profile-overview">

        <div className="profile-avatar-wrapper">

          <div className="profile-avatar">
            {profileImage ? (
              <img src={profileImage} alt="HOD Profile" />
            ) : (
              <UserRound size={65} />
            )}
          </div>

          <button
            className="profile-camera-button"
            onClick={() => fileInputRef.current.click()}
            title="Change Profile Picture"
          >
            <Camera size={18} />
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            hidden
          />

        </div>

        <div className="profile-overview-info">
          <h2>{profile.name}</h2>
          <p>{profile.designation}</p>

          <span>
            <Building2 size={16} />
            {profile.department}
          </span>
        </div>

        <div className="profile-status">
          <span className="status-dot"></span>
          Active Account
        </div>

      </section>

      {/* EDIT / SAVE BUTTONS */}
      <div className="profile-edit-actions">

        {!editMode ? (
          <button
            className="profile-edit-button"
            onClick={() => {
              setMessage("");
              setEditMode(true);
            }}
          >
            <Pencil size={17} />
            Edit Profile
          </button>
        ) : (
          <>
            <button
              className="profile-save-button"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              className="profile-cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={17} />
              Cancel
            </button>
          </>
        )}

      </div>

      {message && (
        <div className="profile-message">
          {message}
        </div>
      )}

      {/* PERSONAL INFORMATION */}
      <section className="profile-section">

        <div className="profile-section-heading">
          <UserRound size={21} />
          <h2>Personal Information</h2>
        </div>

        <div className="profile-details-grid">

          {renderField("Full Name", "name")}
          {renderField("Designation", "designation")}
          {renderField("Employee ID", "employeeId")}
          {renderField("Joining Date", "joiningDate", null, "date")}

        </div>

      </section>

      {/* CONTACT INFORMATION */}
      <section className="profile-section">

        <div className="profile-section-heading">
          <Mail size={21} />
          <h2>Contact Information</h2>
        </div>

        <div className="profile-details-grid">

          {renderField("Email Address", "email", <Mail size={16} />)}
          {renderField("Phone Number", "phone", <Phone size={16} />)}

        </div>

      </section>

      {/* DEPARTMENT INFORMATION */}
      <section className="profile-section">

        <div className="profile-section-heading">
          <GraduationCap size={21} />
          <h2>Department Information</h2>
        </div>

        <div className="profile-details-grid">

          {renderField("Department", "department")}
          {renderField("Institution", "institution")}
          {renderField("Location", "location")}

        </div>

      </section>

    </div>
  );
}

export default HODProfile;