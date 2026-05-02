import { create } from "zustand";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type Priority = "urgent" | "high" | "medium" | "low";
export type ProjectStatus = "planning" | "active" | "review" | "completed" | "paused";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  text: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: "image" | "pdf" | "doc" | "zip" | "other";
  uploadedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  assigneeName: string;
  assigneeInitials: string;
  dueDate: string;
  subtasks: Subtask[];
  checklist: ChecklistItem[];
  comments: Comment[];
  attachments: Attachment[];
  timeTracked: number;
  isTimerRunning: boolean;
  timerStartedAt: number | null;
  tags: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  clientName: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  dueDate: string;
  progress: number;
  color: string;
  teamIds: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatar?: string;
}

const TEAM: TeamMember[] = [
  { id: "t1", name: "Lucas Ferreira", initials: "LF", role: "Admin" },
  { id: "t2", name: "Ana Rodrigues", initials: "AR", role: "Account Manager" },
  { id: "t3", name: "Carlos Dev", initials: "CD", role: "Developer" },
  { id: "t4", name: "Julia Lima", initials: "JL", role: "Designer" },
  { id: "t5", name: "Pedro Santos", initials: "PS", role: "Traffic Manager" },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: "p1", name: "Redesign Site MBO", description: "Redesign completo do site institucional da MBO Empresas com nova identidade visual.", clientId: "c1", clientName: "MBO Empresas", status: "active", priority: "high", startDate: "2025-04-01", dueDate: "2025-05-15", progress: 65, color: "#A855F7", teamIds: ["t3", "t4", "t2"],
  },
  {
    id: "p2", name: "Campanha Ads Q2 Eleganza", description: "Gestão de tráfego pago e criativos para Q2 da Eleganza Fashion.", clientId: "c2", clientName: "Eleganza Fashion", status: "active", priority: "urgent", startDate: "2025-04-10", dueDate: "2025-05-10", progress: 40, color: "#EC4899", teamIds: ["t5", "t4", "t2"],
  },
  {
    id: "p3", name: "TechFlow SaaS MVP", description: "Desenvolvimento do MVP do SaaS de analytics para TechFlow Inc.", clientId: "c3", clientName: "TechFlow Inc.", status: "active", priority: "urgent", startDate: "2025-03-15", dueDate: "2025-06-01", progress: 30, color: "#3B82F6", teamIds: ["t3", "t1"],
  },
  {
    id: "p4", name: "SEO Agzos Agency", description: "Otimização de SEO técnico e conteúdo para o site da agência.", clientId: "c0", clientName: "Agzos Interna", status: "planning", priority: "medium", startDate: "2025-05-01", dueDate: "2025-07-01", progress: 10, color: "#10B981", teamIds: ["t2", "t5"],
  },
  {
    id: "p5", name: "App ImovelMax", description: "Aplicativo mobile para listagem de imóveis da ImovelMax.", clientId: "c4", clientName: "ImovelMax Imóveis", status: "paused", priority: "low", startDate: "2025-02-01", dueDate: "2025-08-01", progress: 20, color: "#F59E0B", teamIds: ["t3"],
  },
];

const MOCK_TASKS: Task[] = [
  // p1 - MBO
  {
    id: "tk1", projectId: "p1", title: "Wireframes homepage", description: "Criar wireframes da nova homepage com foco em conversão.", status: "done", priority: "high", assigneeId: "t4", assigneeName: "Julia Lima", assigneeInitials: "JL", dueDate: "2025-04-10", tags: ["design", "ux"], createdAt: "2025-04-01T09:00:00Z",
    subtasks: [{ id: "s1", title: "Mobile wireframe", done: true }, { id: "s2", title: "Desktop wireframe", done: true }],
    checklist: [{ id: "c1", label: "Aprovado pelo cliente", done: true }, { id: "c2", label: "Revisão de UX", done: true }],
    comments: [{ id: "cm1", authorId: "t2", authorName: "Ana Rodrigues", authorInitials: "AR", text: "Wireframes aprovados pelo cliente MBO! Podemos avançar.", createdAt: "2025-04-10T14:00:00Z" }],
    attachments: [{ id: "a1", name: "wireframe-v2.pdf", size: "2.4 MB", type: "pdf", uploadedAt: "2025-04-09T11:00:00Z" }],
    timeTracked: 14400, isTimerRunning: false, timerStartedAt: null,
  },
  {
    id: "tk2", projectId: "p1", title: "Design System MBO", description: "Definir paleta de cores, tipografia e componentes base para o redesign.", status: "done", priority: "high", assigneeId: "t4", assigneeName: "Julia Lima", assigneeInitials: "JL", dueDate: "2025-04-15", tags: ["design"], createdAt: "2025-04-02T10:00:00Z",
    subtasks: [{ id: "s3", title: "Paleta de cores", done: true }, { id: "s4", title: "Tipografia", done: true }, { id: "s5", title: "Componentes cards", done: true }],
    checklist: [{ id: "c3", label: "Entregue no Figma", done: true }],
    comments: [],
    attachments: [{ id: "a2", name: "design-system-mbo.fig", size: "8.1 MB", type: "other", uploadedAt: "2025-04-15T16:00:00Z" }],
    timeTracked: 21600, isTimerRunning: false, timerStartedAt: null,
  },
  {
    id: "tk3", projectId: "p1", title: "Desenvolvimento Frontend", description: "Implementar as páginas em Next.js seguindo o design system.", status: "in_progress", priority: "high", assigneeId: "t3", assigneeName: "Carlos Dev", assigneeInitials: "CD", dueDate: "2025-05-05", tags: ["dev", "frontend"], createdAt: "2025-04-16T08:00:00Z",
    subtasks: [{ id: "s6", title: "Header e nav", done: true }, { id: "s7", title: "Seção hero", done: true }, { id: "s8", title: "Seção serviços", done: false }, { id: "s9", title: "Footer", done: false }],
    checklist: [{ id: "c4", label: "Responsivo mobile", done: false }, { id: "c5", label: "Testes cross-browser", done: false }],
    comments: [{ id: "cm2", authorId: "t3", authorName: "Carlos Dev", authorInitials: "CD", text: "Header e hero prontos. Trabalhando na seção de serviços agora.", createdAt: "2025-04-28T10:00:00Z" }],
    attachments: [],
    timeTracked: 18000, isTimerRunning: false, timerStartedAt: null,
  },
  {
    id: "tk4", projectId: "p1", title: "Integração CMS", description: "Configurar Contentful para gestão de conteúdo pelo cliente.", status: "todo", priority: "medium", assigneeId: "t3", assigneeName: "Carlos Dev", assigneeInitials: "CD", dueDate: "2025-05-12", tags: ["dev", "cms"], createdAt: "2025-04-20T08:00:00Z",
    subtasks: [], checklist: [{ id: "c6", label: "Modelos de conteúdo criados", done: false }],
    comments: [],
    attachments: [],
    timeTracked: 0, isTimerRunning: false, timerStartedAt: null,
  },
  {
    id: "tk5", projectId: "p1", title: "QA e Revisão Final", description: "Revisão completa de qualidade antes do go-live.", status: "todo", priority: "high", assigneeId: "t2", assigneeName: "Ana Rodrigues", assigneeInitials: "AR", dueDate: "2025-05-14", tags: ["qa"], createdAt: "2025-04-20T08:00:00Z",
    subtasks: [{ id: "s10", title: "Teste em iOS Safari", done: false }, { id: "s11", title: "Teste em Android Chrome", done: false }],
    checklist: [],
    comments: [],
    attachments: [],
    timeTracked: 0, isTimerRunning: false, timerStartedAt: null,
  },
  // p2 - Eleganza
  {
    id: "tk6", projectId: "p2", title: "Briefing e estratégia", description: "Definir objetivos, KPIs e estratégia de campanha com o cliente.", status: "done", priority: "urgent", assigneeId: "t2", assigneeName: "Ana Rodrigues", assigneeInitials: "AR", dueDate: "2025-04-12", tags: ["estratégia"], createdAt: "2025-04-10T09:00:00Z",
    subtasks: [], checklist: [{ id: "c7", label: "Aprovado pela Eleganza", done: true }],
    comments: [{ id: "cm3", authorId: "t5", authorName: "Pedro Santos", authorInitials: "PS", text: "Estratégia aprovada. Meta: 500 leads a R$12 CPL.", createdAt: "2025-04-12T15:00:00Z" }],
    attachments: [{ id: "a3", name: "briefing-eleganza-q2.pdf", size: "1.2 MB", type: "pdf", uploadedAt: "2025-04-12T10:00:00Z" }],
    timeTracked: 7200, isTimerRunning: false, timerStartedAt: null,
  },
  {
    id: "tk7", projectId: "p2", title: "Criação dos criativos Meta Ads", description: "Desenvolver peças criativas para feed e stories do Instagram/Facebook.", status: "in_progress", priority: "urgent", assigneeId: "t4", assigneeName: "Julia Lima", assigneeInitials: "JL", dueDate: "2025-04-30", tags: ["design", "ads"], createdAt: "2025-04-13T09:00:00Z",
    subtasks: [{ id: "s12", title: "Feed 1:1", done: true }, { id: "s13", title: "Stories 9:16", done: true }, { id: "s14", title: "Carrossel", done: false }],
    checklist: [{ id: "c8", label: "Revisão copy", done: true }, { id: "c9", label: "Aprovação cliente", done: false }],
    comments: [],
    attachments: [{ id: "a4", name: "criativos-feed-v1.zip", size: "45 MB", type: "zip", uploadedAt: "2025-04-25T14:00:00Z" }],
    timeTracked: 10800, isTimerRunning: false, timerStartedAt: null,
  },
  {
    id: "tk8", projectId: "p2", title: "Subir campanhas e configurar pixel", description: "Criar campanhas no Meta Ads Manager e configurar pixel de conversão.", status: "review", priority: "urgent", assigneeId: "t5", assigneeName: "Pedro Santos", assigneeInitials: "PS", dueDate: "2025-05-02", tags: ["tráfego", "ads"], createdAt: "2025-04-20T09:00:00Z",
    subtasks: [{ id: "s15", title: "Pixel instalado", done: true }, { id: "s16", title: "Campanha criada", done: true }, { id: "s17", title: "Teste de evento", done: false }],
    checklist: [{ id: "c10", label: "Budget definido", done: true }],
    comments: [{ id: "cm4", authorId: "t5", authorName: "Pedro Santos", authorInitials: "PS", text: "Pixel instalado e eventos disparando. Aguardando aprovação final.", createdAt: "2025-04-30T16:00:00Z" }],
    attachments: [],
    timeTracked: 5400, isTimerRunning: false, timerStartedAt: null,
  },
  // p3 - TechFlow
  {
    id: "tk9", projectId: "p3", title: "Arquitetura do sistema", description: "Definir stack tecnológica, modelagem de banco e arquitetura de microserviços.", status: "done", priority: "urgent", assigneeId: "t1", assigneeName: "Lucas Ferreira", assigneeInitials: "LF", dueDate: "2025-03-22", tags: ["arquitetura", "dev"], createdAt: "2025-03-15T09:00:00Z",
    subtasks: [{ id: "s18", title: "ERD do banco", done: true }, { id: "s19", title: "Diagrama de serviços", done: true }],
    checklist: [{ id: "c11", label: "Documentação técnica", done: true }],
    comments: [],
    attachments: [{ id: "a5", name: "arch-techflow.pdf", size: "3.8 MB", type: "pdf", uploadedAt: "2025-03-22T12:00:00Z" }],
    timeTracked: 28800, isTimerRunning: false, timerStartedAt: null,
  },
  {
    id: "tk10", projectId: "p3", title: "API de autenticação", description: "Implementar JWT auth com roles e refresh token.", status: "in_progress", priority: "urgent", assigneeId: "t3", assigneeName: "Carlos Dev", assigneeInitials: "CD", dueDate: "2025-05-08", tags: ["dev", "backend"], createdAt: "2025-04-01T09:00:00Z",
    subtasks: [{ id: "s20", title: "Login endpoint", done: true }, { id: "s21", title: "Refresh token", done: false }, { id: "s22", title: "Roles middleware", done: false }],
    checklist: [{ id: "c12", label: "Testes unitários", done: false }, { id: "c13", label: "Documentação Swagger", done: false }],
    comments: [],
    attachments: [],
    timeTracked: 32400, isTimerRunning: false, timerStartedAt: null,
  },
  {
    id: "tk11", projectId: "p3", title: "Dashboard de analytics", description: "Tela principal com gráficos de KPIs em tempo real.", status: "todo", priority: "high", assigneeId: "t3", assigneeName: "Carlos Dev", assigneeInitials: "CD", dueDate: "2025-05-25", tags: ["dev", "frontend"], createdAt: "2025-04-10T09:00:00Z",
    subtasks: [{ id: "s23", title: "Componente de gráfico", done: false }, { id: "s24", title: "Integração WebSocket", done: false }],
    checklist: [],
    comments: [],
    attachments: [],
    timeTracked: 0, isTimerRunning: false, timerStartedAt: null,
  },
  // p4 - SEO
  {
    id: "tk12", projectId: "p4", title: "Auditoria SEO técnico", description: "Análise completa de SEO técnico com Screaming Frog.", status: "in_progress", priority: "medium", assigneeId: "t2", assigneeName: "Ana Rodrigues", assigneeInitials: "AR", dueDate: "2025-05-20", tags: ["seo"], createdAt: "2025-05-01T09:00:00Z",
    subtasks: [{ id: "s25", title: "Core Web Vitals", done: true }, { id: "s26", title: "Estrutura de URLs", done: false }],
    checklist: [{ id: "c14", label: "Relatório exportado", done: false }],
    comments: [],
    attachments: [],
    timeTracked: 3600, isTimerRunning: false, timerStartedAt: null,
  },
];

export const KANBAN_COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "A Fazer", color: "border-border" },
  { id: "in_progress", label: "Em Progresso", color: "border-blue-500/50" },
  { id: "review", label: "Revisão", color: "border-yellow-500/50" },
  { id: "done", label: "Concluído", color: "border-emerald-500/50" },
];

interface ProjectsStore {
  projects: Project[];
  tasks: Task[];
  team: TeamMember[];
  activeTaskId: string | null;

  setActiveTask: (id: string | null) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  reorderTasks: (status: TaskStatus, fromIndex: number, toIndex: number) => void;
  toggleTimer: (taskId: string) => void;
  tickTimers: () => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  toggleChecklist: (taskId: string, itemId: string) => void;
  addComment: (taskId: string, text: string, authorId: string) => void;
  addAttachment: (taskId: string, name: string, size: string, type: Attachment["type"]) => void;
  addSubtask: (taskId: string, title: string) => void;
  addChecklistItem: (taskId: string, label: string) => void;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  isOverdue: (task: Task) => boolean;
}

export const useProjectsStore = create<ProjectsStore>()((set, get) => ({
  projects: MOCK_PROJECTS,
  tasks: MOCK_TASKS,
  team: TEAM,
  activeTaskId: null,

  setActiveTask: (id) => set({ activeTaskId: id }),

  moveTask: (taskId, newStatus) =>
    set((s) => ({ tasks: s.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t) })),

  reorderTasks: (status, fromIndex, toIndex) =>
    set((s) => {
      const statusTasks = s.tasks.filter((t) => t.status === status);
      const others = s.tasks.filter((t) => t.status !== status);
      const reordered = [...statusTasks];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      return { tasks: [...others, ...reordered] };
    }),

  toggleTimer: (taskId) =>
    set((s) => {
      const now = Date.now();
      return {
        tasks: s.tasks.map((t) => {
          if (t.id === taskId) {
            if (t.isTimerRunning) {
              const elapsed = t.timerStartedAt ? Math.floor((now - t.timerStartedAt) / 1000) : 0;
              return { ...t, isTimerRunning: false, timerStartedAt: null, timeTracked: t.timeTracked + elapsed };
            } else {
              return { ...t, isTimerRunning: true, timerStartedAt: now };
            }
          }
          return { ...t, isTimerRunning: false, timerStartedAt: t.isTimerRunning && t.timerStartedAt ? (() => { const e = Math.floor((now - t.timerStartedAt!) / 1000); return null; })() : t.timerStartedAt };
        }),
      };
    }),

  tickTimers: () =>
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (!t.isTimerRunning || !t.timerStartedAt) return t;
        return t;
      }),
    })),

  toggleSubtask: (taskId, subtaskId) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.map((st) => st.id === subtaskId ? { ...st, done: !st.done } : st) }
          : t
      ),
    })),

  toggleChecklist: (taskId, itemId) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, checklist: t.checklist.map((ci) => ci.id === itemId ? { ...ci, done: !ci.done } : ci) }
          : t
      ),
    })),

  addComment: (taskId, text, authorId) =>
    set((s) => {
      const member = s.team.find((m) => m.id === authorId) ?? s.team[0];
      const comment: Comment = {
        id: `cm-${Date.now()}`,
        authorId,
        authorName: member.name,
        authorInitials: member.initials,
        text,
        createdAt: new Date().toISOString(),
      };
      return { tasks: s.tasks.map((t) => t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t) };
    }),

  addAttachment: (taskId, name, size, type) =>
    set((s) => {
      const att: Attachment = { id: `att-${Date.now()}`, name, size, type, uploadedAt: new Date().toISOString() };
      return { tasks: s.tasks.map((t) => t.id === taskId ? { ...t, attachments: [...t.attachments, att] } : t) };
    }),

  addSubtask: (taskId, title) =>
    set((s) => {
      const st: Subtask = { id: `st-${Date.now()}`, title, done: false };
      return { tasks: s.tasks.map((t) => t.id === taskId ? { ...t, subtasks: [...t.subtasks, st] } : t) };
    }),

  addChecklistItem: (taskId, label) =>
    set((s) => {
      const ci: ChecklistItem = { id: `ci-${Date.now()}`, label, done: false };
      return { tasks: s.tasks.map((t) => t.id === taskId ? { ...t, checklist: [...t.checklist, ci] } : t) };
    }),

  getTasksByProject: (projectId) => get().tasks.filter((t) => t.projectId === projectId),

  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),

  isOverdue: (task) => {
    if (task.status === "done") return false;
    return new Date(task.dueDate) < new Date();
  },
}));
