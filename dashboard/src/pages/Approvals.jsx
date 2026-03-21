import { useState, useEffect } from "react";
import { getApprovals } from "../api.js";
import { ShieldCheck } from "lucide-react";
import { EmptyState } from "../components/EmptyState.jsx";
import ApprovalCard from "../components/ApprovalCard.jsx";

export default function Approvals({ navigate }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function refresh() {
    setLoading(true);
    getApprovals()
      .then(setApprovals)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  if (loading && approvals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-12 flex items-center">
          <h1 className="text-sm font-semibold uppercase tracking-wider">Approvals</h1>
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
        <h1 className="text-sm font-semibold uppercase tracking-wider">Approvals</h1>
        <span className="text-xs text-muted-foreground">
          {approvals.length} pending
        </span>
      </div>

      {error && (
        <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {approvals.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          text="No pending approvals"
          sub="Approvals will appear here when agents need your sign-off."
        />
      ) : (
        <div className="space-y-3">
          {approvals.map((approval) => (
            <ApprovalCard
              key={approval.id || approval._file}
              approval={approval}
              onResolved={refresh}
              navigate={navigate}
              hideProject={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
