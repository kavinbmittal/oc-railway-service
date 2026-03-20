import { useState, useEffect } from "react";
import { getProjects } from "../api.js";
import { FolderKanban, User, DollarSign, ArrowRight } from "lucide-react";

const STATUS_COLORS = {
  active: "bg-green-900/50 text-green-300",
  paused: "bg-orange-900/50 text-orange-300",
  completed: "bg-blue-900/50 text-blue-300",
  unknown: "bg-muted text-muted-foreground",
};

const STATUS_DOT = {
  active: "bg-green-400",
  paused: "bg-yellow-400",
  completed: "bg-blue-400",
  unknown: "bg-muted-foreground",
};

export default function Overview({ navigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border p-4">
              <div className="bg-accent/75 h-4 w-20 mb-3" />
              <div className="bg-accent/75 h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-destructive">Error: {error}</p>
      </div>
    );
  }

  const activeCount = projects.filter((p) => p.status === "active").length;
  const totalBudget = projects
    .map((p) => {
      const match = p.budget?.match(/\$(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb bar */}
      <div className="h-12 flex items-center">
        <h1 className="text-sm font-semibold uppercase tracking-wider">Dashboard</h1>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-1 sm:gap-2">
        <MetricCard label="Projects" value={projects.length} />
        <MetricCard label="Active" value={activeCount} />
        <MetricCard
          label="Weekly Budget"
          value={`$${totalBudget}`}
          mono
        />
        <MetricCard label="Agents" value="9" />
      </div>

      {/* Projects section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Projects
        </h3>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-border">
            <div className="bg-muted/50 p-4 mb-4">
              <FolderKanban className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No projects yet</p>
            <p className="text-xs text-muted-foreground/60">
              Create a project directory in shared/projects/
            </p>
          </div>
        ) : (
          <div className="border border-border divide-y divide-border">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate("project", project.id)}
                className="flex items-center gap-3 px-4 py-3 text-sm w-full text-left transition-colors cursor-pointer hover:bg-accent/50"
              >
                {/* Status dot */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    STATUS_DOT[project.status] || STATUS_DOT.unknown
                  }`}
                />

                {/* Title */}
                <span className="font-medium text-foreground flex-1 truncate">
                  {project.title}
                </span>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${
                    STATUS_COLORS[project.status] || STATUS_COLORS.unknown
                  }`}
                >
                  {project.status}
                </span>

                {/* Lead */}
                <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <User size={12} />
                  {project.lead}
                </span>

                {/* Budget */}
                <span className="text-xs text-muted-foreground font-mono tabular-nums shrink-0">
                  {project.budget}
                </span>

                <ArrowRight size={14} className="text-muted-foreground/50 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, mono }) {
  return (
    <div className="border border-border px-4 py-4 sm:px-5 sm:py-5">
      <div
        className={`text-2xl sm:text-3xl font-semibold tracking-tight ${
          mono ? "tabular-nums font-mono" : "tabular-nums"
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}
