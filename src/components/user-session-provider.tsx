'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Permissions, hasPermission, ROLE_PRESETS } from '@/lib/permissions';
import type { SessionUser } from '@/lib/session';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  roleName: string;
  departmentId?: string | null;
  departmentName?: string | null;
  permissions: number; // Bitfield integer
  avatarUrl?: string | null;
  otpEnabled?: boolean;
}

/** Demo personas are deny-by-default: only when explicitly enabled. */
const DEMO_ENABLED =
  process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN === 'true' ||
  process.env.ALLOW_DEMO_LOGIN === 'true';

const GUEST_USER: AppUser = {
  id: 'guest',
  name: 'کاربر مهمان',
  email: '',
  roleName: 'مهمان',
  departmentId: null,
  departmentName: null,
  permissions: Permissions.VIEW_PROCESSES,
  avatarUrl: undefined,
};

export const DEMO_USERS: AppUser[] = [
  {
    id: 'usr-admin',
    name: 'مهندس سهرابی (مدیر ارشد)',
    email: 'admin@fanavari.local',
    roleName: ROLE_PRESETS.SUPER_ADMIN.name,
    departmentId: 'dept-it',
    departmentName: 'ستاد مرکزی فناوری',
    permissions: ROLE_PRESETS.SUPER_ADMIN.bitfield,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
  },
  {
    id: 'usr-principal',
    name: 'سید مرتضی حسینی (مدیر مدرسه)',
    email: 'principal@school.local',
    roleName: 'مدیر مدرسه',
    departmentId: 'org-medu',
    departmentName: 'مدارس و واحدهای آموزشی',
    permissions: ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=principal',
  },
  {
    id: 'usr-deputy',
    name: 'مریم صادقی (معاون اجرایی)',
    email: 'deputy@school.local',
    roleName: 'معاون اجرایی',
    departmentId: 'org-medu',
    departmentName: 'مدارس و واحدهای آموزشی',
    permissions: ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=deputy',
  },
  {
    id: 'usr-tech-support',
    name: 'علیرضا راد (پشتیبان فناوری)',
    email: 'it-support@fanavari.local',
    roleName: 'پشتیبان فناوری',
    departmentId: 'dept-it',
    departmentName: 'اداره فناوری و آمار',
    permissions: ROLE_PRESETS.PROCESS_EDITOR.bitfield,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=tech',
  },
  {
    id: 'usr-teacher',
    name: 'احمد محمدی (آموزگار / پرسنل)',
    email: 'teacher@school.local',
    roleName: 'آموزگار',
    departmentId: 'org-medu',
    departmentName: 'مدارس و واحدهای آموزشی',
    permissions: ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher',
  },
];

function toAppUser(s: SessionUser): AppUser {
  return {
    id: s.id,
    name: s.name,
    email: s.email || '',
    phone: s.phone,
    emailVerified: s.emailVerified,
    phoneVerified: s.phoneVerified,
    roleName: s.roleName,
    departmentId: s.departmentId,
    departmentName: s.departmentName,
    permissions: s.permissions,
    avatarUrl: s.avatarUrl,
    otpEnabled: s.otpEnabled,
  };
}

interface UserContextType {
  currentUser: AppUser;
  /** True when the user holds a real server session (not demo/guest). */
  isAuthenticated: boolean;
  /** True while the initial /auth/me check is running. */
  isLoading: boolean;
  /** Demo-only persona switching (disabled unless demo logins allowed). */
  switchUser: (userId: string) => void;
  loginAsSuperAdmin: (password?: string) => boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  can: (permission: number) => boolean;
  isSuperAdmin: boolean;
  isDemoMode: boolean;
}

const UserContext = createContext<UserContextType>({
  currentUser: GUEST_USER,
  isAuthenticated: false,
  isLoading: true,
  switchUser: () => {},
  loginAsSuperAdmin: () => false,
  logout: async () => {},
  refreshSession: async () => {},
  can: () => false,
  isSuperAdmin: false,
  isDemoMode: false,
});

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser>(DEMO_ENABLED ? DEMO_USERS[0] : GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(toAppUser(data.user));
          setIsAuthenticated(true);
          return;
        }
      }
    } catch {
      // No session — fall through to demo/guest fallback.
    }
    setIsAuthenticated(false);
    if (DEMO_ENABLED) {
      const savedUserId =
        typeof window !== 'undefined' ? localStorage.getItem('fanavari-active-user') : null;
      const found = DEMO_USERS.find((u) => u.id === savedUserId);
      setCurrentUser(found || DEMO_USERS[0]);
    } else {
      setCurrentUser(GUEST_USER);
    }
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession]);

  const switchUser = (userId: string) => {
    if (!DEMO_ENABLED) return;
    const found = DEMO_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(false);
      localStorage.setItem('fanavari-active-user', found.id);
    }
  };

  const loginAsSuperAdmin = (password?: string): boolean => {
    // Demo-only quick login. Real admins sign in via /login in production.
    if (!DEMO_ENABLED) return false;
    if (!password || password === 'admin' || password === 'fanavari1403' || password === 'fanavari') {
      const adminUser = DEMO_USERS[0];
      setCurrentUser(adminUser);
      setIsAuthenticated(false);
      localStorage.setItem('fanavari-active-user', adminUser.id);
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore network errors — still clear local state.
    }
    setIsAuthenticated(false);
    if (DEMO_ENABLED) {
      localStorage.removeItem('fanavari-active-user');
      setCurrentUser(DEMO_USERS[0]);
    } else {
      setCurrentUser(GUEST_USER);
    }
  };

  const can = (permission: number): boolean => {
    return hasPermission(currentUser.permissions, permission);
  };

  const isSuperAdmin = (currentUser.permissions & Permissions.ADMINISTRATOR) === Permissions.ADMINISTRATOR;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        switchUser,
        loginAsSuperAdmin,
        logout,
        refreshSession,
        can,
        isSuperAdmin,
        isDemoMode: DEMO_ENABLED && !isAuthenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserSession() {
  return useContext(UserContext);
}
