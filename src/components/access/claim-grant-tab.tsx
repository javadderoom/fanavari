'use client';

import React, { useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';

interface ClaimGrantTabProps {
  isLoading: boolean;
  onGenerateClaimLink: (expiresInDays: number) => Promise<void>;
}

export function ClaimGrantTab({
  isLoading,
  onGenerateClaimLink,
}: ClaimGrantTabProps) {
  const [claimExpiresInDays, setClaimExpiresInDays] = useState<number>(7);

  const handleGenerate = async () => {
    await onGenerateClaimLink(claimExpiresInDays);
  };

  return (
    <div className="space-y-3 pt-1">
      <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
        ایجاد پیوند هوشمند زمان‌دار. هر همکاری با باز کردن این لینک، در صورت ورود به سامانه، دسترسی‌اش به صورت خودکار فعال می‌شود:
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">مدت اعتبار:</span>
          <select
            value={claimExpiresInDays}
            onChange={(e) => setClaimExpiresInDays(Number(e.target.value))}
            className="px-3 py-2 text-xs rounded-xl border bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none"
          >
            <option value={3}>۳ روز</option>
            <option value={7}>۷ روز (استاندارد)</option>
            <option value={14}>۱۴ روز (دو هفته)</option>
            <option value={30}>۳۰ روز (یک ماه)</option>
            <option value={365}>دائم / ۱ سال</option>
          </select>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={handleGenerate}
          className="w-full sm:w-auto px-4 py-2 text-xs rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
          <span>تولید لینک دعوت جدید</span>
        </button>
      </div>
    </div>
  );
}
