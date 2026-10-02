import { Process } from '@/types/process';

export const MOCK_PROCESSES: Process[] = [
  {
    id: 'proc-hr-01',
    slug: 'hr-new-employee-registration',
    title: 'ثبت و پذیرش پرسنل جدید در سامانه منابع انسانی (HRMS)',
    description: 'فرایند کامل ثبت نام، ایجاد پرونده الکترونیک، ثبت قرارداد آزمایشی و دریافت کدهای پرسنلی و بیمه در سامانه یکپارچه پرسنلی سازمان.',
    category: 'hr',
    departmentName: 'مدیریت منابع انسانی',
    estimatedMinutes: 20,
    targetSystem: 'سامانه جامع منابع انسانی (HRMS)',
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
  {
    id: 'proc-fin-02',
    slug: 'finance-petty-cash-and-tax-invoice',
    title: 'ثبت، بررسی و تسویه تنخواه و صورتحساب‌های مالیاتی',
    description: 'دستورالعمل بارگذاری فاکتورهای رسمی با شناسه یکتای صورتحساب مالیاتی، دریافت تأییدیه مدیر مالی و صدور سند حسابداری تسویه.',
    category: 'finance',
    departmentName: 'امور مالی و حسابداری',
    estimatedMinutes: 15,
    targetSystem: 'کارپوشه سامانه مودیان و نرم‌افزار سپیدار',
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
  {
    id: 'proc-it-03',
    slug: 'it-devops-cloud-and-git-access',
    title: 'تعریف دسترسی و حساب کاربری در کلاستر کوبرنتیز و ریپازیتوری‌های گیت',
    description: 'فرایند امن تعریف دسترسی برای برنامه‌نویسان و مهندسان دواپس شامل دریافت کلید عمومی SSH، ایجاد کاربر IAM و تنظیم کانفیگ Kubeconfig.',
    category: 'it',
    departmentName: 'فناوری اطلاعات و زیرساخت',
    estimatedMinutes: 25,
    targetSystem: 'کنسول مدیریت ابری و گیت‌لب سازمانی',
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
  {
    id: 'proc-leg-04',
    slug: 'legal-digital-token-and-seal',
    title: 'صدور، تمدید و فعال‌سازی توکن دیجیتال و مهر سازمانی',
    description: 'مراحل احراز هویت در مرکز صدور گواهی الکترونیکی، دریافت توکن سخت‌افزاری PKI و نصب درایورهای امضای دیجیتال.',
    category: 'legal',
    departmentName: 'امور حقوقی و امنیت اسناد',
    estimatedMinutes: 30,
    targetSystem: 'مرکز ریشه صدور گواهی الکترونیکی کشور (GICA)',
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
  {
    id: 'proc-sup-05',
    slug: 'support-product-return-and-wallet-refund',
    title: 'فرایند مرجوعی کالا، بازرسی انبار و استرداد وجه سفارش',
    description: 'دستورالعمل رسیدگی به تیکت‌های مرجوعی، بررسی ضوابط ضمانت ۷ روزه، ثبت بارنامه تحویل کالا به انبار و واریز اعتبار به حساب مشتری.',
    category: 'support',
    departmentName: 'امور مشتریان و لجستیک',
    estimatedMinutes: 15,
    targetSystem: 'سامانه CRM ارتباط با مشتری و انبارداری',
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
  },
  {
    id: 'proc-hr-06',
    slug: 'hr-medical-leave-social-security',
    title: 'ثبت استعلاجی پرسنل و ارسال پرونده به کمیسیون پزشکی تأمین اجتماعی',
    description: 'فرایند ثبت گواهی پزشکی بالای ۳ روز، استعلام تاییدیه پزشک معتمد و ثبت الکترونیکی در درگاه خدمات غیرحضوری تأمین اجتماعی.',
    category: 'hr',
    departmentName: 'مدیریت منابع انسانی',
    estimatedMinutes: 18,
    targetSystem: 'درگاه خدمات غیرحضوری تأمین اجتماعی (eservices.tamin.ir)',
    targetUrl: 'https://eservices.tamin.ir/view/#/leaves',
    isPopular: false,
    totalSteps: 3,
    tags: ['مرخصی استعلاجی', 'تأمین اجتماعی', 'کمیسیون پزشکی', 'غرامت دستمزد', 'پزشک معتمد', 'بیمه'],
    updatedAt: '۱۴۰۳/۰۶/۱۵',
    steps: [
      {
        id: 'step-med-01',
        orderIndex: 1,
        stepKey: 'doctor-note-upload',
        title: 'بارگذاری گواهی پزشک و درج کد نظام پزشکی',
        stepType: 'action',
        targetMenuPath: 'پرتال پرسنلی > درخواست‌ها > مرخصی استعلاجی > ثبت جدید',
        contentMarkdown: 'تصویر نسخه الکترونیک با شناسه نسخه و مهر پزشک بارگذاری گردد.',
        copyableFields: [
          { label: 'سقف استعلاجی بدون نیاز به تایید کمیسیون', value: '۷ روز در سال' }
        ],
        errorGuides: [
          {
            id: 'err-med-01',
            errorCode: 'ERR-TAMIN-NO-PRESC',
            errorTitle: 'نسخه الکترونیک در سامانه نسخه تامین اجتماعی یافت نشد',
            cause: 'پزشک نسخه را روی سرورهای بیمه ثبت نکرده یا گواهی دستی صادر نموده است.',
            solution: 'گواهی دستی باید به شعبه بیمه کارگزاری مربوطه به صورت حضوری ارائه شود.',
          }
        ]
      },
      {
        id: 'step-med-02',
        orderIndex: 2,
        stepKey: 'medical-commission-check',
        title: 'بررسی مدت زمان استراحت و نیاز به کمیسیون پزشکی',
        stepType: 'decision',
        targetMenuPath: 'امور بیمه > پرونده‌های در جریان > بررسی طول دوره درمان',
        contentMarkdown: 'اگر مدت استراحت بیش از ۱۵ روز است، ارجاع پرونده به کمیسیون پزشکی بدوی شعبه الزامی است.',
        tips: [
          'برای مرخصی زایمان بارگذاری تصویر شناسنامه نوزاد الزامی است.'
        ]
      },
      {
        id: 'step-med-03',
        orderIndex: 3,
        stepKey: 'salary-compensation-claim',
        title: 'تأیید کارکرد ماهانه و ارجاع جهت دریافت غرامت ایام بیماری',
        stepType: 'end',
        targetMenuPath: 'حقوق و دستمزد > اعلام کارکرد به شعبه بیمه',
        contentMarkdown: 'ایام استعلاجی به عنوان کارکرد موقت از لیست حقوق سازمان کسر و توسط تامین اجتماعی پرداخت می‌گردد.',
      }
    ]
  },
  {
    id: 'proc-it-07',
    slug: 'it-network-printer-scanner-setup',
    title: 'پیکربندی و اتصال پرینترهای تحت شبکه و اسکنرهای اداری',
    description: 'راهنمای گام‌به‌گام اتصال چاپگر سازمانی، اختصاص IP استاتیک در سوییچ شبکه، تعریف درایور PCL6 و احراز هویت کاربری با کارت هوشمند.',
    category: 'it',
    departmentName: 'فناوری اطلاعات و زیرساخت',
    estimatedMinutes: 12,
    targetSystem: 'کنسول مدیریت پرینت‌سرور ویندوز و CUPS لینوکس',
    targetUrl: 'http://print.internal.fanavari.org:631',
    isPopular: false,
    totalSteps: 3,
    tags: ['پرینتر تحت شبکه', 'اسکنر اداری', 'IP استاتیک', 'درایور پرینت', 'پشتیبانی سخت‌افزار', 'کارتخوان'],
    updatedAt: '۱۴۰۳/۰۶/۲۰',
    steps: [
      {
        id: 'step-prn-01',
        orderIndex: 1,
        stepKey: 'ip-assignment',
        title: 'تنظیم آدرس IP استاتیک در رنج VLAN تجهیزات دفتری',
        stepType: 'action',
        targetMenuPath: 'پنل لمسی پرینتر > Network Settings > TCP/IP Manual',
        contentMarkdown: 'آدرس IP مشخص شده برای پرینتر طبقه را به همراه ساب‌نت ماسک و گیت‌وی اداری تنظیم کنید.',
        copyableFields: [
          { label: 'رنج پیش‌فرض IP پرینترهای اداری', value: '192.168.40.100 - 192.168.40.150' },
          { label: 'ساب‌نت ماسک شبکه', value: '255.255.255.0' },
          { label: 'گیت‌وی سازمانی', value: '192.168.40.1' }
        ],
        errorGuides: [
          {
            id: 'err-prn-01',
            errorCode: 'NET-IP-CONFLICT',
            errorTitle: 'تداخل آدرس IP با تجهیز دیگر در شبکه (IP Conflict)',
            cause: 'آدرس اختصاص‌یافته قبلاً روی دستگاه دیگری در شبکه رزرو شده است.',
            solution: 'در سرور DHCP مک‌ادرس پرینتر را رزرو کنید یا با دستور ping آزاد بودن IP را بررسی فرمایید.',
            escalationContact: 'کارشناس شبکه، داخلی ۲۰۵'
          }
        ]
      },
      {
        id: 'step-prn-02',
        orderIndex: 2,
        stepKey: 'driver-deploy',
        title: 'نصب درایور یونیورسال از طریق گروپ پالیسی ویندوز (GPO)',
        stepType: 'action',
        targetMenuPath: 'Active Directory > Group Policy > Deploy Printer Drivers',
        contentMarkdown: 'پکیج درایور HP/Canon Universal Print Driver به صورت خاموش روی تمامی کلاینت‌های واحد نصب می‌شود.',
        tips: [
          'پورت پیش‌فرض پرینت شبکه RAW Port 9100 می‌باشد.'
        ]
      },
      {
        id: 'step-prn-03',
        orderIndex: 3,
        stepKey: 'test-page-and-card',
        title: 'تست چاپ صفحه وضعیت و فعال‌سازی کارت RFID کارمند',
        stepType: 'end',
        targetMenuPath: 'پرینتر > Swipe Card > همگام‌سازی کارت با کد پرسنلی',
        contentMarkdown: 'کارت پرسنلی روی ریدر پرینتر گرفته شود تا سهمیه چاپ ماهانه به حساب کاربری متصل گردد.',
      }
    ]
  },
  {
    id: 'proc-fin-08',
    slug: 'finance-vat-taxpayers-system-return',
    title: 'فرایند ثبت و پرداخت اظهارنامه مالیات بر ارزش افزوده در سامانه مودیان',
    description: 'مراحل تجمیع فاکتورهای فصلی خرید و فروش، محاسبه مالیات و عوارض دوره، صدور قبض پرداخت مالیاتی و ثبت کد رهگیری پرداخت.',
    category: 'finance',
    departmentName: 'امور مالی و حسابداری',
    estimatedMinutes: 35,
    targetSystem: 'درگاه ملی خدمات الکترونیک سازمان امور مالیاتی (my.tax.gov.ir)',
    targetUrl: 'https://my.tax.gov.ir',
    isPopular: true,
    totalSteps: 3,
    tags: ['ارزش افزوده', 'سامانه مودیان', 'سازمان امور مالیاتی', 'اظهارنامه فصلی', 'قبض مالیاتی', 'ماده ۱۶۹'],
    updatedAt: '۱۴۰۳/۰۷/۱۱',
    steps: [
      {
        id: 'step-vat-01',
        orderIndex: 1,
        stepKey: 'data-consolidation',
        title: 'تطبیق کارپوشه فروش با دفاتر قانونی و فاکتورهای ابطالی',
        stepType: 'action',
        targetMenuPath: 'کارپوشه مالیاتی > بخش صورتحساب‌های فروش > خروجی اکسل مقایسه‌ای',
        contentMarkdown: 'فاکتورهای تایید شده، رد شده و در انتظار مودیان را استخراج کرده و مبالغ مشمول مالیات را بررسی کنید.',
        copyableFields: [
          { label: 'نرخ فعلی مالیات بر ارزش افزوده', value: '۱۰ درصد (سهم مالیات ۶٪ + سهم عوارض ۴٪)' }
        ],
        errorGuides: [
          {
            id: 'err-vat-01',
            errorCode: 'TAX-DIFF-RECONCILE',
            errorTitle: 'مغایرت صورتحساب‌های خرید پذیرفته‌شده با اعتبار مالیاتی',
            cause: 'فروشنده فاکتور خرید را پس از مهلت قانونی در سامانه ثبت کرده یا وضعیت صورتحساب «ابطال شده» است.',
            solution: 'با امور مالی فروشنده تماس گرفته و تاییدیه رسمی یا فاکتور اصلاحی دریافت کنید.',
            escalationContact: 'مدیر حسابداری مالیاتی'
          }
        ]
      },
      {
        id: 'step-vat-02',
        orderIndex: 2,
        stepKey: 'declaration-submission',
        title: 'تکمیل فرم اظهارنامه پیش‌فرض و اعمال اعتبارات مالیاتی',
        stepType: 'decision',
        targetMenuPath: 'درگاه ملی مالیات > ارزش افزوده > ارسال اظهارنامه دوره جاری',
        contentMarkdown: 'فرم پیش‌نویس سیستمی مالیاتی را مطالعه نمایید. در صورت وجود اعتبار دوره‌های قبل، کسر اعتبار را فعال کنید.',
        tips: [
          'جریمه تاخیر در تسلیم اظهارنامه معادل ۵۰ درصد مالیات متعلقه و غیرقابل بخشودگی کامل است.'
        ]
      },
      {
        id: 'step-vat-03',
        orderIndex: 3,
        stepKey: 'payment-slip-and-settlement',
        title: 'تولید شناسه قبض و پرداخت و دریافت برگه قطعی تسویه',
        stepType: 'end',
        targetMenuPath: 'امور مالیاتی > صدور شناسه قبض و پرداخت برخط',
        contentMarkdown: 'شناسه قبض ۳۰ رقمی صادر شده را با درگاه ساتنا پرداخت نموده و شماره پیگیری را در سیستم بایگانی فرمایید.',
        copyableFields: [
          { label: 'کد اقتصادی سازمان امور مالیاتی', value: '411111111111' }
        ]
      }
    ]
  }
];

export const CATEGORIES = [
  { key: 'all', label: 'همه فرایندها', count: MOCK_PROCESSES.length, icon: 'Layers' },
  { key: 'hr', label: 'منابع انسانی و اداری', count: MOCK_PROCESSES.filter(p => p.category === 'hr').length, icon: 'Users' },
  { key: 'finance', label: 'مالی و حسابداری', count: MOCK_PROCESSES.filter(p => p.category === 'finance').length, icon: 'Coins' },
  { key: 'it', label: 'فناوری و زیرساخت', count: MOCK_PROCESSES.filter(p => p.category === 'it').length, icon: 'Server' },
  { key: 'legal', label: 'حقوقی و امنیت', count: MOCK_PROCESSES.filter(p => p.category === 'legal').length, icon: 'ShieldCheck' },
  { key: 'support', label: 'پشتیبانی مشتریان', count: MOCK_PROCESSES.filter(p => p.category === 'support').length, icon: 'Headphones' },
] as const;
