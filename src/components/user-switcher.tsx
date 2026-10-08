'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUserSession, DEMO_USERS } from './user-session-provider';
import { Shield, ShieldAlert, User, ChevronDown, Check, Sparkles, LogOut, Settings } from 'lucide-react';

export function UserSwitcher() {
  const { currentUser, switchUser, isSuperAdmin, isAuthenticated, isDemoMode, logout } = useUserSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer hover:scale-105"
        style={{
          background: 'var(--bg-glass-card)',
          borderColor: isSuperAdmin ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-glass)',
          color: 'var(--text-primary)',
        }}
        title="تغییر حساب کاربری و سطح دسترسی سازمانی"
      >
        <div className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden bg-slate-200 dark:bg-slate-700">
          {isSuperAdmin ? (
            <Shield className="w-3 h-3 text-rose-500 fill-rose-500" />
          ) : (
            <User className="w-3 h-3 text-blue-500" />
          )}
        </div>

        <span className="hidden sm:inline font-bold whitespace-nowrap">
          {currentUser.name.split(' ')[0]}
        </span>

        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono whitespace-nowrap"
          style={{
            background: isSuperAdmin ? 'var(--badge-rose-bg)' : 'var(--accent-soft)',
            color: isSuperAdmin ? 'var(--badge-rose-text)' : 'var(--accent-primary)',
          }}
        >
          {isSuperAdmin ? '👑 Admin' : currentUser.roleName}
        </span>

        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-72 rounded-2xl glass-panel-strong shadow-2xl p-2 z-50 border animate-in fade-in zoom-in-95"
          style={{ borderColor: 'var(--border-glass)' }}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-3 py-2 border-b mb-1 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[11px] font-bold block" style={{ color: 'var(--text-muted)' }}>
              {isAuthenticated ? currentUser.name : 'حساب کاربری'}
            </span>
            <span className="text-[10px] text-blue-500 font-mono">RBAC + Dept</span>
          </div>

          {isAuthenticated ? (
            <div className="space-y-1 mb-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full p-2.5 rounded-xl text-right flex items-center gap-2.5 text-xs transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>حساب کاربری من</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-right flex items-center gap-2.5 text-xs transition-colors cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-bold">خروج از حساب</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block p-2.5 rounded-xl text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 mb-1"
            >
              ورود / ثبت‌نام
            </Link>
          )}

          {isDemoMode && (
          <>
          <div className="px-3 py-2 border-b mb-1 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[11px] font-bold block" style={{ color: 'var(--text-muted)' }}>
              تغییر پرسونای تستی سازمانی:
            </span>
          </div>

          <div className="space-y-1">
            {DEMO_USERS.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    switchUser(user.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-500/10 font-bold text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={user.avatarUrl || undefined} 
                      alt="" 
                      className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-300 dark:border-slate-600" 
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[12px]" style={{ color: 'var(--text-primary)' }}>
                          {user.name}
                        </span>
                        {user.id === 'usr-admin' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
                            ادمین کل
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {user.roleName}
                        </span>
                        {user.departmentName && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                              {user.departmentName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
          </>
          )}
        </div>
      )}
    </div>
  );
}
