'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Permissions, hasPermission, ROLE_PRESETS } from '@/lib/permissions';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  permissions: number; // Bitfield integer
  avatarUrl?: string;
}

export const DEMO_USERS: AppUser[] = [
  {
    id: 'usr-admin',
    name: 'مدیر ارشد سامانه (Super Admin)',
    email: 'admin@fanavari.local',
    roleName: ROLE_PRESETS.SUPER_ADMIN.name,
    permissions: ROLE_PRESETS.SUPER_ADMIN.bitfield,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
  },
  {
    id: 'usr-editor',
    name: 'کارشناس تدوین فرایند (Editor)',
    email: 'editor@fanavari.local',
    roleName: ROLE_PRESETS.PROCESS_EDITOR.name,
    permissions: ROLE_PRESETS.PROCESS_EDITOR.bitfield,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=editor',
  },
  {
    id: 'usr-viewer',
    name: 'پرسنل سازمانی (Viewer)',
    email: 'viewer@fanavari.local',
    roleName: ROLE_PRESETS.EMPLOYEE_VIEWER.name,
    permissions: ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=viewer',
  },
];

interface UserContextType {
  currentUser: AppUser;
  switchUser: (userId: string) => void;
  loginAsSuperAdmin: (password?: string) => boolean;
  can: (permission: number) => boolean;
  isSuperAdmin: boolean;
}

const UserContext = createContext<UserContextType>({
  currentUser: DEMO_USERS[0],
  switchUser: () => {},
  loginAsSuperAdmin: () => true,
  can: () => true,
  isSuperAdmin: true,
});

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
  // Default is Super Admin (the user)
  const [currentUser, setCurrentUser] = useState<AppUser>(DEMO_USERS[0]);

  useEffect(() => {
    const savedUserId = localStorage.getItem('fanavari-active-user');
    if (savedUserId) {
      const found = DEMO_USERS.find(u => u.id === savedUserId);
      if (found) setCurrentUser(found);
    }
  }, []);

  const switchUser = (userId: string) => {
    const found = DEMO_USERS.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('fanavari-active-user', found.id);
    }
  };

  const loginAsSuperAdmin = (password?: string): boolean => {
    // Master password check (or empty for quick login)
    if (!password || password === 'admin' || password === 'fanavari1403' || password === 'fanavari') {
      const adminUser = DEMO_USERS[0];
      setCurrentUser(adminUser);
      localStorage.setItem('fanavari-active-user', adminUser.id);
      return true;
    }
    return false;
  };

  const can = (permission: number): boolean => {
    return hasPermission(currentUser.permissions, permission);
  };

  const isSuperAdmin = (currentUser.permissions & Permissions.ADMINISTRATOR) === Permissions.ADMINISTRATOR;

  return (
    <UserContext.Provider value={{ currentUser, switchUser, loginAsSuperAdmin, can, isSuperAdmin }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserSession() {
  return useContext(UserContext);
}
