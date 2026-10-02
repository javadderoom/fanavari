import { Process, SystemTool, OrganizationEntity } from '@/types/process';

export const SYSTEM_TOOLS: SystemTool[] = [
  {
    slug: 'figma',
    name: 'فیگما (Figma)',
    category: 'software',
    icon: 'Figma',
    description: 'ابزار طراحی رابط کاربری و پروتوتایپینگ ابری؛ فرایندهای خروجی SVG، استخراج کد و توکن‌های طراحی.',
    websiteUrl: 'https://figma.com',
    processCount: 2,
  },
  {
    slug: 'git',
    name: 'گیت و گیت‌لب (Git & GitLab)',
    category: 'devtools',
    icon: 'GitBranch',
    description: 'مدیریت نسخه‌بندی سورس‌کد، ساخت پول ریکوئست، کانفیگ کلید SSH و حل تعارضات مرج (Merge Conflicts).',
    websiteUrl: 'https://git-scm.com',
    processCount: 2,
  },
  {
    slug: 'excel',
    name: 'مایکروسافت اکسل (Microsoft Excel)',
    category: 'software',
    icon: 'Table',
    description: 'کاربردهای پیشرفته مالی، مغایرت‌گیری بانکی با XLOOKUP، ساخت جداول محوری (Pivot Table) و ماکروها.',
    websiteUrl: 'https://office.com/excel',
    processCount: 1,
  },
  {
    slug: 'docker',
    name: 'داکر (Docker & Containers)',
    category: 'devtools',
    icon: 'Container',
    description: 'ساخت ایمیج‌های بهینه کانتینری، تنظیم نگاشت پورت‌ها، اتصال به شبکه‌های داخلی و دیپلوی چندلایه‌ای.',
    websiteUrl: 'https://docker.com',
    processCount: 1,
  },
  {
    slug: 'sepidar',
    name: 'نرم‌افزار حسابداری سپیدار',
    category: 'erp',
    icon: 'Calculator',
    description: 'سیستم یکپارچه مالی و بازرگانی؛ صدور فاکتورهای رسمی، انبارداری و ثبت اظهارنامه ارزش افزوده.',
    websiteUrl: 'https://sepidarsystem.com',
    processCount: 1,
  },
  {
    slug: 'hrms',
    name: 'سامانه جامع منابع انسانی (HRMS)',
    category: 'portal',
    icon: 'Users',
    description: 'پرتال جامع ثبت احکام، کارگزینی، ثبت قراردادهای آزمایشی و مدیریت پرونده پرسنلی سازمان.',
    websiteUrl: 'https://hrms.fanavari.org',
    processCount: 2,
  },
  {
    slug: 'moadian',
    name: 'کارپوشه سامانه مودیان مالیاتی',
    category: 'portal',
    icon: 'Landmark',
    description: 'درگاه رسمی سازمان امور مالیاتی کشور جهت ارسال صورتحساب‌های الکترونیکی و اظهارنامه فصلی.',
    websiteUrl: 'https://my.tax.gov.ir',
    processCount: 2,
  },
  {
    slug: 'tamin',
    name: 'خدمات غیرحضوری تأمین اجتماعی',
    category: 'portal',
    icon: 'Shield',
    description: 'درگاه استعلام سوابق بیمه، ارسال لیست حق بیمه ماهانه و ثبت پرونده‌های استعلاجی پزشکی.',
    websiteUrl: 'https://eservices.tamin.ir',
    processCount: 1,
  },
  {
    slug: 'gica',
    name: 'مرکز صدور گواهی الکترونیکی (GICA)',
    category: 'portal',
    icon: 'Key',
    description: 'سامانه رسمی صدور نماد الکترونیک، توکن‌های سخت‌افزاری امضای دیجیتال و احراز هویت ویدئویی.',
    websiteUrl: 'https://gica.ir',
    processCount: 1,
  }
];

export const ORGANIZATIONS: OrganizationEntity[] = [
  {
    slug: 'org-tax',
    name: 'سازمان امور مالیاتی کشور',
    category: 'gov',
    description: 'مرجع رسمی صدور صورتحساب الکترونیکی، دریافت مالیات بر ارزش افزوده و نظارت بر کارپوشه مودیان.',
    processCount: 2,
  },
  {
    slug: 'org-tamin',
    name: 'سازمان تأمین اجتماعی',
    category: 'gov',
    description: 'پوشش‌های بیمه کارگری و کارمندی، استعلام کدهای کارگاهی و رسیدگی به غرامت ایام استعلاجی.',
    processCount: 2,
  },
  {
    slug: 'org-fanavari-hr',
    name: 'مدیریت سرمایه انسانی و اداری',
    category: 'enterprise',
    description: 'بخش داخلی پذیرش، احکام شغلی، ثبت قراردادهای پرسنلی، بیمه تکمیلی و آموزش نیروهای جدید.',
    processCount: 2,
  },
  {
    slug: 'org-fanavari-it',
    name: 'مرکز فناوری اطلاعات و زیرساخت (IT / DevOps)',
    category: 'tech',
    description: 'مدیریت کلاسترهای سرور، اعطای دسترسی‌های امنیتی، ایمیل سازمانی و پشتیبانی سخت‌افزاری.',
    processCount: 3,
  },
  {
    slug: 'org-fanavari-finance',
    name: 'مدیریت مالی و حسابداری',
    category: 'enterprise',
    description: 'تسویه تنخواه‌ها، حسابداری اسناد، حواله‌های پایا و ساتنا و ممیزی دفاتر قانونی شرکت.',
    processCount: 2,
  },
  {
    slug: 'org-customer-ops',
    name: 'امور مشتریان و خدمات پس از فروش',
    category: 'enterprise',
    description: 'رسیدگی به تیکت‌های مرجوعی، بازرسی کیفی انبار و استرداد وجه به کیف پول مشتریان.',
    processCount: 1,
  },
];

export const MOCK_PROCESSES: Process[] = [
  // 1. HR Administrative Workflow
  {
    id: 'proc-hr-01',
    slug: 'hr-new-employee-registration',
    title: 'ثبت و پذیرش پرسنل جدید در سامانه منابع انسانی (HRMS)',
    description: 'فرایند کامل ثبت نام، ایجاد پرونده الکترونیک، ثبت قرارداد آزمایشی و دریافت کدهای پرسنلی و بیمه در سامانه یکپارچه پرسنلی سازمان.',
    scope: 'organization',
    category: 'hr',
    departmentName: 'مدیریت منابع انسانی',
    estimatedMinutes: 20,
    targetSystem: 'سامانه جامع منابع انسانی (HRMS)',
    targetSystemSlug: 'hrms',
    targetUrl: 'https://hrms.fanavari.org/admin/onboarding',
    isPopular: true,
    totalSteps: 4,
    tags: ['استخدام', 'ثبت پرسنل', 'قرارداد', 'کد ملی', 'تأمین اجتماعی', 'کارگزینی', 'حقوق و دستمزد'],
    updatedAt: '۱۴۰۳/۰۷/۱۰',
    steps: [
      {
        id: 'step-hr-01',
        orderIndex: 1,
        stepKey: 'login-and-navigation',
        title: 'ورود به سامانه و دسترسی به منوی کارگزینی',
        stepType: 'action',
        targetMenuPath: 'داشبورد > مدیریت سرمایه انسانی > کارگزینی و احکام > پرونده جدید',
        contentMarkdown: 'با حساب کاربری کارشناس HR وارد پرتال شوید. از نوار ناوبری راست، گزینه «کارگزینی و احکام» و سپس «تعریف پرسنل جدید» را کلیک نمایید.',
        copyableFields: [
          { label: 'نام کاربری تست کارگزینی', value: 'hr_expert_ops' },
          { label: 'آدرس مستقیم صفحه ثبت', value: 'https://hrms.fanavari.org/admin/employees/new' }
        ],
        tips: [
          'حتماً با مرورگر کروم یا فایرفاکس به‌روزرسانی شده وارد شوید.',
          'در صورتی که صفحه بارگذاری نشد، کش مرورگر را با Ctrl+F5 پاک کنید.'
        ],
        errorGuides: [
          {
            id: 'err-hr-01',
            errorCode: 'ERR-403',
            errorTitle: 'خطای عدم دسترسی (۴۰۳ Forbidden)',
            cause: 'مجوز نقش کارگزینی برای این کاربر فعال نشده یا توکن سشن منقضی شده است.',
            solution: 'یک‌بار خروج کامل زده و مجدداً وارد شوید؛ در صورت تکرار با داخلی ۲۰۴ (ادمین سامانه) تماس بگیرید.',
            escalationContact: 'ادمین زیرساخت داخلی ۲۰۴'
          }
        ]
      },
      {
        id: 'step-hr-02',
        orderIndex: 2,
        stepKey: 'identity-and-insurance-fields',
        title: 'تکمیل فرم اطلاعات هویتی و سوابق بیمه',
        stepType: 'action',
        targetMenuPath: 'فرم ثبت پرسنل > تب اطلاعات پایه',
        contentMarkdown: 'کد ملی، شماره شناسنامه، تاریخ تولد مطابق کارت ملی، و شماره بیمه ۱۰ رقمی تأمین اجتماعی را در کادرهای مربوطه وارد کنید. دکمه «استعلام برخط ثبت احوال» را کلیک کنید.',
        copyableFields: [
          { label: 'فرمت پیش‌فرض کد پرسنلی', value: 'EMP-1403-XXXX' },
          { label: 'کد کارگاه تأمین اجتماعی سازمان', value: '9981240012' }
        ],
        tips: [
          'کد ملی بدون خط تیره وارد شود.',
          'در صورت داشتن سابقه قبلی، شماره بیمه قدیمی ملاک عمل است.'
        ],
        errorGuides: [
          {
            id: 'err-hr-02',
            errorCode: 'ERR-ID-MISMATCH',
            errorTitle: 'عدم تطابق کد ملی با اطلاعات ثبت احوال',
            cause: 'اشتباه در درج تاریخ تولد شمسی یا وارد کردن صفر اول کد ملی به شکل ناقص.',
            solution: 'دقت کنید صفر اول کد ملی حذف نشده باشد و ارقام با صفحه اول شناسنامه جدید مطابقت داده شود.',
            escalationContact: 'کارشناس پذیرش پرسنلی'
          },
          {
            id: 'err-hr-03',
            errorCode: 'ERR-SSO-TIMEOUT',
            errorTitle: 'خطای قطعی سرویس استعلام ثبت احوال',
            cause: 'درگاه برخط ثبت احوال موقتاً قطع است.',
            solution: 'گزینه «تأیید دستی با تعهد اسکن مدارک» را فعال کنید تا ثبت اولیه معطل نماند.',
          }
        ]
      },
      {
        id: 'step-hr-03',
        orderIndex: 3,
        stepKey: 'contract-and-role-decision',
        title: 'تعیین نوع همکاری و شرایط قرارداد (انشعاب)',
        stepType: 'decision',
        targetMenuPath: 'فرم ثبت پرسنل > تب قرارداد و رده شغلی',
        contentMarkdown: 'نوع همکاری پرسنل را بین «قرارداد تمام‌وقت رسمی»، «پاره‌وقت/ساعتی» یا «پروژه‌ای/مشاوره‌ای» تعیین کنید. انتخاب این گزینه ساختار کسورات و بیمه را تغییر می‌دهد.',
        tips: [
          'برای نیروهای تمام‌وقت، آپلود گواهی طب کار و سوءپیشینه الزامی است.',
          'نیروهای پروژه‌ای مشمول کسر مالیات مقطوع ۱۰ درصدی ماده ۸۶ می‌شوند.'
        ],
        errorGuides: [
          {
            id: 'err-hr-04',
            errorCode: 'ERR-FILE-SIZE',
            errorTitle: 'خطای حداکثر حجم فایل ضمائم (بیش از ۵ مگابایت)',
            cause: 'اسکن قرارداد یا مدارک با رزولوشن نامناسب اسکن شده و حجم بالایی دارد.',
            solution: 'فایل را با کیفیت 150dpi مجدداً ذخیره کرده یا از فشرده‌ساز آنلاین استفاده نمایید.',
          }
        ]
      },
      {
        id: 'step-hr-04',
        orderIndex: 4,
        stepKey: 'system-access-and-completion',
        title: 'ثبت نهایی و تخصیص ایمیل سازمانی و سیستم‌ها',
        stepType: 'end',
        targetMenuPath: 'فرم ثبت پرسنل > اقدام نهایی > ایجاد حساب‌های یکپارچه',
        contentMarkdown: 'با زدن دکمه «تأیید و صدور حکم»، به‌طور خودکار ایمیل سازمانی صادر شده و درخواست تجهیزات به واحد فناوری اطلاعات ارسال می‌گردد.',
        copyableFields: [
          { label: 'الگوی ساخت ایمیل', value: 'firstname.lastname@fanavari.ir' },
          { label: 'رمز عبور موقت اولیه', value: 'Fanavari@1403!' }
        ],
        tips: [
          'کارمند باید در اولین لاگین رمز عبور خود را تغییر داده و تایید دو مرحله‌ای را فعال کند.'
        ]
      }
    ]
  },

  // 2. SOFTWARE WORKFLOW: Figma SVG Export & Optimization
  {
    id: 'proc-sw-figma-01',
    slug: 'figma-svg-export-optimization',
    title: 'فرایند استخراج و بهینه‌سازی آیکون‌های وکتوری (SVG) در نرم‌افزار فیگما',
    description: 'دستورالعمل استاندارد آماده‌سازی آیکون‌ها، Flatten کردن خطوط، تبدیل Stroke به Outline و خروجی SVG فوق فشرده برای وب و فرانت‌اند.',
    scope: 'software',
    category: 'design',
    departmentName: 'تیم طراحی محصول (Product Design)',
    estimatedMinutes: 8,
    targetSystem: 'نرم‌افزار فیگما (Figma Desktop / Web)',
    targetSystemSlug: 'figma',
    targetUrl: 'https://figma.com',
    isPopular: true,
    totalSteps: 3,
    tags: ['فیگما', 'Figma', 'طراحی', 'SVG', 'آیکون', 'Outline Stroke', 'وکتور', 'فرانت‌اند'],
    updatedAt: '۱۴۰۳/۰۷/۱۱',
    steps: [
      {
        id: 'step-fig-01',
        orderIndex: 1,
        stepKey: 'vector-cleanup',
        title: 'یکپارچه‌سازی وکتور و تبدیل Stroke به Fill (Outline Stroke)',
        stepType: 'action',
        targetMenuPath: 'فریم فیگما > لایه‌های آیکون > کلید میانبر Ctrl+Shift+O',
        contentMarkdown: 'همه لایه‌های آیکون را داخل یک فریم با ابعاد استاندارد ۲۴x۲۴ پیکسل قرار دهید. تمام خطوط دارای Stroke را با زدن میانبر `Ctrl+Shift+O` به شکل Outline تبدیل کنید تا در تغییر اندازه ضخامت خط تغییر نکند.',
        copyableFields: [
          { label: 'میانبر تبدیل Stroke به Outline در ویندوز', value: 'Ctrl + Shift + O' },
          { label: 'ابعاد استاندارد فریم آیکون', value: '24 x 24 px' }
        ],
        tips: [
          'از ترکیب رنگ‌های مختلف در یک آیکون مونوکروم خودداری کرده و مقدار Fill را روی currentColor تنظیم کنید.'
        ],
        errorGuides: [
          {
            id: 'err-fig-01',
            errorCode: 'FIG-STROKE-SCALING',
            errorTitle: 'خطای به هم ریختن ضخامت آیکون در سایزهای مختلف',
            cause: 'لایه‌ها قبل از خروجی به شکل Outline تبدیل نشده‌اند و با Scale تغییر ضخامت می‌دهند.',
            solution: 'کلید ترکیبی Ctrl+E (Flatten) را روی لایه‌ها بزنید تا به یک لایه یکپارچه تبدیل شوند.',
          }
        ]
      },
      {
        id: 'step-fig-02',
        orderIndex: 2,
        stepKey: 'export-settings-check',
        title: 'تنظیمات بخش Export و غیرفعال‌سازی آیدی‌های اضافه',
        stepType: 'decision',
        targetMenuPath: 'پنل سمت راست > تب Export > فرمت SVG > دکمه سه نقطه (...) تنظیمات',
        contentMarkdown: 'آیا آیکون برای وب‌سایت استفاده می‌شود یا اپ موبایل؟ در بخش تنظیمات SVG، تیک گزینه `Include "id" attribute` را بردارید تا تداخل آیدی در کد HTML رخ ندهد.',
        tips: [
          'تیک Outline Text را در صورت وجود متن حتماً فعال کنید.'
        ]
      },
      {
        id: 'step-fig-03',
        orderIndex: 3,
        stepKey: 'svgo-compression',
        title: 'فشرده‌سازی با SVGO و کپی کد JSX',
        stepType: 'end',
        targetMenuPath: 'پلاگین فیگما > SVGO Compressor یا کلیک‌راست > Copy as SVG',
        contentMarkdown: 'با پلاگین SVGO حجم فایل را تا ۶۰ درصد بدون افت کیفیت کاهش دهید و مستقیماً در ریپازیتوری کامپوننت‌های فرانت‌اند قرار دهید.',
        copyableFields: [
          { label: 'دستور ترمینال فشرده‌سازی خودکار SVG', value: 'npx svgo -f ./public/icons -o ./public/icons-optimized' }
        ]
      }
    ]
  },

  // 3. SOFTWARE WORKFLOW: Git Merge Conflict Resolution
  {
    id: 'proc-sw-git-02',
    slug: 'git-merge-conflict-resolution',
    title: 'فرایند حل تعارضات ادغام (Merge Conflicts) با ابزار گیت و VSCode',
    description: 'راهنمای مرحله‌به‌مرحله همگام‌سازی برنچ با main، شناسایی کدهای متناقض با Git Rebase، حل تعارضات در ادیتور و پوش ایمن به مخزن.',
    scope: 'software',
    category: 'it',
    departmentName: 'تیم مهندسی نرم‌افزار',
    estimatedMinutes: 10,
    targetSystem: 'ترمینال گیت و ویژوال استودیو کد (VSCode)',
    targetSystemSlug: 'git',
    targetUrl: 'https://git-scm.com',
    isPopular: true,
    totalSteps: 3,
    tags: ['گیت', 'Git', 'Merge Conflict', 'Rebase', 'VSCode', 'ترمینال', 'برنامه‌نویسی'],
    updatedAt: '۱۴۰۳/۰۷/۱۰',
    steps: [
      {
        id: 'step-git-01',
        orderIndex: 1,
        stepKey: 'fetch-and-rebase',
        title: 'دریافت آخرین تغییرات برنچ مرجع و شروع Rebase',
        stepType: 'action',
        targetMenuPath: 'ترمینال پروژه > برنچ فیچر',
        contentMarkdown: 'قبل از حل تعارض، برنچ محلی خود را با سرور همگام کنید: `git fetch origin` و سپس دستور `git rebase origin/main` را اجرا فرمایید.',
        copyableFields: [
          { label: 'دستور شروع ریبیس روی شاخه اصلی', value: 'git fetch origin && git rebase origin/main' }
        ],
        errorGuides: [
          {
            id: 'err-git-01',
            errorCode: 'GIT-DIRTY-WORKTREE',
            errorTitle: 'خطای وجود تغییرات ذخیره‌نشده (Dirty Working Tree)',
            cause: 'فایل‌هایی در دایرکتوری جاری بدون کامیت تغییر یافته‌اند و گیت اجازه جابجایی نمی‌دهد.',
            solution: 'ابتدا دستور `git stash` را برای نگهداری موقت اجرا کرده و بعد ریبیس را آغاز کنید.',
          }
        ]
      },
      {
        id: 'step-git-02',
        orderIndex: 2,
        stepKey: 'resolve-in-editor',
        title: 'بررسی نشانگرهای تعارض (<<<<<<< HEAD) و انتخاب کد صحیح',
        stepType: 'decision',
        targetMenuPath: 'ادیتور کد > فایل‌های علامت‌گذاری شده با پسوند !C',
        contentMarkdown: 'در VSCode یکی از گزینه‌های `Accept Current Change` یا `Accept Incoming Change` یا ترکیب دستی هر دو را انتخاب کنید. پس از رفع، فایل را سیو کنید.',
        tips: [
          'هرگز نشانگرهای گیت (مثل ======= و >>>>>>>) را در کد باقی نگذارید.'
        ]
      },
      {
        id: 'step-git-03',
        orderIndex: 3,
        stepKey: 'continue-and-force-push',
        title: 'افزودن به استیج و ادامه Rebase و پوش با اجاره امن',
        stepType: 'end',
        targetMenuPath: 'ترمینال > دستورات نهایی',
        contentMarkdown: 'دستور `git add .` و سپس `git rebase --continue` را بزنید. در پایان با `git push --force-with-lease` تغییرات را به مخزن ارسال کنید.',
        copyableFields: [
          { label: 'دستور پوش ایمن به گیت‌هاب/گیت‌لب', value: 'git push --force-with-lease origin HEAD' }
        ]
      }
    ]
  },

  // 4. SOFTWARE WORKFLOW: Microsoft Excel Bank Reconciliation
  {
    id: 'proc-sw-excel-03',
    slug: 'excel-bank-reconciliation-xlookup',
    title: 'مغایرت‌گیری صورتحساب‌های بانکی و اسناد مالی با تابع XLOOKUP در اکسل',
    description: 'فرایند استاندارد تطبیق تراکنش‌های پرینت بانکی با دفاتر حسابداری، حذف فاصله‌های اضافی و شناسایی اسناد مفقود با توابع پیشرفته اکسل.',
    scope: 'software',
    category: 'finance',
    departmentName: 'امور مالی و حسابداری',
    estimatedMinutes: 14,
    targetSystem: 'نرم‌افزار مایکروسافت اکسل (Excel 2021+ / Office 365)',
    targetSystemSlug: 'excel',
    targetUrl: 'https://office.com',
    isPopular: true,
    totalSteps: 3,
    tags: ['اکسل', 'Excel', 'مغایرت‌گیری', 'XLOOKUP', 'فرمول‌نویسی', 'حسابداری بانکی', 'شبا'],
    updatedAt: '۱۴۰۳/۰۷/۰۸',
    steps: [
      {
        id: 'step-xl-01',
        orderIndex: 1,
        stepKey: 'clean-data',
        title: 'یکپارچه‌سازی و حذف فاصله‌های مخفی با تابع TRIM و CLEAN',
        stepType: 'action',
        targetMenuPath: 'شیت اکسل > ستون شناسه تراکنش یا شماره پیگیری',
        contentMarkdown: 'شناسه‌های خروجی اینترنت‌بانک اغلب حاوی کاراکترهای نامرئی هستند. با ستون کمکی فرمول `=TRIM(CLEAN(A2))` را اعمال کنید تا متن کاملاً تمیز شود.',
        copyableFields: [
          { label: 'فرمول تمیزکاری داده در اکسل', value: '=TRIM(CLEAN(SUBSTITUTE(A2, UNICHAR(160), " ")))' }
        ]
      },
      {
        id: 'step-xl-02',
        orderIndex: 2,
        stepKey: 'xlookup-matching',
        title: 'تطبیق ارقام با تابع XLOOKUP و مدیریت موارد یافت‌نشده (#N/A)',
        stepType: 'decision',
        targetMenuPath: 'شیت دفاتر > فرمول‌نویسی ستون وضعیت تطابق',
        contentMarkdown: 'آیا ستون شناسه پیگیری در هر دو فایل موجود است؟ از فرمول `=XLOOKUP(A2, BankSheet!A:A, BankSheet!B:B, "عدم تطابق")` برای واکشی مبالغ استفاده فرمایید.',
        copyableFields: [
          { label: 'فرمول XLOOKUP پیشرفته', value: '=XLOOKUP(A2, BankSheet!$A$2:$A$5000, BankSheet!$C$2:$C$5000, "سند یافت نشد", 0)' }
        ],
        errorGuides: [
          {
            id: 'err-xl-01',
            errorCode: 'EXCEL-#N/A',
            errorTitle: 'خطای نمایش ارور #N/A به جای مغایرت',
            cause: 'یکی از سلول‌ها به صورت Text و دیگری به صورت Number فرمت‌بندی شده است.',
            solution: 'ستون مربوطه را با میانبر Alt+A+E (Text to Columns) روی فرمت یکسان تنظیم کنید.',
          }
        ]
      },
      {
        id: 'step-xl-03',
        orderIndex: 3,
        stepKey: 'pivot-summary',
        title: 'ساخت جدول محوری (Pivot Table) و صدور برگه مغایرت نهایی',
        stepType: 'end',
        targetMenuPath: 'منوی Insert > PivotTable > گروه‌بندی بر اساس نوع واریز/برداشت',
        contentMarkdown: 'خلاصه اقلام باز بانکی و چک‌های در راه را در یک پیوت‌تیبل گزارش کرده و به امضای کارشناس حسابداری برسانید.',
      }
    ]
  },

  // 5. Finance Tax / Gov Portal Workflow
  {
    id: 'proc-fin-02',
    slug: 'finance-petty-cash-and-tax-invoice',
    title: 'ثبت، بررسی و تسویه تنخواه و صورتحساب‌های مالیاتی در سامانه مودیان',
    description: 'دستورالعمل بارگذاری فاکتورهای رسمی با شناسه یکتای صورتحساب مالیاتی، دریافت تأییدیه مدیر مالی و صدور سند حسابداری تسویه.',
    scope: 'portal',
    category: 'finance',
    departmentName: 'امور مالی و حسابداری',
    estimatedMinutes: 15,
    targetSystem: 'کارپوشه سامانه مودیان و نرم‌افزار سپیدار',
    targetSystemSlug: 'moadian',
    targetUrl: 'https://tax.fanavari.org/invoices/new',
    isPopular: true,
    totalSteps: 3,
    tags: ['فاکتور رسمی', 'سامانه مودیان', 'تنخواه گردان', 'شماره شبا', 'ارزش افزوده', 'صورتحساب', 'مالیات'],
    updatedAt: '۱۴۰۳/۰۷/۰۸',
    steps: [
      {
        id: 'step-fin-01',
        orderIndex: 1,
        stepKey: 'invoice-precheck',
        title: 'بررسی اصالت صورتحساب و شناسه ۲۲ رقمی مالیاتی',
        stepType: 'action',
        targetMenuPath: 'حسابداری > تنخواه > ورود فاکتور جدید',
        contentMarkdown: 'شناسه ۲۲ رقمی صورتحساب الکترونیکی ثبت شده در کارپوشه سامانه مودیان را وارد کنید. سیستم مبلغ، شناسه ملی فروشنده و مالیات بر ارزش افزوده را به صورت خودکار واکشی می‌کند.',
        copyableFields: [
          { label: 'فرمت استاندارد شناسه صورتحساب', value: 'A1B2C3D4E5F6G7H8I9J0K1' },
          { label: 'شناسه ملی سازمان فناوران', value: '14008976543' }
        ],
        errorGuides: [
          {
            id: 'err-fin-01',
            errorCode: 'TAX-INVALID-ID',
            errorTitle: 'خطای عدم یافت شناسه صورتحساب در سامانه امور مالیاتی',
            cause: 'فروشنده هنوز فاکتور را در کارپوشه مودیان تایید نهایی نکرده یا شناسه اشتباه تایپ شده است.',
            solution: 'از فروشنده بخواهید کد پیگیری سامانه مودیان را بررسی کند؛ حداکثر مهلت ثبت ۳۰ روز است.',
            escalationContact: 'حسابداری مالیاتی، داخلی ۱۰۸'
          }
        ]
      },
      {
        id: 'step-fin-02',
        orderIndex: 2,
        stepKey: 'bank-and-iban-validation',
        title: 'ثبت اطلاعات بانکی و شماره شبا جهت واریز',
        stepType: 'action',
        targetMenuPath: 'تنخواه > پرداخت > تعیین مشخصات ذینفع',
        contentMarkdown: 'شماره شبا ۲۴ رقمی بدون درج IR را وارد کنید. تطابق نام صاحب حساب با نام صادرکننده فاکتور یا تنخواه‌دار بررسی می‌شود.',
        copyableFields: [
          { label: 'پیشوند شماره شبا', value: 'IR' },
          { label: 'کد بانک مرکزی تسویه', value: '017-FANAVARI' }
        ],
        errorGuides: [
          {
            id: 'err-fin-02',
            errorCode: 'ERR-IBAN-CHECKSUM',
            errorTitle: 'خطای شماره شبا نامعتبر است (Checksum Error)',
            cause: 'دو رقم کنترل ابتدای شماره شبا با محاسبات الگوریتم مود ۹۷ همخوانی ندارد.',
            solution: 'شماره شبا را از سایت رسمی بانک مبدأ استعلام کرده و مجدداً کپی نمایید.',
          }
        ]
      },
      {
        id: 'step-fin-03',
        orderIndex: 3,
        stepKey: 'manager-approval-and-payout',
        title: 'تأیید مدیر واحد و صدور حواله پایا/ساتنا',
        stepType: 'end',
        targetMenuPath: 'کارپوشه تأییدات > اسناد در انتظار > تأیید نهایی',
        contentMarkdown: 'پس از تایید کارشناس و تایید مدیر ارشد، سند تنخواه بسته شده و حواله تسویه در صف پایا شبانه قرار می‌گیرد.',
        tips: [
          'مبالغ بالای ۵۰ میلیون تومان نیازمند دو امضای دیجیتال است.'
        ]
      }
    ]
  },

  // 6. IT Infrastructure Workflow
  {
    id: 'proc-it-03',
    slug: 'it-devops-cloud-and-git-access',
    title: 'تعریف دسترسی و حساب کاربری در کلاستر کوبرنتیز و ریپازیتوری‌های گیت',
    description: 'فرایند امن تعریف دسترسی برای برنامه‌نویسان و مهندسان دواپس شامل دریافت کلید عمومی SSH، ایجاد کاربر IAM و تنظیم کانفیگ Kubeconfig.',
    scope: 'organization',
    category: 'it',
    departmentName: 'فناوری اطلاعات و زیرساخت',
    estimatedMinutes: 25,
    targetSystem: 'کنسول مدیریت ابری و گیت‌لب سازمانی',
    targetSystemSlug: 'git',
    targetUrl: 'https://git.fanavari.org/admin/users',
    isPopular: true,
    totalSteps: 4,
    tags: ['دواپس', 'کوبرنتیز', 'کلید SSH', 'دسترسی سرور', 'گیت‌هاب', 'VPN سازمانی', 'لینوکس'],
    updatedAt: '۱۴۰۳/۰۷/۰۵',
    steps: [
      {
        id: 'step-it-01',
        orderIndex: 1,
        stepKey: 'ssh-key-submission',
        title: 'دریافت و اعتبارسنجی کلید عمومی SSH کاربر',
        stepType: 'action',
        targetMenuPath: 'پرتال دسترسی زیرساخت > فرم درخواست دسترسی سرور',
        contentMarkdown: 'کاربر باید کلید عمومی از نوع `ed25519` را در تیکت ضمیمه کند. از ارسال کلید خصوصی (Private Key) اکیداً خودداری شود.',
        copyableFields: [
          { label: 'دستور ساخت کلید استاندارد در ترمینال', value: 'ssh-keygen -t ed25519 -C "developer@fanavari.ir"' }
        ],
        tips: [
          'کلیدهای RSA با طول کمتر از ۳۰۷۲ بیت رد صلاحیت امنیتی می‌شوند.'
        ],
        errorGuides: [
          {
            id: 'err-it-01',
            errorCode: 'SSH-KEY-MALFORMED',
            errorTitle: 'فرمت کلید عمومی نامعتبر است',
            cause: 'کلید به درستی کپی نشده، کاراکترهای اینتر اضافی دارد یا فایل خصوصی آپلود شده است.',
            solution: 'متن کلید باید دقیقاً با `ssh-ed25519` شروع شود و روی یک خط کپی گردد.',
            escalationContact: 'تیم امنیت سایبری سازمان'
          }
        ]
      },
      {
        id: 'step-it-02',
        orderIndex: 2,
        stepKey: 'ldap-and-vpn-account',
        title: 'ایجاد کاربر در اکتیودایرکتوری و اتصال VPN لایه ۳',
        stepType: 'action',
        targetMenuPath: 'سرور LDAP > دایرکتوری مهندسی > افزودن یوزر جدید',
        contentMarkdown: 'نام کاربری را مطابق با نام لاتین بسازید و عضویت در گروه `engineering-core` را تایید نمایید.',
        copyableFields: [
          { label: 'پروتکل VPN مجاز', value: 'WireGuard / OpenVPN TLS 1.3' },
          { label: 'دامنه LDAP احراز هویت', value: 'auth.internal.fanavari.org' }
        ]
      },
      {
        id: 'step-it-03',
        orderIndex: 3,
        stepKey: 'cluster-role-binding',
        title: 'تنظیم RoleBinding و دسترسی نیم‌اسپیس‌ها در کوبرنتیز',
        stepType: 'decision',
        targetMenuPath: 'کلاستر K8s > ماژول RBAC > ایجاد RoleBinding',
        contentMarkdown: 'بسته به پروژه، دسترسی کاربر را مشخص کنید: آیا فقط دسترسی `View` به لاگ‌ها نیاز است یا دسترسی `Deploy` به محیط Staging؟',
        tips: [
          'دسترسی به محیط Production تنها از طریق خط لوله CI/CD مجاز است.'
        ]
      },
      {
        id: 'step-it-04',
        orderIndex: 4,
        stepKey: '2fa-enforcement',
        title: 'الزام احراز هویت دو مرحله‌ای (2FA) و تست دسترسی',
        stepType: 'end',
        targetMenuPath: 'تنظیمات امنیتی > TOTP Authenticator',
        contentMarkdown: 'کیوآرکد اپلیکیشن Google Authenticator اسکن شود و کلیدهای بازیابی در گاوصندوق امن ذخیره گردند.',
        errorGuides: [
          {
            id: 'err-it-02',
            errorCode: 'ERR-2FA-DESYNC',
            errorTitle: 'خطای کد احراز هویت دو مرحله‌ای نادرست است (Time Desync)',
            cause: 'ساعت تلفن همراه کاربر با سرور دقیق تنظیم نیست و اختلاف چند ثانیه‌ای دارد.',
            solution: 'در تنظیمات گوشی گزینه Automatic Date & Time را فعال نموده و ساعت را با اینترنت همگام کنید.',
          }
        ]
      }
    ]
  },

  // 7. Legal Digital Token Workflow
  {
    id: 'proc-leg-04',
    slug: 'legal-digital-token-and-seal',
    title: 'صدور، تمدید و فعال‌سازی توکن دیجیتال و مهر سازمانی در مرکز ریشه GICA',
    description: 'مراحل احراز هویت در مرکز صدور گواهی الکترونیکی، دریافت توکن سخت‌افزاری PKI و نصب درایورهای امضای دیجیتال.',
    scope: 'portal',
    category: 'legal',
    departmentName: 'امور حقوقی و امنیت اسناد',
    estimatedMinutes: 30,
    targetSystem: 'مرکز ریشه صدور گواهی الکترونیکی کشور (GICA)',
    targetSystemSlug: 'gica',
    targetUrl: 'https://gica.ir/portal',
    isPopular: false,
    totalSteps: 3,
    tags: ['توکن دیجیتال', 'امضای دیجیتال', 'مهر سازمانی', 'مرکز ریشه', 'پایانه صدور', 'درایور PKI'],
    updatedAt: '۱۴۰۳/۰۶/۲۸',
    steps: [
      {
        id: 'step-leg-01',
        orderIndex: 1,
        stepKey: 'gica-request',
        title: 'ثبت مشخصات شرکت و نماینده در پرتال صدور گواهی',
        stepType: 'action',
        targetMenuPath: 'پرتال مرکز صدور > گواهی اشخاص حقوقی > درخواست توکن سطح ۳',
        contentMarkdown: 'روزنامه رسمی، آگهی آخرین تغییرات و معرفی‌نامه امضاداران مجاز را آپلود کنید.',
        copyableFields: [
          { label: 'شناسه حقوقی شرکت', value: '10103456789' },
          { label: 'کد پستی مرکز اصلی شرکت', value: '1987654321' }
        ],
        errorGuides: [
          {
            id: 'err-leg-01',
            errorCode: 'TOKEN-NOT-FOUND',
            errorTitle: 'سخت‌افزار توکن شناسایی نشد (PKCS#11 Error)',
            cause: 'درایور شرکت سازنده توکن (مانند پارس‌کلید یا ePass3003) روی ویندوز نصب نیست.',
            solution: 'درایور اختصاصی را از صفحه پشتیبانی دانلود و با حالت Run as Administrator نصب کنید.',
            escalationContact: 'واحد پشتیبانی سخت‌افزار، داخلی ۲۱۵'
          }
        ]
      },
      {
        id: 'step-leg-02',
        orderIndex: 2,
        stepKey: 'video-verification',
        title: 'احراز هویت ویدئویی برخط نماینده مجاز',
        stepType: 'action',
        targetMenuPath: 'اپلیکیشن احراز هویت > ضبط تصویر و خواندن متن تعهد',
        contentMarkdown: 'متن استعلام نمایش داده شده در تصویر را با صدای رسا قرائت نموده و چهره را در کادر بیضی نگه دارید.',
        tips: [
          'کارت ملی هوشمند اصل باید حین ضبط در دست راست نماینده قرار داشته باشد.'
        ]
      },
      {
        id: 'step-leg-03',
        orderIndex: 3,
        stepKey: 'pin-initialization',
        title: 'تنظیم رمز عبور اولیه پین توکن (Token User PIN)',
        stepType: 'end',
        targetMenuPath: 'نرم‌افزار مدیریت توکن > تغییر پین امنیتی',
        contentMarkdown: 'رمز پیش‌فرض کارخانه (12345678) را به یک رمز ۸ تا ۱۶ رقمی ترکیبی تغییر دهید.',
        tips: [
          'در صورت وارد کردن ۳ بار پین اشتباه، توکن قفل شده و نیازمند PUK شرکت خواهد بود.'
        ]
      }
    ]
  },

  // 8. Support E-commerce Return Workflow
  {
    id: 'proc-sup-05',
    slug: 'support-product-return-and-wallet-refund',
    title: 'فرایند مرجوعی کالا، بازرسی انبار و استرداد وجه سفارش',
    description: 'دستورالعمل رسیدگی به تیکت‌های مرجوعی، بررسی ضوابط ضمانت ۷ روزه، ثبت بارنامه تحویل کالا به انبار و واریز اعتبار به حساب مشتری.',
    scope: 'organization',
    category: 'support',
    departmentName: 'امور مشتریان و لجستیک',
    estimatedMinutes: 15,
    targetSystem: 'سامانه CRM ارتباط با مشتری و انبارداری',
    targetSystemSlug: 'hrms',
    targetUrl: 'https://crm.fanavari.org/returns/new',
    isPopular: true,
    totalSteps: 3,
    tags: ['مرجوعی کالا', 'استرداد وجه', 'تیکت پشتیبانی', 'کد رهگیری پستی', 'انبارداری', 'کیف پول'],
    updatedAt: '۱۴۰۳/۰۷/۰۲',
    steps: [
      {
        id: 'step-sup-01',
        orderIndex: 1,
        stepKey: 'order-eligibility',
        title: 'تطابق شماره سفارش و شرایط ضمانت بازگشت کالا',
        stepType: 'decision',
        targetMenuPath: 'سامانه CRM > مشتریان > سفارش‌ها > ثبت درخواست بازگشت',
        contentMarkdown: 'تاریخ تحویل سفارش به مشتری را چک کنید. آیا کمتر از ۷ روز کاری از زمان تحویل گذشته است؟ آیا پلمب اقلام بهداشتی مخدوش نشده است؟',
        copyableFields: [
          { label: 'الگوی کد مرجوعی کالا', value: 'RET-1403-XXXXX' }
        ],
        errorGuides: [
          {
            id: 'err-sup-01',
            errorCode: 'RET-EXPIRED-7DAYS',
            errorTitle: 'مهلت ۷ روزه مرجوعی سفارش به اتمام رسیده است',
            cause: 'فاصله زمانی تحویل تا ثبت درخواست بیش از ۱۶۸ ساعت است.',
            solution: 'در صورت اثبات عیب ذاتی، موضوع به مدیر گارانتی ارجاع و مجوز استثنایی صادر گردد.',
            escalationContact: 'سرپرست تیم پشتیبانی، داخلی ۱۰۲'
          }
        ]
      },
      {
        id: 'step-sup-02',
        orderIndex: 2,
        stepKey: 'courier-pickup',
        title: 'ثبت مأموریت پیک جمع‌آوری و دریافت در انبار مرکزی',
        stepType: 'action',
        targetMenuPath: 'لجستیک > مأموریت‌های ناوگان > ایجاد حواله ورود انبار',
        contentMarkdown: 'کد رهگیری مرسوله پستی یا بارنامه پیک را ثبت کنید تا بسته وارد واحد کنترل کیفیت (QC) شود.',
        tips: [
          'تصویر اولیه جعبه در لحظه تحویل انبار ثبت گردد.'
        ]
      },
      {
        id: 'step-sup-03',
        orderIndex: 3,
        stepKey: 'qc-and-refund',
        title: 'تأیید تست کیفیت و شارژ کیف پول مشتری یا واریز شبا',
        stepType: 'end',
        targetMenuPath: 'مالی CRM > استرداد وجه > شارژ آنی کیف پول',
        contentMarkdown: 'در صورت تایید بازرس انبار، وجه ظرف حداکثر ۲ ساعت به کیف پول کاربری شارژ و پیامک اطلاع‌رسانی ارسال می‌شود.',
        copyableFields: [
          { label: 'کد تخفیف پوزش برای تاخیر', value: 'SORRY-GIFT-1403' }
        ]
      }
    ]
  }
];

export const CATEGORIES = [
  { key: 'all', label: 'همه فرایندها', count: MOCK_PROCESSES.length, icon: 'Layers' },
  { key: 'software', label: 'نرم‌افزارها و ابزارها', count: MOCK_PROCESSES.filter(p => p.scope === 'software').length, icon: 'Laptop' },
  { key: 'hr', label: 'منابع انسانی و کارگزینی', count: MOCK_PROCESSES.filter(p => p.category === 'hr').length, icon: 'Users' },
  { key: 'finance', label: 'مالی و مودیان مالیاتی', count: MOCK_PROCESSES.filter(p => p.category === 'finance').length, icon: 'Coins' },
  { key: 'it', label: 'زیرساخت و مهندسی نرم‌افزار', count: MOCK_PROCESSES.filter(p => p.category === 'it').length, icon: 'Server' },
  { key: 'design', label: 'طراحی محصول و رابط کاربری', count: MOCK_PROCESSES.filter(p => p.category === 'design').length, icon: 'Palette' },
  { key: 'legal', label: 'حقوقی و گواهی الکترونیک', count: MOCK_PROCESSES.filter(p => p.category === 'legal').length, icon: 'ShieldCheck' },
  { key: 'support', label: 'پشتیبانی و انبارداری', count: MOCK_PROCESSES.filter(p => p.category === 'support').length, icon: 'Headphones' },
] as const;
