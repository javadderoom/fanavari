import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cleanSlugForSubmit } from '../src/lib/slug-utils';

describe('Process Slug Update Logic', () => {
  it('should clean and normalize custom user slug input', () => {
    const rawUserSlug = '  /My Custom Process Slug_2026/  ';
    const cleaned = cleanSlugForSubmit(rawUserSlug, 'proc');
    assert.equal(cleaned, 'my-custom-process-slug-2026');
  });

  it('should preserve Persian and Latin characters in custom slugs', () => {
    const mixedSlug = '  سامانه-sida-نمرات  ';
    const cleaned = cleanSlugForSubmit(mixedSlug, 'proc');
    assert.equal(cleaned, 'سامانه-sida-نمرات');
  });

  it('should detect when slug is unchanged during edit', () => {
    const existingSlug = 'personnel-registration';
    const incomingSlug = 'personnel-registration';
    const sanitized = cleanSlugForSubmit(incomingSlug, 'proc');
    assert.equal(sanitized === existingSlug, true);
  });

  it('should detect when slug has changed during edit', () => {
    const existingSlug = 'old-slug-1';
    const incomingSlug = 'new-renamed-slug';
    const sanitized = cleanSlugForSubmit(incomingSlug, 'proc');
    assert.equal(sanitized !== existingSlug, true);
    assert.equal(sanitized, 'new-renamed-slug');
  });
});
