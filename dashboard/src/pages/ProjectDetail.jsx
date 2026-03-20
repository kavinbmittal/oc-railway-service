import { useState, useEffect } from "react";
import { getFile } from "../api.js";
import { ArrowLeft, FileText, Activity, DollarSign, FlaskConical } from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "standups", label: "Standups", icon: Activity },
  { id: "costs", label: "Costs", icon: DollarSign },
  { id: "activity", label: "Activity", icon: Activity },
];

export default function ProjectDetail({ projectId, navigate }) {
  const [tab, setTab] = useState("overview");
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [standups, setStandups] = useState([]);
  const [costs, setCosts] = useState([]);
  const [activityLog, setActivityLog] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFile(`shared/projects/${projectId}/PROJECT.md`).catch(() => null),
      getFile(`shared/projects/${projectId}/milestones.md`).catch(() => null),
      getFile(`shared/projects/${projectId}/activity.log`).catch(() => null),
      loadStandups(projectId),
      loadCosts(projectId),
    ]).then(([proj, miles, activity, standupList, costList]) => {
      setProject(proj?.content || null);
      setMilestones(miles?.content || null);
      setActivityLog(activity?.content || "");
      setStandups(standupList);
      setCosts(costList);
      setLoading(false);
    });
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500 text-sm">Loading project...</div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("overview")}
        className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to projects
      </button>

      <h2 className="text-2xl font-bold text-zinc-100 mb-6">{projectId}</h2>

      <div className="flex gap-1 mb-6 border-b border-zinc-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ${
              tab === id
                ? "border-zinc-100 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          {project && (
            <section>
              <h3 className="text-sm font-semibold text-zinc-300 mb-2">PROJECT.md</h3>
              <pre className="text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg p-4 whitespace-pre-wrap font-mono">
                {project}
              </pre>
            </section>
          )}
          {milestones && (
            <section>
              <h3 className="text-sm font-semibold text-zinc-300 mb-2">Milestones</h3>
              <pre className="text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg p-4 whitespace-pre-wrap font-mono">
                {milestones}
              </pre>
            </section>
          )}
        </div>
      )}

      {tab === "standups" && (
        <div className="space-y-4">
          {standups.length === 0 ? (
            <p className="text-zinc-500 text-sm">No standups yet.</p>
          ) : (
            standups.map((s) => (
              <div
                key={s.name}
                className="border border-zinc-800 rounded-lg p-4 bg-zinc-900"
              >
                <h4 className="text-sm font-semibold text-zinc-300 mb-2">
                  {s.name.replace(".md", "")}
                </h4>
                <pre className="text-sm text-zinc-400 whitespace-pre-wrap font-mono">
                  {s.content}
                </pre>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "costs" && (
        <div className="space-y-4">
          {costs.length === 0 ? (
            <p className="text-zinc-500 text-sm">No cost data yet.</p>
          ) : (
            costs.map((c) => (
              <div
                key={c.agent}
                className="border border-zinc-800 rounded-lg p-4 bg-zinc-900"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-zinc-300">{c.agent}</h4>
                  <span className="text-sm font-mono text-emerald-400">
                    ${c.total_usd?.toFixed(2) || "0.00"}
                  </span>
                </div>
                {c.entries && (
                  <div className="text-xs text-zinc-500 space-y-1">
                    {c.entries.slice(-5).map((e, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{e.task}</span>
                        <span className="font-mono">
                          {e.type === "claude-code" ? "CC" : `$${e.cost_usd?.toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "activity" && (
        <div>
          {activityLog ? (
            <pre className="text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg p-4 whitespace-pre-wrap font-mono">
              {activityLog}
            </pre>
          ) : (
            <p className="text-zinc-500 text-sm">No activity logged yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

async function loadStandups(projectId) {
  try {
    const dir = await getFile(`shared/projects/${projectId}/standups`);
    if (dir.type !== "directory" || !dir.entries) return [];
    const files = dir.entries.filter((e) => e.type === "file" && e.name.endsWith(".md"));
    const results = await Promise.all(
      files.sort((a, b) => b.name.localeCompare(a.name)).slice(0, 7).map(async (f) => {
        const data = await getFile(`shared/projects/${projectId}/standups/${f.name}`);
        return { name: f.name, content: data.content || "" };
      })
    );
    return results;
  } catch {
    return [];
  }
}

async function loadCosts(projectId) {
  try {
    const dir = await getFile(`shared/projects/${projectId}/costs`);
    if (dir.type !== "directory" || !dir.entries) return [];
    const files = dir.entries.filter((e) => e.type === "file" && e.name.endsWith(".json"));
    const results = await Promise.all(
      files.map(async (f) => {
        const data = await getFile(`shared/projects/${projectId}/costs/${f.name}`);
        return data.content || {};
      })
    );
    return results;
  } catch {
    return [];
  }
}
