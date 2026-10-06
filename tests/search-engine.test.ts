import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeText,
  tokenize,
  stripHtml,
  highlightMatchText,
  searchProcesses,
  searchAnnouncements,
  searchOmni,
} from '../src/lib/search-engine';
import { Process, InformationPost } from '../src/types/process';

describe('Search Engine Core', () => {
  describe('normalizeText', () => {
    it('should unify Arabic Yeh (ي, ى) to Persian Yeh (ی)', () => {
      assert.equal(normalizeText('بررسي اسناد مالى'), 'بررسی اسناد مالی');
    });

    it('should unify Arabic Kaf (ك) to Persian Kaf (ک)', () => {
      assert.equal(normalizeText('بانك مركزي'), 'بانک مرکزی');
    });

    it('should replace Zero-Width Non-Joiner (ZWNJ) with space', () => {
      assert.equal(normalizeText('میز\u200cخدمت'), 'میز خدمت');
    });

    it('should convert Persian numbers to Latin digits', () => {
      assert.equal(normalizeText('کد رهگیری ۱۴۰۳-۰۸-۲۹'), 'کد رهگیری 1403 08 29');
    });

    it('should convert Arabic numbers to Latin digits', () => {
      assert.equal(normalizeText('خطای ٥٠٠ سرور'), 'خطای 500 سرور');
    });

    it('should lowercase English characters', () => {
      assert.equal(normalizeText('SSO Portal Login'), 'sso portal login');
    });

    it('should normalize punctuation and excessive whitespaces', () => {
      assert.equal(normalizeText('  سامانه:؛،   انبار / لجستیک !؟ '), 'سامانه انبار لجستیک');
    });

    it('should return empty string for null or empty inputs', () => {
      assert.equal(normalizeText(''), '');
    });
  });

  describe('tokenize', () => {
    it('should split query into clean normalized tokens', () => {
      const tokens = tokenize('درخواست  مرخصی\u200cهای  سال ۱۴۰۳');
      assert.deepEqual(tokens, ['درخواست', 'مرخصی', 'های', 'سال', '1403']);
    });

    it('should return empty array for empty query', () => {
      assert.deepEqual(tokenize(''), []);
      assert.deepEqual(tokenize('   '), []);
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags and normalize spaces', () => {
      const html = '<div class="alert"><p>متن <strong>مهم</strong> جهت مطالعه</p></div>';
      assert.equal(stripHtml(html), 'متن مهم جهت مطالعه');
    });

    it('should return empty string for empty input', () => {
      assert.equal(stripHtml(''), '');
    });
  });

  describe('highlightMatchText', () => {
    it('should find matching query substring and split correctly', () => {
      const result = highlightMatchText('سامانه جامع اداری پرسنل', 'جامع');
      assert.notEqual(result, null);
      assert.equal(result?.match, 'جامع');
      assert.equal(result?.before, 'سامانه ');
      assert.equal(result?.after, ' اداری پرسنل');
    });

    it('should return null if query does not match', () => {
      const result = highlightMatchText('سامانه جامع اداری', 'مالی');
      assert.equal(result, null);
    });

    it('should return null for empty text or query', () => {
      assert.equal(highlightMatchText('', 'تست'), null);
      assert.equal(highlightMatchText('متن', ''), null);
    });
  });

  describe('searchProcesses', () => {
    const mockProcesses: Process[] = [
      {
        id: 'proc-1',
        slug: 'leave-request',
        title: 'ثبت درخواست مرخصی استحقاقی',
        description: 'راهنمای گام به گام دریافت تاییدیه مرخصی سالانه پرسنل',
        scope: 'portal',
        category: 'hr',
        visibility: 'public',
        departmentName: 'منابع انسانی',
        estimatedMinutes: 5,
        targetSystem: 'سامانه کارگزینی چارگون',
        targetSystemSlug: 'chargoon',
        targetUrl: 'https://chargoon.company.local',
        isPopular: true,
        totalSteps: 2,
        tags: ['مرخصی', 'پرسنلی', 'چارگون'],
        updatedAt: '1403/01/01',
        steps: [
          {
            id: 'step-1',
            orderIndex: 1,
            stepKey: 'login',
            title: 'ورود به کارتابل پرسنلی',
            contentMarkdown: 'نام کاربری و رمز عبور سازمانی را در درگاه وارد کنید.',
            stepType: 'action',
            targetMenuPath: 'میز خدمت > پرسنلی > ورود',
            copyableFields: [
              { label: 'کد پرسنلی نمونه', value: '980123' },
            ],
          },
          {
            id: 'step-2',
            orderIndex: 2,
            stepKey: 'submit-form',
            title: 'تکمیل فرم مرخصی',
            contentMarkdown: 'تاریخ شروع و پایان را انتخاب کرده و بر روی دکمه ثبت نهایی کلیک کنید.',
            stepType: 'action',
            errorGuides: [
              {
                id: 'err-1',
                errorCode: 'ERR-LEAVE-403',
                errorTitle: 'عدم موجودی مانده مرخصی',
                cause: 'سقف مرخصی به اتمام رسیده است.',
                solution: 'با امور اداری و سرپرست واحد هماهنگ فرمایید.',
              },
            ],
          },
        ],
      },
      {
        id: 'proc-2',
        slug: 'vpn-setup',
        title: 'اتصال به شبکه اختصاصی VPN',
        description: 'تنظیمات کلاینت سیسکو جهت دسترسی دورکاری پرسنل فنی',
        scope: 'software',
        category: 'it',
        visibility: 'public',
        departmentName: 'فناوری اطلاعات و زیرساخت',
        estimatedMinutes: 10,
        targetSystem: 'Cisco AnyConnect',
        targetSystemSlug: 'cisco',
        isPopular: false,
        totalSteps: 1,
        tags: ['شبکه', 'امنیت', 'سیسکو'],
        updatedAt: '1403/01/01',
        steps: [
          {
            id: 'step-v1',
            orderIndex: 1,
            stepKey: 'cisco-connect',
            title: 'وارد کردن آدرس سرور VPN',
            contentMarkdown: 'آدرس سرور را در فیلد Connection وارد کنید.',
            stepType: 'action',
            copyableFields: [
              { label: 'سرور اصلی', value: 'vpn.company.ir' },
            ],
          },
        ],
      },
    ];

    it('should return all processes when query is empty', () => {
      const results = searchProcesses(mockProcesses, '');
      assert.equal(results.length, 2);
      assert.equal(results[0]?.score, 1);
    });

    it('should find process with highest weight for title match', () => {
      const results = searchProcesses(mockProcesses, 'مرخصی استحقاقی');
      assert.ok(results.length > 0);
      assert.equal(results[0]?.process?.id, 'proc-1');
      assert.ok((results[0]?.score ?? 0) >= 180, 'Exact title match should score at least 180 points');
      assert.equal(results[0]?.bestMatch?.type, 'title');
    });

    it('should perform deep search in error codes with high priority (140 pts)', () => {
      const results = searchProcesses(mockProcesses, 'ERR-LEAVE-403');
      assert.equal(results.length, 1);
      assert.equal(results[0]?.process?.id, 'proc-1');
      assert.equal(results[0]?.bestMatch?.type, 'error');
      assert.ok((results[0]?.score ?? 0) >= 140);
    });

    it('should search copyable fields (labels and values)', () => {
      // Test search by copyable field value
      const results = searchProcesses(mockProcesses, 'vpn.company.ir');
      assert.ok(results.length >= 1);
      assert.equal(results[0]?.process?.id, 'proc-2');
      assert.equal(results[0]?.bestMatch?.type, 'field');
      assert.ok((results[0]?.score ?? 0) >= 75);

      // Test search by copyable field value unique to proc-1
      const numResults = searchProcesses(mockProcesses, '980123');
      assert.equal(numResults.length, 1);
      assert.equal(numResults[0]?.process?.id, 'proc-1');
      assert.equal(numResults[0]?.bestMatch?.type, 'field');
    });

    it('should match deep step menu path and instructions', () => {
      const results = searchProcesses(mockProcesses, 'میز خدمت');
      assert.ok(results.length >= 1);
      assert.equal(results[0]?.process?.id, 'proc-1');
      assert.equal(results[0]?.bestMatch?.type, 'step');
      assert.ok((results[0]?.score ?? 0) >= 45);
    });

    it('should search by department name', () => {
      const results = searchProcesses(mockProcesses, 'زیرساخت');
      assert.ok(results.length >= 1);
      assert.equal(results[0]?.process?.id, 'proc-2');
    });

    it('should search by tags', () => {
      const results = searchProcesses(mockProcesses, 'سیسکو');
      assert.ok(results.length >= 1);
      assert.equal(results[0]?.process?.id, 'proc-2');
      assert.equal(results[0]?.bestMatch?.type, 'tag');
    });

    it('should rank by relevance descending', () => {
      const results = searchProcesses(mockProcesses, 'پرسنل');
      assert.ok(results.length >= 1);
      for (let i = 0; i < results.length - 1; i++) {
        assert.ok((results[i]?.score ?? 0) >= (results[i + 1]?.score ?? 0));
      }
    });
  });

  describe('searchAnnouncements and searchOmni', () => {
    const mockPosts: InformationPost[] = [
      {
        id: 'post-1',
        slug: 'work-hours-summer',
        title: 'بخشنامه ساعات کاری تابستان ۱۴۰۳',
        summary: 'تغییر ساعات کار از ساعت ۶ صبح الی ۱۳ ظهر',
        content: '<p>کلیه همکاران گرامی ملزم به رعایت ساعات جدید هستند.</p>',
        type: 'circular',
        priority: 'urgent',
        isPinned: true,
        publishedAt: '1403/03/15',
        createdAt: '1403/03/15',
        updatedAt: '1403/03/15',
        authorName: 'اداره کل منابع انسانی',
        departmentName: 'امور اداری',
      },
      {
        id: 'post-2',
        slug: 'tax-server-update',
        title: 'اطلاعیه بروزرسانی سرورهای مالیاتی',
        summary: 'اختلال موقت سامانه مودیان در پایان هفته',
        content: '<p>سامانه مودیان از روز پنجشنبه به مدت ۲۴ ساعت در دسترس نخواهد بود.</p>',
        type: 'announcement',
        priority: 'normal',
        isPinned: false,
        publishedAt: '1403/03/20',
        createdAt: '1403/03/20',
        updatedAt: '1403/03/20',
        authorName: 'فناوری اطلاعات',
        systemToolName: 'سامانه مودیان',
      },
    ];

    it('should search announcements with pinned & urgent score boosts', () => {
      const results = searchAnnouncements(mockPosts, 'ساعات کاری');
      assert.equal(results.length, 1);
      assert.equal(results[0]?.post?.id, 'post-1');
      // 170 (title) + 25 (urgent) + 20 (pinned) = 215
      assert.ok((results[0]?.score ?? 0) >= 215);
    });

    it('should combine processes and announcements in searchOmni', () => {
      const mockProcesses: Process[] = [
        {
          id: 'proc-s1',
          slug: 'tax-submission',
          title: 'ارسال صورتحساب در سامانه مودیان',
          description: 'نحوه ثبت فاکتورهای الکترونیکی',
          scope: 'portal',
          category: 'finance',
          visibility: 'public',
          departmentName: 'امور مالی',
          estimatedMinutes: 15,
          targetSystem: 'سامانه مودیان',
          targetSystemSlug: 'tax',
          isPopular: true,
          totalSteps: 1,
          tags: ['مالیات', 'مودیان'],
          updatedAt: '1403/01/01',
          steps: [],
        },
      ];

      const omniResults = searchOmni(mockProcesses, mockPosts, 'مودیان');
      assert.equal(omniResults.length, 2);

      const types = omniResults.map((r) => r.itemType);
      assert.ok(types.includes('process'));
      assert.ok(types.includes('information'));

      // Check descending order
      assert.ok((omniResults[0]?.score ?? 0) >= (omniResults[1]?.score ?? 0));
    });
  });
});
