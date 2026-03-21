import { useState, useEffect, useMemo } from "react";
import { getApprovals, resolveApproval } from "../api.js";
import { ShieldCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/Tabs.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import ApprovalCard from "../components/ApprovalCard.jsx";

export default function Approvals({ navigate }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("pending");

  function refresh() {
    setLoading(true);
    getApprovals()
      .then(setApprovals)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  const pendingApprovals = useMemo(
    () => approvals.filter((a) => !a.status || a.status === "pending"),
    [approvals]
  );

  const displayedApprovals = tab === "pending" ? pendingApprovals : approvals;

  async function handleApprove(approval) {
    try {
      await resolveApproval({
        project: approval._project || approval.project,
        id: approval.id,
        decision: "approved",
        comment: null,
        requester: approval.requester,
        gate: approval.gate,
        what: approval.what || approval.title,
        why: approval.why,
        created: approval.created,
      });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReject(approval) {
    const comment = prompt("Reason for rejection:");
    if (!comment) return;
    try {
      await resolveApproval({
        project: approval._project || approval.project,
        id: approval.id,
        decision: "rejected",
        comment,
        requester: approval.requester,
        gate: approval.gate,
        what: approval.what || approval.title,
        why: approval.why,
        created: approval.created,
      });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading && approvals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-12 flex items-center">
          <h1 className="text-sm font-semibold uppercase tracking-wider">
            Approvals
          </h1>
        </div>
        <div className="border border-border p-4">
          <div className="bg-accent/75 h-4 w-48 mb-3" />
          <div className="bg-accent/75 h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="h-12 flex items-center justify-between">
        <h1 className="text-sm font-semibold uppercase tracking-wider">
          Approvals
        </h1>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingApprovals.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 rounded-full bg-amber-900/50 text-amber-300 text-[10px] font-medium px-1">
                {pendingApprovals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {displayedApprovals.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          text={
            tab === "pending"
              ? "No pending approvals"
              : "No approvals"
          }
          sub="Approvals will appear here when agents need your sign-off."
        />
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          {displayedApprovals.map((approval) => (
            <ApprovalCard
              key={approval.id || approval._file}
              approval={approval}
              onApprove={handleApprove}
              onReject={handleReject}
              navigate={navigate}
              hideProject={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
