'use client';

import React from 'react';
import { useTheme } from './theme-provider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all duration-300"
      style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border-glass)',
        color: 'var(--text-secondary)',
      }}
      title={theme === 'light' ? 'تغییر به حالت شب' : 'تغییر به حالت روز'}
      aria-label="تغییر تم"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {theme === 'light' ? (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="w-4 h-4 text-blue-400 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>
    </button>
  );
}
