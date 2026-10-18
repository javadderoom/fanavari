import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma';
import { parseCircularToProcesses } from '../src/lib/circular-parser';

const SAMPLE_MULTI = `*#سامانه: یکپارچه‌یِ دانش‌آموزی (سیدا)

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

describe('Circular Process Batch Ingestion & Database Integrity', () => {
  it('should parse and save multi-process circulars with proper foreign key linking', async () => {
    const parsed = parseCircularToProcesses(SAMPLE_MULTI);
    assert.equal(parsed.processes.length, 2);

    const testSlug1 = `test-batch-origin-${Date.now()}`;
    const testSlug2 = `test-batch-dest-${Date.now()}`;

    // Clean up if already exists
    await prisma.process.deleteMany({
      where: { slug: { in: [testSlug1, testSlug2] } },
    });

    try {
      // Create destination process first
      const p2 = await prisma.process.create({
        data: {
          title: parsed.processes[1].title,
          slug: testSlug2,
          description: parsed.processes[1].description,
          targetSystem: parsed.processes[1].targetSystem,
          targetUrl: parsed.processes[1].targetUrl,
          audience: parsed.processes[1].audience,
          sourceChannel: parsed.processes[1].sourceChannel,
          circularDate: parsed.processes[1].circularDate,
          category: 'education',
          scope: 'portal',
          steps: {
            create: parsed.processes[1].steps.map((s, idx) => ({
              orderIndex: idx + 1,
              stepKey: `step-${idx + 1}`,
              title: s.title,
              contentMarkdown: s.contentMarkdown,
              targetMenuPath: s.targetMenuPath,
            })),
          },
        },
      });

      // Create origin process linked to destination
      const p1 = await prisma.process.create({
        data: {
          title: parsed.processes[0].title,
          slug: testSlug1,
          description: parsed.processes[0].description,
          targetSystem: parsed.processes[0].targetSystem,
          targetUrl: parsed.processes[0].targetUrl,
          audience: parsed.processes[0].audience,
          sourceChannel: parsed.processes[0].sourceChannel,
          circularDate: parsed.processes[0].circularDate,
          category: 'education',
          scope: 'portal',
          nextProcessId: p2.id,
          nextProcessNote: parsed.processes[0].nextProcessNote,
          steps: {
            create: parsed.processes[0].steps.map((s, idx) => ({
              orderIndex: idx + 1,
              stepKey: `step-${idx + 1}`,
              title: s.title,
              contentMarkdown: s.contentMarkdown,
              targetMenuPath: s.targetMenuPath,
            })),
          },
        },
        include: {
          nextProcess: true,
          steps: true,
        },
      });

      assert.equal(p1.nextProcessId, p2.id);
      assert.ok(p1.nextProcessNote?.includes('معاون آموزش متوسطه'));
      assert.equal(p1.audience, parsed.processes[0].audience);
      assert.equal(p1.steps.length, 7);
      assert.equal(p1.steps[6].title, '+ ایجاد');
      assert.ok(p1.steps[6].targetMenuPath?.includes('+ ایجاد'));
    } finally {
      // Clean up test rows
      await prisma.process.deleteMany({
        where: { slug: { in: [testSlug1, testSlug2] } },
      });
    }
  });
});
