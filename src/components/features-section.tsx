'use client';

import React from 'react';
import { 
  GitFork, 
  Search, 
  ShieldAlert, 
  Layers, 
  Cpu, 
  Workflow,
  Sparkles
} from 'lucide-react';

const FEATURES = [
  {
    icon: Search,
    title: 'جستجوی مویرگی و هوشمند (Google-Style)',
    description: 'کافیست هر چیزی که به ذهن می‌رسد را تایپ کنید: از کد خطا (مثل ۴۰۳ یا ۵۰۰) گرفته تا شماره شبا، نام سامانه یا بخشی از یک فیلد، سیستم دقیق‌ترین فرایند و مرحله را پیدا می‌کند.',
    badge: 'بدون نیاز به فیلتر دستی',
    color: 'blue',
  },
  {
    icon: GitFork,
    title: 'فلوچارت زنده با انشعاب‌های شرطی',
    description: 'دیگر نیازی به اسناد متنی طولانی و سردرگم‌کننده نیست. هر فرایند یک دیاگرام بصری شفاف با نودهای اقدام، تصمیم، هشدار و راهنمای خطایابی است.',
    badge: 'تعاملی و بصری',
    color: 'indigo',
  },
  {
    icon: ShieldAlert,
    title: 'ماتریس اختصاصی حل خطا و استثناها',
    description: 'برای هر مرحله، خطاهای محتمل با تصویر، علت دقیق و راه‌حل گام‌به‌گام مستند شده تا کاربر در بن‌بست‌های کاری گیر نکند.',
    badge: 'کاهش تیکت‌های پشتیبانی',
    color: 'rose',
  },
  {
    icon: Layers,
    title: 'جعبه‌ابزار و یادداشت موقت (Scratchpad)',
    description: 'امکان ذخیره اطلاعات موقت حین اجرای کار (کد ملی، شماره پرونده، رمزهای موقت) با قابلیت کپی مستقیم فیلدها با یک کلیک.',
    badge: 'ذخیره خودکار داده‌ها',
    color: 'amber',
  },
  {
    icon: Workflow,
    title: 'هدایت گام‌به‌گام همگام با سامانه اصلی',
    description: 'مسیر دقیق کلیک در منوهای سامانه‌ها (HRMS، مودیان مالیاتی، سپیدار، کنسول کلود) شفاف مشخص شده تا کارمند در اولین مراجعه مسلط شود.',
    badge: 'سرعت بخشیدن به Onboarding',
    color: 'emerald',
  },
  {
    icon: Cpu,
    title: 'معماری مدرن و بهینه برای Vercel و Neon',
    description: 'پیاده‌سازی شده با Next.js و Prisma 7 سازگار با سرورلس نئون برای لود آنی، انعطاف‌پذیری فوق‌العاده و مقیاس‌پذیری بدون توقف.',
    badge: 'سرعت رندر میلی‌ثانیه‌ای',
    color: 'cyan',
  },
];

export function FeaturesSection() {
  return (
    <section id="features-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
          style={{
            background: 'var(--accent-soft)',
            color: 'var(--accent-primary)',
            border: '1px solid var(--accent-border)'
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>چرا سامانه فناوری؟</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          پایان دوران مستندات خشک و سردرگمی در فرایندهای سازمانی
        </h2>
        <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          تمام ابزارهایی که یک کارمند، سرپرست یا متخصص برای اجرای بی‌نقص و بدون خطای وظایف خود نیاز دارد، در یک تجربه کاربری شیشه‌ای و چشم‌نواز جمع شده است.
        </p>
      </div>

      {/* Grid of Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature, idx) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={idx}
              className="glass-card rounded-3xl p-6 flex flex-col justify-between transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: 'var(--accent-soft)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>

                <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
