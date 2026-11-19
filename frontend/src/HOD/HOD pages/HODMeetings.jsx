
import React, { useCallback, useState, useEffect, useRef } from "react";
import "../HOD styles/HODMeetings.css";

const API_URL = "http://localhost:5000";

// GET TODAY'S DATE USING LOCAL TIME
const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// GET MEETING DATE
const getMeetingDateKey = (meeting) => {
  const value =
    meeting.date ||
    meeting.meetingDate ||
    meeting.meeting_date ||
    meeting.scheduledDate ||
    meeting.scheduled_date;

  if (!value) return "";

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const dateString = String(value).trim();

  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  // Supports DD/MM/YYYY and DD-MM-YYYY
  const otherMatch = dateString.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (otherMatch) {
    return `${otherMatch[3]}-${String(otherMatch[2]).padStart(2, "0")}-${String(otherMatch[1]).padStart(2, "0")}`;
  }

  return "";
};

// GET MEETING START TIME
const getMeetingStartTime = (meeting) =>
  meeting.startTime || meeting.start_time || "";

// GET MEETING END TIME
const getMeetingEndTime = (meeting) =>
  meeting.endTime || meeting.end_time || "";

// CONVERT TIME INTO MINUTES
const getTimeMinutes = (time) => {
  if (!time) return null;

  const match = String(time)
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (minutes > 59) return null;

  if (period) {
    if (hours < 1 || hours > 12) return null;

    if (period === "PM" && hours < 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }
  } else if (hours > 23) {
    return null;
  }

  return hours * 60 + minutes;
};

// CHECK REJECTED MEETINGS
const isRejectedMeeting = (meeting) =>
  String(meeting.status || "").trim().toLowerCase() === "rejected";

const HODMeetings = ({
  initialShowForm = false,
  initialSection = "today"
}) => {
  const formRef = useRef(null);
  const upcomingSectionRef = useRef(null);

  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

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
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        console.error("HOD login token not found.");
        setMeetings([]);
        return;
      }

      const response = await fetch(`${API_URL}/api/hod/meetings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load meetings.");
      }

      if (!Array.isArray(data.meetings)) {
        throw new Error("Meetings array not found in backend response.");
      }

      setMeetings(data.meetings);
      console.log("HOD meetings loaded:", data.meetings);
    } catch (error) {
      console.error("Meeting loading error:", error);
    }
  }, []);

  // AUTOMATICALLY REFRESH MEETINGS
  useEffect(() => {
    loadMeetings();

    const interval = window.setInterval(() => {
      loadMeetings();
    }, 15000);

    window.addEventListener("focus", loadMeetings);

    const handleMeetingsUpdated = () => {
      loadMeetings();
    };

    window.addEventListener("hodMeetingsUpdated", handleMeetingsUpdated);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", loadMeetings);
      window.removeEventListener(
        "hodMeetingsUpdated",
        handleMeetingsUpdated
      );
    };
  }, [loadMeetings]);

  // UPDATE CURRENT TIME EVERY 5 SECONDS
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  // FETCH PROJECTS
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) return;

        const response = await fetch(`${API_URL}/api/hod/projects`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch projects.");
        }

        setProjects(data.projects || []);
      } catch (error) {
        console.error("Projects fetch error:", error);
      }
    };

    fetchProjects();
  }, []);

  // SCROLL TO FORM WHEN REQUESTED
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

  // SCROLL TO UPCOMING MEETINGS WHEN REQUESTED
  useEffect(() => {
    if (initialSection === "upcoming") {
      const timer = setTimeout(() => {
        upcomingSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [initialSection]);

  // HANDLE FORM INPUT
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

  // FORMAT TIME
  const formatTime = (time) => {
    if (!time) return "--";

    const minutes = getTimeMinutes(time);

    if (minutes === null) return String(time);

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const date = new Date();
    date.setHours(hours, remainingMinutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // GET TEAM / PROJECT NAME
  const getTeamName = (meeting) => {
    if (typeof meeting.project === "string") {
      return meeting.project;
    }

    return (
      meeting.projectName ||
      meeting.project_name ||
      meeting.project?.project_name ||
      meeting.team ||
      "Team"
    );
  };

  // CREATE MEETING
  const handleCreate = async (e) => {
    e.preventDefault();

    // CHECK REQUIRED FIELDS
    if (
      !formData.title.trim() ||
      !formData.project.trim() ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.venue.trim()
    ) {
      alert("Please fill in all meeting details.");
      return;
    }

    const newStart = getTimeMinutes(formData.startTime);
    const newEnd = getTimeMinutes(formData.endTime);

    // CHECK VALID TIME
    if (
      newStart === null ||
      newEnd === null ||
      newEnd <= newStart
    ) {
      alert("End time must be after start time.");
      return;
    }

    // CHECK CURRENT LOCAL DATE AND TIME AT SUBMISSION
    const now = new Date();
    const currentDate = getTodayDate();

    const currentMinutesPrecise =
      now.getHours() * 60 +
      now.getMinutes() +
      now.getSeconds() / 60;

    // PAST DATE CHECK
    if (formData.date < currentDate) {
      alert("You cannot create a meeting for a past date.");
      return;
    }

    // PAST TIME CHECK
    if (
      formData.date === currentDate &&
      newStart <= currentMinutesPrecise
    ) {
      alert(
        "You cannot create a meeting for a time that has already passed."
      );
      return;
    }

    // CHECK OVERLAPPING MEETINGS ON THE SAME DATE
    const conflictingMeeting = meetings.find((meeting) => {
      if (isRejectedMeeting(meeting)) return false;

      if (getMeetingDateKey(meeting) !== formData.date) return false;

      const existingStart = getTimeMinutes(
        getMeetingStartTime(meeting)
      );

      const existingEnd = getTimeMinutes(
        getMeetingEndTime(meeting)
      );

      if (
        existingStart === null ||
        existingEnd === null ||
        existingEnd <= existingStart
      ) {
        return false;
      }

      // Touching endpoints are allowed
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (conflictingMeeting) {
      alert(
        "Another meeting is already scheduled at this time. Please choose a different time slot."
      );
      return;
    }

    const selectedProject = projects.find(
      (project) =>
        project.project_name?.trim().toLowerCase() ===
        formData.project.trim().toLowerCase()
    );

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API_URL}/api/hod/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          project: formData.project.trim(),
          project_id: selectedProject?.project_id || null,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          venue: formData.venue.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create meeting.");
      }

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

  // CURRENT DATE AND TIME
  const today = getTodayDate();
  const now = new Date(currentTime);

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  // GET DISPLAY STATUS
  const getMeetingDisplayStatus = (meeting) => {
    const meetingDate = getMeetingDateKey(meeting);

    if (!meetingDate) return "Unknown";

    if (meetingDate < today) return "Completed";

    if (meetingDate > today) return "Upcoming";

    const start = getTimeMinutes(
      getMeetingStartTime(meeting)
    );

    const end = getTimeMinutes(
      getMeetingEndTime(meeting)
    );

    if (start === null || end === null) {
      return "Upcoming";
    }

    if (currentMinutes >= end) {
      return "Completed";
    }

    if (currentMinutes >= start && currentMinutes < end) {
      return "Ongoing";
    }

    return "Upcoming";
  };

  // TODAY'S MEETINGS
  // SHOWS UPCOMING, ONGOING AND COMPLETED
  const todaysMeetings = meetings
    .filter((meeting) => {
      if (isRejectedMeeting(meeting)) return false;

      return getMeetingDateKey(meeting) === today;
    })
    .sort((a, b) => {
      const firstStart =
        getTimeMinutes(getMeetingStartTime(a)) ?? 0;

      const secondStart =
        getTimeMinutes(getMeetingStartTime(b)) ?? 0;

      return firstStart - secondStart;
    });

  // UPCOMING MEETINGS
  // TODAY'S NOT-STARTED AND ALL FUTURE MEETINGS
  const upcomingMeetings = meetings
    .filter((meeting) => {
      if (isRejectedMeeting(meeting)) return false;

      const meetingDate = getMeetingDateKey(meeting);

      if (!meetingDate) return false;

      if (meetingDate > today) return true;

      if (meetingDate < today) return false;

      const meetingStart = getTimeMinutes(
        getMeetingStartTime(meeting)
      );

      return (
        meetingStart !== null &&
        meetingStart > currentMinutes
      );
    })
    .sort((a, b) => {
      const dateDifference = getMeetingDateKey(a).localeCompare(
        getMeetingDateKey(b)
      );

      if (dateDifference !== 0) return dateDifference;

      const firstStart =
        getTimeMinutes(getMeetingStartTime(a)) ?? 0;

      const secondStart =
        getTimeMinutes(getMeetingStartTime(b)) ?? 0;

      return firstStart - secondStart;
    });

  // FORMAT DATE
  const formatDate = (dateValue) => {
    if (!dateValue) return "--";

    const dateKey = String(dateValue).match(
      /^(\d{4}-\d{2}-\d{2})/
    );

    const normalized = dateKey ? dateKey[1] : dateValue;

    const date = new Date(`${normalized}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // MEETING TABLE
  const renderMeetingTable = (meetingList, emptyMessage) => (
    <div className="table-wrapper">
      <table className="hod-meetings-table">
        <thead>
          <tr>
            <th>Team / Project</th>
            <th>Meeting Time</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {meetingList.length === 0 ? (
            <tr>
              <td colSpan="4" className="hod-no-meetings">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            meetingList.map((meeting, index) => {
              const status = getMeetingDisplayStatus(meeting);

              return (
                <tr key={meeting.meeting_id || index}>
                  <td>
                    <strong className="hod-team-name">
                      {getTeamName(meeting)}
                    </strong>
                  </td>

                  <td className="hod-meeting-time">
                    {formatTime(getMeetingStartTime(meeting))} –{" "}
                    {formatTime(getMeetingEndTime(meeting))}
                  </td>

                  <td>
                    <strong
                      style={{
                        color:
                          status === "Completed"
                            ? "#16a34a"
                            : status === "Ongoing"
                            ? "#2563eb"
                            : status === "Upcoming"
                            ? "#64748b"
                            : "#dc2626",
                        fontWeight: 700
                      }}
                    >
                      {status.toUpperCase()}
                    </strong>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="view-details-button"
                      onClick={() => setSelectedMeeting(meeting)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })
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
      <section
        ref={upcomingSectionRef}
        className="dashboard-card upcoming-card hod-meetings-card"
      >
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
                <strong>{getTeamName(selectedMeeting)}</strong>
              </div>

              <div className="hod-detail-item">
                <span>Meeting Title</span>
                <strong>{selectedMeeting.title || "--"}</strong>
              </div>

              <div className="hod-detail-item">
                <span>Date</span>
                <strong>
                  {formatDate(getMeetingDateKey(selectedMeeting))}
                </strong>
              </div>

              <div className="hod-detail-item">
                <span>Start Time</span>
                <strong>
                  {formatTime(getMeetingStartTime(selectedMeeting))}
                </strong>
              </div>

              <div className="hod-detail-item">
                <span>End Time</span>
                <strong>
                  {formatTime(getMeetingEndTime(selectedMeeting))}
                </strong>
              </div>

              <div className="hod-detail-item">
                <span>Venue</span>
                <strong>{selectedMeeting.venue || "--"}</strong>
              </div>

              <div className="hod-detail-item">
                <span>Status</span>
                <strong
                  style={{
                    color:
                      getMeetingDisplayStatus(selectedMeeting) === "Completed"
                        ? "#16a34a"
                        : getMeetingDisplayStatus(selectedMeeting) === "Ongoing"
                        ? "#2563eb"
                        : "#64748b"
                  }}
                >
                  {getMeetingDisplayStatus(selectedMeeting).toUpperCase()}
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

        <form onSubmit={handleCreate} noValidate>
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
