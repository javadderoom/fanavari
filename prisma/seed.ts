import { prisma } from '../src/lib/prisma';
import { ROLE_PRESETS } from '../src/lib/permissions';

async function main() {
  console.log('Seeding Fanavari PostgreSQL database with production entities...');

  // 1. Ensure Standard Role Users Exist
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@fanavari.local' },
    update: {},
    create: {
      email: 'admin@fanavari.local',
      name: 'مدیر ارشد سامانه (Super Admin)',
      roleName: ROLE_PRESETS.SUPER_ADMIN.name,
      permissions: ROLE_PRESETS.SUPER_ADMIN.bitfield,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'editor@fanavari.local' },
    update: {},
    create: {
      email: 'editor@fanavari.local',
      name: 'کارشناس تدوین فرایند',
      roleName: ROLE_PRESETS.PROCESS_EDITOR.name,
      permissions: ROLE_PRESETS.PROCESS_EDITOR.bitfield,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=editor',
    },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@fanavari.local' },
    update: {},
    create: {
      email: 'viewer@fanavari.local',
      name: 'پرسنل سازمانی (کاربر عادی)',
      roleName: ROLE_PRESETS.EMPLOYEE_VIEWER.name,
      permissions: ROLE_PRESETS.EMPLOYEE_VIEWER.bitfield,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=viewer',
    },
  });

  // 2. Organization: وزارت آموزش و پرورش
  const meduDept = await prisma.department.upsert({
    where: { slug: 'org-medu' },
    update: {
      name: 'وزارت آموزش و پرورش',
      icon: 'Building2',
    },
    create: {
      name: 'وزارت آموزش و پرورش',
      slug: 'org-medu',
      icon: 'Building2',
    },
  });

  // 3. System Tool: سامانه آموزش و ضمن خدمت فرهنگیان (LTMS)
  const ltmsTool = await prisma.systemTool.upsert({
    where: { slug: 'ltms' },
    update: {
      name: 'سامانه آموزش و ضمن خدمت فرهنگیان (LTMS)',
      category: 'portal',
      icon: 'GraduationCap',
      description: 'سامانه جامع یادگیری و توانمندسازی ضمن خدمت معلمان و کادر آموزشی وزارت آموزش و پرورش (ltms.medu.ir)؛ ثبت‌نام دوره‌های تخصصی، آزمون‌های مجازی ارتقای رتبه و صدور گواهی‌نامه الکترونیکی.',
      websiteUrl: 'https://ltms.medu.ir',
    },
    create: {
      name: 'سامانه آموزش و ضمن خدمت فرهنگیان (LTMS)',
      slug: 'ltms',
      category: 'portal',
      icon: 'GraduationCap',
      description: 'سامانه جامع یادگیری و توانمندسازی ضمن خدمت معلمان و کادر آموزشی وزارت آموزش و پرورش (ltms.medu.ir)؛ ثبت‌نام دوره‌های تخصصی، آزمون‌های مجازی ارتقای رتبه و صدور گواهی‌نامه الکترونیکی.',
      websiteUrl: 'https://ltms.medu.ir',
    },
  });

  // 4. Process: به‌روزرسانی ابلاغ و حکم همکار در سامانه LTMS
  const existingProcess = await prisma.process.findUnique({
    where: { slug: 'ltms-educator-decree-update' },
  });

  if (!existingProcess) {
    await prisma.process.create({
      data: {
        title: 'به‌روزرسانی ابلاغ و حکم همکار در سامانه LTMS',
        slug: 'ltms-educator-decree-update',
        description: 'راهنمای گام‌به‌گام و دو مرحله‌ای به‌روزرسانی اطلاعات ابلاغ تدریس و آخرین نگارش حکم کارگزینی فرهنگیان در سامانه آموزش ضمن خدمت (ltms.medu.ir) از طریق ثبت تیکت‌های تخصصی پشتیبانی جهت فعال‌سازی دوره‌های جدید و سوابق آموزشی.',
        scope: 'portal',
        category: 'hr',
        estimatedMinutes: 15,
        targetSystem: 'سامانه آموزش و ضمن خدمت فرهنگیان (LTMS)',
        targetUrl: 'https://ltms.medu.ir',
        authorId: superAdmin.id,
        departmentId: meduDept.id,
        systemToolId: ltmsTool.id,
        steps: {
          create: [
            {
              orderIndex: 1,
              stepKey: 'ltms-login-and-support',
              title: 'ورود به درگاه LTMS و مراجعه به مرکز پشتیبانی',
              stepType: 'action',
              contentMarkdown: 'جهت آغاز فرایند، ابتدا با مراجعه به نشانی رسمی سامانه ضمن خدمت فرهنگیان (**ltms.medu.ir**) با وارد کردن **کد ملی**، **کد پرسنلی** و **کلمه عبور** وارد حساب کاربری خود شوید.\n\nپس از ورود به داشبورد، از منوی دسترسی سریع یا پنل سمت راست، روی گزینه **مرکز پشتیبانی** کلیک نموده و سپس گزینه **درخواست جدید** را انتخاب فرمایید.',
              copyableFields: [
                { label: 'آدرس رسمی پرتال LTMS', value: 'https://ltms.medu.ir', description: 'پرتال جامع مدیریت یادگیری و آموزش ضمن خدمت فرهنگیان' }
              ],
              positionX: 100,
              positionY: 100,
            },
            {
              orderIndex: 2,
              stepKey: 'ltms-ticket-assignment',
              title: 'ثبت تیکت فاز اول — درخواست به‌روزرسانی ابلاغ تدریس',
              stepType: 'action',
              contentMarkdown: 'در فرم ارسال درخواست جدید، فیلد **نوع درخواست** را باز کرده و دقیقاً عنوان **«درخواست ابلاغ من به‌روزرسانی گردد»** را از لیست کشویی انتخاب کنید.\n\nدر بخش شرح تیکت، کد پرسنلی، کد مدرسه (آموزشگاه محل خدمت) و منطقه آموزشی را درج نمایید تا پشتیبان منطقه سریع‌تر استعلام سامانه سیدا را تایید کند. سپس روی دکمه **ارسال به پشتیبان** کلیک نمایید.',
              copyableFields: [
                { label: 'عنوان نوع درخواست (دقیق)', value: 'درخواست ابلاغ من به‌روزرسانی گردد', description: 'عبارت دقیق که باید در لیست کشویی نوع تیکت انتخاب شود' },
                { label: 'متن نمونه تیکت ابلاغ', value: 'با سلام و احترام، خواهشمند است نسبت به به‌روزرسانی و دریافت ابلاغ تدریس اینجانب برای سال تحصیلی جاری در سامانه LTMS اقدام فرمایید. کد پرسنلی: [کد پرسنلی] - کد مدرسه: [کد آموزشگاه] - منطقه: [منطقه آموزشی]', description: 'متن استاندارد اداری جهت تسریع در بررسی کارشناس پشتیبانی' }
              ],
              positionX: 300,
              positionY: 100,
            },
            {
              orderIndex: 3,
              stepKey: 'ltms-verify-assignment-response',
              title: 'بررسی پاسخ پشتیبان و دریافت تاییدیه ابلاغ',
              stepType: 'decision',
              contentMarkdown: 'به بخش **پیگیری درخواست‌ها** مراجعه نموده و وضعیت تیکت ارسالی را بررسی کنید. معمولاً بررسی تیکت بین ۲ الی ۲۴ ساعت کاری زمان می‌برد.\n\n**بررسی نتیجه:**\n* **حالت الف (موفق):** چنانچه وضعیت تیکت به «پاسخ داده شده / ابلاغ با موفقیت اعمال گردید» تغییر یافت، بلافاصله به گام چهارم (ثبت تیکت به‌روزرسانی حکم) بروید.\n* **حالت ب (رد تیکت):** چنانچه پاسخ داده شد که ابلاغی در سیستم یافت نشد، باید به مدیر آموزشگاه یا کارشناسی آموزش منطقه مراجعه نموده تا ابلاغ در سامانه سیدا نهایی شود.',
              positionX: 500,
              positionY: 100,
              errorGuides: {
                create: [
                  {
                    errorCode: 'LTMS-ERR-01',
                    errorTitle: 'عدم یافتن ابلاغ تدریس در سرور پایگاه مرکزی',
                    solutionMarkdown: 'ابلاغ ساعات موظف یا غیرموظف معلم در سامانه سیدا توسط مدیر مدرسه یا اداره منطقه هنوز به مرحله تایید نهایی نرسیده است. با مدیر مدرسه یا مسئول فناوری منطقه تماس حاصل نمایید تا وضعیت ابلاغ را در سیدا به حالت تایید تغییر دهند، سپس مجدداً تیکت ثبت نمایید.',
                  }
                ]
              }
            },
            {
              orderIndex: 4,
              stepKey: 'ltms-ticket-decree',
              title: 'ثبت تیکت فاز دوم — درخواست به‌روزرسانی حکم کارگزینی',
              stepType: 'action',
              contentMarkdown: '**نکته بسیار مهم:** پس از اعمال موفقیت‌آمیز ابلاغ در فاز اول، اطلاعات حکمی به صورت خودکار تغییر نمی‌کند و حتماً باید تیکت دوم صادر گردد.\n\nمجدداً روی گزینه **درخواست جدید** کلیک نموده و این‌بار از لیست کشویی نوع درخواست، گزینه **«به‌روزرسانی حکم»** را انتخاب نمایید. در متن درخواست اعلام فرمایید که ابلاغ تایید شده و درخواست سینک آخرین حکم کارگزینی را دارید، سپس روی **ارسال به پشتیبان** کلیک کنید.',
              copyableFields: [
                { label: 'عنوان نوع درخواست دوم', value: 'به‌روزرسانی حکم', description: 'نوع درخواست برای همگام‌سازی آخرین رتبه و مشخصات کارگزینی' },
                { label: 'متن نمونه تیکت حکم', value: 'با سلام و احترام، با عنایت به اعمال موفقیت‌آمیز ابلاغ تدریس اینجانب، خواهشمند است نسبت به به‌روزرسانی آخرین نگارش حکم کارگزینی و رتبه‌بندی در سامانه LTMS اقدام فرمایید.', description: 'متن رسمی تیکت فاز دوم' }
              ],
              positionX: 700,
              positionY: 100,
              errorGuides: {
                create: [
                  {
                    errorCode: 'LTMS-ERR-02',
                    errorTitle: 'مغایرت کد رشته شغلی یا تاریخ اجرای حکم',
                    solutionMarkdown: 'نگارش حکم جدید صادر شده دارای تاریخ اجرای معوق است یا در هسته پرسنلی استانی هنوز قطعی نشده است. تصویر آخرین فیش حقوقی یا تصویر حکم کارگزینی جدید را ضمیمه تیکت نموده یا به کارگزینی منطقه اطلاع دهید.',
                  }
                ]
              }
            },
            {
              orderIndex: 5,
              stepKey: 'ltms-final-verification',
              title: 'خروج، ورود مجدد و راستی‌آزمایی نهایی کارنامه ضمن خدمت',
              stepType: 'end',
              contentMarkdown: 'پس از دریافت پاسخ تایید تیکت دوم از سوی پشتیبان، جهت اعمال تغییرات در سشن کاربری، یک‌بار از حساب کاربری خود در سامانه LTMS **خروج (Logout)** نموده و مجدداً وارد شوید.\n\nاکنون به منوی **دوره‌های ثبت‌نامی** و **کارنامه ضمن خدمت** مراجعه کنید؛ سرفصل‌های آموزشی متناسب با ابلاغ و رسته شغلی جدید برای شما نمایان شده و مجاز به شرکت در دوره‌ها و آزمون‌های ارتقای رتبه خواهید بود.',
              positionX: 900,
              positionY: 100,
            }
          ]
        }
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
