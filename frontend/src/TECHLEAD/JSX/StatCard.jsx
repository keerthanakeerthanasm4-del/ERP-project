
import React from "react";
import {
  FolderKanban,
  Users,
  UserRound,
  TrendingUp,
} from "lucide-react";

import "../CSS/StatCard.css";

const iconMap = {
  projects: FolderKanban,
  leads: UserRound,
  members: Users,
};

const StatCard = ({
  title,
  value = 0,
  type = "projects",
  description,
  change,
}) => {
  const Icon = iconMap[type] || FolderKanban;

  return (
    <div className={`tl-stat-card tl-stat-${type}`}>
      <div className="tl-stat-card-top">
        <div className="tl-stat-icon">
          <Icon size={25} />
        </div>

        <span className="tl-stat-label">{title}</span>
      </div>

      <div className="tl-stat-card-bottom">
        <h2>{value}</h2>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {change && (
        <div className="tl-stat-change">
          <TrendingUp size={15} />
          <span>{change}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
