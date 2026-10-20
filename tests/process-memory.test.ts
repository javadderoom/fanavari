import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLastProcessChoices,
  saveLastProcessChoices,
  clearLastProcessChoices,
  DEFAULT_PROCESS_CHOICES,
  PROCESS_MEMORY_STORAGE_KEY,
} from '../src/lib/process-memory';

class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

beforeEach(() => {
  const mockStorage = new MockLocalStorage();
  (global as any).window = {
    localStorage: mockStorage,
  };
});

test('getLastProcessChoices returns null when nothing is stored', () => {
  assert.equal(getLastProcessChoices(), null);
});

test('saveLastProcessChoices persists choices and getLastProcessChoices retrieves them accurately', () => {
  const saved = saveLastProcessChoices({
    departmentName: 'وزارت آموزش و پرورش',
    targetSystem: 'سیدا (یکپارچه دانش‌آموزی)',
    targetUrl: 'https://my.medu.ir',
    scope: 'schools',
    category: 'student',
    visibility: 'restricted',
    tagsInput: 'نمونه دولتی، نقل و انتقال',
  });

  assert.ok(saved);
  assert.equal(saved.departmentName, 'وزارت آموزش و پرورش');
  assert.equal(saved.targetSystem, 'سیدا (یکپارچه دانش‌آموزی)');

  const retrieved = getLastProcessChoices();
  assert.ok(retrieved);
  assert.equal(retrieved.departmentName, 'وزارت آموزش و پرورش');
  assert.equal(retrieved.targetSystem, 'سیدا (یکپارچه دانش‌آموزی)');
  assert.equal(retrieved.targetUrl, 'https://my.medu.ir');
  assert.equal(retrieved.scope, 'schools');
  assert.equal(retrieved.category, 'student');
  assert.equal(retrieved.visibility, 'restricted');
  assert.equal(retrieved.tagsInput, 'نمونه دولتی، نقل و انتقال');
});

test('clearLastProcessChoices removes stored choices completely', () => {
  saveLastProcessChoices({
    departmentName: 'اداره کل فناوری اطلاعات',
    targetSystem: 'سها',
  });

  assert.ok(getLastProcessChoices());

  clearLastProcessChoices();
  assert.equal(getLastProcessChoices(), null);
});

test('saveLastProcessChoices partially updates while preserving previous stored values', () => {
  saveLastProcessChoices({
    departmentName: 'سازمان امور مالیاتی',
    targetSystem: 'سامانه مودیان',
    scope: 'organization',
    category: 'finance',
  });

  // Only update targetSystem in next call
  saveLastProcessChoices({
    targetSystem: 'سامانه جامع تجارت',
  });

  const updated = getLastProcessChoices();
  assert.ok(updated);
  assert.equal(updated.departmentName, 'سازمان امور مالیاتی');
  assert.equal(updated.targetSystem, 'سامانه جامع تجارت');
  assert.equal(updated.scope, 'organization');
  assert.equal(updated.category, 'finance');
});

test('getLastProcessChoices handles corrupt or malformed JSON gracefully', () => {
  (global as any).window.localStorage.setItem(PROCESS_MEMORY_STORAGE_KEY, 'invalid-json{{{');
  assert.equal(getLastProcessChoices(), null);
});
