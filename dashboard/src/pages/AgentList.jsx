import { useState, useEffect } from "react";
import { getFile } from "../api.js";
import { Bot } from "lucide-react";

const AGENTS = [
  { name: "Sam", workspace: "workspace", role: "Cross-project coordinator", emoji: "🧠" },
  { name: "Binny", workspace: "workspace-binny", role: "Lia PM, project lead", emoji: "🚀" },
  { name: "EJ", workspace: "workspace-ej", role: "Engineering, technical sparring", emoji: "🔧" },
  { name: "Kiko", workspace: "workspace-kiko", role: "Celestial PM, design", emoji: "🎨" },
  { name: "Leslie", workspace: "workspace-leslie-marketer", role: "Growth, outreach", emoji: "📈" },
  { name: "Zara", workspace: "workspace-zara-design", role: "Design, UX, research", emoji: "🎯" },
  { name: "Ritam", workspace: "workspace-ritam", role: "Researcher", emoji: "🔬" },
  { name: "Jon", workspace: "workspace-jon-appideas", role: "Apps research", emoji: "📱" },
  { name: "Midas", workspace: "workspace-midas", role: "Crypto", emoji: "💰" },
];

export default function AgentList() {
  const [tasks, setTasks] = useState({});

  useEffect(() => {
    AGENTS.forEach((agent) => {
      getFile(`${agent.workspace}/memory/active-tasks.md`)
        .then((data) => {
          setTasks((prev) => ({ ...prev, [agent.name]: data.content || "" }));
        })
        .catch(() => {
          setTasks((prev) => ({ ...prev, [agent.name]: null }));
        });
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-100">Agents</h2>
        <p className="text-zinc-500 text-sm mt-1">{AGENTS.length} permanent agents</p>
      </div>

      <div className="space-y-3">
        {AGENTS.map((agent) => (
          <div
            key={agent.name}
            className="border border-zinc-800 rounded-lg p-4 bg-zinc-900"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg">{agent.emoji}</span>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">{agent.name}</h3>
                <p className="text-xs text-zinc-500">{agent.role}</p>
              </div>
            </div>
            {tasks[agent.name] !== undefined && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                {tasks[agent.name] ? (
                  <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                    {tasks[agent.name].slice(0, 500)}
                    {tasks[agent.name].length > 500 ? "\n..." : ""}
                  </pre>
                ) : (
                  <p className="text-xs text-zinc-600">No active tasks file</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
