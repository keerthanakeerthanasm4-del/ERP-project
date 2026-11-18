
import React, { useCallback, useState, useEffect, useRef } from "react";
import "../HOD styles/HODMeetings.css";

const API_URL = "http://localhost:5000";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const HODMeetings = ({ initialShowForm = false }) => {
  const formRef = useRef(null);

  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    project: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: ""
  });

  // LOAD MEETINGS
  const loadMeetings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/hod/meetings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load meetings.");
      setMeetings(data.meetings || []);
    } catch (error) {
      console.error("Meeting loading error:", error);
    }
  }, []);

  useEffect(() => {
    loadMeetings();

    const interval = window.setInterval(loadMeetings, 15000);
    window.addEventListener("focus", loadMeetings);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", loadMeetings);
    };
  }, [loadMeetings]);

  // FETCH PROJECTS
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/hod/projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch projects"
          );
        }

        setProjects(data.projects || []);
      } catch (error) {
        console.error("Projects fetch error:", error);
      }
    };

    fetchProjects();
  }, []);

  // SCROLL TO CREATE MEETING WHEN OPENED FROM DASHBOARD
  useEffect(() => {
    if (initialShowForm) {
      const timer = setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [initialShowForm]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value
    }));
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({
      title: "",
      project: "",
      date: "",
      startTime: "",
      endTime: "",
      venue: ""
    });
  };

  // NORMALIZE MEETING DATE
  const getMeetingDateKey = (meeting) => {
    const value =
      meeting.date ||
      meeting.meetingDate ||
      meeting.meeting_date;

    if (!value) return "";

    const dateString = String(value).trim();
    const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/);

    if (match) return match[1];

    const parsed = new Date(dateString);

    if (Number.isNaN(parsed.getTime())) return "";

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // CREATE MEETING
  const handleCreate = async (e) => {
    e.preventDefault();

    if (formData.endTime <= formData.startTime) {
      alert("End time must be after start time.");
      return;
    }

    const selectedProject = projects.find(
      (project) =>
        project.project_name?.trim().toLowerCase() ===
        formData.project.trim().toLowerCase()
    );

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/hod/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          project: formData.project.trim(),
          project_id: selectedProject?.project_id || null,
          venue: formData.venue.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create meeting.");
      await loadMeetings();
      window.dispatchEvent(new Event("hodMeetingsUpdated"));

      resetForm();
      setSelectedMeeting(null);

      alert("Meeting created successfully!");
    } catch (error) {
      console.error("Meeting creation error:", error);
      alert(error.message || "Unable to save meeting.");
    }
  };

  // DATE FILTERING
  const today = getTodayDate();

  const todaysMeetings = meetings
    .filter(
      (meeting) => getMeetingDateKey(meeting) === today
    )
    .sort((a, b) =>
      (a.startTime || "").localeCompare(b.startTime || "")
    );

  const upcomingMeetings = meetings
    .filter((meeting) => {
      const meetingDate = getMeetingDateKey(meeting);
      return meetingDate && meetingDate > today;
    })
    .sort((a, b) => {
      const dateDifference = getMeetingDateKey(a).localeCompare(
        getMeetingDateKey(b)
      );

      if (dateDifference !== 0) return dateDifference;

      return (a.startTime || "").localeCompare(
        b.startTime || ""
      );
    });

  // FORMAT DATE
  const formatDate = (dateValue) => {
    if (!dateValue) return "--";

    const dateKey = String(dateValue).match(
      /^(\d{4}-\d{2}-\d{2})/
    );

    const normalized = dateKey ? dateKey[1] : dateValue;
    const date = new Date(`${normalized}T00:00:00`);

    if (Number.isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // FORMAT TIME
  const formatTime = (time) => {
    if (!time) return "--";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // GET TEAM NAME
  const getTeamName = (meeting) =>
    meeting.project ||
    meeting.team ||
    meeting.projectName ||
    meeting.project_name ||
    "Team";

  // MEETING TABLE
  // Shows only team name, meeting time and view details.
  const renderMeetingTable = (meetingList, emptyMessage) => (
    <div className="table-wrapper">
      <table className="hod-meetings-table">
        <thead>
          <tr>
            <th>Team / Project</th>
            <th>Meeting Time</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {meetingList.length === 0 ? (
            <tr>
              <td colSpan="3" className="hod-no-meetings">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            meetingList.map((meeting, index) => (
              <tr key={meeting.meeting_id || index}>
                <td>
                  <strong className="hod-team-name">
                    {getTeamName(meeting)}
                  </strong>
                </td>

                <td className="hod-meeting-time">
                  {formatTime(meeting.startTime)} –{" "}
                  {formatTime(meeting.endTime)}
                </td>

                <td className="hod-action-cell">
                  <button
                    type="button"
                    className="view-details-button"
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="hod-meetings-page">

      {/* HEADER */}
      <header className="hod-meetings-page-header">
        <div>
          <h1>MEETINGS</h1>
          <p>Manage your department meetings efficiently</p>
        </div>
      </header>

      {/* TODAY'S MEETINGS */}
      <section className="dashboard-card upcoming-card hod-meetings-card">
        <div className="section-heading card-heading hod-meetings-heading">
          <div>
            <h3>Today's Meetings</h3>
            <p>Meetings scheduled for today</p>
          </div>
        </div>

        {renderMeetingTable(
          todaysMeetings,
          "No meetings scheduled for today."
        )}
      </section>

      {/* UPCOMING MEETINGS */}
      <section className="dashboard-card upcoming-card hod-meetings-card">
        <div className="section-heading card-heading hod-meetings-heading">
          <div>
            <h3>Upcoming Meetings</h3>
            <p>Your future scheduled meetings</p>
          </div>
        </div>

        {renderMeetingTable(
          upcomingMeetings,
          "No upcoming meetings found."
        )}
      </section>

      {/* MEETING DETAILS POPUP */}
      {selectedMeeting && (
        <div
          className="hod-details-overlay"
          onClick={() => setSelectedMeeting(null)}
        >
          <section
            className="hod-inline-details"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hod-details-heading">
              <div>
                <span className="hod-details-kicker">
                  MEETING INFORMATION
                </span>

                <h3>Meeting Details</h3>

                <p>Complete information about this meeting</p>
              </div>

              <button
                type="button"
                className="hod-form-close"
                onClick={() => setSelectedMeeting(null)}
              >
                ✕
              </button>
            </div>

            <div className="hod-details-grid">

              <div className="hod-detail-item">
                <span>Team / Project</span>
                <strong>
                  {getTeamName(selectedMeeting)}
                </strong>
              </div>

              <div className="hod-detail-item">
                <span>Meeting Title</span>
                <strong>
                  {selectedMeeting.title || "--"}
                </strong>
              </div>

              <div className="hod-detail-item">
                <span>Date</span>
                <strong>
                  {formatDate(
                    getMeetingDateKey(selectedMeeting)
                  )}
                </strong>
              </div>

              <div className="hod-detail-item">
                <span>Start Time</span>
                <strong>
                  {formatTime(selectedMeeting.startTime)}
                </strong>
              </div>

              <div className="hod-detail-item">
                <span>End Time</span>
                <strong>
                  {formatTime(selectedMeeting.endTime)}
                </strong>
              </div>

              <div className="hod-detail-item">
                <span>Venue</span>
                <strong>
                  {selectedMeeting.venue || "--"}
                </strong>
              </div>

              <div className="hod-detail-item">
                <span>Status</span>
                <strong>
                  {selectedMeeting.status || "Pending"}
                </strong>
              </div>

            </div>
          </section>
        </div>
      )}

      {/* CREATE MEETING FORM */}
      <section
        ref={formRef}
        className="dashboard-card hod-meeting-form-card"
        id="create-meeting-section"
      >
        <div className="hod-meeting-card-heading">
          <div>
            <h3>Create New Meeting</h3>
            <p>Enter the details to schedule a meeting</p>
          </div>
        </div>

        <form onSubmit={handleCreate}>
          <div className="hod-form-grid">

            <div className="hod-form-group">
              <label>Meeting Title *</label>

              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter meeting title"
                required
              />
            </div>

            <div className="hod-form-group">
              <label>Team / Project Name *</label>

              <input
                name="project"
                list="hod-project-options"
                value={formData.project}
                onChange={handleChange}
                placeholder="Type or select team name"
                required
              />

              <datalist id="hod-project-options">
                {projects.map((project) => (
                  <option
                    key={project.project_id || project.project_name}
                    value={project.project_name}
                  />
                ))}

                <option value="Development Team" />
                <option value="Testing Team" />
                <option value="Design Team" />
              </datalist>
            </div>

            <div className="hod-form-group">
              <label>Meeting Date *</label>

              <input
                type="date"
                name="date"
                min={getTodayDate()}
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hod-form-group">
              <label>Start Time *</label>

              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hod-form-group">
              <label>End Time *</label>

              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hod-form-group">
              <label>Meeting Venue *</label>

              <input
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Enter meeting venue"
                required
              />
            </div>

          </div>

          <div className="hod-form-actions">
            <button
              type="button"
              className="hod-cancel-button"
              onClick={resetForm}
            >
              Clear
            </button>

            <button
              type="submit"
              className="hod-save-button"
            >
              + Create Meeting
            </button>
          </div>
        </form>
      </section>

    </div>
  );
};

export default HODMeetings;
