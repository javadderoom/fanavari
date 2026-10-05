'use client';

import React, { useState } from 'react';
import { useUserSession, DEMO_USERS } from './user-session-provider';
import { Shield, ShieldAlert, User, ChevronDown, Check, Sparkles } from 'lucide-react';

export function UserSwitcher() {
  const { currentUser, switchUser, isSuperAdmin } = useUserSession();
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
          className="absolute left-0 mt-2 w-64 rounded-2xl glass-panel-strong shadow-2xl p-2 z-50 border animate-in fade-in zoom-in-95"
          style={{ borderColor: 'var(--border-glass)' }}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-3 py-2 border-b mb-1" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[11px] font-bold block" style={{ color: 'var(--text-muted)' }}>
              حساب کاربری و سطح دسترسی:
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
                  className={`w-full p-2 rounded-xl text-right flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-500/10 font-bold text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="block font-bold" style={{ color: 'var(--text-primary)' }}>
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {user.roleName} • {user.email}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
