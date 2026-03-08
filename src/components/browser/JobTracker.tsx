import { useState } from "react";
import { X, Plus, ExternalLink, Trash2, ChevronRight, Briefcase, GripVertical } from "lucide-react";
import { useJobTracker, JobApplication, JobStatus } from "@/hooks/useJobTracker";
import { cn } from "@/lib/utils";

interface JobTrackerProps {
  onClose: () => void;
  onOpenUrl?: (url: string) => void;
}

const COLUMNS: { id: JobStatus; label: string; color: string; bg: string }[] = [
  { id: "saved",     label: "Saved",     color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20" },
  { id: "applied",   label: "Applied",   color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { id: "interview", label: "Interview", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
  { id: "offer",     label: "Offer 🎉",  color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20" },
  { id: "rejected",  label: "Rejected",  color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20" },
];

const EMPTY_FORM = { title: "", company: "", url: "", salary: "", location: "", notes: "", status: "saved" as JobStatus };

export function JobTracker({ onClose, onOpenUrl }: JobTrackerProps) {
  const { jobs, addJob, updateJob, deleteJob, moveJob } = useJobTracker();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<JobStatus | null>(null);

  const handleSubmit = () => {
    if (!form.title.trim() || !form.company.trim()) return;
    if (editId) {
      updateJob(editId, form);
      setEditId(null);
    } else {
      addJob(form);
    }
    setForm(EMPTY_FORM);
    setShowAddForm(false);
  };

  const startEdit = (job: JobApplication) => {
    setForm({ title: job.title, company: job.company, url: job.url ?? "", salary: job.salary ?? "", location: job.location ?? "", notes: job.notes ?? "", status: job.status });
    setEditId(job.id);
    setShowAddForm(true);
  };

  // Drag & drop
  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent, col: JobStatus) => { e.preventDefault(); setDragOver(col); };
  const onDrop = (col: JobStatus) => {
    if (dragId) moveJob(dragId, col);
    setDragId(null);
    setDragOver(null);
  };
  const onDragEnd = () => { setDragId(null); setDragOver(null); };

  const totalApps = jobs.filter(j => j.status !== "rejected").length;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="flex flex-col w-full max-w-6xl mx-auto bg-background border-x border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-chrome shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Job Pipeline</h1>
              <p className="text-xs text-muted-foreground">{totalApps} active application{totalApps !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowAddForm(true); setEditId(null); setForm(EMPTY_FORM); }}
              className="flex items-center gap-1.5 h-8 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Job
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add / Edit Form */}
        {showAddForm && (
          <div className="px-6 py-4 border-b border-border bg-surface/50 shrink-0">
            <h3 className="text-xs font-semibold text-foreground mb-3">{editId ? "Edit Job" : "Add New Job"}</h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Job title *" className="h-8 px-3 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50" />
              <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Company *" className="h-8 px-3 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50" />
              <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="Job URL" className="h-8 px-3 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50" />
              <input value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} placeholder="Salary / Package" className="h-8 px-3 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50" />
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Location" className="h-8 px-3 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50" />
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as JobStatus }))} className="h-8 px-3 text-xs bg-background border border-border rounded-lg text-foreground outline-none focus:border-primary/50">
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" rows={2} className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 resize-none mb-2" />
            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={!form.title.trim() || !form.company.trim()} className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors">
                {editId ? "Save" : "Add Job"}
              </button>
              <button onClick={() => { setShowAddForm(false); setEditId(null); setForm(EMPTY_FORM); }} className="h-8 px-4 bg-surface border border-border text-muted-foreground rounded-lg text-xs hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 p-6 h-full min-w-max">
            {COLUMNS.map((col) => {
              const colJobs = jobs.filter(j => j.status === col.id);
              const isOver = dragOver === col.id;
              return (
                <div
                  key={col.id}
                  onDragOver={e => onDragOver(e, col.id)}
                  onDrop={() => onDrop(col.id)}
                  className={cn(
                    "flex flex-col w-56 rounded-xl border transition-all duration-150",
                    isOver ? "border-primary/50 bg-primary/5" : "border-border bg-surface/40"
                  )}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-semibold", col.color)}>{col.label}</span>
                    </div>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", col.bg, col.color)}>
                      {colJobs.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]">
                    {colJobs.length === 0 && (
                      <div className="flex items-center justify-center h-20 text-[11px] text-muted-foreground/40 border border-dashed border-border rounded-lg">
                        Drop here
                      </div>
                    )}
                    {colJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        expanded={expandedId === job.id}
                        onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                        onEdit={() => startEdit(job)}
                        onDelete={() => deleteJob(job.id)}
                        onOpenUrl={onOpenUrl}
                        onMove={(status) => moveJob(job.id, status)}
                        columns={COLUMNS}
                        onDragStart={() => onDragStart(job.id)}
                        onDragEnd={onDragEnd}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface JobCardProps {
  job: JobApplication;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenUrl?: (url: string) => void;
  onMove: (status: JobStatus) => void;
  columns: typeof COLUMNS;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function JobCard({ job, expanded, onToggle, onEdit, onDelete, onOpenUrl, onMove, columns, onDragStart, onDragEnd }: JobCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group bg-card border border-border rounded-lg p-2.5 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all"
    >
      <div className="flex items-start gap-1.5">
        <GripVertical className="w-3 h-3 text-muted-foreground/30 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{job.title}</p>
          <p className="text-[11px] text-muted-foreground truncate">{job.company}</p>
          {job.location && <p className="text-[10px] text-muted-foreground/60 truncate">📍 {job.location}</p>}
          {job.salary && <p className="text-[10px] text-primary/80 truncate">💰 {job.salary}</p>}
        </div>
        <button onClick={onToggle} className="shrink-0 text-muted-foreground hover:text-foreground">
          <ChevronRight className={cn("w-3 h-3 transition-transform", expanded && "rotate-90")} />
        </button>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-border space-y-1.5">
          {job.notes && <p className="text-[11px] text-muted-foreground/80 leading-relaxed">{job.notes}</p>}
          <div className="flex flex-wrap gap-1">
            {job.url && onOpenUrl && (
              <button onClick={() => onOpenUrl(job.url!)} className="flex items-center gap-0.5 text-[10px] text-primary hover:underline">
                <ExternalLink className="w-2.5 h-2.5" /> Open
              </button>
            )}
            <button onClick={onEdit} className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded border border-border hover:border-primary/30 transition-colors">Edit</button>
            <button onClick={onDelete} className="text-[10px] text-destructive/70 hover:text-destructive px-1.5 py-0.5 rounded border border-destructive/20 hover:border-destructive/40 transition-colors">
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
          {/* Move to */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            <span className="text-[10px] text-muted-foreground/50">Move to:</span>
            {columns.filter(c => c.id !== job.status).map(c => (
              <button key={c.id} onClick={() => onMove(c.id)} className={cn("text-[10px] px-1.5 py-0.5 rounded border transition-colors", c.bg, c.color, "hover:opacity-80")}>
                {c.label.replace(" 🎉", "")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
