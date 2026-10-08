'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/components/user-session-provider';
import { canAccessDashboard } from '@/lib/permissions';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminHeader } from '@/components/dashboard/admin-header';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading, isDemoMode } = useUserSession();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Admins-and-authors only: guests go to login, signed-in plain viewers go
  // home. Demo mode (explicitly enabled) bypasses for development.
  const canSeeDashboard =
    isDemoMode || (isAuthenticated && canAccessDashboard(currentUser.permissions));

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isDemoMode) {
      router.replace('/login');
    } else if (!canSeeDashboard) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, isDemoMode, canSeeDashboard, router]);

  if (isLoading || !canSeeDashboard) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-app)' }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      {/* Dedicated Admin Sidebar */}
      <AdminSidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Header */}
        <AdminHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
