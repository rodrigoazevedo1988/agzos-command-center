import { useState, useEffect, useRef, useCallback } from "react";
import {
  useProjectsStore, Task, TaskStatus, Project, KANBAN_COLUMNS, Priority,
  NewProjectInput, ProjectStatus,
} from "@/store/useProjectsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus, Calendar, Clock, Play, Pause, Paperclip, MessageSquare,
  CheckSquare, ChevronDown, ChevronRight, AlertTriangle, Timer,
  LayoutList, Columns, BarChart2, User, Tag, Upload, Send, X,
  FileText, Image, Archive, File,
} from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Helpers ───────────────────────────────────────────────────────────────

function priorityColor(p: Priority) {
  switch (p) {
    case "urgent": return "bg-red-500/15 text-red-400 border-red-500/30";
    case "high": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "medium": return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "low": return "bg-muted/50 text-muted-foreground border-border";
  }
}

function priorityLabel(p: Priority) {
  const m: Record<Priority, string> = { urgent: "Urgente", high: "Alto", medium: "Médio", low: "Baixo" };
  return m[p];
}

function statusLabel(s: TaskStatus) {
  const m: Record<TaskStatus, string> = { todo: "A Fazer", in_progress: "Em Progresso", review: "Revisão", done: "Concluído" };
  return m[s];
}

function formatSeconds(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function Avatar({ initials, size = "sm" }: { initials: string; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-xs";
  return (
    <div className={`${sz} rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0`}>
      {initials}
    </div>
  );
}

function AttachIcon({ type }: { type: string }) {
  if (type === "pdf") return <FileText className="w-4 h-4 text-red-400" />;
  if (type === "image") return <Image className="w-4 h-4 text-blue-400" />;
  if (type === "zip") return <Archive className="w-4 h-4 text-yellow-400" />;
  return <File className="w-4 h-4 text-muted-foreground" />;
}

// ─── Live Timer hook ────────────────────────────────────────────────────────

function useLiveSeconds(task: Task) {
  const [extra, setExtra] = useState(0);
  useEffect(() => {
    if (!task.isTimerRunning || !task.timerStartedAt) { setExtra(0); return; }
    const base = Math.floor((Date.now() - task.timerStartedAt) / 1000);
    setExtra(base);
    const id = setInterval(() => {
      setExtra(Math.floor((Date.now() - task.timerStartedAt!) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [task.isTimerRunning, task.timerStartedAt]);
  return task.timeTracked + extra;
}

// ─── Task Detail Dialog ─────────────────────────────────────────────────────

function TaskDetail({ task, onClose }: { task: Task; onClose: () => void }) {
  const { toggleTimer, toggleSubtask, toggleChecklist, addComment, addAttachment, addSubtask, addChecklistItem, isOverdue } = useProjectsStore();
  const { user } = useAuthStore();
  const totalSecs = useLiveSeconds(task);
  const [commentText, setCommentText] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [newChecklist, setNewChecklist] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overdue = isOverdue(task);

  function submitComment() {
    if (!commentText.trim()) return;
    addComment(task.id, commentText.trim(), user.id);
    setCommentText("");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const type = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? "image"
      : ext === "pdf" ? "pdf"
      : ["zip", "rar", "7z"].includes(ext) ? "zip"
      : "other";
    const size = file.size > 1024 * 1024
      ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;
    addAttachment(task.id, file.name, size, type as any);
    e.target.value = "";
  }

  const doneSubtasks = task.subtasks.filter((s) => s.done).length;
  const doneChecklist = task.checklist.filter((c) => c.done).length;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border/50 p-0 gap-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-5 pb-3 border-b border-border/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant="outline" className={`text-[10px] uppercase tracking-wider border ${priorityColor(task.priority)}`}>
                  {priorityLabel(task.priority)}
                </Badge>
                <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">
                  {statusLabel(task.status)}
                </Badge>
                {overdue && (
                  <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-400 bg-red-500/10 gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> Atrasada
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-lg font-semibold leading-snug">{task.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-80px)]">
          <div className="p-5 space-y-5">
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Responsável</span>
                <div className="flex items-center gap-1.5">
                  <Avatar initials={task.assigneeInitials} />
                  <span className="font-medium text-sm">{task.assigneeName}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Prazo</span>
                <div className={`flex items-center gap-1.5 font-medium text-sm ${overdue ? "text-red-400" : "text-foreground"}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(task.dueDate)}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Tempo</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm font-medium tabular-nums ${task.isTimerRunning ? "text-emerald-400" : "text-foreground"}`}>
                    {formatSeconds(totalSecs)}
                  </span>
                  <Button
                    size="icon"
                    variant={task.isTimerRunning ? "destructive" : "outline"}
                    className="h-6 w-6 rounded-full border-border/50"
                    onClick={() => toggleTimer(task.id)}
                  >
                    {task.isTimerRunning ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                  </Button>
                </div>
              </div>
            </div>

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            )}

            <Separator className="bg-border/40" />

            {task.subtasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-primary" /> Subtarefas
                    <span className="text-xs text-muted-foreground">({doneSubtasks}/{task.subtasks.length})</span>
                  </h4>
                </div>
                <Progress value={(doneSubtasks / task.subtasks.length) * 100} className="h-1 bg-muted/30" />
                <div className="space-y-1.5">
                  {task.subtasks.map((st) => (
                    <label key={st.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <Checkbox checked={st.done} onCheckedChange={() => toggleSubtask(task.id, st.id)} className="border-border/60" />
                      <span className={`text-sm ${st.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{st.title}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="Nova subtarefa..." value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && newSubtask.trim()) { addSubtask(task.id, newSubtask.trim()); setNewSubtask(""); } }}
                    className="h-7 text-xs bg-background/50 border-border/40" />
                  <Button size="sm" variant="outline" className="h-7 px-2 border-border/40" onClick={() => { if (newSubtask.trim()) { addSubtask(task.id, newSubtask.trim()); setNewSubtask(""); } }}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {task.checklist.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-yellow-400" /> Checklist
                  <span className="text-xs text-muted-foreground">({doneChecklist}/{task.checklist.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {task.checklist.map((ci) => (
                    <label key={ci.id} className="flex items-center gap-2.5 cursor-pointer">
                      <Checkbox checked={ci.done} onCheckedChange={() => toggleChecklist(task.id, ci.id)} className="border-border/60" />
                      <span className={`text-sm ${ci.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{ci.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="Novo item..." value={newChecklist} onChange={(e) => setNewChecklist(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && newChecklist.trim()) { addChecklistItem(task.id, newChecklist.trim()); setNewChecklist(""); } }}
                    className="h-7 text-xs bg-background/50 border-border/40" />
                  <Button size="sm" variant="outline" className="h-7 px-2 border-border/40" onClick={() => { if (newChecklist.trim()) { addChecklistItem(task.id, newChecklist.trim()); setNewChecklist(""); } }}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            <Separator className="bg-border/40" />

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-400" /> Anexos
                <span className="text-xs text-muted-foreground">({task.attachments.length})</span>
              </h4>
              {task.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors">
                  <AttachIcon type={att.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{att.name}</p>
                    <p className="text-[10px] text-muted-foreground">{att.size} · {formatDate(att.uploadedAt)}</p>
                  </div>
                </div>
              ))}
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-2 border-dashed border-border/50 hover:border-primary/50" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-3.5 h-3.5" /> Enviar arquivo
              </Button>
            </div>

            <Separator className="bg-border/40" />

            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" /> Comentários
                <span className="text-xs text-muted-foreground">({task.comments.length})</span>
              </h4>
              {task.comments.map((cm) => (
                <div key={cm.id} className="flex gap-2.5">
                  <Avatar initials={cm.authorInitials} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold">{cm.authorName}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDateTime(cm.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{cm.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Avatar initials={user.avatarInitials} />
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Adicionar comentário..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submitComment(); }}
                    className="flex-1 h-8 text-sm bg-background/50 border-border/40"
                  />
                  <Button size="icon" className="h-8 w-8 shrink-0" onClick={submitComment} disabled={!commentText.trim()}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── Task Card (shared) ─────────────────────────────────────────────────────

function TaskCard({ task, onClick, dragging }: { task: Task; onClick: () => void; dragging?: boolean }) {
  const { isOverdue } = useProjectsStore();
  const totalSecs = useLiveSeconds(task);
  const overdue = isOverdue(task);
  const doneSubtasks = task.subtasks.filter((s) => s.done).length;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-card border rounded-xl p-3 cursor-pointer transition-all duration-200
        hover:border-primary/40 hover:shadow-md hover:shadow-primary/5
        ${dragging ? "opacity-50 rotate-1 scale-95" : ""}
        ${overdue ? "border-red-500/30 bg-red-500/5" : "border-border/40"}
      `}
    >
      {overdue && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">{task.title}</p>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border ${priorityColor(task.priority)}`}>
          {priorityLabel(task.priority)}
        </Badge>
        {task.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground border border-border/30">{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <Avatar initials={task.assigneeInitials} size="sm" />
          {task.subtasks.length > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              {doneSubtasks}/{task.subtasks.length}
            </span>
          )}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {task.comments.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {task.isTimerRunning && (
            <span className="flex items-center gap-0.5 text-emerald-400 font-mono animate-pulse">
              <Timer className="w-3 h-3" />
              {formatSeconds(totalSecs)}
            </span>
          )}
          <span className={`flex items-center gap-1 ${overdue ? "text-red-400" : ""}`}>
            <Calendar className="w-3 h-3" />
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban ─────────────────────────────────────────────────────────────────

function SortableTaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onClick={onOpen} dragging={isDragging} />
    </div>
  );
}

function KanbanColumn({ status, tasks, onOpenTask }: { status: typeof KANBAN_COLUMNS[0]; tasks: Task[]; onOpenTask: (t: Task) => void }) {
  const colColors: Record<string, string> = {
    todo: "border-t-border",
    in_progress: "border-t-blue-500/60",
    review: "border-t-yellow-500/60",
    done: "border-t-emerald-500/60",
  };
  const colBadge: Record<string, string> = {
    todo: "bg-muted/50 text-muted-foreground",
    in_progress: "bg-blue-500/15 text-blue-400",
    review: "bg-yellow-500/15 text-yellow-400",
    done: "bg-emerald-500/15 text-emerald-400",
  };

  return (
    <div className={`flex flex-col bg-card/40 border border-border/40 border-t-2 ${colColors[status.id]} rounded-xl min-h-[500px] w-72 shrink-0`}>
      <div className="p-3 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{status.label}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colBadge[status.id]}`}>{tasks.length}</span>
        </div>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 flex-1">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onOpen={() => onOpenTask(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function KanbanView({ onOpenTask }: { onOpenTask: (t: Task) => void }) {
  const { tasks, moveTask } = useProjectsStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id as string); }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const overId = over.id as string;
    const col = KANBAN_COLUMNS.find((c) => c.id === overId);
    if (col) { moveTask(active.id as string, col.id); return; }
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) { moveTask(active.id as string, overTask.status); }
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const col = KANBAN_COLUMNS.find((c) => c.id === over.id);
    if (col) { moveTask(active.id as string, col.id); }
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return <KanbanColumn key={col.id} status={col} tasks={colTasks} onOpenTask={onOpenTask} />;
        })}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} onClick={() => {}} />}
      </DragOverlay>
    </DndContext>
  );
}

// ─── List View ───────────────────────────────────────────────────────────────

function ProjectListRow({ project, onOpenTask }: { project: Project; onOpenTask: (t: Task) => void }) {
  const { tasks, isOverdue } = useProjectsStore();
  const [expanded, setExpanded] = useState(false);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const overdueTasks = projectTasks.filter(isOverdue).length;

  const statusColors: Record<string, string> = {
    planning: "bg-muted/50 text-muted-foreground border-border",
    active: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    review: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    paused: "bg-muted/50 text-muted-foreground border-border",
  };
  const statusLabels: Record<string, string> = {
    planning: "Planejamento", active: "Em Andamento", review: "Revisão", completed: "Concluído", paused: "Pausado",
  };

  return (
    <div className="border border-border/40 rounded-xl overflow-hidden bg-card/50 backdrop-blur-xl hover:border-primary/30 transition-colors">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{project.name}</h3>
            <Badge variant="outline" className={`text-[10px] border ${statusColors[project.status]}`}>
              {statusLabels[project.status]}
            </Badge>
            <Badge variant="outline" className={`text-[10px] border ${priorityColor(project.priority)}`}>
              {priorityLabel(project.priority)}
            </Badge>
            {overdueTasks > 0 && (
              <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-400 bg-red-500/10 gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> {overdueTasks} atrasada{overdueTasks > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{project.clientName} · {projectTasks.length} tarefa{projectTasks.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="w-40 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5 bg-muted/30" />
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(project.dueDate)}
          </div>
        </div>

        <div className="ml-auto">
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/30 p-3 space-y-2 bg-muted/5">
          {projectTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhuma tarefa neste projeto.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {projectTasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => onOpenTask(task)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ListView({ onOpenTask }: { onOpenTask: (t: Task) => void }) {
  const { projects } = useProjectsStore();
  return (
    <div className="space-y-3">
      {projects.map((p) => <ProjectListRow key={p.id} project={p} onOpenTask={onOpenTask} />)}
    </div>
  );
}

// ─── Gantt View ──────────────────────────────────────────────────────────────

function GanttView() {
  const { projects, tasks, isOverdue } = useProjectsStore();
  const today = new Date();

  const minDate = new Date("2025-03-15");
  const maxDate = new Date("2025-08-15");
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / 86400000);

  function getOffset(date: string) {
    const d = new Date(date);
    return Math.max(0, Math.ceil((d.getTime() - minDate.getTime()) / 86400000));
  }
  function getWidth(start: string, end: string) {
    return Math.max(1, getOffset(end) - getOffset(start));
  }
  function todayOffset() {
    return Math.ceil((today.getTime() - minDate.getTime()) / 86400000);
  }

  const months: { label: string; offset: number }[] = [];
  let d = new Date(minDate);
  while (d <= maxDate) {
    months.push({ label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }), offset: getOffset(d.toISOString()) });
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }

  const statusLabels: Record<string, string> = {
    planning: "Planejamento", active: "Em Andamento", review: "Revisão", completed: "Concluído", paused: "Pausado",
  };

  return (
    <div className="border border-border/40 rounded-xl overflow-hidden bg-card/50 backdrop-blur-xl">
      <div className="p-4 border-b border-border/30">
        <h3 className="font-semibold text-sm">Linha do Tempo</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Mar/25 – Ago/25</p>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${totalDays * 3 + 220}px` }}>
          {/* Month headers */}
          <div className="flex border-b border-border/30" style={{ marginLeft: "220px" }}>
            {months.map((m) => (
              <div key={m.label} className="text-[10px] text-muted-foreground px-2 py-2 border-r border-border/20 font-medium" style={{ width: `${(m.label === months[months.length - 1].label ? (totalDays - m.offset) : (months[months.indexOf(m) + 1]?.offset - m.offset)) * 3}px`, minWidth: "60px" }}>
                {m.label}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="relative">
            {/* Today line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-primary/60 z-10 pointer-events-none"
              style={{ left: `${220 + todayOffset() * 3}px` }}
            >
              <div className="absolute -top-0 -translate-x-1/2 text-[9px] bg-primary text-primary-foreground px-1 rounded font-bold">Hoje</div>
            </div>

            {projects.map((project) => {
              const projTasks = tasks.filter((t) => t.projectId === project.id);
              const overdueTasks = projTasks.filter(isOverdue).length;
              return (
                <div key={project.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center" style={{ height: "48px" }}>
                    <div className="w-[220px] shrink-0 flex items-center gap-2 px-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{project.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{project.clientName}</p>
                      </div>
                      {overdueTasks > 0 && <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 animate-pulse" />}
                    </div>
                    <div className="relative flex-1" style={{ height: "48px" }}>
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-6 rounded-full flex items-center px-2 text-[10px] font-medium text-white/90 overflow-hidden whitespace-nowrap"
                        style={{
                          left: `${getOffset(project.startDate) * 3}px`,
                          width: `${getWidth(project.startDate, project.dueDate) * 3}px`,
                          backgroundColor: project.color,
                          opacity: project.status === "paused" ? 0.5 : 1,
                        }}
                      >
                        {statusLabels[project.status]} · {project.progress}%
                      </div>
                    </div>
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

// ─── Add Project Dialog ──────────────────────────────────────────────────────

const PROJECT_COLOR_OPTIONS = [
  "#A855F7", "#EC4899", "#3B82F6", "#10B981",
  "#F59E0B", "#EF4444", "#06B6D4", "#8B5CF6",
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "urgent", label: "Urgente" },
  { value: "high", label: "Alto" },
  { value: "medium", label: "Médio" },
  { value: "low", label: "Baixo" },
];

const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planejamento" },
  { value: "active", label: "Em Andamento" },
  { value: "review", label: "Revisão" },
  { value: "completed", label: "Concluído" },
  { value: "paused", label: "Pausado" },
];

const EMPTY_PROJECT: NewProjectInput = {
  name: "",
  description: "",
  clientName: "",
  status: "planning",
  priority: "medium",
  startDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  color: "#A855F7",
};

function AddProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addProject = useProjectsStore((s) => s.addProject);
  const [form, setForm] = useState<NewProjectInput>(EMPTY_PROJECT);
  const [errors, setErrors] = useState<Partial<Record<keyof NewProjectInput, string>>>({});

  function setField<K extends keyof NewProjectInput>(key: K, value: NewProjectInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const errs: Partial<Record<keyof NewProjectInput, string>> = {};
    if (!form.name.trim()) errs.name = "Nome é obrigatório.";
    if (!form.clientName.trim()) errs.clientName = "Cliente é obrigatório.";
    if (!form.dueDate) errs.dueDate = "Prazo é obrigatório.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    addProject(form);
    setForm(EMPTY_PROJECT);
    setErrors({});
    onClose();
  }

  function handleClose() {
    setForm(EMPTY_PROJECT);
    setErrors({});
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Novo Projeto
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Preencha os dados do projeto. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1 max-h-[60vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label className="text-sm">Nome do projeto *</Label>
            <Input
              placeholder="Ex: Redesign Site Cliente"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className={`bg-background/50 border-border/50 ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Descrição</Label>
            <Input
              placeholder="Descreva o objetivo do projeto..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Cliente *</Label>
            <Input
              placeholder="Ex: Empresa Ltda."
              value={form.clientName}
              onChange={(e) => setField("clientName", e.target.value)}
              className={`bg-background/50 border-border/50 ${errors.clientName ? "border-destructive" : ""}`}
            />
            {errors.clientName && <p className="text-xs text-destructive">{errors.clientName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => setField("priority", v as Priority)}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Status inicial</Label>
              <Select value={form.status} onValueChange={(v) => setField("status", v as ProjectStatus)}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Início</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Prazo *</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setField("dueDate", e.target.value)}
                className={`bg-background/50 border-border/50 ${errors.dueDate ? "border-destructive" : ""}`}
              />
              {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Cor do projeto</Label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setField("color", c)}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-offset-card ring-white scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" className="border-border/50" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Projeto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stats ───────────────────────────────────────────────────────────────────

function StatCard({ title, value, className = "text-foreground" }: { title: string; value: number; className?: string }) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
        <p className={`text-2xl font-bold tabular-nums ${className}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Projects() {
  const { projects, tasks, isOverdue } = useProjectsStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [view, setView] = useState<"list" | "kanban" | "gantt">("kanban");
  const [addOpen, setAddOpen] = useState(false);

  const total = projects.length;
  const active = projects.filter((p) => p.status === "active").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const overdueCount = tasks.filter(isOverdue).length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground text-sm">Acompanhe projetos, tarefas e prazos da agência.</p>
        </div>
        <PermissionGuard action="projects.create" tooltip="Apenas Admin, Gerente de Conta e Gestor de Tráfego podem criar projetos.">
          <Button data-testid="btn-add-project" className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Novo Projeto
          </Button>
        </PermissionGuard>
      </div>

      <AddProjectDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total de Projetos" value={total} />
        <StatCard title="Em Andamento" value={active} className="text-primary" />
        <StatCard title="Concluídos" value={completed} className="text-emerald-400" />
        <StatCard title="Tarefas Atrasadas" value={overdueCount} className={overdueCount > 0 ? "text-red-400" : "text-foreground"} />
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        <TabsList className="bg-muted/30 border border-border/40 h-9">
          <TabsTrigger value="list" className="gap-1.5 text-xs data-[state=active]:bg-background">
            <LayoutList className="w-3.5 h-3.5" /> Lista
          </TabsTrigger>
          <TabsTrigger value="kanban" className="gap-1.5 text-xs data-[state=active]:bg-background">
            <Columns className="w-3.5 h-3.5" /> Kanban
          </TabsTrigger>
          <TabsTrigger value="gantt" className="gap-1.5 text-xs data-[state=active]:bg-background">
            <BarChart2 className="w-3.5 h-3.5" /> Gantt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <ListView onOpenTask={setActiveTask} />
        </TabsContent>
        <TabsContent value="kanban" className="mt-4">
          <KanbanView onOpenTask={setActiveTask} />
        </TabsContent>
        <TabsContent value="gantt" className="mt-4">
          <GanttView />
        </TabsContent>
      </Tabs>

      {activeTask && (
        <TaskDetail
          task={tasks.find((t) => t.id === activeTask.id) ?? activeTask}
          onClose={() => setActiveTask(null)}
        />
      )}
    </div>
  );
}
