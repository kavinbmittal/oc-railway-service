/**
 * Goals Page — tree view of nested goals (company -> project -> milestone).
 */

import { useState, useEffect } from "react";
import { Target, Plus } from "lucide-react";
import { getGoals, createGoal, updateGoal, getProjects } from "../api.js";
import { GoalTree } from "../components/GoalTree.jsx";
import { GoalForm } from "../components/GoalForm.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    Promise.all([getGoals(), getProjects()])
      .then(([g, p]) => {
        setGoals(g);
        setProjects(p);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data) => {
    try {
      await createGoal(data);
      setShowForm(false);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await updateGoal(id, updates);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // Compute summary metrics
  const companyGoals = goals.filter((g) => g.level === "company");
  const inProgress = goals.filter((g) => g.status === "in_progress").length;
  const atRisk = goals.filter((g) => g.status === "at_risk").length;
  const completed = goals.filter((g) => g.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb bar */}
      <div className="h-12 flex items-center justify-between">
        <h1 className="text-sm font-semibold uppercase tracking-wider">Goals</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Goal
        </button>
      </div>

      {error && (
        <div className="text-sm text-destructive px-3 py-2 border border-destructive/30 bg-destructive/10">
          {error}
        </div>
      )}

      {/* Summary metrics */}
      {goals.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{goals.length} total</span>
          <span className="text-yellow-400">{inProgress} in progress</span>
          {atRisk > 0 && <span className="text-red-400">{atRisk} at risk</span>}
          <span className="text-green-400">{completed} completed</span>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <GoalForm
          goals={goals}
          projects={projects}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Goal tree */}
      {goals.length === 0 && !showForm ? (
        <EmptyState
          icon={Target}
          text="No goals yet"
          sub="Create company, project, or milestone goals to track progress"
          action="Add Goal"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <GoalTree goals={goals} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
