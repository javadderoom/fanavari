'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUserSession } from '@/components/user-session-provider';
import { notify } from '@/lib/notify';

const STORAGE_KEY = 'farayandnama_bookmarks';

interface BookmarksContextType {
  bookmarkedIds: string[];
  bookmarkedCount: number;
  isBookmarked: (processId?: string | null) => boolean;
  toggleBookmark: (processId: string, processTitle?: string) => Promise<boolean>;
  clearBookmarks: () => void;
  isLoading: boolean;
}

const BookmarksContext = createContext<BookmarksContextType>({
  bookmarkedIds: [],
  bookmarkedCount: 0,
  isBookmarked: () => false,
  toggleBookmark: async () => false,
  clearBookmarks: () => {},
  isLoading: false,
});

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserSession();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initial load from localStorage (instant, zero-flash)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setBookmarkedIds(parsed.filter((id) => typeof id === 'string'));
        }
      }
    } catch {
      // Local storage unreadable or disabled
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 2. Multi-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setBookmarkedIds(parsed.filter((id) => typeof id === 'string'));
          }
        } catch {
          // ignore parsing error
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 3. Server sync when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !isInitialized) return;

    let isCancelled = false;
    setIsLoading(true);

    async function syncWithServer() {
      try {
        const res = await fetch('/api/bookmarks');
        if (!res.ok) return;

        const data = await res.json();
        const serverIds: string[] = Array.isArray(data.processIds) ? data.processIds : [];

        // Check if there are local guest bookmarks that need uploading to server
        const currentLocal = (() => {
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as string[]) : [];
          } catch {
            return [];
          }
        })();

        const pendingUpload = currentLocal.filter((id) => !serverIds.includes(id));

        if (pendingUpload.length > 0) {
          // Batch upload local bookmarks to server
          await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ processIds: pendingUpload }),
          });
        }

        // Merge both sets
        const merged = Array.from(new Set([...serverIds, ...currentLocal]));
        if (!isCancelled) {
          setBookmarkedIds(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error('Failed to sync bookmarks with server:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    syncWithServer();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isInitialized]);

  const isBookmarked = useCallback(
    (processId?: string | null) => {
      if (!processId) return false;
      return bookmarkedIds.includes(processId);
    },
    [bookmarkedIds]
  );

  const toggleBookmark = useCallback(
    async (processId: string, processTitle?: string): Promise<boolean> => {
      if (!processId) return false;

      const currentlyActive = bookmarkedIds.includes(processId);
      const nextList = currentlyActive
        ? bookmarkedIds.filter((id) => id !== processId)
        : [...bookmarkedIds, processId];

      // Optimistic update
      setBookmarkedIds(nextList);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      } catch {
        // ignore
      }

      const displayTitle = processTitle ? `«${processTitle}»` : 'فرایند';

      if (currentlyActive) {
        notify.info(`${displayTitle} از نشان‌شده‌ها حذف شد.`);
        if (isAuthenticated) {
          fetch('/api/bookmarks', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ processId }),
          }).catch((err) => {
            console.error('Failed to remove bookmark from server:', err);
          });
        }
        return false;
      } else {
        notify.success(`${displayTitle} به نشان‌شده‌ها افزوده شد.`);
        if (isAuthenticated) {
          fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ processId }),
          }).catch((err) => {
            console.error('Failed to save bookmark to server:', err);
          });
        }
        return true;
      }
    },
    [bookmarkedIds, isAuthenticated]
  );

  const clearBookmarks = useCallback(() => {
    setBookmarkedIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      bookmarkedIds,
      bookmarkedCount: bookmarkedIds.length,
      isBookmarked,
      toggleBookmark,
      clearBookmarks,
      isLoading,
    }),
    [bookmarkedIds, isBookmarked, toggleBookmark, clearBookmarks, isLoading]
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}
