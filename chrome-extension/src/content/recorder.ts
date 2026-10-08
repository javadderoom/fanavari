import type { RecordedEvent, TabMessage } from '../shared/types';

/**
 * Interaction recorder (M1: labels only unless values approved).
 * Injected dynamically by the background worker on origins the author
 * granted (specific site or all sites) — never statically matched.
 */

let recording = false;
let captureValues = false;

function pageRef(): string {
  try {
    return `${location.origin}${location.pathname}`;
  } catch {
    return '';
  }
}

function visibleText(el: Element | null, max = 120): string {
  if (!el) return '';
  const text = (el as HTMLElement).innerText ?? el.textContent ?? '';
  return text.replace(/\s+/g, ' ').trim().slice(0, max);
}

function attr(el: Element | null, name: string): string {
  return el?.getAttribute(name)?.trim() ?? '';
}

/** Best human-readable name for a clicked element. */
function labelForClick(target: EventTarget | null): { label: string; tag: string } {
  const el = (target instanceof Element ? target : null)?.closest(
    'button, a, [role="button"], input[type="submit"], input[type="button"], [role="tab"], [role="menuitem"], select, option'
  ) as HTMLElement | null;
  const fallback = target instanceof Element ? target : null;
  const node = el ?? fallback;
  const tag = (node?.tagName ?? '').toLowerCase();

  const label =
    visibleText(node) ||
    attr(node, 'aria-label') ||
    attr(node, 'value') ||
    attr(node, 'alt') ||
    attr(node, 'title') ||
    (tag === 'input' ? attr(node, 'placeholder') || attr(node, 'name') : '') ||
    tag;

  return { label, tag };
}

/** Best human-readable label for a form field. Never reads password values. */
function labelForField(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  const id = field.id;
  if (id) {
    const exterior = document.querySelector(`label[for="${CSS.escape(id)}"]`);
    const t = visibleText(exterior);
    if (t) return t;
  }
  const wrapping = field.closest('label');
  // Clone to strip the field's own value/text from the label text.
  if (wrapping) {
    const clone = wrapping.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input, textarea, select').forEach((n) => n.remove());
    const t = visibleText(clone);
    if (t) return t;
  }
  return (
    attr(field, 'aria-label') ||
    attr(field, 'placeholder') ||
    attr(field, 'name') ||
    field.tagName.toLowerCase()
  );
}

function emit(event: RecordedEvent): void {
  chrome.runtime.sendMessage({ type: 'RECORDER_EVENT', event }).catch(() => {
    // Background not reachable (e.g. during reload) — drop silently.
  });
}

function onClick(e: MouseEvent): void {
  if (!recording) return;
  const { label, tag } = labelForClick(e.target);
  const anchor = (e.target instanceof Element ? e.target.closest('a[href]') : null) as HTMLAnchorElement | null;
  const href = anchor?.href ?? '';
  const external = href && !href.startsWith(location.origin);

  emit({
    type: external ? 'navigation' : 'click',
    label,
    tag,
    page: pageRef(),
    at: Date.now(),
  });
}

function onInput(e: Event): void {
  if (!recording) return;
  const field = e.target;
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
    return;
  }
  const isPassword = field instanceof HTMLInputElement && field.type === 'password';
  const event: RecordedEvent = {
    type: 'input',
    label: labelForField(field),
    tag: field.tagName.toLowerCase(),
    page: pageRef(),
    at: Date.now(),
  };
  // Labels-only by default; values only when the author approved them —
  // and never for password fields.
  if (captureValues && !isPassword && typeof field.value === 'string' && field.value) {
    event.value = field.value.slice(0, 200);
  }
  emit(event);
}

chrome.runtime.onMessage.addListener((msg: TabMessage, _sender, sendResponse) => {
  if (msg.type === 'START_RECORDING') {
    recording = true;
    captureValues = msg.captureValues;
    sendResponse({ ok: true });
  } else if (msg.type === 'STOP_RECORDING') {
    recording = false;
    sendResponse({ ok: true });
  }
  return false;
});

// Use 'change' (committed values) instead of per-keystroke 'input'
// to avoid flooding the buffer with partial typing.
document.addEventListener('click', onClick, true);
document.addEventListener('change', onInput, true);
