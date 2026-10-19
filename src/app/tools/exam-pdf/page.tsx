'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Upload,
  Printer,
  Sparkles,
  Shuffle,
  Trash2,
  Edit3,
  Settings2,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Columns,
  RotateCcw,
  KeyRound,
  GraduationCap,
  ListFilter,
  FileText,
  HelpCircle,
  Hash,
  ArrowRight,
  School,
  Calendar,
  Clock,
  Layers,
} from 'lucide-react';
import {
  parseRawTable,
  autoDetectColumnRoles,
  buildExamQuestions,
  toPersianDigits,
  SAMPLE_EXAM_CSV,
  ExamColumn,
  ColumnRole,
  SelectionMode,
  ExamHeaderConfig,
  ExamLayoutConfig,
} from '@/lib/exam-parser';

export default function ExamPdfToolPage() {
  // State for raw data & columns
  const [fileName, setFileName] = useState<string>('داده‌های نمونه (احکام و نماز - ۶۰ سوال)');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<ExamColumn[]>([]);

  // Selection & filtering options
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('all');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [filterColumnId, setFilterColumnId] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [shuffleSeed, setShuffleSeed] = useState<number>(42);

  // Exam Header Configuration
  const [headerConfig, setHeaderConfig] = useState<ExamHeaderConfig>({
    schoolName: 'دبیرستان نمونه دولتی فرهنگ',
    examTitle: 'آزمون تستی احکام و معارف اسلامی',
    subject: 'پیام‌های آسمان و دین و زندگی',
    gradeAndMajor: 'پایه دهم / مقطع متوسطه دوم',
    examSession: 'نوبت اول (دی‌ماه)',
    examDate: '۱۴۰۵/۱۰/۱۵',
    durationMinutes: '۴۵',
    studentFields: {
      showName: true,
      showClass: true,
      showSeatNumber: true,
      showScoreBox: true,
    },
    customNotice: 'پاسخ صحیح را با پررنگ کردن کامل دایره در پاسخ‌نامه یا علامت‌زدن مشخص فرمایید. آزمون نمره منفی ندارد.',
  });

  // Layout & Print Configuration
  const [layoutConfig, setLayoutConfig] = useState<ExamLayoutConfig>({
    columns: 2,
    fontSize: 'base',
    spacing: 'normal',
    showAnswerKey: true,
    showOptionLetters: true,
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview');
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [rawTextInput, setRawTextInput] = useState<string>('');
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with sample data on mount
  useEffect(() => {
    loadSampleData();
  }, []);

  function loadSampleData() {
    const { headers, rows } = parseRawTable(SAMPLE_EXAM_CSV);
    const initialCols = autoDetectColumnRoles(headers);
    setRawHeaders(headers);
    setRawRows(rows);
    setColumns(initialCols);
    setFileName('نمونه سوالات احکام و نماز (فایل ارسالی)');
    setSelectionMode('first_n');
    setQuestionCount(20);
    setFilterColumnId('');
    setFilterValue('');
  }

  // Handle uploaded file (Excel or CSV)
  async function handleFile(file: File) {
    try {
      const isCsv = file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.name.endsWith('.txt');
      let headers: string[];
      let rows: Record<string, any>[];

      if (isCsv) {
        const text = await file.text();
        const parsed = parseRawTable(text);
        headers = parsed.headers;
        rows = parsed.rows;
      } else {
        const buffer = await file.arrayBuffer();
        const parsed = parseRawTable(buffer);
        headers = parsed.headers;
        rows = parsed.rows;
      }

      if (headers.length === 0 || rows.length === 0) {
        alert('هیچ سطری در فایل انتخابی یافت نشد یا ساختار آن خالی است.');
        return;
      }

      const detectedCols = autoDetectColumnRoles(headers);
      setRawHeaders(headers);
      setRawRows(rows);
      setColumns(detectedCols);
      setFileName(file.name);
      setSelectionMode('all');
      setFilterColumnId('');
      setFilterValue('');
    } catch (err: any) {
      console.error('File parsing error:', err);
      alert('خطا در خواندن فایل اکسل: لطفاً مطمئن شوید فایل سالم و استاندارد است.');
    }
  }

  function handlePasteTextSubmit() {
    if (!rawTextInput.trim()) return;
    const parsed = parseRawTable(rawTextInput);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
      alert('متن وارد شده دارای ساختار معتبر جدول یا CSV نیست.');
      return;
    }
    const detectedCols = autoDetectColumnRoles(parsed.headers);
    setRawHeaders(parsed.headers);
    setRawRows(parsed.rows);
    setColumns(detectedCols);
    setFileName('داده‌های متنی چسبانده شده');
    setShowPasteModal(false);
    setRawTextInput('');
  }

  // Column management handlers
  function handleRenameColumn(id: string, newTitle: string) {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, displayName: newTitle } : col))
    );
  }

  function handleChangeRole(id: string, newRole: ColumnRole) {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, role: newRole } : col))
    );
  }

  function handleDeleteColumn(id: string) {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, enabled: false, role: 'ignore' } : col))
    );
  }

  function handleRestoreColumn(id: string) {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, enabled: true, role: 'metadata' } : col))
    );
  }

  // Unique values for the selected filter column
  const filterColumnValues = useMemo(() => {
    if (!filterColumnId) return [];
    const targetCol = columns.find((c) => c.id === filterColumnId);
    if (!targetCol) return [];
    const unique = new Set<string>();
    rawRows.forEach((r) => {
      const val = String(r[targetCol.originalName] || '').trim();
      if (val) unique.add(val);
    });
    return Array.from(unique);
  }, [filterColumnId, columns, rawRows]);

  // Build the transformed question list & answer key
  const { questions, answerKey, totalAvailable } = useMemo(() => {
    if (rawRows.length === 0 || columns.length === 0) {
      return { questions: [], answerKey: [], totalAvailable: 0 };
    }
    return buildExamQuestions(rawRows, columns, {
      selectionMode,
      questionCount,
      filterColumnId: filterColumnId || undefined,
      filterValue: filterValue || undefined,
      shuffleOptions,
      seed: shuffleSeed,
    });
  }, [rawRows, columns, selectionMode, questionCount, filterColumnId, filterValue, shuffleOptions, shuffleSeed]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen pb-16 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Banner / Actions Bar (Hidden on print) */}
      <div className="no-print border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-16 z-30 transition-colors border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="بازگشت به خانه"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  آزمون‌ساز هوشمند: اکسل به PDF
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  فایل فعال: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fileName}</span> ({toPersianDigits(questions.length)} سوال منتخب از {toPersianDigits(totalAvailable)})
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>پیش‌نمایش آزمون</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>تنظیمات و ستون‌ها</span>
              </button>
            </div>

            {/* Teacher Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsTeacherMode((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isTeacherMode
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
              title="نمایش کلید پاسخ‌های صحیح در برگه"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">کلید پاسخ‌ها</span>
            </button>

            {/* Print / Export PDF Primary Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ / ذخیره PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Settings Tab (Hidden when in pure preview mode) */}
        {activeTab === 'settings' && (
          <div className="no-print space-y-6 animate-in fade-in duration-150">
            {/* Top Cards: Data Ingestion & Sample */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: File Upload */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  dragOver
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv, .tsv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  بارگذاری فایل اکسل یا CSV
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  فایل‌های .xlsx, .xls, .csv را بکشید یا برای انتخاب کلیک کنید
                </p>
              </div>

              {/* Card 2: Sample Data & Paste */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>آزمایش سریع با داده‌های نمونه</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    مجموعه سوالات احکام و نماز (۶۰ سوال، گزینه‌های ۴ گانه و ستون نوبت امتحانی).
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={loadSampleData}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer text-center"
                  >
                    بارگذاری مجدد نمونه
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasteModal(true)}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    ورود دستی متن
                  </button>
                </div>
              </div>

              {/* Card 3: Quick Stats */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm mb-1">
                    <FileCheck className="w-4 h-4" />
                    <span>وضعیت بانک سوالات</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="block text-xs text-slate-400 font-medium">کل سوالات فایل</span>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                        {toPersianDigits(rawRows.length)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                      <span className="block text-xs text-emerald-600 dark:text-emerald-400 font-medium">انتخاب شده در آزمون</span>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                        {toPersianDigits(questions.length)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-400 text-center">
                  ستون‌های فعال: {toPersianDigits(columns.filter((c) => c.enabled).length)} از {toPersianDigits(columns.length)}
                </div>
              </div>
            </div>

            {/* Section 1: Question Count & Selection Controls (User Requirement!) */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Hash className="w-4 h-4 text-emerald-500" />
                  <span>تعیین تعداد سوالات استخراجی و فیلترها</span>
                </div>
                <span className="text-xs text-slate-400">
                  شما می‌توانید تعداد سوال یا آزمون‌های تصادفی تعیین کنید
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Selection Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    نحوه انتخاب سوالات:
                  </label>
                  <select
                    value={selectionMode}
                    onChange={(e) => setSelectionMode(e.target.value as SelectionMode)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                  >
                    <option value="all">همه سوالات موجود در فایل ({toPersianDigits(totalAvailable)} سوال)</option>
                    <option value="first_n">تعداد مشخص از ابتدای فایل</option>
                    <option value="random_n">انتخاب تصادفی / رندوم (نمونه‌برداری)</option>
                  </select>
                </div>

                {/* Question Count Input */}
                {selectionMode !== 'all' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      تعداد سوالات مورد نظر:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={Math.max(totalAvailable, 1)}
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24 px-3 py-2 rounded-xl text-xs font-bold text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                      />
                      <div className="flex gap-1">
                        {[5, 10, 15, 20, 30].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setQuestionCount(num)}
                            className={`px-2 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              questionCount === num
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {toPersianDigits(num)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Filter by column (e.g. نوبت امتحان) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    فیلتر بر اساس ستون خاص (اختیاری):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filterColumnId}
                      onChange={(e) => {
                        setFilterColumnId(e.target.value);
                        setFilterValue('');
                      }}
                      className="px-2.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                    >
                      <option value="">بدون فیلتر</option>
                      {columns
                        .filter((c) => c.enabled)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.displayName}
                          </option>
                        ))}
                    </select>

                    {filterColumnId ? (
                      filterColumnValues.length > 0 ? (
                        <select
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          className="px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                        >
                          <option value="">انتخاب مقدار...</option>
                          {filterColumnValues.map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="مقدار مورد نظر..."
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          className="px-2.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                        />
                      )
                    ) : (
                      <div className="text-xs text-slate-400 flex items-center px-2">تمام ردیف‌ها</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Option Shuffling Toggle */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleOptions}
                      onChange={(e) => setShuffleOptions(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      بر زدن تصادفی ترتیب گزینه‌ها (Shuffle)
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      جلوگیری از قرار گرفتن همیشگی پاسخ صحیح در گزینه (الف) + محاسبه خودکار کلید آزمون
                    </span>
                  </div>
                </div>

                {shuffleOptions && (
                  <button
                    type="button"
                    onClick={() => setShuffleSeed(Math.floor(Math.random() * 100000))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>تولید چیدمان رندوم جدید</span>
                  </button>
                )}
              </div>
            </div>

            {/* Section 2: Column Management (User Requirement: تغییر عنوان و حذف ستون) */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Edit3 className="w-4 h-4 text-emerald-500" />
                  <span>مدیریت ستون‌ها: تغییر عنوان، تعیین نقش، یا حذف کامل ستون</span>
                </div>
                <span className="text-xs text-slate-400">
                  ستون‌های غیرضروری را حذف کنید یا نام آن‌ها را سفارشی نمایید
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                      <th className="py-2.5 px-3">نام اصلی در فایل</th>
                      <th className="py-2.5 px-3">عنوان ستون (قابل ویرایش)</th>
                      <th className="py-2.5 px-3">نقش ستون در آزمون</th>
                      <th className="py-2.5 px-3 text-center">عملیات / وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {columns.map((col) => (
                      <tr
                        key={col.id}
                        className={`transition-colors ${
                          col.enabled ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'opacity-40 bg-slate-100/50 dark:bg-slate-800/30'
                        }`}
                      >
                        {/* Original Name */}
                        <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                          {col.originalName}
                        </td>

                        {/* Editable Display Title */}
                        <td className="py-3 px-3">
                          {col.enabled ? (
                            <input
                              type="text"
                              value={col.displayName}
                              onChange={(e) => handleRenameColumn(col.id, e.target.value)}
                              className="w-full max-w-xs px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                            />
                          ) : (
                            <span className="line-through text-slate-400">{col.displayName}</span>
                          )}
                        </td>

                        {/* Column Role Selector */}
                        <td className="py-3 px-3">
                          {col.enabled ? (
                            <select
                              value={col.role}
                              onChange={(e) => handleChangeRole(col.id, e.target.value as ColumnRole)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                            >
                              <option value="question">متن سوال (Question)</option>
                              <option value="correct_answer">پاسخ صحیح / گزینه الف (Correct Answer)</option>
                              <option value="option_a">گزینه الف (Option A)</option>
                              <option value="option_b">گزینه ب (Option B)</option>
                              <option value="option_c">گزینه ج (Option C)</option>
                              <option value="option_d">گزینه د (Option D)</option>
                              <option value="metadata">متادیتا / اطلاعات تکمیلی</option>
                              <option value="ignore">نادیده‌گرفتن</option>
                            </select>
                          ) : (
                            <span className="text-rose-500 font-medium">حذف شده از آزمون</span>
                          )}
                        </td>

                        {/* Action: Delete / Restore */}
                        <td className="py-3 px-3 text-center">
                          {col.enabled ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteColumn(col.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="حذف کامل این ستون"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRestoreColumn(col.id)}
                              className="flex items-center gap-1 mx-auto px-2 py-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-bold cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>بازیابی</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Exam Header & Paper Customization */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <School className="w-4 h-4 text-emerald-500" />
                  <span>مشخصات سربرگ آزمون (مدرسه، درس، نوبت و تاریخ)</span>
                </div>
                <span className="text-xs text-slate-400">
                  این اطلاعات در کادر بالای برگه امتحانی چاپ خواهند شد
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام مدرسه یا سازمان:
                  </label>
                  <input
                    type="text"
                    value={headerConfig.schoolName}
                    onChange={(e) => setHeaderConfig({ ...headerConfig, schoolName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان آزمون:
                  </label>
                  <input
                    type="text"
                    value={headerConfig.examTitle}
                    onChange={(e) => setHeaderConfig({ ...headerConfig, examTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام درس و مقطع:
                  </label>
                  <input
                    type="text"
                    value={headerConfig.subject}
                    onChange={(e) => setHeaderConfig({ ...headerConfig, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    پایه و رشته تحصیلی:
                  </label>
                  <input
                    type="text"
                    value={headerConfig.gradeAndMajor}
                    onChange={(e) => setHeaderConfig({ ...headerConfig, gradeAndMajor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نوبت امتحانی:
                  </label>
                  <input
                    type="text"
                    value={headerConfig.examSession}
                    onChange={(e) => setHeaderConfig({ ...headerConfig, examSession: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      تاریخ آزمون:
                    </label>
                    <input
                      type="text"
                      value={headerConfig.examDate}
                      onChange={(e) => setHeaderConfig({ ...headerConfig, examDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500 text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      مدت (دقیقه):
                    </label>
                    <input
                      type="text"
                      value={headerConfig.durationMinutes}
                      onChange={(e) => setHeaderConfig({ ...headerConfig, durationMinutes: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Notice Box */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                  راهنما یا تذکرات امتحانی (در صورت نیاز):
                </label>
                <textarea
                  rows={2}
                  value={headerConfig.customNotice}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, customNotice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-emerald-500 text-xs"
                />
              </div>

              {/* Student info fields toggles */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={headerConfig.studentFields.showName}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        studentFields: { ...headerConfig.studentFields, showName: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>نام و نام خانوادگی دانش‌آموز</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={headerConfig.studentFields.showClass}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        studentFields: { ...headerConfig.studentFields, showClass: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>نام کلاس / شعبه</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={headerConfig.studentFields.showSeatNumber}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        studentFields: { ...headerConfig.studentFields, showSeatNumber: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>شماره صندلی / داوطلب</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={headerConfig.studentFields.showScoreBox}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        studentFields: { ...headerConfig.studentFields, showScoreBox: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>کادر نمره و امضای مصحح</span>
                </label>
              </div>
            </div>

            {/* Section 4: Layout & Print Preferences */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Columns className="w-4 h-4 text-emerald-500" />
                  <span>تنظیمات صفحه‌بندی و ظاهر چاپ (A4)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
                {/* Columns */}
                <div>
                  <label className="block mb-1.5 text-slate-700 dark:text-slate-300">چیدمان سوالات:</label>
                  <select
                    value={layoutConfig.columns}
                    onChange={(e) =>
                      setLayoutConfig({ ...layoutConfig, columns: parseInt(e.target.value, 10) as 1 | 2 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value={1}>تک ستونه (استاندارد باز)</option>
                    <option value={2}>دو ستونه (بهینه‌سازی مصرف کاغذ)</option>
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block mb-1.5 text-slate-700 dark:text-slate-300">اندازه قلم متن:</label>
                  <select
                    value={layoutConfig.fontSize}
                    onChange={(e) =>
                      setLayoutConfig({ ...layoutConfig, fontSize: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="sm">کوچک (10pt)</option>
                    <option value="base">استاندارد (11pt)</option>
                    <option value="lg">بزرگ (12pt)</option>
                  </select>
                </div>

                {/* Spacing */}
                <div>
                  <label className="block mb-1.5 text-slate-700 dark:text-slate-300">فاصله‌گذاری سوالات:</label>
                  <select
                    value={layoutConfig.spacing}
                    onChange={(e) =>
                      setLayoutConfig({ ...layoutConfig, spacing: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="compact">فشرده (حداقل فضا)</option>
                    <option value="normal">متوسط / استاندارد</option>
                    <option value="spacious">باز و خوانا</option>
                  </select>
                </div>

                {/* Answer Key Sheet Toggle */}
                <div>
                  <label className="block mb-1.5 text-slate-700 dark:text-slate-300">برگه کلید پاسخنامه:</label>
                  <select
                    value={layoutConfig.showAnswerKey ? 'yes' : 'no'}
                    onChange={(e) =>
                      setLayoutConfig({ ...layoutConfig, showAnswerKey: e.target.value === 'yes' })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="yes">پیوست کلید در انتهای آزمون</option>
                    <option value="no">بدون پیوست کلید</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
              >
                مشاهده پیش‌نمایش برگه و چاپ
              </button>
            </div>
          </div>
        )}

        {/* Live A4 Print Paper Preview */}
        {(activeTab === 'preview' || activeTab === 'settings') && (
          <div className={activeTab === 'settings' ? 'mt-8' : ''}>
            {/* Action Bar Above Preview (Hidden on print) */}
            <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>پیش‌نمایش زنده صفحه استاندارد A4</span>
                <span className="text-slate-400 font-normal">|</span>
                <span className="text-slate-500 font-normal">
                  {layoutConfig.columns === 2 ? 'صفحه‌بندی دو ستونه' : 'صفحه‌بندی تک ستونه'}
                </span>
                {isTeacherMode && (
                  <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded text-[11px]">
                    حالت کلید مصحح (پاسخ‌های صحیح با رنگ سبز مشخص شده‌اند)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLayoutConfig((prev) => ({ ...prev, columns: prev.columns === 1 ? 2 : 1 }))}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {layoutConfig.columns === 1 ? 'تغییر به دو ستونه' : 'تغییر به تک ستونه'}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>چاپ برگه A4</span>
                </button>
              </div>
            </div>

            {/* A4 Sheet Container */}
            <div className="print-exam-container flex justify-center">
              <div
                id="printable-exam-paper"
                className={`w-full max-w-[210mm] bg-white text-black border border-slate-300 dark:border-slate-700 shadow-xl rounded-none sm:rounded-sm p-[12mm] text-right font-sans transition-all ${
                  layoutConfig.fontSize === 'sm' ? 'text-[13px] leading-relaxed' : layoutConfig.fontSize === 'lg' ? 'text-[15px] leading-relaxed' : 'text-[14px] leading-relaxed'
                }`}
                style={{
                  fontFamily: 'var(--font-vazirmatn), Tahoma, sans-serif',
                  color: '#000000',
                  backgroundColor: '#ffffff',
                }}
              >
                {/* 1. Official Exam Header Box */}
                <div className="border-2 border-black rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-3 items-center gap-2 text-xs border-b border-black/40 pb-2 mb-2">
                    {/* Right column: School info */}
                    <div className="space-y-1">
                      <div className="font-bold">{headerConfig.schoolName || 'وزارت آموزش و پرورش'}</div>
                      <div>درس: <span className="font-semibold">{headerConfig.subject}</span></div>
                      <div>رشته / پایه: <span className="font-semibold">{headerConfig.gradeAndMajor}</span></div>
                    </div>

                    {/* Center column: Exam Title & Term */}
                    <div className="text-center space-y-1">
                      <div className="text-[11px] font-bold text-slate-600">باسمه تعالی</div>
                      <div className="text-sm font-black">{headerConfig.examTitle}</div>
                      <div className="text-xs font-bold">{headerConfig.examSession}</div>
                    </div>

                    {/* Left column: Date & Duration */}
                    <div className="text-left space-y-1">
                      <div>تاریخ: <span className="font-semibold">{toPersianDigits(headerConfig.examDate)}</span></div>
                      <div>مدت پاسخگویی: <span className="font-semibold">{toPersianDigits(headerConfig.durationMinutes)} دقیقه</span></div>
                      <div>تعداد سوالات: <span className="font-semibold">{toPersianDigits(questions.length)} سوال</span></div>
                    </div>
                  </div>

                  {/* Student Fields Row */}
                  <div className="flex flex-wrap items-center justify-between text-xs pt-1 gap-y-2">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                      {headerConfig.studentFields.showName && (
                        <div>
                          نام و نام خانوادگی: <span className="inline-block border-b border-dotted border-black w-36"></span>
                        </div>
                      )}
                      {headerConfig.studentFields.showClass && (
                        <div>
                          کلاس / شعبه: <span className="inline-block border-b border-dotted border-black w-20"></span>
                        </div>
                      )}
                      {headerConfig.studentFields.showSeatNumber && (
                        <div>
                          شماره داوطلب: <span className="inline-block border-b border-dotted border-black w-20"></span>
                        </div>
                      )}
                    </div>

                    {headerConfig.studentFields.showScoreBox && (
                      <div className="border border-black px-3 py-1 rounded text-center text-[11px]">
                        نمره به عدد و حروف: ....................
                      </div>
                    )}
                  </div>
                </div>

                {/* Notice Box if present */}
                {headerConfig.customNotice && (
                  <div className="bg-slate-100 border border-black/30 rounded p-2 mb-4 text-xs font-medium text-slate-800">
                    <span className="font-bold text-black">تذکر مهم: </span>
                    {headerConfig.customNotice}
                  </div>
                )}

                {/* 2. Questions List */}
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    هیچ سوالی با تنظیمات فعلی انتخاب نشده است.
                  </div>
                ) : (
                  <div
                    className={
                      layoutConfig.columns === 2
                        ? 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'
                        : 'space-y-4'
                    }
                  >
                    {questions.map((q) => (
                      <div
                        key={q.id}
                        className={`print-avoid-break border-b border-slate-200 pb-3 ${
                          layoutConfig.spacing === 'compact' ? 'space-y-1.5' : layoutConfig.spacing === 'spacious' ? 'space-y-3' : 'space-y-2'
                        }`}
                      >
                        {/* Question Text */}
                        <div className="flex items-start gap-1.5">
                          <span className="font-black text-black shrink-0">
                            {toPersianDigits(q.questionNumber)}-
                          </span>
                          <span className="font-bold text-black leading-snug">
                            {q.text}
                          </span>
                        </div>

                        {/* Options List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 pr-4 pt-1">
                          {q.options.map((opt) => {
                            const isCorrectAndTeacher = isTeacherMode && opt.isCorrect;
                            return (
                              <div
                                key={opt.id}
                                className={`flex items-start gap-1.5 rounded px-1.5 py-0.5 transition-colors ${
                                  isCorrectAndTeacher
                                    ? 'bg-emerald-100 border border-emerald-400 font-bold text-emerald-950'
                                    : 'text-slate-900'
                                }`}
                              >
                                <span className="font-bold text-black shrink-0">
                                  {'\u200E'}({opt.label}){'\u200E'}
                                </span>
                                <span className="leading-snug">{opt.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* End of Exam Notice */}
                <div className="mt-8 pt-4 border-t-2 border-black/30 text-center text-xs font-bold text-slate-700 print-avoid-break">
                  « با آرزوی موفقیت و سربلندی برای شما دانش‌آموزان گرامی »
                </div>

                {/* 3. Answer Key Section (Optional) */}
                {layoutConfig.showAnswerKey && answerKey.length > 0 && (
                  <div className="mt-8 pt-6 border-t-2 border-dashed border-black/50 print-avoid-break">
                    <div className="flex items-center justify-between border-b border-black pb-2 mb-3">
                      <span className="text-sm font-black text-black">
                        کلید پاسخنامه سوالات چهارگزینه‌ای (مخصوص مصحح)
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        مجموع سوالات: {toPersianDigits(answerKey.length)}
                      </span>
                    </div>

                    {/* Answer Key Grid (5 columns per row) */}
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-xs text-center">
                      {answerKey.map((item) => (
                        <div
                          key={item.questionNumber}
                          className="border border-black/40 rounded p-1 bg-slate-50"
                        >
                          <div className="text-[11px] text-slate-500 font-bold border-b border-slate-200 pb-0.5">
                            سوال {toPersianDigits(item.questionNumber)}
                          </div>
                          <div className="text-sm font-black text-black pt-0.5">
                            {item.correctLabel}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              ورود مستقیم داده‌های متنی (CSV یا کپی از اکسل)
            </h3>
            <p className="text-xs text-slate-500">
              سطر اول باید شامل عنوان ستون‌ها (مانند: متن سوال، جواب درست، ب، ج، د) باشد.
            </p>
            <textarea
              rows={8}
              dir="rtl"
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              placeholder="متن سوال,جواب درست,ب,ج,د,نوبت امتحان&#10;سوال اول,پاسخ صحیح,گزینه ب,گزینه ج,گزینه د,1"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handlePasteTextSubmit}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                پردازش و ایجاد آزمون
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
