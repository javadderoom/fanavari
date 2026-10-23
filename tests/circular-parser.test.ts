import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCircularToProcesses, cleanStepLine } from '../src/lib/circular-parser';

const SAMPLE_MULTI_PROCESS = `*#سامانه: یکپارچه‌یِ دانش‌آموزی (سیدا)

#مخاطب: مدیران محترم مدارس نمونه دولتی مقطع متوسطه دوم *

*#موضوع:
💢 امکان دریافت مجوز انتقالی مدارس نمونه دولتی پیش از فعال شدن سامانه نقل و انتقال سال تحصیلی ۱۴۰۶-۱۴۰۵ بصورت زیر میسر می‌باشد.*

📌لازم به ذکر می‌باشد درخواست انتقال می‌بایست در *مدرسه مبدأ* طبق مراحل ذیل ثبت گردد.

*⭕️مراحل جهت مشاهده و اقدام در مدرسه مبدأ؛*
⬅️ ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir
⬅️ ورود به سُها (سکوی هوشمند سازمانی)
⬅️ ورود به سامانه سیدا
◀️ عملیات اولیه
◀️ عملیات پیش ثبت‌نام
◀️ مجوزهای ثبت‌نام
◀️ *+* ایجاد

🔻پس از ثبت درخواست، این مجوز می‌بایست توسط معاون آموزش متوسطه استان (مقصد) تأیید شود.

*⭕️مراحل جهت مشاهده و اقدام در مدرسه مقصد؛*
⬅️ ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir
⬅️ ورود به سُها (سکوی هوشمند سازمانی)
⬅️ ورود به سامانه سیدا
◀️ عملیات ضمن سال
◀️ ثبت‌نام میان‌پایه
◀️ افزودن دانش‌آموزان خارج از مدرسه


مرکز توسعه آموزش مجازی، فناوری و امنیت اطلاعات
* آدرس کانال در پیام رسان بله:*
🆔 @Fanavari_Setad

🖥️ درگاه خدمات یکپارچه وزارت آموزش و پرورش
🌐 My.Medu.ir

🗓 *تاریخ:  ۱۴۰۵/۰۷/۲۵*`;

const SAMPLE_SINGLE_PROCESS = `*ٖ#سامانه: یکپارچه‌یِ دانش‌آموزی (سیدا)

#مخاطب: مدیران محترم مدارس با ماهیت حفظ قرآن کریم*

* #موضوع:
💢کشوی مجوزهای ثبت نام در سال تحصیلی ۱۴۰۶-۱۴۰۵ فعال گردید.*

*📌 مراحل جهت مشاهده و اقدام؛*
⬅️ ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir
⬅️ ورود به سُها (سکوی هوشمند سازمانی)
⬅️ ورود به سامانه سیدا
◀️ عملیات پیش ثبت‌نام
◀️ مجوزهای ثبت‌نام
◀️ *+* جدید

مرکز توسعه آموزش مجازی، فناوری و امنیت اطلاعات
* آدرس کانال در پیام رسان بله:*
🆔 @Fanavari_Setad

🖥️ درگاه خدمات یکپارچه وزارت آموزش و پرورش
🌐 My.Medu.ir

🗓*تاریخ: ۱۴۰۵/۰۷/۲۰*`;

describe('Circular Announcement Parser Engine', () => {
  describe('cleanStepLine', () => {
    it('should strip directional arrows and variation selectors', () => {
      assert.equal(
        cleanStepLine('⬅️ ورود به پنجره واحد خدمات الکترونیک'),
        'ورود به پنجره واحد خدمات الکترونیک'
      );
      assert.equal(cleanStepLine('◀️ عملیات پیش ثبت‌نام'), 'عملیات پیش ثبت‌نام');
      assert.equal(cleanStepLine('🔹 تایید نهایی'), 'تایید نهایی');
      assert.equal(cleanStepLine('1. ورود به سیستم'), 'ورود به سیستم');
    });

    it('should clean asterisk-wrapped plus buttons', () => {
      assert.equal(cleanStepLine('◀️ *+* ایجاد'), '+ ایجاد');
      assert.equal(cleanStepLine('◀️ *+* جدید'), '+ جدید');
    });
  });

  describe('parseCircularToProcesses - Multi-Stage Scenario', () => {
    it('should identify multi-stage interconnected processes', () => {
      const result = parseCircularToProcesses(SAMPLE_MULTI_PROCESS);

      assert.equal(result.isMultiStage, true);
      assert.equal(result.metadata.targetSystem, 'سیدا');
      assert.equal(result.metadata.sourceChannel, '@Fanavari_Setad');
      assert.equal(result.metadata.circularDate, '۱۴۰۵/۰۷/۲۵');
      assert.equal(result.metadata.targetUrl, 'https://my.medu.ir');
      assert.equal(result.processes.length, 2);
    });

    it('should configure Process 1 (Origin School) with 1 step containing all 7 clicks in menu path', () => {
      const result = parseCircularToProcesses(SAMPLE_MULTI_PROCESS);
      const proc1 = result.processes[0];

      assert.ok(proc1.title.includes('مدرسه مبدأ'));
      assert.equal(proc1.targetSystem, 'سیدا');
      assert.ok(proc1.audience?.includes('مدرسه مبدأ'));
      
      // Each step in the text must parse into 1 click in our process (single unified action step)
      assert.equal(proc1.steps.length, 1);
      const step = proc1.steps[0];
      assert.equal(step.title, 'مراحل اقدام در مدرسه مبدأ');
      
      const clicks = step.targetMenuPath.split(' > ');
      assert.equal(clicks.length, 7);
      assert.equal(clicks[0], 'ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir');
      assert.equal(clicks[1], 'ورود به سُها (سکوی هوشمند سازمانی)');
      assert.equal(clicks[2], 'ورود به سامانه سیدا');
      assert.equal(clicks[3], 'عملیات اولیه');
      assert.equal(clicks[4], 'عملیات پیش ثبت‌نام');
      assert.equal(clicks[5], 'مجوزهای ثبت‌نام');
      assert.equal(clicks[6], '+ ایجاد');

      // Content Markdown should NOT copy/duplicate the click path sequence
      assert.ok(!step.contentMarkdown.includes('**مسیر کلیک‌های اجرایی در سامانه:**'));
      assert.ok(!step.contentMarkdown.includes('1. ورود به پنجره واحد'));
      assert.ok(step.contentMarkdown.includes('+ ایجاد'));
      assert.ok(step.contentMarkdown.includes('نکات و راهنمای تکمیلی'));

      // Chaining configuration
      assert.equal(proc1.nextProcessDraftIndex, 1);
      assert.ok(
        proc1.nextProcessNote?.includes('توسط معاون آموزش متوسطه استان (مقصد) تأیید شود')
      );
    });

    it('should configure Process 2 (Destination School) with 1 step containing all 6 clicks in menu path', () => {
      const result = parseCircularToProcesses(SAMPLE_MULTI_PROCESS);
      const proc2 = result.processes[1];

      assert.ok(proc2.title.includes('مدرسه مقصد'));
      assert.equal(proc2.targetSystem, 'سیدا');
      assert.ok(proc2.audience?.includes('مدرسه مقصد'));
      
      assert.equal(proc2.steps.length, 1);
      const step = proc2.steps[0];
      assert.equal(step.title, 'مراحل اقدام در مدرسه مقصد');
      
      const clicks = step.targetMenuPath.split(' > ');
      assert.equal(clicks.length, 6);
      assert.equal(clicks[0], 'ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir');
      assert.equal(clicks[3], 'عملیات ضمن سال');
      assert.equal(clicks[4], 'ثبت‌نام میان‌پایه');
      assert.equal(clicks[5], 'افزودن دانش‌آموزان خارج از مدرسه');
      assert.equal(proc2.nextProcessDraftIndex, undefined);
    });
  });

  describe('parseCircularToProcesses - Single Stage Scenario', () => {
    it('should parse a single process with correct metadata and 1 step containing all 6 clicks', () => {
      const result = parseCircularToProcesses(SAMPLE_SINGLE_PROCESS);

      assert.equal(result.isMultiStage, false);
      assert.equal(result.metadata.targetSystem, 'سیدا');
      assert.equal(result.metadata.sourceChannel, '@Fanavari_Setad');
      assert.equal(result.metadata.circularDate, '۱۴۰۵/۰۷/۲۰');
      assert.equal(result.metadata.audience, 'مدیران محترم مدارس با ماهیت حفظ قرآن کریم');
      assert.equal(result.processes.length, 1);

      const proc = result.processes[0];
      assert.ok(proc.title.includes('کشوی مجوزهای ثبت نام'));
      assert.equal(proc.targetSystem, 'سیدا');
      assert.equal(proc.audience, 'مدیران محترم مدارس با ماهیت حفظ قرآن کریم');
      
      assert.equal(proc.steps.length, 1);
      const step = proc.steps[0];
      assert.equal(step.title, 'مراحل اقدام در سامانه');
      
      const clicks = step.targetMenuPath.split(' > ');
      assert.equal(clicks.length, 6);
      assert.equal(clicks[0], 'ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir');
      assert.equal(clicks[4], 'مجوزهای ثبت‌نام');
      assert.equal(clicks[5], '+ جدید');
      assert.equal(proc.nextProcessDraftIndex, undefined);
    });

    it('should parse explicit sub-step headings into distinct steps without repeating clicks', () => {
      const multiStepText = `#سامانه: سیدا
#موضوع: ثبت نام چندمرحله‌ای
گام ۱: ورود به درگاه
⬅️ ورود به پنجره واحد
⬅️ ورود به سُها

گام ۲: صدور مجوز
◀️ عملیات پیش ثبت‌نام
◀️ مجوزهای ثبت‌نام
◀️ + جدید`;

      const result = parseCircularToProcesses(multiStepText);
      assert.equal(result.processes.length, 1);
      const proc = result.processes[0];
      assert.equal(proc.steps.length, 2);

      // Step 1 only has its 2 clicks
      assert.equal(proc.steps[0].title, 'گام ۱: ورود به درگاه');
      assert.equal(proc.steps[0].targetMenuPath, 'ورود به پنجره واحد > ورود به سُها');

      // Step 2 only has its 3 clicks (does NOT repeat Step 1 clicks!)
      assert.equal(proc.steps[1].title, 'گام ۲: صدور مجوز');
      assert.equal(proc.steps[1].targetMenuPath, 'عملیات پیش ثبت‌نام > مجوزهای ثبت‌نام > + جدید');
    });

    it('should correctly parse circulars without hashtag prefixes and prevent footer link leakage', () => {
      const plainText = `سامانه: یکپارچهیِ دانشآموزی (سیدا)

مخاطب: مدیرانِ محترم مدارس بزرگسال

موضوع: امکان ثبتنام دانشآموزان فاقد سابقه سیدا پس از دریافت مجوز در دوره نیم سال اول بزرگسال فراهم گردید.

📌 مراحل جهت مشاهده و اقدام (ثبتنام)؛
⬅️ ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir
⬅️ ورود به سُها (سکوی هوشمند سازمانی)
⬅️ ورود به سامانه سیدا
◀️ عملیات اولیه 
◀️ عملیات پیش ثبتنام
◀️ ثبتنام میانپایه
◀️ اضافه نمودن دانشآموز خارج از مدرسه


https://farayandnama.ir/process/امکان-ثبتنام-دانشآموزان-فاقد-سابقه-سیدا-پس-از-دریافت-مجوز-در-دوره-نیم-سال-اول-بزرگسال-فراهم-گردید
🗓 تاریخ: ۱۴۰۵/۰۷/۲۹`;

      const result = parseCircularToProcesses(plainText);
      assert.equal(result.isMultiStage, false);
      assert.equal(result.metadata.targetSystem, 'سیدا');
      assert.equal(result.metadata.audience, 'مدیرانِ محترم مدارس بزرگسال');
      assert.equal(
        result.metadata.subject,
        'امکان ثبتنام دانشآموزان فاقد سابقه سیدا پس از دریافت مجوز در دوره نیم سال اول بزرگسال فراهم گردید.'
      );
      assert.equal(result.metadata.circularDate, '۱۴۰۵/۰۷/۲۹');
      assert.equal(result.metadata.targetUrl, 'https://my.medu.ir');

      assert.equal(result.processes.length, 1);
      const proc = result.processes[0];
      assert.equal(
        proc.title,
        'امکان ثبتنام دانشآموزان فاقد سابقه سیدا پس از دریافت مجوز در دوره نیم سال اول بزرگسال فراهم گردید.'
      );
      assert.equal(proc.targetSystem, 'سیدا');
      assert.equal(proc.audience, 'مدیرانِ محترم مدارس بزرگسال');
      assert.equal(proc.steps.length, 1);

      const step = proc.steps[0];
      const clicks = step.targetMenuPath.split(' > ');
      assert.equal(clicks.length, 7);
      assert.equal(clicks[6], 'اضافه نمودن دانشآموز خارج از مدرسه');

      // Verify no footer URLs or "(ثبتنام)؛" leaked into step instructions
      assert.ok(!step.contentMarkdown.includes('https://farayandnama.ir'));
      assert.ok(!step.contentMarkdown.includes('تاریخ:'));
      assert.ok(!step.contentMarkdown.includes('(ثبتنام)؛'));
    });
  });
});
