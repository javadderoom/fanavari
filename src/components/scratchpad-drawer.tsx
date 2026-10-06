'use client';

import React, { useState, useEffect } from 'react';
import { 
  StickyNote, 
  X, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles,
  ChevronDown,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { notify } from '@/lib/notify';

interface ScratchpadField {
  id: string;
  label: string;
  value: string;
}

interface ScratchpadDrawerProps {
  processId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function ScratchpadDrawer({
  processId,
  isOpen,
  onToggle,
}: ScratchpadDrawerProps) {
  const [note, setNote] = useState('');
  const [fields, setFields] = useState<ScratchpadField[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    if (!processId) return;
    try {
      const savedNote = localStorage.getItem(`fanavari-scratchpad-note-${processId}`);
      if (savedNote) setNote(savedNote);

      const savedFields = localStorage.getItem(`fanavari-scratchpad-fields-${processId}`);
      if (savedFields) {
        setFields(JSON.parse(savedFields));
      } else {
        // Default starter helper fields
        setFields([
          { id: '1', label: 'کد ملی کاربر', value: '' },
          { id: '2', label: 'شماره پرونده / پیگیری', value: '' },
        ]);
      }
    } catch (e) {
      console.error('Error loading scratchpad:', e);
    }
  }, [processId]);

  // Auto-save on modification
  const handleSave = () => {
    try {
      localStorage.setItem(`fanavari-scratchpad-note-${processId}`, note);
      localStorage.setItem(`fanavari-scratchpad-fields-${processId}`, JSON.stringify(fields));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error('Error saving scratchpad:', e);
    }
  };

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    notify.success(`مقدار «${text}» کپی شد.`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddField = () => {
    const newField: ScratchpadField = {
      id: `f-${Date.now()}`,
      label: 'فیلد جدید',
      value: '',
    };
    setFields((prev) => [...prev, newField]);
  };

  const handleUpdateField = (id: string, key: 'label' | 'value', val: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: val } : f))
    );
  };

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <>
      {/* Floating Launcher Button (Always visible on bottom-left) */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          type="button"
          onClick={onToggle}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl transition-all cursor-pointer font-bold text-xs ${
            isOpen
              ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/30 scale-105'
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105'
          }`}
          title="جعبه‌ابزار داده‌های موقت و یادداشت در حین انجام فرایند"
        >
          <StickyNote className="w-4 h-4 text-amber-500" />
          <span>جعبه‌ابزار موقت (Scratchpad)</span>
          {fields.some((f) => f.value.trim().length > 0) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Slide-out / Floating Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-20 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-3xl border shadow-2xl backdrop-blur-2xl overflow-hidden animate-in zoom-in-95"
          style={{
            background: 'var(--bg-glass-strong)',
            borderColor: 'var(--border-glass)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Header */}
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{ 
              borderColor: 'var(--border-subtle)',
              background: 'var(--bg-glass-card)' 
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                <StickyNote className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black">جعبه‌ابزار و مقادیر موقت</h4>
                <span className="text-[10px] text-slate-400 block">
                  داده‌ها در مرورگر شما ذخیره می‌مانند
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSave}
                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="ذخیره دستی"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{isSaved ? 'ذخیره شد' : 'ذخیره'}</span>
              </button>

              <button
                type="button"
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Quick-Copy Fields */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <span>فیلدهای پرکاربرد (کپی با یک کلیک):</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ فیلد جدید</span>
                </button>
              </div>

              <div className="space-y-2">
                {fields.map((field) => {
                  const isCopied = copiedKey === field.id;

                  return (
                    <div
                      key={field.id}
                      className="p-2.5 rounded-xl border flex items-center gap-2"
                      style={{
                        background: 'var(--bg-surface)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateField(field.id, 'label', e.target.value)}
                        placeholder="عنوان فیلد..."
                        className="w-1/3 text-[11px] font-bold bg-transparent outline-none border-b border-transparent focus:border-blue-500"
                        style={{ color: 'var(--text-secondary)' }}
                      />

                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleUpdateField(field.id, 'value', e.target.value)}
                        placeholder="مقدار یا کد..."
                        className="flex-1 text-xs font-mono font-bold bg-transparent outline-none"
                        style={{ color: 'var(--accent-primary)' }}
                        dir="ltr"
                      />

                      {field.value && (
                        <button
                          type="button"
                          onClick={() => handleCopy(field.value, field.id)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-600 transition-colors cursor-pointer"
                          title="کپی در کلیپ‌بورد"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="حذف فیلد"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Freeform Notes Area */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">
                یادداشت آزاد در جریان اجرای فرایند:
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="شماره پیگیری‌های موقت، پاسخ سامانه، خطاها یا هماهنگی‌های لازم را اینجا یادداشت کنید..."
                className="w-full p-2.5 rounded-xl border text-xs font-medium outline-none leading-relaxed"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
