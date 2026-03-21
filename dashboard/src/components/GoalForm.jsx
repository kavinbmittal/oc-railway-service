/**
 * GoalForm — inline create form for goals.
 */

import { useState } from "react";
import { Plus, X } from "lucide-react";

const LEVELS = ["company", "project", "milestone"];

export function GoalForm({ goals, projects, onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("project");
  const [parent, setParent] = useState("");
  const [linkedProjects, setLinkedProjects] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      level,
      parent: parent || null,
      projects: linkedProjects,
    });
    setTitle("");
    setLevel("project");
    setParent("");
    setLinkedProjects([]);
  };

  const toggleProject = (slug) => {
    setLinkedProjects((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  };

  const parentOptions = goals.filter((g) => {
    // Can only parent under company or project level
    if (level === "company") return false;
    if (level === "project") return g.level === "company";
    return g.level === "company" || g.level === "project";
  });

  return (
    <form onSubmit={handleSubmit} className="border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium">Add Goal</span>
        {onCancel && (
          <button type="button" onClick={onCancel} className="ml-auto p-1 hover:bg-accent/50 rounded transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <input
        className="w-full bg-transparent border border-border px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
        placeholder="Goal title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />

      <div className="flex items-center gap-3 flex-wrap">
        {/* Level */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Level:</span>
          <select
            className="bg-transparent border border-border px-2 py-1 text-xs outline-none focus:border-primary"
            value={level}
            onChange={(e) => { setLevel(e.target.value); setParent(""); }}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Parent */}
        {parentOptions.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Parent:</span>
            <select
              className="bg-transparent border border-border px-2 py-1 text-xs outline-none focus:border-primary max-w-[200px]"
              value={parent}
              onChange={(e) => setParent(e.target.value)}
            >
              <option value="">(none)</option>
              {parentOptions.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Linked projects */}
      {projects && projects.length > 0 && (
        <div>
          <span className="text-xs text-muted-foreground">Link to projects:</span>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {projects.map((p) => {
              const slug = p.id || p.slug;
              const active = linkedProjects.includes(slug);
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => toggleProject(slug)}
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono border transition-colors ${
                    active
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {p.title || slug}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Goal
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
