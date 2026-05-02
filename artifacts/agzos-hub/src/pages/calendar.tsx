import { useState, useMemo } from "react";
import { useProjectsStore } from "@/store/useProjectsStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft, ChevronRight, CalendarDays, Clock, User,
  AlertTriangle, CheckCircle2, Circle, ArrowRight, Layers,
} from "lucide-react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const STATUS_CONFIG = {
  todo:        { label: "A Fazer",      color: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  in_progress: { label: "Em Progresso", color: "bg-blue-500/10 text-blue-400",   dot: "bg-blue-400" },
  review:      { label: "Revisão",      color: "bg-yellow-500/10 text-yellow-400",dot: "bg-yellow-400" },
  done:        { label: "Concluído",    color: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400" },
};

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", color: "text-red-400",    icon: <AlertTriangle className="w-3 h-3" /> },
  high:   { label: "Alta",    color: "text-orange-400", icon: <ArrowRight className="w-3 h-3" /> },
  medium: { label: "Média",   color: "text-yellow-400", icon: <Circle className="w-3 h-3" /> },
  low:    { label: "Baixa",   color: "text-emerald-400",icon: <CheckCircle2 className="w-3 h-3" /> },
};

function formatHours(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}min`;
  return `${h}h${m > 0 ? ` ${m}min` : ""}`;
}

export default function Calendar() {
  const { projects, tasks } = useProjectsStore();
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState<string>("all");

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };
  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();

  const cells: Array<{ date: Date; isCurrentMonth: boolean }> = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ date: new Date(currentYear, currentMonth - 1, daysInPrev - i), isCurrentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(currentYear, currentMonth, d), isCurrentMonth: true });
  while (cells.length % 7 !== 0)
    cells.push({ date: new Date(currentYear, currentMonth + 1, cells.length - daysInMonth - firstDay + 1), isCurrentMonth: false });

  // Map tasks by due date
  const filteredTasks = useMemo(() =>
    tasks.filter(t => filterProject === "all" || t.projectId === filterProject),
    [tasks, filterProject]
  );

  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    for (const task of filteredTasks) {
      if (!task.dueDate) continue;
      const key = task.dueDate.split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(task);
    }
    return map;
  }, [filteredTasks]);

  // Project due dates
  const projectsByDate = useMemo(() => {
    const map: Record<string, typeof projects> = {};
    for (const p of projects) {
      if (!p.dueDate) continue;
      const key = p.dueDate;
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    return map;
  }, [projects]);

  const toKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayKey = toKey(today);
  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : [];
  const selectedProjects = selectedDate ? (projectsByDate[selectedDate] ?? []) : [];

  // Month stats
  const monthKeys = cells.filter(c => c.isCurrentMonth).map(c => toKey(c.date));
  const monthTasks = monthKeys.flatMap(k => tasksByDate[k] ?? []);
  const doneTasks = monthTasks.filter(t => t.status === "done").length;
  const dueTasks = monthTasks.filter(t => t.status !== "done").length;
  const overdueTasks = filteredTasks.filter(t => {
    if (!t.dueDate || t.status === "done") return false;
    return new Date(t.dueDate) < today;
  }).length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground text-sm">Prazos de tarefas e projetos por data.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Project filter */}
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border/50 bg-muted/20 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todos os projetos</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={goToToday} className="border-border/50">Hoje</Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-9 w-9">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-base font-semibold w-40 text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card/50 border border-border/40 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Concluídas este mês</p>
            <p className="text-xl font-bold text-emerald-400">{doneTasks}</p>
          </div>
        </div>
        <div className="bg-card/50 border border-border/40 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Pendentes no mês</p>
            <p className="text-xl font-bold">{dueTasks}</p>
          </div>
        </div>
        <div className={`bg-card/50 border rounded-xl p-4 flex items-center gap-3 ${overdueTasks > 0 ? "border-red-500/30" : "border-border/40"}`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 ${overdueTasks > 0 ? "text-red-400" : "text-muted-foreground"}`} />
          <div>
            <p className="text-xs text-muted-foreground">Em atraso (geral)</p>
            <p className={`text-xl font-bold ${overdueTasks > 0 ? "text-red-400" : ""}`}>{overdueTasks}</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card/50 border border-border/40 rounded-xl overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border/40">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const key = toKey(cell.date);
            const dayTasks = tasksByDate[key] ?? [];
            const dayProjects = projectsByDate[key] ?? [];
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;
            const hasItems = dayTasks.length > 0 || dayProjects.length > 0;
            const hasOverdue = dayTasks.some(t => t.status !== "done" && new Date(key) < today);
            const isLastRow = idx >= cells.length - 7;

            return (
              <button
                key={key}
                onClick={() => hasItems && setSelectedDate(isSelected ? null : key)}
                className={`relative min-h-[80px] p-1.5 text-left flex flex-col transition-all border-b border-r border-border/20 ${
                  isLastRow ? "border-b-0" : ""
                } ${idx % 7 === 6 ? "border-r-0" : ""} ${
                  !cell.isCurrentMonth ? "opacity-30" : ""
                } ${
                  isSelected ? "bg-primary/10" : hasItems ? "hover:bg-muted/20 cursor-pointer" : "cursor-default"
                }`}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                      isToday
                        ? "bg-primary text-primary-foreground text-xs font-bold"
                        : "text-foreground"
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  {hasOverdue && <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />}
                </div>

                {/* Project deadlines */}
                {dayProjects.slice(0, 1).map(p => (
                  <div
                    key={p.id}
                    className="w-full text-[10px] font-semibold px-1.5 py-0.5 rounded-md mb-0.5 truncate"
                    style={{ backgroundColor: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40` }}
                  >
                    🏁 {p.name}
                  </div>
                ))}

                {/* Tasks */}
                {dayTasks.slice(0, 2).map(task => {
                  const proj = projects.find(p => p.id === task.projectId);
                  return (
                    <div
                      key={task.id}
                      className="w-full text-[10px] px-1.5 py-0.5 rounded-md mb-0.5 truncate font-medium"
                      style={{
                        backgroundColor: `${proj?.color ?? "#A855F7"}15`,
                        color: proj?.color ?? "#A855F7",
                        border: `1px solid ${proj?.color ?? "#A855F7"}30`,
                      }}
                    >
                      {task.title}
                    </div>
                  );
                })}

                {/* Overflow indicator */}
                {(dayTasks.length + dayProjects.length) > 3 && (
                  <span className="text-[9px] text-muted-foreground px-1">
                    +{dayTasks.length + dayProjects.length - 3} mais
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 flex-wrap text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Hoje</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/40" />
          <span>Prazo de projeto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-violet-500/15 border border-violet-500/30" />
          <span>Tarefa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span>Possui atraso</span>
        </div>
      </div>

      {/* Day detail dialog */}
      {selectedDate && (
        <Dialog open onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="sm:max-w-[520px] bg-card border-border/50 max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="w-5 h-5 text-primary" />
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-1">
              {/* Project deadlines */}
              {selectedProjects.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Prazo de Projeto
                  </p>
                  {selectedProjects.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3 rounded-xl border mb-2"
                      style={{ borderColor: `${p.color}40`, backgroundColor: `${p.color}10` }}
                    >
                      <Layers className="w-4 h-4 shrink-0" style={{ color: p.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: p.color }}>{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.clientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{p.progress}%</p>
                        <p className="text-[10px] text-muted-foreground">progresso</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tasks */}
              {selectedTasks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Tarefas com prazo ({selectedTasks.length})
                  </p>
                  {selectedTasks.map(task => {
                    const proj = projects.find(p => p.id === task.projectId);
                    const statusConf = STATUS_CONFIG[task.status];
                    const prioConf = PRIORITY_CONFIG[task.priority];
                    const isLate = task.status !== "done" && new Date(selectedDate) < today;

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border mb-2 ${isLate ? "border-red-500/30 bg-red-500/5" : "border-border/40 bg-muted/10"}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className={`font-semibold text-sm ${isLate ? "text-red-300" : ""}`}>{task.title}</p>
                          <div className={`flex items-center gap-1 text-[10px] font-medium ${prioConf.color} shrink-0`}>
                            {prioConf.icon} {prioConf.label}
                          </div>
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusConf.color}`}>
                              {statusConf.label}
                            </Badge>
                            {proj && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                style={{ color: proj.color, backgroundColor: `${proj.color}20` }}>
                                {proj.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> {task.assigneeName}
                            </span>
                            {task.timeTracked > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {formatHours(task.timeTracked)}
                              </span>
                            )}
                          </div>
                        </div>
                        {isLate && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-red-400">
                            <AlertTriangle className="w-3 h-3" /> Em atraso
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedTasks.length === 0 && selectedProjects.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Nenhum item nesta data.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
