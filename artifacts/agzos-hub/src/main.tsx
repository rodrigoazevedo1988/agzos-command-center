import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useAuthStore } from "@/store/useAuthStore";

// Aplica o tema antes da renderização para evitar flash
const stored = localStorage.getItem("agzos-theme");
const theme = stored ? (JSON.parse(stored) as { state?: { theme?: string } })?.state?.theme ?? "dark" : "dark";
document.documentElement.classList.add(theme);

// Injeta o token JWT em todas as requisições do api-client-react
setAuthTokenGetter(() => useAuthStore.getState().token);

createRoot(document.getElementById("root")!).render(<App />);
