import { Switch, Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";
import { useAuthStore } from "@/store/useAuthStore";

// Pages
import Dashboard from "@/pages/dashboard";
import Sites from "@/pages/sites";
import Projects from "@/pages/projects";
import Clients from "@/pages/clients";
import Team from "@/pages/team";
import Financial from "@/pages/financial";
import Tools from "@/pages/tools";
import NotificationsPage from "@/pages/notifications";
import Reports from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import CalendarPage from "@/pages/calendar";
import ActivityPage from "@/pages/activity";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";

const queryClient = new QueryClient();

// Lê o token do localStorage de forma síncrona antes do primeiro render
// para evitar redirect incorreto para /login durante hidratação do Zustand
function getPersistedToken(): string | null {
  try {
    const raw = localStorage.getItem("agzos-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const storeToken = useAuthStore((s) => s.token);
  const token = storeToken || getPersistedToken();
  if (!token) return <Redirect to="/login" />;
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          {/* Rota pública */}
          <Route path="/login" component={LoginPage} />

          {/* Rotas protegidas — AppLayout envolve todas */}
          <Route>
            <ProtectedRoute>
              <AppLayout>
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/sites" component={Sites} />
                  <Route path="/projects" component={Projects} />
                  <Route path="/clients" component={Clients} />
                  <Route path="/team" component={Team} />
                  <Route path="/financial" component={Financial} />
                  <Route path="/tools" component={Tools} />
                  <Route path="/notifications" component={NotificationsPage} />
                  <Route path="/reports" component={Reports} />
                  <Route path="/settings" component={SettingsPage} />
                  <Route path="/calendar" component={CalendarPage} />
                  <Route path="/activity" component={ActivityPage} />
                  <Route component={NotFound} />
                </Switch>
              </AppLayout>
            </ProtectedRoute>
          </Route>
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
