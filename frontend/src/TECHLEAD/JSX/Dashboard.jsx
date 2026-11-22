
import React from "react";
import {
  FolderKanban,
  Users,
  Clock,
  Activity,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import StatCard from "./StatCard";
import "../CSS/Dashboard.css";

const Dashboard = ({
  totalProjects = 0,
  totalTeamLeads = 0,
  totalTeamMembers = 0,
  projects = [],
  deadlines = [],
  activities = [],
  onViewAllProjects,
  onViewAllDeadlines,
  onViewAllActivity,
}) => {
  return (
    <div className="tl-dashboard">

      {/* PAGE TITLE */}
      <div className="tl-dashboard-heading">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Monitor your projects, team and upcoming deadlines.</p>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="tl-stats-grid">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          type="projects"
          description="Projects assigned to you"
        />

        <StatCard
          title="Total Team Leads"
          value={totalTeamLeads}
          type="leads"
          description="Team leads in your projects"
        />

        <StatCard
          title="Total Team Members"
          value={totalTeamMembers}
          type="members"
          description="Members across your projects"
        />
      </div>

      {/* MAIN DASHBOARD GRID */}
      <div className="tl-dashboard-grid">

        {/* MY PROJECTS */}
        <section className="tl-dashboard-panel tl-projects-panel">
          <div className="tl-panel-header">
            <div className="tl-panel-title">
              <FolderKanban size={21} />
              <h3>My Projects</h3>
            </div>

            <button onClick={onViewAllProjects}>
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="tl-panel-content">
            {projects.length > 0 ? (
              projects.slice(0, 4).map((project) => (
                <div className="tl-project-item" key={project.id}>
                  <div className="tl-project-info">
                    <h4>{project.name}</h4>
                    <p>
                      {project.taskCount ?? 0} Tasks ·{" "}
                      {project.phase || "Phase not set"}
                    </p>
                  </div>

                  <div className="tl-project-progress">
                    <span>{project.progress ?? 0}%</span>
                    <div className="tl-progress-track">
                      <div
                        className="tl-progress-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, Number(project.progress) || 0)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="tl-empty-state">
                <FolderKanban size={32} />
                <p>No projects assigned yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* UPCOMING DEADLINES */}
        <section className="tl-dashboard-panel">
          <div className="tl-panel-header">
            <div className="tl-panel-title">
              <Clock size={21} />
              <h3>Upcoming Deadlines</h3>
            </div>

            <button onClick={onViewAllDeadlines}>
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="tl-panel-content">
            {deadlines.length > 0 ? (
              deadlines.slice(0, 4).map((deadline) => (
                <div className="tl-deadline-item" key={deadline.id}>
                  <div className="tl-deadline-icon">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <h4>{deadline.title}</h4>
                    <p>{deadline.projectName || "Project"}</p>
                    <span>{deadline.date || "Date not set"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="tl-empty-state">
                <CalendarDays size={32} />
                <p>No upcoming deadlines.</p>
              </div>
            )}
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section className="tl-dashboard-panel tl-activity-panel">
          <div className="tl-panel-header">
            <div className="tl-panel-title">
              <Activity size={21} />
              <h3>Recent Activity</h3>
            </div>

            <button onClick={onViewAllActivity}>
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="tl-panel-content">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity) => (
                <div className="tl-activity-item" key={activity.id}>
                  <div className="tl-activity-dot"></div>
                  <div>
                    <p>{activity.message}</p>
                    <span>{activity.time || ""}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="tl-empty-state">
                <Activity size={32} />
                <p>No recent activity.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
