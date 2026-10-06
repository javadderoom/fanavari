'use client';

import React, { useState, useMemo } from 'react';
import { 
  Table2, 
  Search, 
  Filter, 
  Lock, 
  Globe, 
  Settings2, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  FileText,
  HelpCircle
} from 'lucide-react';
import { Process, InformationPost } from '@/types/process';
import { 
  SimulatedPersona, 
  SIMULATION_PERSONAS, 
  evaluateItemAccess, 
  AccessEvaluation 
} from './types';
import { DeptItem } from '@/components/access/types';

interface PermissionsMatrixTableProps {
  processes: Process[];
  posts: InformationPost[];
  departments: DeptItem[];
  onOpenProcessAccess: (process: Process) => void;
  onOpenPostAccess: (post: InformationPost) => void;
}

export function PermissionsMatrixTable({
  processes,
  posts,
  departments,
  onOpenProcessAccess,
  onOpenPostAccess,
}: PermissionsMatrixTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'process' | 'information'>('all');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'restricted' | 'public'>('all');

  // Unified items list
  const allItems = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      type: 'process' | 'post';
      visibility: string;
      departmentName?: string;
      rawProcess?: Process;
      rawPost?: InformationPost;
      accessGrants: any[];
      authorId?: string | null;
    }> = [];

    processes.forEach((p) => {
      list.push({
        id: p.id,
        title: p.title,
        type: 'process',
        visibility: p.visibility || 'public',
        departmentName: p.departmentName,
        rawProcess: p,
        accessGrants: p.accessGrants || [],
        authorId: p.authorId,
      });
    });

    posts.forEach((p) => {
      list.push({
        id: p.id,
        title: p.title,
        type: 'post',
        visibility: p.visibility || 'public',
        departmentName: p.departmentName || undefined,
        rawPost: p,
        accessGrants: p.accessGrants || [],
        authorId: p.authorId,
      });
    });

    return list;
  }, [processes, posts]);

  // Filtered rows
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filterType === 'process' && item.type !== 'process') return false;
      if (filterType === 'information' && item.type !== 'post') return false;

      if (filterVisibility === 'restricted' && item.visibility === 'public') return false;
      if (filterVisibility === 'public' && item.visibility === 'restricted') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!item.title.toLowerCase().includes(q) && !(item.departmentName || '').toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [allItems, filterType, filterVisibility, searchQuery]);

  // Pre-calculated personas to use as matrix columns
  const matrixPersonas = SIMULATION_PERSONAS;

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div 
        className="glass-panel-strong rounded-3xl p-5 border shadow-sm space-y-4"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی سطر در ماتریس مجوزها..."
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-2xl border bg-slate-100 dark:bg-slate-900" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                همه اسناد ({allItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('process')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'process' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                فرایندها ({processes.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('information')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'information' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                بخشنامه‌ها ({posts.length})
              </button>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-2xl border bg-slate-100 dark:bg-slate-900" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setFilterVisibility('all')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterVisibility === 'all' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-xs' : 'text-slate-500'
                }`}
              >
                همه سطوح
              </button>
              <button
                type="button"
                onClick={() => setFilterVisibility('restricted')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterVisibility === 'restricted' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-600/80'
                }`}
              >
                فقط محدودشده‌ها (🔒)
              </button>
              <button
                type="button"
                onClick={() => setFilterVisibility('public')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterVisibility === 'public' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-600/80'
                }`}
              >
                فقط عمومی (🌐)
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t text-xs text-slate-500" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="font-bold text-slate-400">راهنمای علائم ماتریس:</span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>عمومی (قابل دسترس برای همه)</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>تخصیص از طریق سمت / نقش</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>تخصیص از طریق دپارتمان</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>تخصیص فردی کاربر</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>مسدود (سیاست Zero-Leak)</span>
          </span>
        </div>
      </div>

      {/* Cross-Matrix Table Container */}
      <div 
        className="rounded-3xl border overflow-x-auto shadow-sm bg-white dark:bg-slate-900"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <table className="w-full text-right text-xs border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <th className="p-3.5 font-black text-slate-600 dark:text-slate-300 w-72">
                عنوان سند سازمانی
              </th>
              <th className="p-3.5 font-black text-slate-600 dark:text-slate-300 w-24 text-center">
                سطح دید
              </th>
              {matrixPersonas.map((persona) => (
                <th key={persona.id} className="p-3.5 font-black text-slate-600 dark:text-slate-300 text-center">
                  <div className="font-bold text-xs">{persona.roleName}</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate max-w-[110px] mx-auto">
                    {persona.departmentName}
                  </div>
                </th>
              ))}
              <th className="p-3.5 font-black text-slate-600 dark:text-slate-300 w-28 text-center">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={matrixPersonas.length + 3} className="p-8 text-center text-slate-400">
                  موردی یافت نشد.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isRestricted = item.visibility === 'restricted';

                return (
                  <tr 
                    key={`${item.type}-${item.id}`}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Document Title & Type */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {item.type === 'process' ? '⚙️' : '📢'}
                        </span>
                        <div>
                          <div className="font-bold text-xs line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                            {item.title}
                          </div>
                          {item.departmentName && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-2.5 h-2.5" />
                              <span>{item.departmentName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Visibility Badge */}
                    <td className="p-3.5 text-center">
                      {isRestricted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          <Lock className="w-2.5 h-2.5" />
                          <span>محدود</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          <Globe className="w-2.5 h-2.5" />
                          <span>عمومی</span>
                        </span>
                      )}
                    </td>

                    {/* Matrix Cells per Persona */}
                    {matrixPersonas.map((persona) => {
                      const evalInfo = evaluateItemAccess(
                        {
                          visibility: item.visibility,
                          authorId: item.authorId,
                          accessGrants: item.accessGrants,
                        },
                        persona
                      );

                      return (
                        <td key={persona.id} className="p-3 text-center">
                          {evalInfo.isAccessible ? (
                            <span
                              title={`${evalInfo.reasonLabel}: ${evalInfo.matchedDetails || ''}`}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold cursor-help transition-transform hover:scale-105 shadow-2xs ${
                                evalInfo.reasonCode === 'PUBLIC'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                                  : evalInfo.reasonCode === 'SUPER_ADMIN'
                                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                                  : evalInfo.reasonCode === 'ROLE_MATCH'
                                  ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                                  : evalInfo.reasonCode === 'DEPT_MATCH'
                                  ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20'
                                  : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>
                                {evalInfo.reasonCode === 'PUBLIC'
                                  ? 'عمومی'
                                  : evalInfo.reasonCode === 'SUPER_ADMIN'
                                  ? 'مدیر ارشد'
                                  : evalInfo.reasonCode === 'ROLE_MATCH'
                                  ? 'نقش'
                                  : evalInfo.reasonCode === 'DEPT_MATCH'
                                  ? 'دپارتمان'
                                  : 'مجاز'}
                              </span>
                            </span>
                          ) : (
                            <span
                              title="این سند تحت سیاست Zero-Leak از دید این کاربر کاملاً پنهان است"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-60"
                            >
                              <Lock className="w-2.5 h-2.5 text-rose-400" />
                              <span>مسدود</span>
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Manage Access Button */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.type === 'process' && item.rawProcess) {
                            onOpenProcessAccess(item.rawProcess);
                          } else if (item.type === 'post' && item.rawPost) {
                            onOpenPostAccess(item.rawPost);
                          }
                        }}
                        className="p-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer mx-auto"
                      >
                        <Settings2 className="w-3 h-3" />
                        <span>مدیریت</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
