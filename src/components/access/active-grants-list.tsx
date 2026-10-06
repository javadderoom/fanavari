'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Tag, 
  Building2, 
  Link2, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  Edit3 
} from 'lucide-react';
import { ProcessAccessGrant } from '@/types/process';
import { GrantsFilter } from './types';
import { notify } from '@/lib/notify';

interface ActiveGrantsListProps {
  grants: ProcessAccessGrant[];
  processSlug: string;
  onRevokeGrant: (grantId: string, label: string) => Promise<void>;
}

export function ActiveGrantsList({
  grants,
  processSlug,
  onRevokeGrant,
}: ActiveGrantsListProps) {
  const [grantsFilter, setGrantsFilter] = useState<GrantsFilter>('all');
  const [copiedClaimId, setCopiedClaimId] = useState<string | null>(null);

  const roleGrants = grants.filter((g) => Boolean(g.roleName));
  const deptGrants = grants.filter((g) => Boolean(g.departmentId));
  const userGrants = grants.filter((g) => Boolean(g.userId));
  const claimGrants = grants.filter((g) => Boolean(g.claimToken));

  const filteredGrants = grants.filter((g) => {
    if (grantsFilter === 'role') return Boolean(g.roleName);
    if (grantsFilter === 'department') return Boolean(g.departmentId);
    if (grantsFilter === 'user') return Boolean(g.userId);
    if (grantsFilter === 'claim') return Boolean(g.claimToken);
    return true;
  });

  const handleCopyClaimUrl = (token: string, grantId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/process/${processSlug}?claim=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedClaimId(grantId);
    notify.success('لینک دعوت در کلیپ‌بورد کپی شد.');
    setTimeout(() => setCopiedClaimId(null), 2500);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-amber-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-xs font-bold text-[var(--text-primary)]">
          دسترسی‌های فعال این فرایند ({grants.length})
        </span>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
          <button
            type="button"
            onClick={() => setGrantsFilter('all')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              grantsFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            همه ({grants.length})
          </button>
          <button
            type="button"
            onClick={() => setGrantsFilter('role')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              grantsFilter === 'role'
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            سمت‌ها ({roleGrants.length})
          </button>
          <button
            type="button"
            onClick={() => setGrantsFilter('department')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              grantsFilter === 'department'
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            واحدها ({deptGrants.length})
          </button>
          <button
            type="button"
            onClick={() => setGrantsFilter('claim')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              grantsFilter === 'claim'
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            لینک‌ها ({claimGrants.length})
          </button>
          <button
            type="button"
            onClick={() => setGrantsFilter('user')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              grantsFilter === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            اشخاص ({userGrants.length})
          </button>
        </div>
      </div>

      {filteredGrants.length === 0 ? (
        <div className="p-4 text-center rounded-xl border border-dashed border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          دسترسی ثبت‌شده‌ای در این بخش وجود ندارد.
        </div>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
          {filteredGrants.map((grant) => {
            const isRole = Boolean(grant.roleName);
            const isDept = Boolean(grant.departmentId);
            const isClaim = Boolean(grant.claimToken);
            const isUser = Boolean(grant.userId);

            let label = 'دسترسی سازمانی';
            let subLabel = '';
            let icon = <Users className="w-4 h-4 text-blue-500" />;

            if (isRole) {
              label = `سمت: ${grant.roleName}`;
              subLabel = 'شامل تمام همکاران دارای این سمت در کلیه مدارس/واحدهای تابعه';
              icon = <Tag className="w-4 h-4 text-purple-500" />;
            } else if (isDept) {
              label = `واحد سازمانی: ${grant.department?.name || 'واحد تابعه'}`;
              subLabel = 'شامل کلیه پرسنل ثبت‌شده در این واحد';
              icon = <Building2 className="w-4 h-4 text-emerald-500" />;
            } else if (isClaim) {
              label = 'لینک دعوت هوشمند';
              const expiresDate = grant.claimExpiresAt ? new Date(grant.claimExpiresAt) : null;
              const isExpired = expiresDate ? expiresDate < new Date() : false;
              subLabel = isExpired
                ? 'منقضی شده'
                : expiresDate
                ? `معتبر تا ${expiresDate.toLocaleDateString('fa-IR')}`
                : 'بدون انقضا';
              icon = <Link2 className="w-4 h-4 text-amber-500" />;
            } else if (isUser) {
              label = grant.user?.name || 'کاربر سازمانی';
              subLabel = `${grant.user?.roleName || 'پرسنل'} • ${grant.user?.email || ''}`;
              icon = <User className="w-4 h-4 text-blue-500" />;
            }

            return (
              <div
                key={grant.id}
                className="p-3 rounded-xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] flex items-center justify-between text-xs gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[var(--text-primary)] truncate">
                      {label}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate">
                      {subLabel}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Permission Badge */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                    grant.permission === 'edit'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  }`}>
                    {grant.permission === 'edit' ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{grant.permission === 'edit' ? 'ویرایشگر' : 'مشاهده‌گر'}</span>
                  </span>

                  {/* Copy button for Claim Links */}
                  {grant.claimToken && (
                    <button
                      type="button"
                      title="کپی پیوند دعوت"
                      onClick={() => handleCopyClaimUrl(grant.claimToken!, grant.id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                        copiedClaimId === grant.id
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : 'bg-[var(--bg-app)] hover:bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                      }`}
                    >
                      {copiedClaimId === grant.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline text-[10px]">کپی لینک</span>
                    </button>
                  )}

                  {/* Revoke button */}
                  <button
                    type="button"
                    title="لغو این دسترسی"
                    onClick={() => onRevokeGrant(grant.id, label)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
