import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, KeyRound, User } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const login = useAuthStore((s) => s.login);
  const { toast } = useToast();

  // --- Aba: Entrar ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // --- Aba: Primeiro acesso ---
  const [setupEmail, setSetupEmail] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [setupName, setSetupName] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [showSetupPwd, setShowSetupPwd] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro ao entrar", description: data.error ?? "Tente novamente.", variant: "destructive" });
        return;
      }
      login(data.token, data.user);
      navigate("/");
    } catch {
      toast({ title: "Erro de conexão", description: "Não foi possível conectar ao servidor.", variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    if (setupPassword !== setupConfirm) {
      toast({ title: "Senhas não coincidem", description: "Confirme a senha corretamente.", variant: "destructive" });
      return;
    }
    if (setupPassword.length < 8) {
      toast({ title: "Senha muito curta", description: "A senha deve ter no mínimo 8 caracteres.", variant: "destructive" });
      return;
    }
    setSetupLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: setupEmail,
          token: setupToken.trim(),
          password: setupPassword,
          name: setupName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro no primeiro acesso", description: data.error ?? "Tente novamente.", variant: "destructive" });
        return;
      }
      login(data.token, data.user);
      toast({ title: "Conta configurada!", description: `Bem-vindo, ${data.user.name}.` });
      navigate("/");
    } catch {
      toast({ title: "Erro de conexão", description: "Não foi possível conectar ao servidor.", variant: "destructive" });
    } finally {
      setSetupLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <BrandLogo variant="login" />
          <p className="text-sm text-muted-foreground mt-1">Sistema interno da Agzos Agency</p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg p-6">
          <Tabs defaultValue="login">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1">Entrar</TabsTrigger>
              <TabsTrigger value="setup" className="flex-1">Primeiro acesso</TabsTrigger>
            </TabsList>

            {/* Aba: Entrar */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-9"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showLoginPwd ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showLoginPwd ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            {/* Aba: Primeiro acesso */}
            <TabsContent value="setup">
              <form onSubmit={handleSetup} className="space-y-4">
                <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border">
                  Use o token de convite recebido para criar sua senha e ativar sua conta.
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="setup-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="setup-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-9"
                      value={setupEmail}
                      onChange={(e) => setSetupEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="setup-token">Token de convite</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="setup-token"
                      type="text"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="pl-9 font-mono text-xs"
                      value={setupToken}
                      onChange={(e) => setSetupToken(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="setup-name">Seu nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="setup-name"
                      type="text"
                      placeholder="Nome completo"
                      className="pl-9"
                      value={setupName}
                      onChange={(e) => setSetupName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="setup-password">Criar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="setup-password"
                      type={showSetupPwd ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      className="pl-9 pr-10"
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSetupPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showSetupPwd ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showSetupPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="setup-confirm">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="setup-confirm"
                      type="password"
                      placeholder="Repita a senha"
                      className="pl-9"
                      value={setupConfirm}
                      onChange={(e) => setSetupConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={setupLoading}>
                  {setupLoading ? "Configurando..." : "Ativar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Acesso restrito — somente membros autorizados.
        </p>
      </div>
    </div>
  );
}
