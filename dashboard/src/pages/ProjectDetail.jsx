import { useState, useEffect } from "react";
import { getFile } from "../api.js";
import {
  ArrowLeft, FileText, Activity, DollarSign, Clock,
  User, Wallet, Target, ShieldCheck, Bot,
} from "lucide-react";
import Markdown from "../components/Markdown.jsx";

const TABS = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "standups", label: "Standups", icon: Activity },
  { id: "costs", label: "Costs", icon: DollarSign },
  { id: "activity", label: "Activity", icon: Clock },
];

const STATUS_BADGE = {
  active: "bg-green-900/50 text-green-300",
  paused: "bg-orange-900/50 text-orange-300",
  completed: "bg-blue-900/50 text-blue-300",
};

function parseProjectMd(raw) {
  if (!raw) return {};
  const titleMatch = raw.match(/^#\s+(.+)/m);
  const leadMatch = raw.match(/\*\*Lead:\*\*\s*(\S+)/);
  const budgetMatch = raw.match(/\*\*Budget:\*\*\s*(.+)/);
  const statusMatch = raw.match(/\*\*Status:\*\*\s*(\S+)/);
  const createdMatch = raw.match(/\*\*Created:\*\*\s*(\S+)/);
  const missionMatch = raw.match(/## Mission\n+([\s\S]*?)(?=\n## |$)/);
  const gatesMatch = raw.match(/## Approval Gates\n+([\s\S]*?)(?=\n## |$)/);
  const subagentsMatch = raw.match(/## Sub-agents\n+([\s\S]*?)(?=\n## |$)/);
  return {
    title: titleMatch?.[1] || "",
    lead: leadMatch?.[1] || "unassigned",
    budget: budgetMatch?.[1]?.trim() || "none",
    status: statusMatch?.[1] || "unknown",
    created: createdMatch?.[1] || "",
    mission: missionMatch?.[1]?.trim() || "",
    gates: gatesMatch?.[1]?.trim() || "",
    subagents: subagentsMatch?.[1]?.trim() || "",
  };
}

function parseActivityLog(raw) {
  if (!raw) return [];
  return raw
    .trim()
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const m = line.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\s*\|\s*(\S+)\s*\|\s*(.+)/);
      if (m) return { time: m[1], agent: m[2], event: m[3] };
      return { time: "", agent: "", event: line };
    })
    .reverse();
}

export default function ProjectDetail({ projectId, navigate }) {
  const [tab, setTab] = useState("overview");
  const [projectRaw, setProjectRaw] = useState(null);
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
      setProjectRaw(proj?.content || null);
      setMilestones(miles?.content || null);
      setActivityLog(activity?.content || "");
      setStandups(standupList);
      setCosts(costList);
      setLoading(false);
    });
  }, [projectId]);

  const project = parseProjectMd(projectRaw);
  const activities = parseActivityLog(activityLog);
  const totalCost = costs.reduce((sum, c) => sum + (c.total_usd || 0), 0);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="bg-accent/75 h-6 w-48" />
        <div className="bg-accent/75 h-4 w-32" />
        <div className="bg-accent/75 h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb bar */}
      <div className="h-12 flex items-center gap-2">
        <button
          onClick={() => navigate("overview")}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Dashboard
        </button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-[13px] font-semibold text-foreground truncate">
          {project.title || projectId}
        </span>
      </div>

      {/* Project header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold text-foreground">
            {project.title || projectId}
          </h2>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              STATUS_BADGE[project.status] || "bg-muted text-muted-foreground"
            }`}
          >
            {project.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User size={12} />
            {project.lead}
          </span>
          <span className="flex items-center gap-1.5 font-mono tabular-nums">
            <Wallet size={12} />
            {project.budget}
          </span>
          {project.created && (
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {project.created}
            </span>
          )}
          {totalCost > 0 && (
            <span className="flex items-center gap-1.5 font-mono tabular-nums">
              <DollarSign size={12} />
              ${totalCost.toFixed(2)} spent
            </span>
          )}
        </div>
      </div>

      {/* Tabs — line variant */}
      <div className="flex gap-0 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium transition-colors ${
              tab === id
                ? "text-foreground after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="space-y-4">
          {project.mission && (
            <div className="border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} className="text-muted-foreground/50" />
                <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Mission
                </h3>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{project.mission}</p>
            </div>
          )}

          {milestones && (
            <div className="border border-border p-4">
              <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
                Milestones
              </h3>
              <Markdown content={milestones} />
            </div>
          )}

          {project.gates && (
            <div className="border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={14} className="text-muted-foreground/50" />
                <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Approval Gates
                </h3>
              </div>
              <div className="divide-y divide-border">
                {project.gates
                  .split("\n")
                  .filter(Boolean)
                  .map((gate, i) => {
                    const text = gate.replace(/^-\s*/, "");
                    const [name, requires] = text.split(":").map((s) => s.trim());
                    return (
                      <div key={i} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-foreground/80">{name}</span>
                        {requires && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {requires}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {project.subagents && !project.subagents.includes("(none") && (
            <div className="border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot size={14} className="text-muted-foreground/50" />
                <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Sub-agents
                </h3>
              </div>
              <Markdown content={project.subagents} />
            </div>
          )}
        </div>
      )}

      {/* Standups tab */}
      {tab === "standups" && (
        <div>
          {standups.length === 0 ? (
            <EmptyState icon={Activity} text="No standups yet" sub="The lead will post daily updates here." />
          ) : (
            <div className="space-y-3">
              {standups.map((s) => (
                <div key={s.name} className="border border-border p-4">
                  <h4 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
                    {s.name.replace(".md", "")}
                  </h4>
                  <Markdown content={s.content} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Costs tab */}
      {tab === "costs" && (
        <div className="space-y-4">
          {costs.length === 0 ? (
            <EmptyState icon={DollarSign} text="No cost data yet" sub="Agents will log their token usage here." />
          ) : (
            <>
              {/* Summary metrics */}
              <div className="grid grid-cols-2 gap-1">
                <div className="border border-border p-4">
                  <div className="text-2xl font-semibold tabular-nums font-mono">
                    ${totalCost.toFixed(2)}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mt-1">
                    Total Spend
                  </div>
                </div>
                <div className="border border-border p-4">
                  <div className="text-2xl font-semibold tabular-nums">
                    {costs.reduce((sum, c) => sum + (c.entries?.length || 0), 0)}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mt-1">
                    Entries
                  </div>
                </div>
              </div>

              {/* Per-agent breakdown */}
              <div className="border border-border divide-y divide-border">
                {costs.map((c) => (
                  <div key={c.agent} className="px-4 py-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">{c.agent}</span>
                      <span className="text-sm font-mono tabular-nums text-foreground">
                        ${c.total_usd?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    {c.entries && c.entries.length > 0 && (
                      <div className="space-y-1">
                        {c.entries.slice(-5).map((e, i) => (
                          <div key={i} className="flex justify-between text-xs text-muted-foreground">
                            <span className="truncate mr-4">{e.task}</span>
                            <span className="font-mono tabular-nums shrink-0">
                              {e.type === "claude-code" ? (
                                <span className="text-cyan-400">CC</span>
                              ) : (
                                `$${e.cost_usd?.toFixed(2)}`
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Activity tab */}
      {tab === "activity" && (
        <div>
          {activities.length === 0 ? (
            <EmptyState icon={Clock} text="No activity yet" sub="Events will appear as the project progresses." />
          ) : (
            <div className="border border-border divide-y divide-border">
              {activities.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="shrink-0 text-xs text-muted-foreground font-mono tabular-nums pt-0.5 w-28">
                    {a.time}
                  </span>
                  <span className="shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground">
                      {a.agent}
                    </span>
                  </span>
                  <span className="text-foreground/80">{a.event}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-border">
      <div className="bg-muted/50 p-4 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
      {sub && <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>}
    </div>
  );
}

async function loadStandups(projectId) {
  try {
    const dir = await getFile(`shared/projects/${projectId}/standups`);
    if (dir.type !== "directory" || !dir.entries) return [];
    const files = dir.entries.filter((e) => e.type === "file" && e.name.endsWith(".md"));
    return Promise.all(
      files.sort((a, b) => b.name.localeCompare(a.name)).slice(0, 7).map(async (f) => {
        const data = await getFile(`shared/projects/${projectId}/standups/${f.name}`);
        return { name: f.name, content: data.content || "" };
      })
    );
  } catch {
    return [];
  }
}

async function loadCosts(projectId) {
  try {
    const dir = await getFile(`shared/projects/${projectId}/costs`);
    if (dir.type !== "directory" || !dir.entries) return [];
    const files = dir.entries.filter((e) => e.type === "file" && e.name.endsWith(".json"));
    return Promise.all(
      files.map(async (f) => {
        const data = await getFile(`shared/projects/${projectId}/costs/${f.name}`);
        return data.content || {};
      })
    );
  } catch {
    return [];
  }
}
