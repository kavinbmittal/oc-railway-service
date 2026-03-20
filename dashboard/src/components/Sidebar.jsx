import { LayoutDashboard, Users, ChevronRight } from "lucide-react";

const NAV = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "agents", label: "Agents", icon: Users },
];

export default function Sidebar({ page, navigate }) {
  return (
    <aside className="w-60 h-full min-h-0 border-r border-border bg-sidebar flex flex-col">
      <div className="flex items-center gap-2 px-4 h-12 shrink-0 border-b border-border">
        <span className="text-base">🦞</span>
        <span className="text-[13px] font-semibold tracking-wide text-foreground">
          Mission Control
        </span>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto scrollbar-auto-hide flex flex-col gap-0.5 px-2 py-3">
        <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-widest font-mono text-muted-foreground/60">
          Navigation
        </div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => navigate(id)}
            className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors w-full text-left ${
              page === id
                ? "bg-accent text-foreground"
                : "text-foreground/80 hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <Icon size={15} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-border">
        <p className="text-[10px] font-mono text-muted-foreground/60">
          OpenClaw v2026.3.13
        </p>
      </div>
    </aside>
  );
}
