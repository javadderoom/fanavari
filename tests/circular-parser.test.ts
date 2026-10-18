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

    it('should configure Process 1 (Origin School) with steps and chaining', () => {
      const result = parseCircularToProcesses(SAMPLE_MULTI_PROCESS);
      const proc1 = result.processes[0];

      assert.ok(proc1.title.includes('مدرسه مبدأ'));
      assert.equal(proc1.targetSystem, 'سیدا');
      assert.ok(proc1.audience?.includes('مدرسه مبدأ'));
      assert.equal(proc1.steps.length, 7);
      assert.equal(proc1.steps[0].title, 'ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir');
      assert.equal(proc1.steps[6].title, '+ ایجاد');
      assert.ok(proc1.steps[6].targetMenuPath.includes('مجوزهای ثبت‌نام > + ایجاد'));

      // Chaining configuration
      assert.equal(proc1.nextProcessDraftIndex, 1);
      assert.ok(
        proc1.nextProcessNote?.includes('توسط معاون آموزش متوسطه استان (مقصد) تأیید شود')
      );
    });

    it('should configure Process 2 (Destination School) with proper steps', () => {
      const result = parseCircularToProcesses(SAMPLE_MULTI_PROCESS);
      const proc2 = result.processes[1];

      assert.ok(proc2.title.includes('مدرسه مقصد'));
      assert.equal(proc2.targetSystem, 'سیدا');
      assert.ok(proc2.audience?.includes('مدرسه مقصد'));
      assert.equal(proc2.steps.length, 6);
      assert.equal(proc2.steps[0].title, 'ورود به پنجره واحد خدمات الکترونیک وزارت آموزش و پرورش به آدرس my.medu.ir');
      assert.equal(proc2.steps[3].title, 'عملیات ضمن سال');
      assert.equal(proc2.steps[4].title, 'ثبت‌نام میان‌پایه');
      assert.equal(proc2.steps[5].title, 'افزودن دانش‌آموزان خارج از مدرسه');
      assert.equal(proc2.nextProcessDraftIndex, undefined);
    });
  });

  describe('parseCircularToProcesses - Single Stage Scenario', () => {
    it('should parse a single process with correct metadata and steps', () => {
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
      assert.equal(proc.steps.length, 6);
      assert.equal(proc.steps[5].title, '+ جدید');
      assert.ok(proc.steps[5].targetMenuPath.includes('مجوزهای ثبت‌نام > + جدید'));
      assert.equal(proc.nextProcessDraftIndex, undefined);
    });
  });
});
