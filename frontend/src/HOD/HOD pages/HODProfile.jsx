import { useState, useRef } from "react";

import {
  UserRound,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  ShieldCheck,
  Camera,
} from "lucide-react";

function HODProfile() {
 const [profileImage, setProfileImage] = useState(
  localStorage.getItem("hodProfileImage") || null
);
const fileInputRef = useRef(null);

const handleImageChange = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Image size must be less than 2 MB.");
    return;
  }

  const reader = new FileReader();

  reader.onloadend = () => {
    const imageURL = reader.result;

    localStorage.setItem("hodProfileImage", imageURL);
    setProfileImage(imageURL);

    // Notify the Dashboard in the same browser tab
    window.dispatchEvent(new Event("profileImageUpdated"));

    alert("Profile picture updated successfully!");
  };

  reader.readAsDataURL(file);
};
  const hod = {
    name: "HOD Name",
    designation: "Head of Department",
    department: "Computer Science and Engineering",
    email: "hod@svce.ac.in",
    phone: "+91 XXXXX XXXXX",
    employeeId: "SVCE-HOD-001",
    college: "Sri Venkateshwara College of Engineering",
    location: "Bengaluru, Karnataka",
    joiningDate: "01 July 2020",
  };

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
          <h2>{hod.name}</h2>
          <p>{hod.designation}</p>

          <span>
            <Building2 size={16} />
            {hod.department}
          </span>
        </div>

        <div className="profile-status">
          <span className="status-dot"></span>
          Active Account
        </div>

      </section>

      {/* PERSONAL INFORMATION */}
      <section className="profile-section">

        <div className="profile-section-heading">
          <UserRound size={21} />
          <h2>Personal Information</h2>
        </div>

        <div className="profile-details-grid">

          <div className="profile-detail">
            <label>Full Name</label>
            <p>{hod.name}</p>
          </div>

          <div className="profile-detail">
            <label>Designation</label>
            <p>{hod.designation}</p>
          </div>

          <div className="profile-detail">
            <label>Employee ID</label>
            <p>{hod.employeeId}</p>
          </div>

          <div className="profile-detail">
            <label>Joining Date</label>
            <p>{hod.joiningDate}</p>
          </div>

        </div>

      </section>

      {/* CONTACT INFORMATION */}
      <section className="profile-section">

        <div className="profile-section-heading">
          <Mail size={21} />
          <h2>Contact Information</h2>
        </div>

        <div className="profile-details-grid">

          <div className="profile-detail">
            <label>Email Address</label>
            <p>
              <Mail size={16} />
              {hod.email}
            </p>
          </div>

          <div className="profile-detail">
            <label>Phone Number</label>
            <p>
              <Phone size={16} />
              {hod.phone}
            </p>
          </div>

        </div>

      </section>

      {/* DEPARTMENT INFORMATION */}
      <section className="profile-section">

        <div className="profile-section-heading">
          <GraduationCap size={21} />
          <h2>Department Information</h2>
        </div>

        <div className="profile-details-grid">

          <div className="profile-detail">
            <label>Department</label>
            <p>{hod.department}</p>
          </div>

          <div className="profile-detail">
            <label>Institution</label>
            <p>{hod.college}</p>
          </div>

          <div className="profile-detail">
            <label>Location</label>
            <p>{hod.location}</p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default HODProfile;