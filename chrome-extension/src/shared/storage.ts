import type { ExtSettings, RecordedEvent, SessionBuffer } from './types';

const DEFAULT_SETTINGS: ExtSettings = {
  serverUrl: 'http://localhost:3000',
  token: null,
  userName: null,
  captureValues: false,
};

const DEFAULT_BUFFER: SessionBuffer = {
  events: [],
  recordingTabId: null,
  startedAt: null,
};

export async function getSettings(): Promise<ExtSettings> {
  const stored = await chrome.storage.local.get('settings');
  return { ...DEFAULT_SETTINGS, ...(stored.settings ?? {}) };
}

export async function saveSettings(patch: Partial<ExtSettings>): Promise<ExtSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await chrome.storage.local.set({ settings: next });
  return next;
}

export async function getBuffer(): Promise<SessionBuffer> {
  const stored = await chrome.storage.local.get('buffer');
  return { ...DEFAULT_BUFFER, ...(stored.buffer ?? {}) };
}

export async function saveBuffer(patch: Partial<SessionBuffer>): Promise<SessionBuffer> {
  const current = await getBuffer();
  const next = { ...current, ...patch };
  await chrome.storage.local.set({ buffer: next });
  return next;
}

export async function appendEvent(event: RecordedEvent): Promise<void> {
  const buffer = await getBuffer();
  buffer.events.push(event);
  if (buffer.events.length > 500) buffer.events = buffer.events.slice(-500);
  await chrome.storage.local.set({ buffer });
}

export async function clearBuffer(): Promise<void> {
  await chrome.storage.local.set({ buffer: { ...DEFAULT_BUFFER } });
}
