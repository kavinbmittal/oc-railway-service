import { useState, useEffect } from "react";
import { getProjects, getInbox, getIssues } from "../api.js";
import { FolderKanban, User, DollarSign, ArrowRight, AlertTriangle, CheckCircle, ArrowUpRight, CircleDot } from "lucide-react";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { MetricCard } from "../components/MetricCard.jsx";
import { StatusBadge, STATUS_DOT } from "../components/StatusBadge.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { EntityRow } from "../components/EntityRow.jsx";
import { PriorityDot } from "../components/PriorityIcon.jsx";
import { StatusCircle } from "../components/StatusSelect.jsx";

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Overview({ navigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inboxCount, setInboxCount] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    Promise.all([
      getProjects(),
      getInbox().catch(() => null),
    ])
      .then(async ([projs, inbox]) => {
        setProjects(projs);
        if (inbox?.counts) setInboxCount(inbox.counts.total || 0);
        // Load recent issues across all projects
        try {
          const allIssues = [];
          await Promise.all(
            projs.map(async (p) => {
              try {
                const issues = await getIssues(p.id);
                issues.forEach((i) => allIssues.push(i));
              } catch { /* skip */ }
            })
          );
          allIssues.sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
          setRecentIssues(allIssues.slice(0, 5));
        } catch { /* skip */ }
      })
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
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-8 w-16" />
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

      {/* Needs Attention banner */}
      {inboxCount !== null && (
        <div
          onClick={() => navigate("inbox")}
          className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-colors ${
            inboxCount > 0
              ? "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15"
              : "border-green-500/30 bg-green-500/10 hover:bg-green-500/15"
          }`}
        >
          {inboxCount > 0 ? (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-sm font-medium text-amber-300 flex-1">
                {inboxCount} {inboxCount === 1 ? "item needs" : "items need"} your attention
              </span>
              <ArrowUpRight className="h-4 w-4 text-amber-400/60 shrink-0" />
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
              <span className="text-sm font-medium text-green-300 flex-1">
                All clear
              </span>
            </>
          )}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-1 sm:gap-2">
        <MetricCard label="Projects" value={projects.length} />
        <MetricCard label="Active" value={activeCount} />
        <MetricCard label="Weekly Budget" value={`$${totalBudget}`} mono />
        <MetricCard label="Agents" value="9" />
      </div>

      {/* Projects section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Projects
        </h3>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            text="No projects yet"
            sub="Create a project directory in shared/projects/"
          />
        ) : (
          <div className="border border-border divide-y divide-border">
            {projects.map((project) => (
              <EntityRow
                key={project.id}
                onClick={() => navigate("project", project.id)}
                leading={
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      STATUS_DOT[project.status] || STATUS_DOT.unknown
                    }`}
                  />
                }
                title={project.title}
                trailing={
                  <>
                    <StatusBadge status={project.status} />
                    <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <User size={12} />
                      {project.lead}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono tabular-nums shrink-0">
                      {project.budget}
                    </span>
                    <ArrowRight size={14} className="text-muted-foreground/50 shrink-0" />
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Issues section */}
      {recentIssues.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Recent Issues
          </h3>
          <div className="border border-border divide-y divide-border">
            {recentIssues.map((issue) => (
              <EntityRow
                key={issue.id}
                onClick={() => navigate("issue-detail", { projectSlug: issue.project, issueId: issue.id })}
                leading={
                  <div className="flex items-center gap-2">
                    <PriorityDot priority={issue.priority} />
                    <StatusCircle status={issue.status} />
                  </div>
                }
                identifier={issue.id}
                title={issue.title}
                trailing={
                  <>
                    <StatusBadge status={issue.status} />
                    {issue.assignee && (
                      <span className="text-xs text-muted-foreground shrink-0 capitalize">
                        {issue.assignee}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0 hidden sm:inline">
                      {timeAgo(issue.updated)}
                    </span>
                    <ArrowRight size={14} className="text-muted-foreground/50 shrink-0" />
                  </>
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
