'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Permissions, hasPermission, ROLE_PRESETS } from '@/lib/permissions';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  departmentId?: string;
  departmentName?: string;
  permissions: number; // Bitfield integer
  avatarUrl?: string;
}

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
