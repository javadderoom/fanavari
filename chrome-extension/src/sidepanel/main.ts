import { FanavariApi } from '../shared/api';
import { clearBuffer, getBuffer, getSettings, saveBuffer, saveSettings } from '../shared/storage';
import type { RecordedEvent } from '../shared/types';

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id) as T | null;
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
};

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const faNum = (n: number): string => String(n).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);

function sendToBackground<T = unknown>(msg: Record<string, unknown>): Promise<T> {
  return chrome.runtime.sendMessage(msg) as Promise<T>;
}

async function currentTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}

function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.origin;
  } catch {
    return null;
  }
}

/* ---------------------------------- auth ---------------------------------- */

async function refreshAuth(): Promise<void> {
  const settings = await getSettings();
  (document.getElementById('server-url') as HTMLInputElement).value = settings.serverUrl;

  const badge = $('conn-badge');
  const userLine = $('auth-user');
  const logoutBtn = $('logout-btn');

  if (!settings.token) {
    badge.textContent = 'متصل نیست';
    badge.classList.remove('ok');
    userLine.textContent = '';
    logoutBtn.classList.add('hidden');
    return;
  }

  const api = new FanavariApi(settings.serverUrl, settings.token);
  const user = await api.me().catch(() => null);
  if (!user) {
    badge.textContent = 'توکن نامعتبر';
    badge.classList.remove('ok');
    userLine.textContent = 'توکن ذخیره‌شده معتبر نیست — دوباره وارد شوید.';
    logoutBtn.classList.remove('hidden');
    return;
  }

  badge.textContent = 'متصل';
  badge.classList.add('ok');
  userLine.textContent = `${user.name} (${user.roleName})`;
  logoutBtn.classList.remove('hidden');
  await saveSettings({ userName: user.name });
}

async function handleLogin(): Promise<void> {
  const urlInput = document.getElementById('server-url') as HTMLInputElement;
  const serverUrl = urlInput.value.trim().replace(/\/+$/, '') || 'http://localhost:3000';
  await saveSettings({ serverUrl });

  // The relay content script needs access to the server origin to read the
  // issued token from /extension-auth — request it now (user gesture).
  const origin = (() => {
    try {
      return new URL(serverUrl).origin;
    } catch {
      return null;
    }
  })();
  if (origin) {
    const granted = await chrome.permissions.request({ origins: [`${origin}/*`] }).catch(() => false);
    if (granted) {
      await sendToBackground({ type: 'BG_SYNC_RELAY', origin }).catch(() => {});
    }
  }

  await chrome.tabs.create({ url: `${serverUrl}/extension-auth` });
}

/* --------------------------------- access --------------------------------- */

async function refreshAccess(): Promise<void> {
  const tab = await currentTab();
  const origin = originOf(tab?.url);
  $('tab-origin').textContent = origin ?? '(برگه جاری قابل ضبط نیست)';

  const perms = await chrome.permissions.getAll();
  const list = $('grants-list');
  list.innerHTML = '';
  const origins = perms.origins ?? [];
  if (origins.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'هنوز به هیچ سایتی دسترسی داده نشده است.';
    list.appendChild(li);
    return;
  }
  for (const o of origins) {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = o;
    label.dir = 'ltr';
    const revoke = document.createElement('button');
    revoke.textContent = 'لغو';
    revoke.onclick = async () => {
      await chrome.permissions.remove({ origins: [o] });
      await sendToBackground({ type: 'BG_SYNC_SCRIPTS' }).catch(() => {});
      await refreshAccess();
    };
    li.append(label, revoke);
    list.appendChild(li);
  }
}

/* -------------------------------- recording ------------------------------- */

async function refreshRecording(): Promise<void> {
  const buffer = await getBuffer();
  const recording = buffer.recordingTabId !== null;
  const btn = $('record-btn') as HTMLButtonElement;
  btn.textContent = recording ? 'توقف ضبط' : 'شروع ضبط در این برگه';
  btn.classList.toggle('recording', recording);
  renderEvents(buffer.events);
}

function renderEvents(events: RecordedEvent[]): void {
  $('event-count').textContent = faNum(events.length);
  const list = $('events-list');
  list.innerHTML = '';
  for (const ev of events.slice(-50).reverse()) {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.className = 'ev-label';
    const icon = ev.type === 'input' ? '⌨' : ev.type === 'navigation' ? '🧭' : '👆';
    label.textContent = `${icon} ${ev.label}`;
    const meta = document.createElement('span');
    meta.className = 'ev-meta';
    meta.textContent = `${ev.tag ?? ''} • ${ev.page ?? ''}`;
    meta.dir = 'ltr';
    li.append(label, meta);
    if (ev.value !== undefined) {
      const v = document.createElement('span');
      v.className = 'ev-value';
      v.textContent = ev.value;
      li.appendChild(v);
    }
    list.appendChild(li);
  }
  if (events.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'هنوز رویدادی ثبت نشده است.';
    list.appendChild(li);
  }
}

async function toggleRecording(): Promise<void> {
  const buffer = await getBuffer();
  if (buffer.recordingTabId !== null) {
    await sendToBackground({ type: 'BG_STOP_TAB' });
    await refreshRecording();
    return;
  }
  const tab = await currentTab();
  if (!tab?.id) return;
  const settings = await getSettings();
  const res = await sendToBackground<{ ok: boolean; error?: string }>({
    type: 'BG_START_TAB',
    tabId: tab.id,
    captureValues: settings.captureValues,
  });
  if (!res?.ok) {
    setStatus('به این برگه دسترسی ندارید — ابتدا از بخش دسترسی مجوز بدهید.');
  } else {
    setStatus('');
  }
  await refreshRecording();
}

/* ------------------------------- target/send ------------------------------ */

interface StepOption {
  id: string;
  title: string;
  orderIndex: number;
}

let loadedSteps: StepOption[] = [];
let loadedProcessId = '';

async function refreshTargets(): Promise<void> {
  const settings = await getSettings();
  const procSelect = $('process-select') as HTMLSelectElement;
  const stepSelect = $('step-select') as HTMLSelectElement;
  procSelect.innerHTML = '<option value="">— انتخاب —</option>';
  stepSelect.innerHTML = '<option value="">— انتخاب —</option>';
  loadedSteps = [];

  if (!settings.token) {
    setStatus('برای بارگذاری فرایندها ابتدا وارد شوید.');
    return;
  }
  try {
    const api = new FanavariApi(settings.serverUrl, settings.token);
    const processes = await api.listProcesses();
    for (const p of processes) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.title;
      procSelect.appendChild(opt);
    }
    setStatus('');
  } catch {
    setStatus('خطا در بارگذاری فرایندها — اتصال یا توکن را بررسی کنید.');
  }
}

async function handleProcessChange(): Promise<void> {
  const settings = await getSettings();
  const procSelect = $('process-select') as HTMLSelectElement;
  const stepSelect = $('step-select') as HTMLSelectElement;
  stepSelect.innerHTML = '<option value="">— انتخاب —</option>';
  loadedSteps = [];
  loadedProcessId = procSelect.value;
  if (!loadedProcessId || !settings.token) return;
  try {
    const api = new FanavariApi(settings.serverUrl, settings.token);
    const processes = await api.listProcesses();
    const proc = processes.find((p) => p.id === loadedProcessId);
    const steps = [...(proc?.steps ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    loadedSteps = steps;
    for (const s of steps) {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `گام ${faNum(s.orderIndex)} — ${s.title}`;
      stepSelect.appendChild(opt);
    }
  } catch {
    setStatus('خطا در بارگذاری گام‌ها.');
  }
}

async function handleSend(): Promise<void> {
  const settings = await getSettings();
  const stepSelect = $('step-select') as HTMLSelectElement;
  const buffer = await getBuffer();
  if (!settings.token) {
    setStatus('ابتدا وارد شوید.');
    return;
  }
  if (!loadedProcessId || !stepSelect.value) {
    setStatus('فرایند و گام مقصد را انتخاب کنید.');
    return;
  }
  if (buffer.events.length === 0) {
    setStatus('رویدادی برای ارسال وجود ندارد.');
    return;
  }
  try {
    setStatus('در حال ارسال...');
    const api = new FanavariApi(settings.serverUrl, settings.token);
    const result = await api.sendEvents(loadedProcessId, stepSelect.value, buffer.events);
    const parts: string[] = [];
    if (result.appendedMenuSegments > 0) parts.push(`${faNum(result.appendedMenuSegments)} باکس مسیر`);
    if (result.appendedEvents > 0) parts.push(`${faNum(result.appendedEvents)} یادداشت به دستورالعمل`);
    setStatus(`✅ ارسال شد: ${parts.join('، ')}.`);
    await clearBuffer();
    await refreshRecording();
  } catch (err) {
    setStatus(`خطا در ارسال: ${err instanceof Error ? err.message : 'نامشخص'}`);
  }
}

function setStatus(text: string): void {
  $('status').textContent = text;
}

/* ---------------------------------- init ---------------------------------- */

function init(): void {
  $('login-btn').addEventListener('click', () => void handleLogin());
  $('logout-btn').addEventListener('click', async () => {
    await saveSettings({ token: null, userName: null });
    await refreshAuth();
  });
  $('server-url').addEventListener('change', async (e) => {
    const v = (e.target as HTMLInputElement).value.trim().replace(/\/+$/, '');
    if (v) await saveSettings({ serverUrl: v });
  });

  $('grant-site-btn').addEventListener('click', async () => {
    const tab = await currentTab();
    const origin = originOf(tab?.url);
    if (!origin) {
      setStatus('برگه جاری قابل ضبط نیست.');
      return;
    }
    const granted = await chrome.permissions.request({ origins: [`${origin}/*`] }).catch(() => false);
    if (granted) {
      await sendToBackground({ type: 'BG_SYNC_SCRIPTS' }).catch(() => {});
      await refreshAccess();
    }
  });
  $('grant-all-btn').addEventListener('click', async () => {
    if (!confirm('دسترسی ضبط به همه سایت‌ها داده شود؟')) return;
    const granted = await chrome.permissions.request({ origins: ['<all_urls>'] }).catch(() => false);
    if (granted) {
      await sendToBackground({ type: 'BG_SYNC_SCRIPTS' }).catch(() => {});
      await refreshAccess();
    }
  });

  $('record-btn').addEventListener('click', () => void toggleRecording());
  $('clear-btn').addEventListener('click', async () => {
    await clearBuffer();
    await refreshRecording();
  });
  $('values-toggle').addEventListener('change', async (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      const ok = confirm(
        'مقادیر تایپ‌شده هم ثبت شود؟ ممکن است شامل اطلاعات شخصی باشد — پیش از ارسال بازبینی می‌کنید.'
      );
      if (!ok) {
        (e.target as HTMLInputElement).checked = false;
        return;
      }
    }
    await saveSettings({ captureValues: checked });
  });

  $('refresh-btn').addEventListener('click', () => void refreshTargets());
  $('process-select').addEventListener('change', () => void handleProcessChange());
  $('send-btn').addEventListener('click', () => void handleSend());

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.buffer) void refreshRecording();
    if (changes.settings) void (async () => {
      const s = await getSettings();
      (document.getElementById('values-toggle') as HTMLInputElement).checked = s.captureValues;
      await refreshAuth();
    })();
  });

  void (async () => {
    const s = await getSettings();
    (document.getElementById('values-toggle') as HTMLInputElement).checked = s.captureValues;
    // Heal dynamic script registrations (they vanish on extension reload).
    await sendToBackground({ type: 'BG_SYNC_SCRIPTS' }).catch(() => {});
    await refreshAuth();
    await refreshAccess();
    await refreshRecording();
  })();
}

document.addEventListener('DOMContentLoaded', init);
