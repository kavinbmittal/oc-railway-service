/**
 * IssueDetail — full issue view with two-panel layout.
 * UI ported from Aura HTML reference.
 */
import { useState, useEffect, useCallback } from"react";
import { getIssue, updateIssue, addComment } from"../api.js";
import { Pencil, Trash2 } from"lucide-react";
import { formatDate as formatDateUtil, formatTimeAgo } from"../utils/formatDate.js";
import { Skeleton } from"../components/ui/Skeleton.jsx";
import Markdown from"../components/Markdown.jsx";
import { StatusSelect } from"../components/StatusSelect.jsx";
import { PrioritySelect } from"../components/PrioritySelect.jsx";
import { AssigneeSelect } from"../components/AssigneeSelect.jsx";
import { StatusBadge } from"../components/StatusBadge.jsx";

function formatDate(iso) {
 if (!iso) return"";
 return formatDateUtil(iso);
}

function timeAgo(iso) {
 if (!iso) return"";
 return formatTimeAgo(iso);
}

/* Priority badge — Aura bordered pill */
function PriorityBadge({ priority }) {
 const map = {
  critical:"border-red-500/20 bg-red-500/10 text-red-400",
  high:"border-orange-500/20 bg-orange-500/10 text-orange-400",
  medium:"border-blue-500/20 bg-blue-500/10 text-blue-400",
  low:"border-zinc-700/50 bg-zinc-800/50 text-zinc-500",
 };
 const cls = map[priority] || map.low;
 return (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${cls}`}>
   {(priority ||"none").charAt(0).toUpperCase() + (priority ||"none").slice(1)}
  </span>
 );
}

export default function IssueDetail({ projectSlug, issueId, navigate }) {
 const [issue, setIssue] = useState(null);
 const [loading, setLoading] = useState(true);
 const [editingTitle, setEditingTitle] = useState(false);
 const [titleDraft, setTitleDraft] = useState("");
 const [commentText, setCommentText] = useState("");
 const [submittingComment, setSubmittingComment] = useState(false);

 useEffect(() => {
  setLoading(true);
  getIssue(issueId, projectSlug)
   .then((data) => {
    setIssue(data);
    setTitleDraft(data.title ||"");
   })
   .catch((err) => console.error("Failed to load issue:", err))
   .finally(() => setLoading(false));
 }, [issueId, projectSlug]);

 const handleUpdate = useCallback(
  async (updates) => {
   try {
    const updated = await updateIssue(issueId, projectSlug, updates);
    setIssue(updated);
   } catch (err) {
    console.error("Failed to update issue:", err);
   }
  },
  [issueId, projectSlug]
 );

 const handleAddComment = useCallback(
  async () => {
   if (!commentText.trim()) return;
   setSubmittingComment(true);
   try {
    const result = await addComment(issueId, projectSlug, commentText.trim(),"kavin");
    setIssue(result.issue);
    setCommentText("");
   } catch (err) {
    console.error("Failed to add comment:", err);
   } finally {
    setSubmittingComment(false);
   }
  },
  [issueId, projectSlug, commentText]
 );

 function handleTitleBlur() {
  setEditingTitle(false);
  if (titleDraft.trim() && titleDraft !== issue?.title) {
   handleUpdate({ title: titleDraft.trim() });
  }
 }

 function handleTitleKeyDown(e) {
  if (e.key ==="Enter") { e.preventDefault(); e.target.blur(); }
  if (e.key ==="Escape") { setTitleDraft(issue?.title ||""); setEditingTitle(false); }
 }

 if (loading) {
  return (
   <div className="max-w-6xl mx-auto p-6 md:p-10 lg:p-12 space-y-4">
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-8 w-96 mb-2" />
    <Skeleton className="h-4 w-64" />
    <Skeleton className="h-64 w-full rounded-sm mt-4" />
   </div>
  );
 }

 if (!issue) {
  return (
   <div className="max-w-6xl mx-auto p-6 md:p-10 lg:p-12">
    <p className="text-sm text-zinc-500">Issue not found</p>
   </div>
  );
 }

 const comments = issue.comments || [];

 return (
  <div className="flex flex-col h-full">
   <header className="px-8 py-8 border-b border-zinc-800 shrink-0 bg-[#09090b]">
    {/* Breadcrumb */}
    <nav className="flex items-center text-[13px] text-zinc-400 mb-5 tracking-wide">
     <a href="#/overview" onClick={(e) => { e.preventDefault(); navigate("overview"); }} className="hover:text-zinc-200 transition-colors cursor-pointer">Projects</a>
     <span className="mx-2 text-zinc-600">&rsaquo;</span>
     <a href={`#/projects/${projectSlug}`} onClick={(e) => { e.preventDefault(); navigate("project", projectSlug); }} className="hover:text-zinc-200 transition-colors cursor-pointer capitalize">{projectSlug}</a>
     <span className="mx-2 text-zinc-600">&rsaquo;</span>
     <a href={`#/projects/${projectSlug}/issues`} onClick={(e) => { e.preventDefault(); navigate("project-tab", { slug: projectSlug, tab:"issues" }); }} className="hover:text-zinc-200 transition-colors cursor-pointer">Issues</a>
     <span className="mx-2 text-zinc-600">&rsaquo;</span>
     <span className="text-zinc-100 font-semibold">{issue.id}</span>
    </nav>

    {/* Title + Status Badge */}
    <div className="flex items-center gap-4 mb-4">
     {editingTitle ? (
      <input
       type="text"
       value={titleDraft}
       onChange={(e) => setTitleDraft(e.target.value)}
       onBlur={handleTitleBlur}
       onKeyDown={handleTitleKeyDown}
       className="flex-1 bg-transparent text-[30px] font-semibold text-zinc-100 leading-none tracking-tight outline-none border-b border-zinc-800 pb-1"
       autoFocus
      />
     ) : (
      <h1
       className="text-[30px] font-semibold text-zinc-100 leading-none tracking-tight cursor-text hover:text-zinc-300 transition-colors"
       onClick={() => setEditingTitle(true)}
      >
       {issue.title}
      </h1>
     )}
     <StatusBadge status={issue.status} />
    </div>

    {/* Metadata line */}
    <div className="flex flex-wrap items-center gap-2 text-[13px] text-zinc-500">
     <span className="font-mono">{issue.id}</span>
     {issue.priority && issue.priority !== "none" && (
      <>
       <span className="text-zinc-600">&middot;</span>
       <PriorityBadge priority={issue.priority} />
      </>
     )}
     {issue.assignee && (
      <>
       <span className="text-zinc-600">&middot;</span>
       <span className="text-zinc-300 capitalize">{issue.assignee}</span>
      </>
     )}
    </div>
   </header>

   <div className="flex-1 overflow-y-auto p-8">
   {/* Two-column layout — Aura: grid-cols-3 */}
   <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
    {/* Left Column — 2/3 */}
    <div className="xl:col-span-2 space-y-6">
     {/* Description Card — Aura card */}
     <div className="bg-app-card border border-zinc-800 rounded-sm shadow-sm">
      <div className="p-5 border-b border-zinc-800">
       <h2 className="text-sm font-medium text-zinc-100">Description</h2>
      </div>
      <div className="p-5 text-sm text-zinc-300 leading-relaxed prose">
       {issue.description ? (
        <Markdown content={issue.description} />
       ) : (
        <p className="text-zinc-600 italic">No description provided.</p>
       )}
      </div>
     </div>

     {/* Labels */}
     {issue.labels && issue.labels.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
       {issue.labels.map((label, i) => (
        <span key={i} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border border-zinc-800 bg-zinc-800 text-zinc-300">
         {label}
        </span>
       ))}
      </div>
     )}

     {/* Comments Card — Aura card with divide-y */}
     <div className="bg-app-card border border-zinc-800 rounded-sm shadow-sm">
      <div className="p-5 border-b border-zinc-800 flex items-center gap-2">
       <h2 className="text-sm font-medium text-zinc-100">Comments</h2>
       {comments.length > 0 && (
        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs text-zinc-400 font-mono">{comments.length}</span>
       )}
      </div>

      {comments.length > 0 && (
       <div className="divide-y divide-zinc-800/50">
        {comments.map((c, i) => (
         <div key={i} className="px-5 py-5">
          <div className="flex justify-between items-center mb-2">
           <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
             <span className="text-[10px] text-indigo-400 font-medium uppercase">{(c.author ||"S")[0]}</span>
            </div>
            <span className="text-sm font-medium text-zinc-200 capitalize">{c.author ||"system"}</span>
           </div>
           <span className="text-xs font-mono text-zinc-500">{timeAgo(c.timestamp)}</span>
          </div>
          <div className="text-sm text-zinc-300 mc-prose">
           <Markdown content={c.text || c.body ||""} />
          </div>
         </div>
        ))}
       </div>
      )}

      {/* Add comment area — Aura: bg-zinc-900/30 border-t */}
      <div className="p-5 bg-zinc-900/30 border-t border-zinc-800">
       <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        className="w-full rounded-sm border border-zinc-800 bg-[#09090b] text-sm text-zinc-200 p-3 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all resize-y min-h-[100px]"
        placeholder="Leave a comment or instruction for the agents..."
       />
       <div className="flex justify-between items-center mt-3">
        <div className="text-[12px] text-zinc-500">Markdown is supported</div>
        <button
         onClick={handleAddComment}
         disabled={submittingComment || !commentText.trim()}
         className="px-4 py-1.5 rounded-sm border border-zinc-700 bg-zinc-800 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
         Add Comment
        </button>
       </div>
      </div>
     </div>
    </div>

    {/* Right Column — 1/3 */}
    <div className="xl:col-span-1 space-y-6">
     {/* Details Card — Aura: p-5 space-y-5 with flex-col gap-1.5 */}
     <div className="bg-app-card border border-zinc-800 rounded-sm shadow-sm">
      <div className="p-5 space-y-5">
       <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase font-mono tracking-widest text-zinc-500">Status</label>
        <div className="p-2 rounded-sm border border-zinc-800/50 hover:border-zinc-700 bg-zinc-900/50">
         <StatusSelect
          value={issue.status}
          onChange={(status) => handleUpdate({ status })}
         />
        </div>
       </div>

       <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase font-mono tracking-widest text-zinc-500">Priority</label>
        <div className="p-2 rounded-sm border border-zinc-800/50 hover:border-zinc-700 bg-zinc-900/50">
         <PrioritySelect
          value={issue.priority}
          onChange={(priority) => handleUpdate({ priority })}
         />
        </div>
       </div>

       <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase font-mono tracking-widest text-zinc-500">Assignee</label>
        <div className="p-2 rounded-sm border border-zinc-800/50 hover:border-zinc-700 bg-zinc-900/50">
         <AssigneeSelect
          value={issue.assignee}
          onChange={(assignee) => handleUpdate({ assignee })}
         />
        </div>
       </div>

       <div className="pt-4 border-t border-zinc-800/50 space-y-4">
        <div className="flex flex-col gap-1">
         <label className="text-xs uppercase font-mono tracking-widest text-zinc-500">Project</label>
         <span
          className="text-sm text-zinc-300 hover:underline cursor-pointer capitalize"
          onClick={() => navigate("project", projectSlug)}
         >
          {projectSlug}
         </span>
        </div>

        <div className="flex flex-col gap-1">
         <label className="text-xs uppercase font-mono tracking-widest text-zinc-500">Created</label>
         <span className="text-sm text-zinc-300">{formatDate(issue.created)}</span>
        </div>

        <div className="flex flex-col gap-1">
         <label className="text-xs uppercase font-mono tracking-widest text-zinc-500">Updated</label>
         <span className="text-sm text-zinc-300">{timeAgo(issue.updated)}</span>
        </div>
       </div>
      </div>
     </div>

     {/* Actions Card — Aura: p-4 with edit + delete buttons */}
     <div className="bg-app-card border border-zinc-800 rounded-sm shadow-sm p-4 space-y-2">
      <button
       onClick={() => setEditingTitle(true)}
       className="w-full py-2 rounded-sm border border-zinc-700 bg-zinc-800 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
      >
       <Pencil size={14} />
       Edit Issue
      </button>
     </div>
    </div>
   </div>
   </div>
  </div>
 );
}
