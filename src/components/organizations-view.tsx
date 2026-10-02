'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OrganizationEntity } from '@/types/process';
import { DepartmentEditorModal } from '@/components/department-editor-modal';
import { useUserSession } from '@/components/user-session-provider';
import { Permissions } from '@/lib/permissions';
import { 
  Building2, 
  ArrowLeft, 
  Shield, 
  Users, 
  Landmark, 
  Server, 
  Coins, 
  GraduationCap, 
  Plus,
  Layers
} from 'lucide-react';

interface OrganizationsViewProps {
  initialDepartments: OrganizationEntity[];
}

export function OrganizationsView({ initialDepartments }: OrganizationsViewProps) {
  const { can, isSuperAdmin } = useUserSession();
  const [departments, setDepartments] = useState<OrganizationEntity[]>(initialDepartments);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canCreate = can(Permissions.MANAGE_CATEGORIES) || isSuperAdmin;

  const handleOrgCreated = (newOrg: OrganizationEntity) => {
    setDepartments((prev) => [newOrg, ...prev.filter((d) => d.slug !== newOrg.slug)]);
  };

  const getOrgIcon = (slug: string) => {
    switch (slug) {
      case 'org-medu': return <GraduationCap className="w-6 h-6 text-emerald-600" />;
      case 'org-tax': return <Landmark className="w-6 h-6 text-amber-500" />;
      case 'org-tamin': return <Shield className="w-6 h-6 text-sky-500" />;
      case 'org-fanavari-hr': return <Users className="w-6 h-6 text-blue-500" />;
      case 'org-fanavari-it': return <Server className="w-6 h-6 text-purple-500" />;
      case 'org-fanavari-finance': return <Coins className="w-6 h-6 text-emerald-500" />;
      default: return <Building2 className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <>
      {/* Action Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
            پایگاه داده ساختار سازمانی
          </span>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            لیست سازمان‌ها و مراجع متصل به سیستم ({departments.length})
          </h2>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت سازمان یا ارگان جدید</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {departments.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-blue-500" />
          <h3 className="text-lg font-bold">هیچ سازمانی در پایگاه داده ثبت نشده است</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            می‌توانید نخستین ارگان یا وزارتخانه را در پایگاه داده ثبت کنید.
          </p>
          {canCreate && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ثبت سازمان جدید</span>
            </button>
          )}
        </div>
      ) : (
        /* Organizations Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((org) => {
            return (
              <div
                key={org.slug}
                className="glass-card rounded-3xl p-6 flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
                    >
                      {getOrgIcon(org.slug)}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)' }}
                    >
                      {org.category === 'gov' ? 'نهاد دولتی / وزارتخانه' : 'دپارتمان سازمانی'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black mb-2 group-hover:text-blue-600 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {org.name}
                  </h3>

                  <p className="text-xs sm:text-sm font-medium leading-relaxed mb-4"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {org.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t text-xs font-bold text-blue-600"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <span className="text-xs text-slate-500 font-normal">
                    {org.processCount} فرایند تدوین‌شده
                  </span>
                  <Link 
                    href={`/?dept=${org.slug}`} 
                    className="group-hover:translate-x-[-4px] transition-transform flex items-center gap-1 font-bold"
                  >
                    <span>مشاهده فرایندهای مربوطه</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Modal */}
      <DepartmentEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleOrgCreated}
      />
    </>
  );
}
