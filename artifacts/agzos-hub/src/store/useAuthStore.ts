import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Role,
  NavModule,
  Action,
  PermissionMatrix,
  DEFAULT_PERMISSIONS,
} from "@/lib/permissions";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  // Papel simulado localmente (apenas para admins testarem outros perfis)
  simulatedRole: Role | null;
  permissions: PermissionMatrix;

  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  simulateRole: (role: Role | null) => void;
  updatePermissions: (permissions: PermissionMatrix) => void;
  can: (action: Action) => boolean;
  canAccessModule: (module: NavModule) => boolean;
  effectiveRole: () => Role | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      simulatedRole: null,
      permissions: DEFAULT_PERMISSIONS,

      login: (token, user) => {
        set({ token, user, simulatedRole: null });
      },

      logout: () => {
        set({ token: null, user: null, simulatedRole: null });
      },

      simulateRole: (role) => {
        // Só admins reais podem simular outros perfis
        const { user } = get();
        if (user?.role !== "admin") return;
        set({ simulatedRole: role });
      },

      updatePermissions: (permissions) => {
        set({ permissions });
      },

      effectiveRole: () => {
        const { user, simulatedRole } = get();
        if (!user) return null;
        // Admin pode simular outro role localmente
        return simulatedRole ?? user.role;
      },

      can: (action) => {
        const { permissions, effectiveRole } = get();
        const role = effectiveRole();
        if (!role) return false;
        return permissions.actions[action]?.includes(role) ?? false;
      },

      canAccessModule: (module) => {
        const { permissions, effectiveRole } = get();
        const role = effectiveRole();
        if (!role) return false;
        return permissions.modules[module]?.includes(role) ?? false;
      },
    }),
    {
      name: "agzos-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        permissions: state.permissions,
        // Não persiste simulatedRole — sempre começa sem simulação
      }),
    }
  )
);
