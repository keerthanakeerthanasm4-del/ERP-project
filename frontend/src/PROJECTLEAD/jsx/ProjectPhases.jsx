
import React, { useState } from "react";
import "../css/ProjectPhases.css";

function ProjectPhases({ projectName = "College ERP System" }) {
  const [phases, setPhases] = useState([
    {
      id: 1,
      name: "Planning",
      description: "Collect requirements and define project objectives.",
      status: "Completed",
      startDate: "2026-11-01",
      endDate: "2026-11-05",
    },
    {
      id: 2,
      name: "Design",
      description: "Prepare UI designs and database structure.",
      status: "In Progress",
      startDate: "2026-11-06",
      endDate: "2026-11-15",
    },
    {
      id: 3,
      name: "Development",
      description: "Develop frontend and backend modules.",
      status: "Pending",
      startDate: "2026-11-16",
      endDate: "2026-11-30",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const completedCount = phases.filter(
    (phase) => phase.status === "Completed"
  ).length;

  const progress =
    phases.length === 0
      ? 0
      : Math.round((completedCount / phases.length) * 100);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.endDate < formData.startDate) {
      alert("End date cannot be before start date.");
      return;
    }

    if (editingId) {
      setPhases((prev) =>
        prev.map((phase) =>
          phase.id === editingId
            ? { ...phase, ...formData }
            : phase
        )
      );
    } else {
      const newPhase = {
        id: Date.now(),
        ...formData,
        status: "Pending",
      };

      setPhases((prev) => [...prev, newPhase]);
    }

    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (phase) => {
    setFormData({
      name: phase.name,
      description: phase.description,
      startDate: phase.startDate,
      endDate: phase.endDate,
    });

    setEditingId(phase.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this phase?"
    );

    if (confirmDelete) {
      setPhases((prev) =>
        prev.filter((phase) => phase.id !== id)
      );
    }
  };

  const toggleStatus = (id) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === id
          ? {
              ...phase,
              status:
                phase.status === "Completed"
                  ? "In Progress"
                  : "Completed",
            }
          : phase
      )
    );
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div className="phases-page">
      <div className="phases-header">
        <div>
          <p className="phases-subtitle">PROJECT MANAGEMENT</p>
          <h1>Project Phases</h1>
          <p className="phases-project-name">
            Project: {projectName}
          </p>
        </div>

        <button
          className="add-phase-btn"
          onClick={() => {
            setEditingId(null);
            setFormData(emptyForm);
            setShowForm(true);
          }}
        >
          + Add Phase
        </button>
      </div>

      <div className="phase-progress-card">
        <div className="progress-info">
          <div>
            <h3>Overall Phase Progress</h3>
            <p>
              {completedCount} of {phases.length} phases completed
            </p>
          </div>

          <span className="progress-percentage">
            {progress}%
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {showForm && (
        <div className="phase-form-card">
          <h2>{editingId ? "Edit Phase" : "Create New Phase"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="phase-form-group">
              <label>Phase Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter phase name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="phase-form-group">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Describe this phase"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="phase-date-row">
              <div className="phase-form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="phase-form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || undefined}
                  required
                />
              </div>
            </div>

            <div className="phase-form-actions">
              <button type="button" onClick={closeForm}>
                Cancel
              </button>

              <button type="submit" className="save-phase-btn">
                {editingId ? "Update Phase" : "Save Phase"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="phases-section-heading">
        <div>
          <h2>All Phases</h2>
          <p>Manage the stages of your project.</p>
        </div>
        <span>{phases.length} Phases</span>
      </div>

      <div className="phases-list">
        {phases.length === 0 ? (
          <div className="no-phases">
            <h3>No phases added yet</h3>
            <p>Click Add Phase to create your first project phase.</p>
          </div>
        ) : (
          phases.map((phase, index) => (
            <div className="phase-card" key={phase.id}>
              <div className="phase-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="phase-main">
                <div className="phase-title-row">
                  <h3>{phase.name}</h3>

                  <span
                    className={`phase-status ${phase.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {phase.status}
                  </span>
                </div>

                <p className="phase-description">
                  {phase.description || "No description provided."}
                </p>

                <div className="phase-dates">
                  <span>Start: {phase.startDate || "Not set"}</span>
                  <span>End: {phase.endDate || "Not set"}</span>
                </div>

                <div className="phase-actions">
                  <button onClick={() => handleEdit(phase)}>
                    Edit
                  </button>

                  <button onClick={() => toggleStatus(phase.id)}>
                    {phase.status === "Completed"
                      ? "Reopen Phase"
                      : "Mark Completed"}
                  </button>

                  <button
                    className="delete-phase-btn"
                    onClick={() => handleDelete(phase.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProjectPhases;
