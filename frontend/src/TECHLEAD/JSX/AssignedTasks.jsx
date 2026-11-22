
import React, { useState } from "react";
import { Pencil, Trash2, ClipboardList } from "lucide-react";
import "../CSS/AssignedTasks.css";

const emptyForm = {
  projectId: "",
  taskTitle: "",
  description: "",
  teamLeadId: "",
  priority: "Medium",
  deadline: "",
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const AssignedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const todayDate = getTodayDate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent past deadlines for newly created tasks.
    if (
      editingId === null &&
      formData.deadline < todayDate
    ) {
      alert("Please select today or a future date for the deadline.");
      return;
    }

    // Update existing task.
    if (editingId !== null) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingId
            ? {
                ...task,
                ...formData,
                projectName: formData.projectId,
                teamLeadName: formData.teamLeadId,
              }
            : task
        )
      );

      setEditingId(null);
    } else {
      // Create new task.
      const newTask = {
        ...formData,
        id: Date.now(),
        projectName: formData.projectId,
        teamLeadName: formData.teamLeadId,
        status: "Pending",
      };

      setTasks((prevTasks) => [...prevTasks, newTask]);
    }

    setFormData({ ...emptyForm });
  };

  // Edit task.
  const handleEdit = (task) => {
    setFormData({
      projectId: task.projectId,
      taskTitle: task.taskTitle,
      description: task.description,
      teamLeadId: task.teamLeadId,
      priority: task.priority,
      deadline: task.deadline,
    });

    setEditingId(task.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete task.
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== id)
      );

      if (editingId === id) {
        setEditingId(null);
        setFormData({ ...emptyForm });
      }
    }
  };

  // Cancel editing.
  const handleCancel = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
  };

  return (
    <div className="tl-assigned-page">

      {/* Page Heading */}
      <div className="tl-assigned-heading">
        <h1>Assigned Tasks</h1>
        <p>Create, assign and manage tasks for your team.</p>
      </div>

      {/* Task Form */}
      <section className="tl-task-form-card">

        <h2>
          {editingId !== null ? "Edit Task" : "Create New Task"}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="tl-task-form-grid">

            {/* Project Name */}
            <div className="tl-task-field">
              <label>Project Name</label>

              <input
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                placeholder="Enter project name"
                required
              />
            </div>

            {/* Task Title */}
            <div className="tl-task-field">
              <label>Task Title</label>

              <input
                name="taskTitle"
                value={formData.taskTitle}
                onChange={handleChange}
                placeholder="Enter task title"
                required
              />
            </div>

            {/* Description */}
            <div className="tl-task-field tl-task-full">
              <label>Task Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the task and requirements"
                rows="3"
                required
              />
            </div>

            {/* Team Lead */}
            <div className="tl-task-field">
              <label>Team Lead Name</label>

              <input
                name="teamLeadId"
                value={formData.teamLeadId}
                onChange={handleChange}
                placeholder="Enter Team Lead name"
                required
              />
            </div>

            {/* Priority */}
            <div className="tl-task-field">
              <label>Priority</label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Deadline */}
            <div className="tl-task-field tl-task-full">
              <label>Deadline</label>

              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                min={
                  editingId === null
                    ? todayDate
                    : undefined
                }
                required
              />
            </div>

          </div>

          {/* Form Buttons */}
          <div className="tl-task-form-actions">

            <button
              type="submit"
              className="tl-assign-btn"
            >
              {editingId !== null ? "Update Task" : "Assign Task"} →
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="tl-cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </section>

      {/* Assigned Tasks Table */}
      <section className="tl-task-table-card">

        <div className="tl-task-table-heading">
          <h2>Assigned Tasks</h2>
          <span>{tasks.length} Tasks</span>
        </div>

        <div className="tl-task-table-wrapper">

          <table className="tl-task-table">

            <thead>
              <tr>
                <th>Project Name</th>
                <th>Task</th>
                <th>Team Lead</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {tasks.length > 0 ? (

                tasks.map((task) => (

                  <tr key={task.id}>

                    <td>{task.projectName}</td>

                    <td>{task.taskTitle}</td>

                    <td>{task.teamLeadName}</td>

                    <td>
                      <span
                        className={`tl-priority ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td>{task.deadline}</td>

                    <td>
                      <span className="tl-task-status">
                        {task.status}
                      </span>
                    </td>

                    <td>
                      <div className="tl-task-actions">

                        <button
                          type="button"
                          className="tl-edit-btn"
                          onClick={() => handleEdit(task)}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="tl-delete-btn"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="7" className="tl-task-empty">

                    <ClipboardList size={30} />

                    <p>No tasks assigned yet.</p>

                    <span>
                      Create a new task using the form above.
                    </span>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
};

export default AssignedTasks;
