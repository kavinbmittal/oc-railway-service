import { LayoutDashboard, FolderKanban, Users } from "lucide-react";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "agents", label: "Agents", icon: Users },
];

export default function Sidebar({ page, navigate }) {
  return (
    <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col">
      <div className="px-4 py-5 border-b border-zinc-800">
        <h1 className="text-sm font-semibold tracking-wide text-zinc-300 flex items-center gap-2">
          <span className="text-lg">🦞</span> Mission Control
        </h1>
      </div>
      <nav className="flex-1 py-3">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => navigate(id)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              page === id
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">OpenClaw v2026.3.13</p>
      </div>
    </aside>
  );
}
