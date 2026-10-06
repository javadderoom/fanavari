'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, UserPlus } from 'lucide-react';
import { ProcessAccessGrant } from '@/types/process';
import { LookupUser } from './types';

interface UserGrantTabProps {
  grants: ProcessAccessGrant[];
  isLoading: boolean;
  onAddUserGrant: (userId: string, userName: string) => Promise<void>;
}

export function UserGrantTab({
  grants,
  isLoading,
  onAddUserGrant,
}: UserGrantTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LookupUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LookupUser | null>(null);

  // Debounced secure search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/users/lookup?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out users who already have individual grants
          const existingIds = new Set(grants.filter((g) => g.userId).map((g) => g.userId));
          setSearchResults(data.filter((u: LookupUser) => !existingIds.has(u.id)));
        }
      } catch (err) {
        console.error('User lookup error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, grants]);

  const handleAdd = async () => {
    if (!selectedUser) return;
    await onAddUserGrant(selectedUser.id, selectedUser.name);
    setSelectedUser(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-3 pt-1">
      <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
        جستجوی اختصاصی و مستقیم همکاران بدون نمایش عمومی دایرکتوری:
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="حداقل ۳ حرف از نام یا ایمیل همکار را وارد فرمایید..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedUser(null);
              }}
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 animate-spin absolute left-3 top-3 text-[var(--text-muted)]" />
            )}
          </div>

          <button
            type="button"
            disabled={!selectedUser || isLoading}
            onClick={handleAdd}
            className="px-4 py-2 text-xs rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>افزودن</span>
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && !selectedUser && (
          <div className="absolute z-20 top-full mt-1.5 w-full rounded-2xl border shadow-xl bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden">
            <div className="p-1.5 space-y-1 max-h-52 overflow-y-auto">
              {searchResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(u);
                    setSearchQuery(u.name);
                    setSearchResults([]);
                  }}
                  className="w-full p-2.5 rounded-xl text-right flex items-center justify-between hover:bg-[var(--bg-app)] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="w-7 h-7 rounded-full bg-[var(--bg-app)]" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                        {u.name.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold group-hover:text-blue-500 transition-colors">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">
                        {u.maskedEmail}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                    {u.roleName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
          <span className="text-blue-600 dark:text-blue-400">
            کاربر انتخاب‌شده: <strong>{selectedUser.name}</strong> ({selectedUser.roleName})
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setSearchQuery('');
            }}
            className="text-[11px] text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
          >
            تغییر
          </button>
        </div>
      )}
    </div>
  );
}
