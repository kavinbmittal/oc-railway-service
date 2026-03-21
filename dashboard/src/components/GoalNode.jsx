/**
 * GoalNode — single goal row with progress bar, status badge, project tags.
 * Supports inline editing of title and status.
 */

import { useState } from "react";
import { StatusBadge } from "./StatusBadge.jsx";

const GOAL_STATUSES = ["not_started", "in_progress", "at_risk", "completed"];

function progressColor(pct) {
  if (pct >= 100) return "bg-green-400";
  if (pct >= 60) return "bg-blue-400";
  if (pct >= 30) return "bg-yellow-400";
  return "bg-muted-foreground/40";
}

const LEVEL_BADGE = {
  company: "text-purple-300 bg-purple-900/40",
  project: "text-blue-300 bg-blue-900/40",
  milestone: "text-green-300 bg-green-900/40",
};

export function GoalNode({ goal, onUpdate, depth = 0 }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(goal.title);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const pct = Math.round((goal.progress || 0) * 100);

  const handleTitleSave = () => {
    if (titleDraft.trim() && titleDraft.trim() !== goal.title) {
      onUpdate?.(goal.id, { title: titleDraft.trim() });
    }
    setEditingTitle(false);
  };

  const handleStatusChange = (newStatus) => {
    onUpdate?.(goal.id, { status: newStatus });
    setShowStatusMenu(false);
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/30 transition-colors group"
      style={{ paddingLeft: `${depth * 20 + 12}px` }}
    >
      {/* Level badge */}
      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap shrink-0 ${LEVEL_BADGE[goal.level] || LEVEL_BADGE.project}`}>
        {goal.level}
      </span>

      {/* Title (click to edit) */}
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input
            className="bg-transparent border border-border px-1.5 py-0.5 text-sm w-full outline-none focus:border-primary"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSave();
              if (e.key === "Escape") { setTitleDraft(goal.title); setEditingTitle(false); }
            }}
            autoFocus
          />
        ) : (
          <span
            className="truncate cursor-pointer hover:underline underline-offset-2"
            onClick={() => { setTitleDraft(goal.title); setEditingTitle(true); }}
          >
            {goal.title}
          </span>
        )}
      </div>

      {/* Progress bar (mini) */}
      <div className="w-20 shrink-0 hidden sm:block">
        <div className="flex items-center gap-1.5">
          <div className="relative h-1.5 flex-1 bg-muted overflow-hidden rounded-full">
            <div
              className={`absolute inset-y-0 left-0 transition-all duration-150 rounded-full ${progressColor(pct)}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums w-7 text-right">{pct}%</span>
        </div>
      </div>

      {/* Project tags */}
      {goal.projects?.length > 0 && (
        <div className="flex items-center gap-1 shrink-0 hidden md:flex">
          {goal.projects.map((p) => (
            <span
              key={p}
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground"
            >
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Status badge (click to change) */}
      <div className="relative shrink-0">
        <button onClick={() => setShowStatusMenu(!showStatusMenu)}>
          <StatusBadge status={goal.status} />
        </button>
        {showStatusMenu && (
          <div className="absolute right-0 top-full mt-1 z-20 border border-border bg-background shadow-lg py-1 min-w-[140px]">
            {GOAL_STATUSES.map((s) => (
              <button
                key={s}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent/50 transition-colors"
                onClick={() => handleStatusChange(s)}
              >
                <StatusBadge status={s} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
