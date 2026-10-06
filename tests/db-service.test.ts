import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapPrismaProcess } from '../src/lib/db-service';

describe('db-service Data Mapping', () => {
  describe('mapPrismaProcess', () => {
    it('should map a raw Prisma record with default values when fields are omitted', () => {
      const raw = {
        id: 'proc-101',
        slug: 'basic-proc',
        title: 'فرایند ساده',
        description: 'شرح فرایند',
        createdAt: new Date('2024-05-01T10:00:00Z'),
        updatedAt: new Date('2024-05-01T10:00:00Z'),
        steps: [],
      };

      const mapped = mapPrismaProcess(raw);

      assert.equal(mapped.id, 'proc-101');
      assert.equal(mapped.slug, 'basic-proc');
      assert.equal(mapped.title, 'فرایند ساده');
      assert.equal(mapped.scope, 'portal');
      assert.equal(mapped.category, 'hr');
      assert.equal(mapped.visibility, 'public');
      assert.equal(mapped.departmentName, 'سازمان نامشخص');
      assert.equal(mapped.targetSystem, 'سامانه سازمانی');
      assert.equal(mapped.targetSystemSlug, 'portal');
      assert.equal(mapped.estimatedMinutes, 10);
      assert.equal(mapped.totalSteps, 0);
      assert.deepEqual(mapped.accessGrants, []);
      assert.deepEqual(mapped.steps, []);
    });

    it('should correctly map hierarchical sub-processes within steps', () => {
      const raw = {
        id: 'parent-proc',
        slug: 'parent-process',
        title: 'فرایند اصلی',
        description: 'فرایند دارای زیرفرایند',
        updatedAt: new Date('2024-06-01T10:00:00Z'),
        department: { name: 'معاونت فنی', slug: 'tech-dept' },
        systemTool: { name: 'سامانه جامع ERP', slug: 'erp', websiteUrl: 'https://erp.local' },
        steps: [
          {
            id: 'step-parent-1',
            orderIndex: 1,
            stepKey: 'run-sub',
            title: 'مرحله ارجاع به زیرفرایند',
            contentMarkdown: 'این مرحله مستلزم اجرای فرایند فرزند است.',
            stepType: 'subprocess',
            subProcessId: 'child-proc-99',
            subProcessSlug: 'child-process',
            subProcess: {
              id: 'child-proc-99',
              slug: 'child-process',
              title: 'تاییدیه مالیاتی فرعی',
              steps: [{ id: 's1' }, { id: 's2' }, { id: 's3' }],
              department: { name: 'امور مالی' },
              systemTool: { name: 'سامانه مودیان' },
            },
          },
        ],
      };

      const mapped = mapPrismaProcess(raw);

      assert.equal(mapped.steps.length, 1);
      const step = mapped.steps[0];
      assert.equal(step.stepType, 'subprocess');
      assert.equal(step.subProcessId, 'child-proc-99');
      assert.equal(step.subProcessSlug, 'child-process');
      assert.equal(step.subProcessTitle, 'تاییدیه مالیاتی فرعی');
      assert.equal(step.subProcessStepCount, 3);
      assert.notEqual(step.subProcess, null);
      assert.equal(step.subProcess?.id, 'child-proc-99');
      assert.equal(step.subProcess?.totalSteps, 3);
      assert.equal(step.subProcess?.departmentName, 'امور مالی');
    });

    it('should correctly map access grants for multi-audience permissions', () => {
      const raw = {
        id: 'proc-secure',
        slug: 'secure-workflow',
        title: 'فرایند محرمانه',
        updatedAt: new Date('2024-06-01T10:00:00Z'),
        accessGrants: [
          {
            id: 'grant-1',
            processId: 'proc-secure',
            userId: 'user-42',
            user: {
              id: 'user-42',
              name: 'سهراب سپهری',
              email: 'sohrab@domain.com',
              roleName: 'کارشناس ارشد',
              avatarUrl: '/avatar.png',
            },
            departmentId: 'dept-fin',
            department: {
              id: 'dept-fin',
              name: 'امور مالی',
              slug: 'finance',
            },
            roleName: 'مدیر مالی',
            permission: 'edit',
            claimToken: 'token-abc-123',
            claimExpiresAt: new Date('2026-12-31T23:59:59Z'),
            createdAt: new Date('2024-06-01T00:00:00Z'),
          },
        ],
      };

      const mapped = mapPrismaProcess(raw);

      assert.equal(mapped.accessGrants?.length, 1);
      const grant = mapped.accessGrants?.[0];
      assert.equal(grant?.userId, 'user-42');
      assert.equal(grant?.user?.name, 'سهراب سپهری');
      assert.equal(grant?.department?.name, 'امور مالی');
      assert.equal(grant?.permission, 'edit');
      assert.equal(grant?.claimToken, 'token-abc-123');
    });

    it('should parse schedule both from JSON string and parsed object', () => {
      const scheduleObj = {
        month: 'تیر',
        timeframeLabel: 'از ۱ الی ۱۵ تیر',
        recurrence: 'annual',
      };

      const withJsonString = mapPrismaProcess({
        id: 'p-1',
        slug: 'p1',
        title: 'فرایند تقویمی',
        updatedAt: new Date(),
        schedule: JSON.stringify(scheduleObj),
      });
      assert.deepEqual(withJsonString.schedule, scheduleObj);

      const withObject = mapPrismaProcess({
        id: 'p-2',
        slug: 'p2',
        title: 'فرایند تقویمی ۲',
        updatedAt: new Date(),
        schedule: scheduleObj,
      });
      assert.deepEqual(withObject.schedule, scheduleObj);
    });

    it('should correctly map error guides, copyable fields, and hotspots within steps', () => {
      const raw = {
        id: 'proc-detailed',
        slug: 'detailed-proc',
        title: 'فرایند تفصیلی',
        updatedAt: new Date('2024-06-01T10:00:00Z'),
        department: { name: 'فناوری اطلاعات', slug: 'it' },
        systemTool: { name: 'سامانه احراز هویت SSO', slug: 'sso' },
        steps: [
          {
            id: 'step-det-1',
            orderIndex: 1,
            stepKey: 'sso-key',
            title: 'ورود به سامانه',
            contentMarkdown: 'متن راهنما',
            stepType: 'action',
            copyableFields: [{ label: 'کد احراز', value: 'AUTH-999' }],
            hotspots: [{ x: 50, y: 50, title: 'دکمه ورود', note: 'کلیک کنید' }],
            errorGuides: [
              {
                id: 'err-item-1',
                errorCode: 'SSO-401',
                errorTitle: 'انقضای توکن ورود',
                solutionMarkdown: 'مجدداً از صفحه ورود اقدام فرمایید.',
              },
            ],
          },
        ],
      };

      const mapped = mapPrismaProcess(raw);

      assert.equal(mapped.steps.length, 1);
      const step = mapped.steps[0];
      assert.deepEqual(step.copyableFields, [{ label: 'کد احراز', value: 'AUTH-999' }]);
      assert.deepEqual(step.hotspots, [{ x: 50, y: 50, title: 'دکمه ورود', note: 'کلیک کنید' }]);
      assert.equal(step.errorGuides?.length, 1);
      assert.equal(step.errorGuides?.[0].errorCode, 'SSO-401');
      assert.equal(step.errorGuides?.[0].errorTitle, 'انقضای توکن ورود');
      assert.equal(step.errorGuides?.[0].solution, 'مجدداً از صفحه ورود اقدام فرمایید.');

      // Check tags generation
      assert.ok(mapped.tags.includes('فناوری اطلاعات'));
      assert.ok(mapped.tags.includes('it'));
      assert.ok(mapped.tags.includes('سامانه احراز هویت SSO'));
      assert.ok(mapped.tags.includes('ضمن خدمت'));
    });
  });
});
