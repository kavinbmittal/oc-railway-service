/**
 * CreateExperiment — inline form for creating a new experiment.
 * UI ported from Aura HTML reference.
 */
import { useState } from"react";
import { X } from"lucide-react";

export function CreateExperiment({ projectSlug, themes = [], onCreated, onClose }) {
 const [name, setName] = useState("");
 const [hypothesis, setHypothesis] = useState("");
 const [primaryMetric, setPrimaryMetric] = useState("");
 const [targetValue, setTargetValue] = useState("");
 const [programMd, setProgramMd] = useState("");
 const [selectedTheme, setSelectedTheme] = useState("");
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState(null);

 async function handleSubmit(e) {
  e.preventDefault();
  if (!name.trim() || !hypothesis.trim()) return;
  setSubmitting(true);
  setError(null);
  try {
   // TODO: wire to createExperiment API when available
   const experiment = {
    name: name.trim(),
    hypothesis: hypothesis.trim(),
    primaryMetric: primaryMetric.trim() || null,
    targetValue: targetValue.trim() || null,
    programMd: programMd.trim() || null,
    theme: selectedTheme || null,
   };
   onCreated?.(experiment);
  } catch (err) {
   setError(err.message);
  } finally {
   setSubmitting(false);
  }
 }

 return (
  <div className="bg-card border border-border rounded-[2px] shadow-sm flex flex-col relative overflow-hidden">
   {/* Card Header — Aura */}
   <div className="p-5 border-b border-border flex items-center justify-between">
    <h2 className="text-[14px] font-medium text-foreground tracking-tight flex items-center gap-2">
     New Experiment
    </h2>
    <div className="flex items-center gap-2">
     <span className="flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-secondary border border-border text-[12px] text-muted-foreground font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
      Draft
     </span>
     {onClose && (
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
       <X size={18} />
      </button>
     )}
    </div>
   </div>

   {/* Form Body — Aura */}
   <form onSubmit={handleSubmit}>
    <div className="p-5 space-y-6">

     {/* 1. Experiment Name */}
     <div>
      <label className="block text-[11px] uppercase font-mono tracking-[0.15em] text-muted-foreground mb-2">Experiment Name</label>
      <input
       type="text"
       value={name}
       onChange={(e) => setName(e.target.value)}
       placeholder="e.g. Batch Size Optimization"
       autoFocus
       className="w-full bg-background border border-border rounded-[6px] px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-[3px] focus:ring-ring/50 transition-all shadow-sm"
      />
     </div>

     {/* 2. Hypothesis */}
     <div>
      <label className="block text-[11px] uppercase font-mono tracking-[0.15em] text-muted-foreground mb-2">Hypothesis</label>
      <textarea
       value={hypothesis}
       onChange={(e) => setHypothesis(e.target.value)}
       rows={4}
       placeholder="What do you expect to happen? e.g. Increasing batch size from 500 to 2000 will reduce CPU usage by 15%"
       className="w-full bg-background border border-border rounded-[6px] px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-[3px] focus:ring-ring/50 transition-all resize-none shadow-sm"
      />
     </div>

     {/* 3. Two-column: Primary Metric & Target Value — Aura */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
       <label className="block text-[11px] uppercase font-mono tracking-[0.15em] text-muted-foreground mb-2">Primary Metric</label>
       <input
        type="text"
        value={primaryMetric}
        onChange={(e) => setPrimaryMetric(e.target.value)}
        placeholder="e.g. CPU utilization %"
        className="w-full bg-background border border-border rounded-[6px] px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-[3px] focus:ring-ring/50 transition-all shadow-sm"
       />
      </div>
      <div>
       <label className="block text-[11px] uppercase font-mono tracking-[0.15em] text-muted-foreground mb-2">Target Value</label>
       <div className="relative">
        <input
         type="text"
         value={targetValue}
         onChange={(e) => setTargetValue(e.target.value)}
         placeholder="e.g. -15"
         className="w-full bg-background border border-border rounded-[6px] pl-3 pr-8 py-2 text-[14px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-[3px] focus:ring-ring/50 transition-all shadow-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[14px] font-medium">%</span>
       </div>
      </div>
     </div>

     {/* 4. Experiment Program — Aura: textarea with helper */}
     <div>
      <label className="block text-[11px] uppercase font-mono tracking-[0.15em] text-muted-foreground mb-2">Experiment Program</label>
      <textarea
       value={programMd}
       onChange={(e) => setProgramMd(e.target.value)}
       rows={6}
       placeholder="Describe the experiment methodology, variables, and success criteria. Markdown supported."
       className="w-full bg-background border border-border rounded-[6px] px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-[3px] focus:ring-ring/50 transition-all resize-y font-mono leading-relaxed shadow-sm"
      />
      <p className="text-[12px] text-muted-foreground mt-2">
       This becomes the experiment's program.md — the source of truth for what to test and how.
      </p>
     </div>

     {/* 5. Theme — Aura */}
     {themes.length > 0 && (
      <div>
       <label className="block text-[11px] uppercase font-mono tracking-[0.15em] text-muted-foreground mb-2">Theme</label>
       <div className="relative group w-full md:w-1/2">
        <select
         value={selectedTheme}
         onChange={(e) => setSelectedTheme(e.target.value)}
         className="w-full bg-background border border-border rounded-[6px] px-3 py-2 text-[14px] text-foreground pr-10 focus:outline-none focus:ring-[3px] focus:ring-ring/50 transition-all cursor-pointer appearance-none shadow-sm"
        >
         <option value="">No theme</option>
         {themes.map((t) => (
          <option key={t.id} value={t.id}>{t.title}</option>
         ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
         <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
       </div>
       <p className="text-[12px] text-muted-foreground mt-2">Link this experiment to a strategic theme</p>
      </div>
     )}

     {/* Metrics Preview — Aura: dashed border, conditional */}
     {primaryMetric && (
      <div className="border border-dashed border-border rounded-[2px] p-4 bg-secondary/10 relative overflow-hidden">
       <div className="flex items-center gap-2 mb-4">
        <span className="text-[12px] font-medium text-muted-foreground">Preview</span>
       </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
         <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-1">Primary Metric</div>
         <div className="text-[14px] font-medium text-foreground">{primaryMetric}</div>
        </div>
        {targetValue && (
         <div className="flex flex-col">
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-1">Target Value</div>
          <div className="text-[14px] font-medium text-cyan-400">{targetValue}%</div>
         </div>
        )}
       </div>
      </div>
     )}
    </div>

    {/* Error */}
    {error && (
     <div className="mx-5 mb-4 border border-red-500/20 bg-red-500/5 rounded-[2px] px-4 py-3 text-[13px] text-red-400">
      {error}
     </div>
    )}

    {/* Card Footer — Aura: cyan tint for experiments */}
    <div className="p-5 border-t border-border flex justify-end gap-3">
     {onClose && (
      <button
       type="button"
       onClick={onClose}
       className="px-4 py-2 rounded-[6px] border border-border bg-card text-[13px] font-medium text-foreground/80 hover:bg-accent transition-colors shadow-sm"
      >
       Cancel
      </button>
     )}
     <button
      type="submit"
      disabled={!name.trim() || !hypothesis.trim() || submitting}
      className="px-4 py-2 rounded-[6px] border border-cyan-500/50 bg-cyan-500/10 text-[13px] font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
     >
      {submitting ?"Creating..." :"Create Experiment"}
     </button>
    </div>
   </form>
  </div>
 );
}
