import { useState, useEffect } from "react";
import { getProjects } from "../api.js";
import { FolderKanban, DollarSign, Clock, CheckCircle2 } from "lucide-react";

const STATUS_COLORS = {
  active: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400",
  completed: "bg-zinc-500/20 text-zinc-400",
  unknown: "bg-zinc-500/20 text-zinc-500",
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
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500 text-sm">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-sm">Error: {error}</div>
      </div>
    );
  }

  const activeCount = projects.filter((p) => p.status === "active").length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-100">Overview</h2>
        <p className="text-zinc-500 text-sm mt-1">
          {projects.length} project{projects.length !== 1 ? "s" : ""} ·{" "}
          {activeCount} active
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-zinc-700 rounded-lg p-12 text-center">
          <FolderKanban className="mx-auto mb-3 text-zinc-600" size={32} />
          <p className="text-zinc-400 text-sm">No projects yet.</p>
          <p className="text-zinc-600 text-xs mt-1">
            Create a project by adding a directory to shared/projects/
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => navigate("project", project.id)}
              className="text-left border border-zinc-800 rounded-lg p-5 bg-zinc-900 hover:bg-zinc-800/70 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-zinc-100 text-sm">
                  {project.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    STATUS_COLORS[project.status] || STATUS_COLORS.unknown
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Users size={12} />
                  <span>Lead: {project.lead}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign size={12} />
                  <span>{project.budget}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Users(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}
