'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserSession } from '@/components/user-session-provider';
import { Process, InformationPost } from '@/types/process';
import { 
  SimulatedPersona, 
  SIMULATION_PERSONAS, 
  SimulatorTab, 
  evaluateItemAccess 
} from '@/components/dashboard/permissions/types';
import { PermissionsSimulatorHeader } from '@/components/dashboard/permissions/permissions-simulator-header';
import { PermissionsPersonaView } from '@/components/dashboard/permissions/permissions-persona-view';
import { PermissionsMatrixTable } from '@/components/dashboard/permissions/permissions-matrix-table';
import { PermissionsBitfieldPanel } from '@/components/dashboard/permissions/permissions-bitfield-panel';
import { ProcessAccessModal } from '@/components/process-access-modal';
import { InformationAccessModal } from '@/components/information-access-modal';
import { DeptItem } from '@/components/access/types';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { notify } from '@/lib/notify';

export default function DashboardPermissionsPage() {
  const { currentUser } = useUserSession();

  const [activeTab, setActiveTab] = useState<SimulatorTab>('simulator');
  const [selectedPersona, setSelectedPersona] = useState<SimulatedPersona>(SIMULATION_PERSONAS[0]);

  // Catalog Data
  const [processes, setProcesses] = useState<Process[]>([]);
  const [posts, setPosts] = useState<InformationPost[]>([]);
  const [departments, setDepartments] = useState<DeptItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Active Modals
  const [selectedProcessForAccess, setSelectedProcessForAccess] = useState<Process | null>(null);
  const [selectedPostForAccess, setSelectedPostForAccess] = useState<InformationPost | null>(null);

  // Load live catalog data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // Fetch using super-admin / manager headers so uncensored list is available for auditing
      const headers = {
        'x-user-id': currentUser.id,
        'x-user-role': encodeURIComponent(currentUser.roleName),
        'x-user-dept': currentUser.departmentId || '',
        'x-user-permissions': currentUser.permissions.toString(),
      };

      const [procsRes, postsRes, deptsRes] = await Promise.all([
        fetch('/api/processes?status=all', { headers }),
        fetch('/api/information?status=all', { credentials: 'omit', headers }),
        fetch('/api/departments', { credentials: 'omit' }),
      ]);

      if (!procsRes.ok || !postsRes.ok) {
        throw new Error('خطا در بارگذاری اطلاعات کاتالوگ یا بخشنامه‌ها');
      }

      const [procsData, postsData, deptsData] = await Promise.all([
        procsRes.json(),
        postsRes.json(),
        deptsRes.ok ? deptsRes.json() : [],
      ]);

      setProcesses(Array.isArray(procsData) ? procsData : []);
      setPosts(Array.isArray(postsData) ? postsData : []);
      setDepartments(
        Array.isArray(deptsData)
          ? deptsData.map((d: any) => ({ id: d.id, name: d.name, slug: d.slug }))
          : []
      );
    } catch (err: any) {
      console.error('Failed to load permissions simulator data:', err);
      setFetchError(err.message || 'خطا در بارگذاری داده‌ها');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update a process after modal modifications
  const handleUpdateProcess = (updated: Process) => {
    setProcesses((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProcessForAccess(updated);
  };

  // Update a post after modal modifications
  const handleUpdatePost = (updated: InformationPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPostForAccess(updated);
  };

  // Live KPI statistics for the selected persona
  const stats = useMemo(() => {
    let accessibleProcesses = 0;
    processes.forEach((p) => {
      const evaluation = evaluateItemAccess(
        {
          visibility: p.visibility,
          authorId: p.authorId,
          accessGrants: p.accessGrants || [],
        },
        selectedPersona
      );
      if (evaluation.isAccessible) accessibleProcesses++;
    });

    let accessiblePosts = 0;
    posts.forEach((p) => {
      const evaluation = evaluateItemAccess(
        {
          visibility: p.visibility,
          authorId: p.authorId,
          accessGrants: p.accessGrants || [],
        },
        selectedPersona
      );
      if (evaluation.isAccessible) accessiblePosts++;
    });

    return {
      totalProcesses: processes.length,
      totalPosts: posts.length,
      accessibleProcesses,
      accessiblePosts,
    };
  }, [processes, posts, selectedPersona]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-xs text-slate-400 font-bold">
          در حال بارگذاری کاتالوگ و ماتریس دسترسی‌های سازمانی...
        </span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-3xl p-8 border border-rose-500/30 bg-rose-500/5 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="font-bold text-sm text-rose-700 dark:text-rose-300">
          خطا در بارگذاری داده‌های دسترسی
        </h3>
        <p className="text-xs text-slate-400">{fetchError}</p>
        <button
          type="button"
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تلاش مجدد</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Simulator Header & Controls */}
      <PermissionsSimulatorHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedPersona={selectedPersona}
        onSelectPersona={setSelectedPersona}
        departments={departments}
        stats={stats}
      />

      {/* Tab 1: Live Persona Simulator */}
      {activeTab === 'simulator' && (
        <PermissionsPersonaView
          processes={processes}
          posts={posts}
          selectedPersona={selectedPersona}
          onOpenProcessAccess={(proc) => setSelectedProcessForAccess(proc)}
          onOpenPostAccess={(post) => setSelectedPostForAccess(post)}
        />
      )}

      {/* Tab 2: Audience Cross-Matrix Table */}
      {activeTab === 'matrix' && (
        <PermissionsMatrixTable
          processes={processes}
          posts={posts}
          departments={departments}
          onOpenProcessAccess={(proc) => setSelectedProcessForAccess(proc)}
          onOpenPostAccess={(post) => setSelectedPostForAccess(post)}
        />
      )}

      {/* Tab 3: Bitfield Flags Inspector */}
      {activeTab === 'bitfield' && (
        <PermissionsBitfieldPanel
          selectedPersona={selectedPersona}
          onUpdatePersonaPermissions={(newBits) => {
            setSelectedPersona((prev) => ({
              ...prev,
              permissions: newBits,
            }));
          }}
        />
      )}

      {/* Process Access Modal Trigger */}
      {selectedProcessForAccess && (
        <ProcessAccessModal
          process={selectedProcessForAccess}
          isOpen={true}
          onClose={() => setSelectedProcessForAccess(null)}
          onUpdate={handleUpdateProcess}
        />
      )}

      {/* Information Access Modal Trigger */}
      {selectedPostForAccess && (
        <InformationAccessModal
          post={selectedPostForAccess}
          isOpen={true}
          onClose={() => setSelectedPostForAccess(null)}
          onUpdate={handleUpdatePost}
        />
      )}
    </div>
  );
}
