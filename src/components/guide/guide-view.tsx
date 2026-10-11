'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOnboardingTour } from '@/components/onboarding/onboarding-context';
import { 
  Compass, 
  Search, 
  Workflow, 
  AlertTriangle, 
  Printer, 
  Download, 
  Laptop, 
  BookOpen, 
  ChevronDown, 
  CheckCircle2, 
  Copy, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft,
  Command,
  HelpCircle,
  FileText,
  Clock,
  Layers
} from 'lucide-react';

interface GuideModule {
  id: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  summary: string;
  features: {
    title: string;
    desc: string;
  }[];
  proTip: string;
}

const MODULES: GuideModule[] = [
  {
    id: 'search',
    title: 'موتور جستجوی همه‌جانبه (Omni-Search)',
    badge: 'ماژول ۱',
    icon: Search,
    color: 'from-blue-600 to-cyan-500',
    summary: 'جستجوی بلادرنگ در کلیه عناوین، مراحل عملیاتی، کدهای خطای سامانه‌ها و فیلدهای اطلاعاتی با الگوریتم وزن‌دهی هوشمند.',
    features: [
      {
        title: 'جستجو با کدهای خطا',
        desc: 'کدهای خطای پرتکرار مانند ERR-403 یا TAX-9901 را مستقیماً جستجو کنید تا به گام و راه‌حل دقیق برسید.',
      },
      {
        title: 'جستجو با کلید میانبر /',
        desc: 'در هر صفحه با فشردن کلید / کادر جستجو فوراً فوکوس می‌شود بدون اینکه نیاز به کلیک ماوس باشد.',
      },
      {
        title: 'فیلتر بر اساس سامانه یا واحد',
        desc: 'با تایپ نام نرم‌افزار (مثلاً «سپیدار»، «سامانه مودیان») فرایندهای متصل به آن سامانه اولویت پیدا می‌کنند.',
      },
    ],
    proTip: 'حتی شماره شبای نمونه یا نام منوی داخلی نرم‌افزار هم در جستجوی همه‌جانبه قابل کشف است.',
  },
  {
    id: 'step-runner',
    title: 'رانر گام‌های اجرایی (Step Runner)',
    badge: 'ماژول ۲',
    icon: Workflow,
    color: 'from-indigo-600 to-purple-600',
    summary: 'محیط اجرای خطی و گام‌به‌گام فرایندها همراه با مسیر دقیق کلیک منوها، تصویر راهنما و کپی سریع متغیرها.',
    features: [
      {
        title: 'مسیر منوها به‌صورت تراشه',
        desc: 'مسیر دقیق رسیدن به پنجره مورد نظر در نرم‌افزار (مثلاً «کارگزینی > احکام > ثبت حکم») به وضوح نمایش داده می‌شود.',
      },
      {
        title: 'فیلدهای کپی‌شدنی با یک کلیک',
        desc: 'شناسه‌ها، مقادیر پیش‌فرض و متن‌های طولانی را با یک کلیک روی آیکون کپی، در کلیپ‌بورد ذخیره و جایگذاری کنید.',
      },
      {
        title: 'ثبت و ذخیره خودکار پیشرفت',
        desc: 'تیک زدن مراحل به صورت محلی ذخیره می‌شود؛ بنابراین با بستن مرورگر یا بازگشت مجدد، پیشرفت شما محفوظ است.',
      },
    ],
    proTip: 'در گوشی موبایل، نوار مراحل به صورت افقی و لمسی طراحی شده تا صفحه را اشغال نکند.',
  },
  {
    id: 'error-matrix',
    title: 'ماتریس خطایابی و عیب‌یابی (Error Guides)',
    badge: 'ماژول ۳',
    icon: AlertTriangle,
    color: 'from-rose-600 to-amber-500',
    summary: 'پایگاه دانش عیب‌یابی که ذیل هر گام، خطاهای محتمل، علت وقوع و راهکار قطعی رفع آن را تفکیک می‌کند.',
    features: [
      {
        title: 'کدگذاری استاندارد خطاها',
        desc: 'هر ارور دارای شناسه یکتا، عنوان روان و برچسب شدت (بحرانی، هشدار یا راهنما) است.',
      },
      {
        title: 'علت و راه‌حل گام‌به‌گام',
        desc: 'علت ریشه‌ای خطا توضیح داده شده و راه‌حل رفع آن به صورت نکات عملی و شماره‌گذاری شده ارائه می‌شود.',
      },
      {
        title: 'حل موقت و تماس با پشتیبانی',
        desc: 'در خطاهای مربوط به مسدودسازی حساب، دستورالعمل تماس با واحد فناوری مربوطه قید شده است.',
      },
    ],
    proTip: 'اگر در یک نرم‌افزار به ارور ناشناخته برخوردید، بخش کدهای خطای آن فرایند اولین مرجع شماست.',
  },
  {
    id: 'systems',
    title: 'دایرکتوری سامانه‌ها و بخشنامه‌ها',
    badge: 'ماژول ۴',
    icon: Laptop,
    color: 'from-purple-600 to-pink-500',
    summary: 'هاب اختصاصی برای معرفی پورتال‌های دولتی، نرم‌افزارهای سازمانی و تقویم وظایف دوره‌ای.',
    features: [
      {
        title: 'پرتال سامانه‌ها (/systems)',
        desc: 'صفحه مجزا برای هر سامانه همراه با لینک ورود مستقیم، مستندات رسمی و فهرست تمام فرایندهای مرتبط.',
      },
      {
        title: 'گاه‌شمار اجرایی سالانه (/timeline)',
        desc: 'تقویم وظایف و ضرب‌الاجل‌های قانونی ۱۲ ماه سال با قابلیت فیلتر فصلی و هشدارهای سررسید.',
      },
      {
        title: 'تابلو بخشنامه‌ها (/information)',
        desc: 'اطلاعیه‌ها و ابلاغیه‌های اداری جدید با نشان فوری و پیوست‌های دانلودی.',
      },
    ],
    proTip: 'پیش از شروع فرایندهای فصلی (مانند بستن حساب‌ها)، گاه‌شمار اجرایی را چک کنید.',
  },
  {
    id: 'scratchpad-print',
    title: 'یادداشت شخصی و نسخه چاپی A4',
    badge: 'ماژول ۵',
    icon: Printer,
    color: 'from-emerald-600 to-teal-500',
    summary: 'امکان یادداشت‌برداری اختصاصی برای هر فرایند و پرینت با قالب بهینه‌شده برای کاغذ A4 و PDF.',
    features: [
      {
        title: 'کشوی یادداشت اختصاصی (Scratchpad)',
        desc: 'برای هر فرایند می‌توانید یادداشت، شماره پیگیری یا شماره تماس‌های لازم را ثبت کنید که در دستگاه شما ذخیره می‌ماند.',
      },
      {
        title: 'خروجی چاپ استاندارد (/print)',
        desc: 'حذف نوارهای کناری و منوهای اضافه برای خروجی تمیز با کلید Ctrl+P جهت بایگانی یا استفاده مکتوب.',
      },
      {
        title: 'حفظ حریم خصوصی',
        desc: 'یادداشت‌های محرمانه شما روی سرور ذخیره نمی‌شود و فقط در مرورگر خودتان باقی می‌ماند.',
      },
    ],
    proTip: 'از کلید میانبر چاپ برای ساخت فایل PDF با وضوح بالا و مناسب اشتراک‌گذاری استفاده کنید.',
  },
  {
    id: 'pwa',
    title: 'وب‌اپلیکیشن پیش‌رونده (PWA) و آفلاین',
    badge: 'ماژول ۶',
    icon: Download,
    color: 'from-amber-500 to-orange-600',
    summary: 'امکان نصب سامانه مثل یک نرم‌افزار بومی روی اندروید، iOS، ویندوز و مک با قابلیت کار در شرایط قطعی اینترنت.',
    features: [
      {
        title: 'نصب یک‌کلیکی بدون اپ‌استور',
        desc: 'با کلیک روی گزینه «نصب اپلیکیشن» در نوار بالا یا منوی مرورگر، آیکون فرآیندنما به صفحه گوشی شما اضافه می‌شود.',
      },
      {
        title: 'دسترسی آفلاین پایدار',
        desc: 'فرایندها و صفحات مشاهده‌شده در حافظه کَش ذخیره می‌شوند و حتی بدون اینترنت باز خواهند شد.',
      },
      {
        title: 'سازگاری کامل با جهت راست‌به‌چپ (RTL)',
        desc: 'رابط کاربری با استانداردهای بومی فارسی روی تمامی ابعاد صفحه‌نمایش بهینه‌سازی شده است.',
      },
    ],
    proTip: 'در مرورگر سافاری آیفون، از دکمه Share و سپس «Add to Home Screen» استفاده کنید.',
  },
];

const FAQS = [
  {
    q: 'آیا برای استفاده از سامانه نیاز به ثبت‌نام یا لاگین است؟',
    a: 'خیر. تمامی فرایندهای عمومی، دایرکتوری سامانه‌ها، گاه‌شمار و راهنمای خطایابی برای همه کاربران و پرسنل بدون نیاز به ورود در دسترس است. بخش ورود صرفاً برای مدیران و تدوین‌کنندگان فرایندها جهت ویرایش و بارگذاری مستندات می‌باشد.',
  },
  {
    q: 'آیا اطلاعاتی که در چک‌لیست مراحل تیک می‌زنم پاک می‌شود؟',
    a: 'خیر. پیشرفت گام‌ها در حافظه مرورگر دستگاه شما (localStorage) ذخیره می‌شود و حتی پس از بستن تب یا ری‌استارت مرورگر، می‌توانید ادامه فرایند را طی کنید.',
  },
  {
    q: 'چگونه می‌توانم فرایند جدیدی را به سامانه اضافه کنم؟',
    a: 'اگر دسترسی کارشناسی یا مدیریت دارید، از دکمه «داشبورد» در منوی بالا وارد پنل شده و دکمه «تعریف فرایند جدید» را بزنید. در غیر این صورت، می‌توانید درخواست مستندسازی را به واحد فناوری و سیستم‌ها ارجاع دهید.',
  },
  {
    q: 'آیا امکان پرینت و دریافت فایل PDF از فرایندها وجود دارد؟',
    a: 'بله. در صفحه هر فرایند دکمه «نسخه چاپی» تعبیه شده است. همچنین با فشردن کلید Ctrl + P در صفحه اختصاصی چاپ، یک خروجی بدون حاشیه و استاندارد مخصوص کاغذ A4 دریافت می‌کنید.',
  },
  {
    q: 'کدهای خطا چگونه به‌روزرسانی می‌شوند؟',
    a: 'با تغییر نگارش نرم‌افزارها یا بروز هشدارهای جدید در سامانه‌های ملی، مدیران سامانه بلافاصله علل جدید و راهکارها را در پایگاه داده ثبت می‌کنند و برای همه کاربران منعکس می‌شود.',
  },
];

const SHORTCUTS = [
  { key: '/', action: 'فوکوس فوری روی کادر جستجوی سراسری' },
  { key: 'Esc', action: 'بستن پنجره‌ها، مودال‌ها و تور تعاملی' },
  { key: 'Ctrl + P', action: 'باز کردن پنجره چاپ استاندارد A4' },
  { key: 'کلیدهای جهت‌نما ← / →', action: 'حرکت بین گام‌های تور تعاملی در صفحه' },
];

export function GuideView() {
  const { startTour } = useOnboardingTour();
  const [activeModuleId, setActiveModuleId] = useState<string>('search');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activeModule = MODULES.find((m) => m.id === activeModuleId) || MODULES[0];
  const ActiveIcon = activeModule.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 border shadow-xs"
          style={{
            background: 'var(--bg-glass-strong)',
            borderColor: 'var(--border-glass)',
            color: 'var(--text-secondary)',
          }}
        >
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>مرکز آموزش و مستندات کاربری سامانه فرآیندنما</span>
        </div>

        <h1 
          className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.25] mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          آموزش جامع کار با{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            سامانه فرآیندنما
          </span>
        </h1>

        <p 
          className="text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          راهنمای کاربردی برای تسلط سریع بر جستجوی هوشمند، اجرای خطی مراحل، رفع ارورهای سیستمی و بهره‌گیری از امکانات آفلاین.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={startTour}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white shadow-xl shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            }}
          >
            <Compass className="w-5 h-5 animate-spin-slow" />
            <span>شروع تور تعاملی در صفحه اصلی</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold border transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
            style={{
              borderColor: 'var(--border-glass)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <Workflow className="w-4 h-4 text-blue-500" />
            <span>مشاهده کاتالوگ فرایندها</span>
          </Link>
        </div>
      </div>

      {/* 3-Step Quickstart Grid */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
            شروع سریع در چند ثانیه
          </span>
          <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
            ۳ گام تا تسلط کامل بر فرآیندنما
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border relative overflow-hidden group hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 font-black text-lg">
              ۱
            </div>
            <h3 className="text-lg font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              جستجو یا انتخاب حوزه
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              عنوان فرایند، کد خطای نرم‌افزاری یا نام سامانه را در کادر جستجوی سراسری وارد کرده یا از دسته‌بندی‌های صفحه اصلی انتخاب کنید.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8 border relative overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 font-black text-lg">
              ۲
            </div>
            <h3 className="text-lg font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              اجرای گام‌به‌گام دستورالعمل
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              مسیر کلیک منوها را دنبال کنید، مقادیر لازم را با یک کلیک کپی کرده و مراحل انجام‌شده را در چک‌لیست تیک بزنید.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8 border relative overflow-hidden group hover:border-rose-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5 font-black text-lg">
              ۳
            </div>
            <h3 className="text-lg font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              عیب‌یابی سریع و رفع ارور
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              در صورت بروز هرگونه مشکل، بخش راهنمای خطایابی متصل به همان گام را باز کنید تا علت دقیق و راه‌حل گره‌گشا را بیابید.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Feature Deep Dive Section */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
            کاوش در قابلیت‌ها
          </span>
          <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
            راهنمای تفصیلی بخش‌های اصلی سامانه
          </h2>
        </div>

        {/* Module Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {MODULES.map((m) => {
            const Icon = m.icon;
            const isSelected = activeModuleId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveModuleId(m.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-lg shadow-blue-500/20 scale-102'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #2563eb, #4f46e5)' : 'var(--bg-surface)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{m.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Module Detail Card */}
        <div 
          className="glass-card rounded-3xl p-6 sm:p-10 border shadow-xl relative overflow-hidden"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-start sm:items-center gap-4">
              <div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-tr ${activeModule.color} shrink-0`}
              >
                <ActiveIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {activeModule.badge}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {activeModule.title}
                </h3>
              </div>
            </div>

            <p className="text-sm font-medium leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
              {activeModule.summary}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {activeModule.features.map((feat, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl border transition-all"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-2 mb-2 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat.title}</span>
                </div>
                <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Pro Tip Box */}
          <div 
            className="p-4 sm:p-5 rounded-2xl border flex items-center gap-3.5 shadow-xs"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), var(--bg-surface))',
              borderColor: 'rgba(59, 130, 246, 0.25)',
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-blue-600 block mb-0.5">
                نکته تجربی و میانبر:
              </span>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {activeModule.proTip}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Section */}
      <div className="mb-20">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
            سرعت عمل بالا
          </span>
          <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
            کلیدهای میانبر سامانه
          </h2>
        </div>

        <div className="max-w-3xl mx-auto glass-card rounded-3xl p-6 sm:p-8 border shadow-sm"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {SHORTCUTS.map((sc, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {sc.action}
                </span>
                <kbd 
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-black border shadow-xs tracking-wider"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-glass)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
            پاسخ به سوالات
          </span>
          <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
            پرسش‌های متداول کاربران
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="glass-card rounded-2xl border transition-all overflow-hidden"
                style={{ borderColor: 'var(--border-glass)' }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-right flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <span className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {faq.q}
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 text-slate-400 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div 
                    className="px-4 pb-5 sm:px-5 pt-1 text-xs sm:text-sm leading-relaxed font-medium border-t animate-in fade-in"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-secondary)' 
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div 
        className="rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6, #6366f1)',
        }}
      >
        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">
            آماده‌اید کار با فرایندها را شروع کنید؟
          </h2>
          <p className="text-sm sm:text-base text-blue-100 mb-8 font-medium leading-relaxed">
            تور تعاملی را در صفحه اصلی فعال کنید یا از میان دهکده فرایندهای سازمانی، دستورالعمل مورد نظر خود را بیابید.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={startTour}
              className="px-6 py-3 rounded-2xl text-sm font-black bg-white text-blue-900 hover:bg-blue-50 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              شروع تور تعاملی در صفحه اصلی
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/20"
            >
              رفتن به کاتالوگ فرایندها
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
