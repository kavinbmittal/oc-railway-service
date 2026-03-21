import { useState } from "react";
import { Check, X, Loader2, ChevronDown } from "lucide-react";
import { resolveApproval } from "../api.js";
import { formatTimeAgo } from "../utils/formatDate.js";
import Markdown from "./Markdown.jsx";

export default function ApprovalCard({
  approval,
  onResolved,
  navigate,
  hideProject = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [action, setAction] = useState(null); // "approved" | "rejected"
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleResolve(decision) {
    if (decision === "rejected" && !comment.trim()) {
      setAction("rejected");
      if (!expanded) setExpanded(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await resolveApproval({
        project: approval._project || approval.project,
        id: approval.id,
        decision,
        comment: comment.trim() || null,
        requester: approval.requester,
        gate: approval.gate,
        what: approval.what,
        why: approval.why,
        created: approval.created,
      });
      onResolved();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const timeAgo = approval.created
    ? formatTimeAgo(approval.created)
    : approval.timestamp
      ? formatTimeAgo(approval.timestamp)
      : "";

  const projectName = approval._project || approval.project;
  const isDeliverable =
    approval._source === "deliverables" ||
    approval.gate === "deliverable" ||
    approval.gate === "deliverable-review";
  const title = approval.what || approval.title || "";

  // --- Collapsed state ---
  if (!expanded) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
        onClick={() => setExpanded(true)}
      >
        {/* Gate badge + title + project */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-amber-900/50 text-amber-300">
            {approval.gate}
          </span>
          <span className="text-sm font-medium text-foreground truncate">
            {title}
          </span>
          {!hideProject && projectName && (
            <span
              className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-accent text-accent-foreground cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate && navigate("project", projectName);
              }}
            >
              {projectName}
            </span>
          )}
          {!hideProject && !projectName && approval.requester && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {approval.requester}
            </span>
          )}
        </div>

        {/* Right side: requester, time, buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {projectName && approval.requester && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {approval.requester}
            </span>
          )}
          {timeAgo && (
            <span className="text-xs text-muted-foreground/60 hidden sm:inline">
              {timeAgo}
            </span>
          )}
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setExpanded(true);
                setAction("approved");
              }}
              disabled={submitting}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Check size={12} />
              Approve
            </button>
            <button
              onClick={() => {
                setAction("rejected");
                setExpanded(true);
              }}
              disabled={submitting}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <X size={12} />
              Reject
            </button>
          </div>
          <ChevronDown size={14} className="text-muted-foreground/40" />
        </div>
      </div>
    );
  }

  // --- Expanded state ---
  return (
    <div className="bg-white/5 rounded-lg p-6 space-y-4 transition-all">
      {/* Header row: gate + title */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-amber-900/50 text-amber-300">
              {approval.gate}
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="ml-auto text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              Collapse
            </button>
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {title}
          </h3>
        </div>
      </div>

      {/* Project link */}
      {!hideProject && projectName && navigate && (
        <div>
          <button
            onClick={() => navigate("project", projectName)}
            className="text-sm text-primary hover:underline"
          >
            {projectName}
          </button>
        </div>
      )}

      {/* Requester + timestamp */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {approval.requester && (
          <span>
            Requested by{" "}
            <span
              className={navigate ? "cursor-pointer hover:underline" : ""}
              onClick={() => {
                if (!navigate) return;
                const name = (approval.requester || "").toLowerCase();
                const workspaceId =
                  name === "sam" ? "workspace" : `workspace-${name}`;
                navigate("agent-detail", workspaceId);
              }}
            >
              {approval.requester}
            </span>
          </span>
        )}
        {timeAgo && <span className="text-muted-foreground/60">{timeAgo}</span>}
      </div>

      {/* Why text (rendered as markdown) */}
      {approval.why && !isDeliverable && (
        <div className="mc-prose">
          <Markdown content={approval.why} className="text-sm" />
        </div>
      )}

      {/* Deliverable content (full markdown) */}
      {isDeliverable && approval.why && (
        <div className="border border-border rounded p-4 bg-background max-h-[calc(100vh-300px)] overflow-y-auto mc-prose">
          <Markdown content={approval.why} className="text-sm" />
        </div>
      )}

      {/* Comment input */}
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            action === "rejected"
              ? "Reason for rejection (required)"
              : "Comment (optional)"
          }
          rows={2}
          className="w-full px-3 py-2 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors resize-none rounded"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleResolve("approved")}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {submitting && action === "approved" ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Check size={12} />
          )}
          Approve
        </button>
        <button
          onClick={() => handleResolve("rejected")}
          disabled={submitting || (action === "rejected" && !comment.trim())}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {submitting && action === "rejected" ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <X size={12} />
          )}
          Reject
        </button>
      </div>
    </div>
  );
}
