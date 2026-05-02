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
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
}

const MOCK_USERS: Record<Role, AuthUser> = {
  admin: {
    id: "1",
    name: "Lucas Ferreira",
    email: "lucas@agzos.agency",
    role: "admin",
    avatarInitials: "LF",
  },
  account_manager: {
    id: "2",
    name: "Ana Rodrigues",
    email: "ana@agzos.agency",
    role: "account_manager",
    avatarInitials: "AR",
  },
  traffic_manager: {
    id: "3",
    name: "Pedro Santos",
    email: "pedro@agzos.agency",
    role: "traffic_manager",
    avatarInitials: "PS",
  },
  designer: {
    id: "4",
    name: "Julia Lima",
    email: "julia@agzos.agency",
    role: "designer",
    avatarInitials: "JL",
  },
  developer: {
    id: "5",
    name: "Carlos Dev",
    email: "carlos@agzos.agency",
    role: "developer",
    avatarInitials: "CD",
  },
  financial: {
    id: "6",
    name: "Marina Costa",
    email: "marina@agzos.agency",
    role: "financial",
    avatarInitials: "MC",
  },
  client_viewer: {
    id: "7",
    name: "Marcelo Oliveira",
    email: "marcelo@mbo.com.br",
    role: "client_viewer",
    avatarInitials: "MO",
  },
};

interface AuthStore {
  user: AuthUser;
  permissions: PermissionMatrix;
  switchRole: (role: Role) => void;
  updatePermissions: (permissions: PermissionMatrix) => void;
  can: (action: Action) => boolean;
  canAccessModule: (module: NavModule) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: MOCK_USERS.admin,
      permissions: DEFAULT_PERMISSIONS,

      switchRole: (role: Role) => {
        set({ user: MOCK_USERS[role] });
      },

      updatePermissions: (permissions: PermissionMatrix) => {
        set({ permissions });
      },

      can: (action: Action) => {
        const { user, permissions } = get();
        return permissions.actions[action]?.includes(user.role) ?? false;
      },

      canAccessModule: (module: NavModule) => {
        const { user, permissions } = get();
        return permissions.modules[module]?.includes(user.role) ?? false;
      },
    }),
    {
      name: "agzos-auth",
      partialize: (state) => ({ user: state.user, permissions: state.permissions }),
    }
  )
);

export { MOCK_USERS };
