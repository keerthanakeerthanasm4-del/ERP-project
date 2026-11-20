
import React, { useCallback, useEffect, useRef, useState } from "react";

import "../HOD styles/HODMeetings.css";
import "../HOD styles/HODDashboard.css";

import {
  CalendarDays,
  ArrowRight,
  X
} from "lucide-react";

const API_URL = "http://localhost:5000";

// =====================================
// AUTH HEADERS
// =====================================

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`
  };
};

// =====================================
// DATE HELPERS
// =====================================

const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMeetingDate = (meeting) => {
  const rawDate =
    meeting.date ||
    meeting.meetingDate ||
    meeting.meeting_date ||
    meeting.scheduledDate ||
    meeting.scheduled_date ||
    "";

  if (!rawDate) return "";

  const value = String(rawDate).trim();

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const otherMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (otherMatch) {
    return `${otherMatch[3]}-${String(otherMatch[2]).padStart(2, "0")}-${String(otherMatch[1]).padStart(2, "0")}`;
  }

  return "";
};

// =====================================
// TIME HELPERS
// =====================================

// Converts both 12-hour and 24-hour time into minutes.
const getTimeMinutes = (time) => {
  if (!time) return null;

  const value = String(time).trim();

  const match = value.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i
  );

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (minutes > 59) return null;

  if (period) {
    if (hours < 1 || hours > 12) return null;

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }
  } else if (hours > 23) {
    return null;
  }

  return hours * 60 + minutes;
};

// Converts 12-hour time into HH:mm for the API.
const to24Hour = (time) => {
  const totalMinutes = getTimeMinutes(time);

  if (totalMinutes === null) return "";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(mins).padStart(2, "0")} ${period}`;
};

const formatTime = (time) => {
  if (!time) return "Time not set";

  const minutes = getTimeMinutes(time);

  if (minutes === null) return String(time);

  return formatMinutes(minutes);
};

// =====================================
// HOUR, MINUTE, AM/PM PICKER
// =====================================

const parseTimeParts = (time) => {
  const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return { hour: "", minute: "", period: "" };

  let hour = Number(match[1]);
  let period = match[3]?.toUpperCase() || "";
  if (!period) {
    period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
  }
  return { hour: String(hour), minute: match[2], period };
};

const TimePicker = ({ label, value, onChange }) => {
  const [parts, setParts] = useState(() => parseTimeParts(value));

  useEffect(() => {
    setParts(parseTimeParts(value));
  }, [value]);

  const updatePart = (key, nextValue) => {
    const nextParts = { ...parts, [key]: nextValue };
    setParts(nextParts);
    onChange(nextParts.hour && nextParts.minute && nextParts.period
      ? `${Number(nextParts.hour)}:${nextParts.minute} ${nextParts.period}`
      : "");
  };

  return (
    <div className="hod-form-group">
      <label>{label}</label>
      <div className="hod-time-picker">
        <select aria-label={`${label} hour`} value={parts.hour} onChange={(event) => updatePart("hour", event.target.value)} required>
          <option value="">Hour</option>
          {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
            <option key={hour} value={String(hour)}>{String(hour).padStart(2, "0")}</option>
          ))}
        </select>
        <select aria-label={`${label} minute`} value={parts.minute} onChange={(event) => updatePart("minute", event.target.value)} required>
          <option value="">Minute</option>
          {Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, "0")).map((minute) => (
            <option key={minute} value={minute}>{minute}</option>
          ))}
        </select>
        <select className="hod-time-period" aria-label={`${label} AM or PM`} value={parts.period} onChange={(event) => updatePart("period", event.target.value)} required>
          <option value="">AM/PM</option>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

// =====================================
// GENERAL HELPERS
// =====================================

const normalize = (value) => {
  const normalizedValue =
    value && typeof value === "object"
      ? value.project_name ||
        value.projectName ||
        value.name ||
        value.project_id ||
        value.id
      : value;

  return String(normalizedValue || "").trim().toLowerCase();
};

const getMeetingId = (meeting) => {
  return meeting.meeting_id || meeting.meetingId || meeting.id;
};

const getApprovalStatus = (meeting) => {
  return (
    meeting.status ||
    meeting.approval_status ||
    meeting.approvalStatus ||
    "Pending"
  );
};

const getProjectLeadApproval = (meeting) =>
  meeting.project_lead_approval_status ||
  meeting.projectLeadApprovalStatus ||
  meeting.project_lead_status ||
  meeting.projectLeadStatus ||
  meeting.project_lead_approval ||
  meeting.projectLeadApproval ||
  "";

const hasProjectLeadApproved = (meeting) => {
  const leadStatus = normalize(getProjectLeadApproval(meeting)).replace(/[\s-]+/g, "_");

  if (leadStatus) {
    return ["approved", "accepted", "project_lead_approved"].includes(leadStatus);
  }

  const status = normalize(getApprovalStatus(meeting)).replace(/[\s-]+/g, "_");

  return [
    "approved",
    "fixed",
    "confirmed",
    "pending_hod",
    "awaiting_hod",
    "project_lead_approved",
    "approved_by_project_lead"
  ].includes(status);
};

const isAwaitingHodDecision = (meeting) => {
  const status = normalize(getApprovalStatus(meeting)).replace(/[\s-]+/g, "_");

  if (!hasProjectLeadApproved(meeting)) return false;

  const hodStatus = normalize(
    meeting.hod_approval_status ||
    meeting.hodApprovalStatus ||
    meeting.hod_status
  );

  if (hodStatus) {
    return ["pending", "pending_hod", "awaiting_hod"].includes(
      hodStatus.replace(/[\s-]+/g, "_")
    );
  }

  return [
    "pending",
    "pending_hod",
    "awaiting_hod",
    "project_lead_approved",
    "approved_by_project_lead"
  ].includes(status);
};

const getHodStatusLabel = (meeting) => {
  const status = normalize(getApprovalStatus(meeting));
  const leadStatus = normalize(getProjectLeadApproval(meeting));

  if (isAwaitingHodDecision(meeting)) return "Pending";

  if (status === "approved" || status === "fixed" || status === "confirmed") {
    return "Fixed";
  }

  if (status === "rejected") return "Rejected";

  if (
    leadStatus &&
    ![
      "approved",
      "accepted",
      "project lead approved",
      "project_lead_approved"
    ].includes(leadStatus)
  ) {
    return "Awaiting Project Lead";
  }

  return getApprovalStatus(meeting);
};

const getStartTime = (meeting) => {
  return (
    meeting.startTime ||
    meeting.start_time ||
    meeting.meeting_start_time ||
    ""
  );
};

const getEndTime = (meeting) => {
  return (
    meeting.endTime ||
    meeting.end_time ||
    meeting.meeting_end_time ||
    ""
  );
};

const getTeamName = (meeting) => {
  const relatedProject = meeting.project;

  const project =
    relatedProject && typeof relatedProject === "object"
      ? relatedProject.project_name ||
        relatedProject.name ||
        relatedProject.project_id
      : relatedProject;

  return (
    meeting.team ||
    meeting.projectName ||
    meeting.project_name ||
    project ||
    "Team"
  );
};

const getMeetingTitle = (meeting) => {
  return meeting.title || meeting.meeting_title || "Meeting";
};

const formatMeetingDate = (meeting) => {
  const dateKey = getMeetingDate(meeting);

  if (!dateKey) return "Date not available";

  const [year, month, day] = dateKey.split("-");

  return new Date(`${year}-${month}-${day}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );
};

// =====================================
// COMPONENT
// =====================================

const HODMeetings = ({
  initialShowForm = false,
  initialSection = "today"
}) => {
  const formRef = useRef(null);
  const upcomingSectionRef = useRef(null);
  const todaySectionRef = useRef(null);

  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingMeetingId, setUpdatingMeetingId] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    project: "",
    project_id: "",
    date: getTodayDate(),
    startTime: "",
    endTime: "",
    venue: ""
  });

  // =====================================
  // SCROLL TO SELECTED SECTION
  // =====================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (initialShowForm && formRef.current) {
        formRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      } else if (
        initialSection === "upcoming" &&
        upcomingSectionRef.current
      ) {
        upcomingSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      } else if (
        initialSection === "today" &&
        todaySectionRef.current
      ) {
        todaySectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [initialShowForm, initialSection]);

  // =====================================
  // UPDATE CURRENT TIME
  // =====================================

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  // =====================================
  // FETCH MEETINGS
  // =====================================

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/hod/meetings`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        window.location.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch meetings");
      }

      setMeetings(Array.isArray(data.meetings) ? data.meetings : []);
    } catch (error) {
      console.error("HOD Meetings Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================
  // FETCH PROJECTS
  // =====================================

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/hod/projects`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        window.location.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch projects");
      }

      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (error) {
      console.error("HOD Projects Error:", error);
    }
  }, []);

  // =====================================
  // REFRESH DATA
  // =====================================

  useEffect(() => {
    fetchMeetings();
    fetchProjects();

    const interval = window.setInterval(() => {
      fetchMeetings();
    }, 15000);

    const refreshMeetings = () => fetchMeetings();

    window.addEventListener("focus", refreshMeetings);
    window.addEventListener("hodMeetingsUpdated", refreshMeetings);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshMeetings);
      window.removeEventListener("hodMeetingsUpdated", refreshMeetings);
    };
  }, [fetchMeetings, fetchProjects]);

  // =====================================
  // APPROVE OR REJECT MEETING
  // =====================================

  const updateMeetingStatus = async (meetingId, newStatus) => {
    if (!meetingId) {
      window.alert("Meeting ID is missing.");
      return;
    }

    try {
      setUpdatingMeetingId(meetingId);

      const response = await fetch(
        `${API_URL}/api/hod/meetings/${meetingId}/status`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update meeting status.");
      }

      await fetchMeetings();

      window.dispatchEvent(new Event("hodMeetingsUpdated"));
    } catch (error) {
      console.error("Update meeting status:", error);
      window.alert(error.message || "Unable to update meeting status.");
    } finally {
      setUpdatingMeetingId(null);
    }
  };

  // =====================================
  // CURRENT DATE AND TIME
  // =====================================

  const todayDate = getTodayDate();

  const currentMinutes =
    currentTime.getHours() * 60 + currentTime.getMinutes();

  // =====================================
  // TODAY'S MEETINGS
  // =====================================

  const todayMeetings = meetings
    .filter((meeting) => {
      if (getMeetingDate(meeting) !== todayDate) {
        return false;
      }

      if (!hasProjectLeadApproved(meeting)) return false;

      return normalize(getApprovalStatus(meeting)) !== "rejected";
    })
    .sort((a, b) => {
      return (
        (getTimeMinutes(getStartTime(a)) ?? 0) -
        (getTimeMinutes(getStartTime(b)) ?? 0)
      );
    });

  // =====================================
  // UPCOMING MEETINGS
  // =====================================

  const upcomingMeetings = meetings
    .map((meeting) => ({
      ...meeting,
      normalizedDate: getMeetingDate(meeting)
    }))
    .filter((meeting) => {
      if (!meeting.normalizedDate) return false;

      if (!hasProjectLeadApproved(meeting)) return false;

      if (normalize(getApprovalStatus(meeting)) === "rejected") {
        return false;
      }

      if (meeting.normalizedDate > todayDate) {
        return true;
      }

      if (meeting.normalizedDate === todayDate) {
        const end = getTimeMinutes(getEndTime(meeting));

        return end !== null && end > currentMinutes;
      }

      return false;
    })
    .sort((a, b) => {
      if (a.normalizedDate !== b.normalizedDate) {
        return a.normalizedDate.localeCompare(b.normalizedDate);
      }

      return (
        (getTimeMinutes(getStartTime(a)) ?? 0) -
        (getTimeMinutes(getStartTime(b)) ?? 0)
      );
    });

  // =====================================
  // TODAY'S MEETING STATUS
  // =====================================

  const getTodayMeetingStatus = (meeting) => {
    const start = getTimeMinutes(getStartTime(meeting));
    const end = getTimeMinutes(getEndTime(meeting));

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

  // =====================================
  // FORM HANDLERS
  // =====================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleProjectChange = (event) => {
    const projectName = event.target.value;

    const selectedProject = projects.find((project) => {
      const name = project.project_name || project.name || "";

      return name.trim().toLowerCase() === projectName.trim().toLowerCase();
    });

    setFormData((previous) => ({
      ...previous,
      project: projectName,
      project_id: selectedProject
        ? String(selectedProject.project_id || selectedProject.id || "")
        : ""
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      project: "",
      project_id: "",
      date: getTodayDate(),
      startTime: "",
      endTime: "",
      venue: ""
    });
  };

  // =====================================
  // CREATE MEETING
  // =====================================

  const handleCreateMeeting = async (event) => {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.project.trim() ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.venue.trim()
    ) {
      window.alert("Please fill in all meeting details.");
      return;
    }

    const start = getTimeMinutes(formData.startTime);
    const end = getTimeMinutes(formData.endTime);

    if (start === null || end === null || end <= start) {
      window.alert(
        "Please enter valid times in AM/PM format (example: 09:30 AM), and ensure the end time is later than the start time."
      );
      return;
    }

    const today = getTodayDate();

    if (formData.date < today) {
      window.alert("You cannot schedule a meeting in the past.");
      return;
    }

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    if (formData.date === today && start <= nowMinutes) {
      window.alert("Please select a future meeting time.");
      return;
    }

    const hasOverlap = meetings.some((meeting) => {
      if (normalize(getApprovalStatus(meeting)) === "rejected") {
        return false;
      }

      if (getMeetingDate(meeting) !== formData.date) {
        return false;
      }

      const existingStart = getTimeMinutes(getStartTime(meeting));
      const existingEnd = getTimeMinutes(getEndTime(meeting));

      if (existingStart === null || existingEnd === null) {
        return false;
      }

      return start < existingEnd && end > existingStart;
    });

    if (hasOverlap) {
      window.alert("Another meeting is already scheduled during this time.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/api/hod/meetings`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          project: formData.project.trim(),
          project_id: formData.project_id,
          date: formData.date,

          // Send standard 24-hour time to the backend.
          startTime: to24Hour(formData.startTime),
          endTime: to24Hour(formData.endTime),

          venue: formData.venue.trim(),

          // HOD-created meetings should be approved automatically.
          status: "Approved",
          approval_status: "Approved"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create meeting.");
      }

      const meetingId = getMeetingId(data.meeting || {});

      if (!meetingId) {
        throw new Error("The meeting was created, but its status could not be confirmed.");
      }

      // The create endpoint defaults to Pending, so immediately finalize HOD-created meetings.
      const statusResponse = await fetch(
        `${API_URL}/api/hod/meetings/${meetingId}/status`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: "Approved" })
        }
      );

      const statusData = await statusResponse.json();

      if (!statusResponse.ok) {
        throw new Error(statusData.message || "Meeting created but could not be marked as fixed.");
      }

      window.alert("Meeting created and fixed successfully.");

      resetForm();

      await fetchMeetings();

      window.dispatchEvent(new Event("hodMeetingsUpdated"));
    } catch (error) {
      console.error("Create meeting error:", error);
      window.alert(error.message || "Unable to create meeting.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // MEETING DETAILS
  // =====================================

  const renderMeetingDetails = () => {
    if (!selectedMeeting) return null;

    return (
      <div
        className="hod-details-overlay"
        onClick={() => setSelectedMeeting(null)}
      >
        <div
          className="hod-inline-details"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="hod-details-heading">
            <div>
              <h3>Meeting Details</h3>
              <p>{getMeetingTitle(selectedMeeting)}</p>
            </div>

            <button
              type="button"
              className="hod-form-close"
              onClick={() => setSelectedMeeting(null)}
            >
              <X size={19} />
            </button>
          </div>

          <div className="hod-details-grid">
            <div className="hod-detail-item">
              <span>Project/ Team Name</span>
              <strong>{getTeamName(selectedMeeting)}</strong>
            </div>

            <div className="hod-detail-item">
              <span>Meeting Title</span>
              <strong>{getMeetingTitle(selectedMeeting)}</strong>
            </div>

            <div className="hod-detail-item">
              <span>Date</span>
              <strong>{formatMeetingDate(selectedMeeting)}</strong>
            </div>

            <div className="hod-detail-item">
              <span>Start Time</span>
              <strong>{formatTime(getStartTime(selectedMeeting))}</strong>
            </div>

            <div className="hod-detail-item">
              <span>End Time</span>
              <strong>{formatTime(getEndTime(selectedMeeting))}</strong>
            </div>

            <div className="hod-detail-item">
              <span>Venue</span>
              <strong>{selectedMeeting.venue || "Not available"}</strong>
            </div>

            <div className="hod-detail-item">
              <span>Approval Status</span>
              <strong>{getApprovalStatus(selectedMeeting)}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =====================================
  // PAGE
  // =====================================

  return (
    <div className="hod-meetings-page">

      {/* PAGE HEADING */}

      <div className="hod-meetings-page-header">
        <div>
          <h1>Meetings</h1>
          <p>Manage your department meetings</p>
        </div>
      </div>

      {/* TODAY'S MEETINGS */}

      <div
        className="dashboard-card upcoming-card"
        ref={todaySectionRef}
      >
        <div className="section-heading card-heading">
          <CalendarDays />
          <h3>Today's Meetings</h3>
        </div>

        <div className="table-wrapper">
          <table className="dashboard-meetings-table">
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Project/ Team Name</th>
                <th>Meeting Date &amp; Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="no-meetings">
                    Loading meetings...
                  </td>
                </tr>
              ) : todayMeetings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-meetings">
                    No meetings scheduled for today.
                  </td>
                </tr>
              ) : (
                todayMeetings.map((meeting, index) => {
                  const status = getTodayMeetingStatus(meeting);

                  return (
                    <tr key={getMeetingId(meeting) || index}>
                      <td>{index + 1}</td>

                      <td className="meeting-project-name">
                        {getTeamName(meeting)}
                      </td>

                      <td>
                        {formatMeetingDate(meeting)}
                        {" • "}
                        {formatTime(getStartTime(meeting))}
                        {" - "}
                        {formatTime(getEndTime(meeting))}
                      </td>

                      <td>
                        <span
                          className={`dashboard-status ${normalize(status)}`}
                        >
                          {status}
                        </span>
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
      </div>

      {/* UPCOMING MEETINGS */}

      <div
        className="dashboard-card upcoming-card"
        ref={upcomingSectionRef}
      >
        <div className="section-heading card-heading">
          <CalendarDays />
          <h3>Upcoming Meetings</h3>

          <button
            type="button"
            onClick={() => {
              upcomingSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });
            }}
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className="table-wrapper">
          <table className="dashboard-meetings-table">
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Project/ Team Name</th>
                <th>Meeting Date &amp; Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="no-meetings">
                    Loading meetings...
                  </td>
                </tr>
              ) : upcomingMeetings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-meetings">
                    No upcoming meetings found.
                  </td>
                </tr>
              ) : (
                upcomingMeetings.map((meeting, index) => {
                  const status = getHodStatusLabel(meeting);
                  const meetingId = getMeetingId(meeting);
                  const isPending = isAwaitingHodDecision(meeting);
                  const isUpdating = updatingMeetingId === meetingId;

                  return (
                    <tr key={meetingId || index}>
                      <td>{index + 1}</td>

                      <td className="meeting-project-name">
                        {getTeamName(meeting)}
                      </td>

                      <td>
                        {formatMeetingDate(meeting)}
                        {" • "}
                        {formatTime(getStartTime(meeting))}
                      </td>

                      <td>
                        <span
                          className={`dashboard-status ${normalize(status)}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        {isPending ? (
                          <div className="meeting-action-buttons">
                            <button
                              type="button"
                              className="approve-button"
                              disabled={!isPending || isUpdating}
                              onClick={() =>
                                updateMeetingStatus(meetingId, "Approved")
                              }
                            >
                              {isUpdating ? "Updating..." : "Approve"}
                            </button>

                            <button
                              type="button"
                              className="reject-button"
                              disabled={!isPending || isUpdating}
                              onClick={() =>
                                updateMeetingStatus(meetingId, "Rejected")
                              }
                            >
                              {isUpdating ? "Updating..." : "Reject"}
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`dashboard-status ${normalize(status)}`}
                          >
                            {status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MEETING FORM - ALWAYS BELOW UPCOMING MEETINGS */}

      <div
        className="dashboard-card hod-meeting-form-card"
        ref={formRef}
      >
        <div className="hod-meeting-card-heading">
          <div>
            <h3>Create New Meeting</h3>
            <p>Enter the details to schedule a department meeting.</p>
          </div>
        </div>

        <form onSubmit={handleCreateMeeting}>
          <div className="hod-form-grid">

            <div className="hod-form-group">
              <label>Meeting Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter meeting title"
                required
              />
            </div>

            <div className="hod-form-group">
              <label>Project/ Team Name</label>

              <input
                type="text"
                name="project"
                list="hod-project-team-options"
                value={formData.project}
                onChange={handleProjectChange}
                placeholder="Type or select Project/ Team"
                autoComplete="off"
                required
              />

              <datalist id="hod-project-team-options">
                {projects.map((project) => (
                  <option
                    key={project.project_id || project.id}
                    value={project.project_name || project.name}
                  />
                ))}
              </datalist>
            </div>

            <div className="hod-form-group">
              <label>Meeting Date</label>
              <input
                type="date"
                name="date"
                min={getTodayDate()}
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <TimePicker
              label="Start Time"
              value={formData.startTime}
              onChange={(value) =>
                setFormData((previous) => ({
                  ...previous,
                  startTime: value
                }))
              }
            />

            <TimePicker
              label="End Time"
              value={formData.endTime}
              onChange={(value) =>
                setFormData((previous) => ({
                  ...previous,
                  endTime: value
                }))
              }
            />

            <div className="hod-form-group">
              <label>Venue</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
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
              Cancel
            </button>

            <button
              type="submit"
              className="hod-save-button"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>

      {/* MEETING DETAILS POPUP */}

      {renderMeetingDetails()}

    </div>
  );
};

export default HODMeetings;
