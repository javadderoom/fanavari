import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatToSlug, cleanSlugForSubmit } from '../src/lib/slug-utils';

describe('Slug Utilities', () => {
  describe('formatToSlug', () => {
    it('should convert spaces and whitespace to hyphens', () => {
      assert.equal(formatToSlug('مرخصی استحقاقی پرسنل'), 'مرخصی-استحقاقی-پرسنل');
      assert.equal(formatToSlug('ثبت   درخواست    وام'), 'ثبت-درخواست-وام');
      assert.equal(formatToSlug("درخواست\tمرخصی\nروزانه"), 'درخواست-مرخصی-روزانه');
    });

    it('should convert underscores, slashes and backslashes to hyphens', () => {
      assert.equal(formatToSlug('it_service/network\\vpn'), 'it-service-network-vpn');
      assert.equal(formatToSlug('hr_system_v1'), 'hr-system-v1');
    });

    it('should preserve Persian/Arabic letters, Latin characters and numbers', () => {
      assert.equal(formatToSlug('اتوماسیون اداری چارگون 2025'), 'اتوماسیون-اداری-چارگون-2025');
      assert.equal(formatToSlug('SOP-HR-001 صدور حکم کارگزینی'), 'sop-hr-001-صدور-حکم-کارگزینی');
    });

    it('should strip special characters, emojis, and symbols', () => {
      assert.equal(formatToSlug('فرآیند شماره ۱ (مهم!) @ سامانه #پورتال $100%'), 'فرآیند-شماره-۱-مهم-سامانه-پورتال-100');
    });

    it('should collapse multiple consecutive hyphens into a single hyphen', () => {
      assert.equal(formatToSlug('گام----اول---اجرا'), 'گام-اول-اجرا');
    });

    it('should return empty string for empty input', () => {
      assert.equal(formatToSlug(''), '');
    });
  });

  describe('cleanSlugForSubmit', () => {
    it('should strip leading and trailing hyphens from formatted slugs', () => {
      assert.equal(cleanSlugForSubmit('-درخواست-مرخصی-'), 'درخواست-مرخصی');
      assert.equal(cleanSlugForSubmit('---sop-workflow---'), 'sop-workflow');
    });

    it('should cleanly format raw titles with edge symbols', () => {
      assert.equal(cleanSlugForSubmit(' [راهنمای ورود به سامانه] '), 'راهنمای-ورود-به-سامانه');
      assert.equal(cleanSlugForSubmit('***پورتال جامع***'), 'پورتال-جامع');
    });

    it('should generate fallback slug if input produces an empty string', () => {
      const fallback = cleanSlugForSubmit('*** !@#$%^&*() ');
      assert.ok(fallback.startsWith('proc-'), 'Default fallback prefix should be proc-');
      assert.ok(fallback.length > 5, 'Fallback should contain timestamp');

      const customFallback = cleanSlugForSubmit('', 'dept');
      assert.ok(customFallback.startsWith('dept-'), 'Custom fallback prefix should be dept-');
    });
  });
});
