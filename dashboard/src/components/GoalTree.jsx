/**
 * GoalTree — recursive tree rendering with expand/collapse.
 * Follows Paperclip's GoalTree pattern.
 */

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { GoalNode } from "./GoalNode.jsx";

function GoalBranch({ goal, allGoals, depth, onUpdate }) {
  const [expanded, setExpanded] = useState(true);
  const children = allGoals.filter((g) => g.parent === goal.id);
  const hasChildren = children.length > 0;

  return (
    <div>
      <div className="flex items-center">
        {hasChildren ? (
          <button
            className="shrink-0 p-0.5 ml-1 hover:bg-accent/50 rounded transition-colors"
            style={{ marginLeft: `${depth * 20 + 4}px` }}
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronRight
              className={`h-3 w-3 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span className="shrink-0 w-4" style={{ marginLeft: `${depth * 20 + 4}px` }} />
        )}
        <div className="flex-1 min-w-0">
          <GoalNode goal={goal} onUpdate={onUpdate} depth={0} />
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="border-l border-border/30" style={{ marginLeft: `${depth * 20 + 14}px` }}>
          {children.map((child) => (
            <GoalBranch
              key={child.id}
              goal={child}
              allGoals={allGoals}
              depth={depth + 1}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GoalTree({ goals, onUpdate }) {
  const goalIds = new Set(goals.map((g) => g.id));
  const roots = goals.filter((g) => !g.parent || !goalIds.has(g.parent));

  if (goals.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 px-3">No goals.</p>;
  }

  return (
    <div className="border border-border divide-y divide-border/30 py-1">
      {roots.map((goal) => (
        <GoalBranch
          key={goal.id}
          goal={goal}
          allGoals={goals}
          depth={0}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
