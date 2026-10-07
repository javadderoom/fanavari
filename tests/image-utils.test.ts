import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatBytes } from '../src/lib/image-utils';

describe('Image and WebP Utilities', () => {
  describe('formatBytes', () => {
    it('should format 0 bytes correctly', () => {
      assert.equal(formatBytes(0), '0 B');
      assert.equal(formatBytes(-10), '0 B');
    });

    it('should format small bytes correctly', () => {
      assert.equal(formatBytes(500), '500 B');
    });

    it('should format kilobytes with 1 decimal place', () => {
      assert.equal(formatBytes(1024), '1 KB');
      assert.equal(formatBytes(1536), '1.5 KB');
      assert.equal(formatBytes(10240), '10 KB');
    });

    it('should format megabytes correctly', () => {
      assert.equal(formatBytes(1048576), '1 MB');
      assert.equal(formatBytes(2621440), '2.5 MB');
    });
  });

  describe('Micro UI Snippet & Icon Markdown Pattern', () => {
    it('should identify icon: prefix in markdown alt text', () => {
      const match = /^icon:(.+)$/.exec('icon:دکمه چاپ');
      assert.ok(match);
      assert.equal(match[1], 'دکمه چاپ');
    });

    it('should identify ui: prefix in markdown alt text', () => {
      const match = /^ui:(.+)$/.exec('ui:آیکون ذخیره');
      assert.ok(match);
      assert.equal(match[1], 'آیکون ذخیره');
    });

    it('should not treat standard images as icon snippets', () => {
      const match = /^(icon|ui):(.+)$/.exec('تصویر راهنمای سامانه');
      assert.equal(match, null);
    });
  });
});
