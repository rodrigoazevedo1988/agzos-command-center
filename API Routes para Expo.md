Menu Lateral — Status e API Routes
Base URL: https://9b21255b-ba9d-48b7-a8fa-2ad345bd64a8-00-3uug6g8nnqbvo.picard.replit.dev

1. Dashboard /
Status: ✅ Completo — KPIs, gráfico de receita, atividade recente

Método	Rota	Descrição
GET	/api/dashboard/kpis	monthlyRevenue, activeProjects, managedSites, teamMembers, overdueProjects, newLeadsThisMonth, averageTicket
GET	/api/dashboard/revenue-chart?months=6	Array [{ month, revenue, expenses, profit }]
GET	/api/dashboard/recent-activity	Array [{ id, type, description, entityName, createdAt }]
2. Sites /sites
Status: ✅ Completo — lista, criar, editar, deletar, stats por status

Método	Rota	Descrição
GET	/api/sites/stats	{ total, active, development, maintenance, paused }
GET	/api/sites?status=active&search=nome	Lista com clientName enriquecido
POST	/api/sites	Cria site, gera atividade
GET	/api/sites/:id	Site por ID
PUT	/api/sites/:id	Atualiza site
DELETE	/api/sites/:id	Remove site
Campos POST/PUT: name, url, clientId?, status (active/development/maintenance/paused), platform?, monthlyVisitors?, seoScore?, notes?

3. Projetos /projects
Status: ✅ Completo — kanban, criar, editar, deletar, summary

Método	Rota	Descrição
GET	/api/projects/summary	{ total, byStatus, overdue, completedThisMonth }
GET	/api/projects?status=active&clientId=1&search=nome	Lista com clientName, assigneeName, progress
POST	/api/projects	Cria projeto, gera atividade
GET	/api/projects/:id	Projeto por ID
PUT	/api/projects/:id	Atualiza — se status=completed seta completedAt
DELETE	/api/projects/:id	Remove projeto
Campos POST/PUT: name, description?, status (planning/active/on_hold/completed/cancelled), clientId?, assigneeId?, budget?, startDate?, dueDate?, progress?, priority? (low/medium/high/urgent)

4. Clientes /clients
Status: ✅ Completo — funil de vendas, pipeline, CRUD

Método	Rota	Descrição
GET	/api/clients/funnel	{ lead, proposal, contract, active, churned, totalPipelineValue }
GET	/api/clients?stage=active&search=nome	Lista clientes
POST	/api/clients	Cria cliente, gera atividade
GET	/api/clients/:id	Cliente por ID
PUT	/api/clients/:id	Atualiza cliente
DELETE	/api/clients/:id	Remove cliente
Campos POST/PUT: name, email, phone?, companyName?, stage (lead/proposal/contract/active/churned), monthlyValue?, avatarUrl?, notes?

5. Equipe /team
Status: ✅ Completo — membros, roles, projetos ativos por membro

Método	Rota	Descrição
GET	/api/team	Lista com activeProjects por membro
POST	/api/team	Convida membro (status invited), gera atividade
PUT	/api/team/:id	Atualiza membro
DELETE	/api/team/:id	Remove membro
Campos POST/PUT: name, email, role (admin/manager/developer/designer/analyst), avatarUrl?, status (active/invited/inactive), permissions? (array de módulos)

6. Financeiro /financial
Status: ✅ Completo — faturas, summary, marcar como pago

Método	Rota	Descrição
GET	/api/financial/summary	{ totalRevenue, totalExpenses, profit, pendingInvoices, overdueInvoices, paidThisMonth, invoiceCount }
GET	/api/financial/invoices?clientId=1&status=paid	Lista com clientName, projectName
POST	/api/financial/invoices	Cria fatura (número auto-gerado)
PUT	/api/financial/invoices/:id	Atualiza — se status=paid seta paidAt e gera atividade
DELETE	/api/financial/invoices/:id	Remove fatura
Campos POST/PUT: clientId?, projectId?, amount, status (draft/sent/paid/overdue/cancelled), dueDate?, description?

7. Ferramentas /tools
Status: ✅ Completo — assinaturas/ferramentas da agência

Método	Rota	Descrição
GET	/api/tools	Lista com monthlyCost
POST	/api/tools	Cria ferramenta
PUT	/api/tools/:id	Atualiza
DELETE	/api/tools/:id	Remove
Campos POST/PUT: name, category?, url?, monthlyCost?, status (active/inactive), notes?

8. Calendário /calendar
Status: ✅ Completo — tarefas e deadlines de projetos por mês

Método	Rota	Descrição
GET	/api/mobile/calendar?year=2026&month=5	{ tasks: [...], projectDeadlines: [...] }
9. Atividade /activity
Status: ✅ Completo — feed timeline com filtros

Método	Rota	Descrição
GET	/api/mobile/notifications?limit=30	Feed [{ id, type, description, entityName, createdAt }]
Tipos de type: invoice_paid, client_added, project_created, site_added, task_completed, team_invited

10. Relatórios /reports
Status: ✅ Interface completa — usa as rotas de financial/summary, projects/summary, dashboard/kpis em conjunto

11. Configurações /settings
Status: ⚠️ Interface local — sem persistência em banco ainda (dados do perfil, preferências)

12. Notificações /notifications
Status: ✅ Completo — sincronizado com API

Rotas exclusivas para o Expo
Estas rotas são otimizadas para mobile (menos requests, dados enriquecidos):

Método	Rota	Use para
GET	/api/mobile/summary	Home screen — tudo em 1 request: KPIs + atividade + tarefas + projetos ativos
GET	/api/mobile/calendar?year=YYYY&month=M	Tela de calendário
GET	/api/mobile/notifications?limit=30	Feed de notificações
Para o Expo, a recomendação é: use /api/mobile/summary na home (evita múltiplos fetches), e as rotas CRUD individuais nas telas de detalhe.