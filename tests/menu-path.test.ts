import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseMenuPath } from '../src/components/menu-path-display';

describe('parseMenuPath', () => {
  it('should return empty array for empty, null, or undefined path', () => {
    assert.deepEqual(parseMenuPath(null), []);
    assert.deepEqual(parseMenuPath(undefined), []);
    assert.deepEqual(parseMenuPath(''), []);
    assert.deepEqual(parseMenuPath('   '), []);
  });

  it('should split standard > delimited paths', () => {
    const input = 'میز خدمت > منابع انسانی > مرخصی استحقاقی';
    assert.deepEqual(parseMenuPath(input), ['میز خدمت', 'منابع انسانی', 'مرخصی استحقاقی']);
  });

  it('should handle arrow delimiter ->', () => {
    const input = 'تنظیمات -> امنیت -> تغییر رمز عبور';
    assert.deepEqual(parseMenuPath(input), ['تنظیمات', 'امنیت', 'تغییر رمز عبور']);
  });

  it('should handle unicode chevron and arrow delimiters (›, », →)', () => {
    const chevronInput = 'داشبورد › امور مالی › صدور فاکتور';
    assert.deepEqual(parseMenuPath(chevronInput), ['داشبورد', 'امور مالی', 'صدور فاکتور']);

    const guillemetInput = 'سیستم » انبار » ورود کالا';
    assert.deepEqual(parseMenuPath(guillemetInput), ['سیستم', 'انبار', 'ورود کالا']);

    const arrowInput = 'پورتال → کارتابل → کارتابل تایید';
    assert.deepEqual(parseMenuPath(arrowInput), ['پورتال', 'کارتابل', 'کارتابل تایید']);
  });

  it('should handle slash delimiters / when > is not present', () => {
    const slashInput = 'سامانه جامع / احراز هویت / ثبت نام پرسنل';
    assert.deepEqual(parseMenuPath(slashInput), ['سامانه جامع', 'احراز هویت', 'ثبت نام پرسنل']);
  });

  it('should trim surrounding whitespace and ignore empty segments', () => {
    const input = '  صفحه اصلی   >   مدیریت کاربران   > >   ویرایش دسترسی  >  ';
    assert.deepEqual(parseMenuPath(input), ['صفحه اصلی', 'مدیریت کاربران', 'ویرایش دسترسی']);
  });

  it('should handle single segment without delimiters', () => {
    const single = 'صفحه نخست';
    assert.deepEqual(parseMenuPath(single), ['صفحه نخست']);
  });
});
