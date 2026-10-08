import { appendEvent, getBuffer, saveBuffer, saveSettings } from './shared/storage';
import type { PanelMessage, RecordedEvent } from './shared/types';

const RECORDER_ID = 'fanavari-recorder';
const RELAY_ID = 'fanavari-auth-relay';

/** Toolbar icon click opens the side panel. */
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.windowId !== undefined) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

async function replaceContentScript(
  id: string,
  js: string,
  origins: string[]
): Promise<void> {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [id] });
  } catch {
    // Not registered yet — ignore.
  }
  if (origins.length === 0) return;
  await chrome.scripting.registerContentScripts([
    {
      id,
      js: [js],
      matches: origins,
      runAt: 'document_idle',
      allFrames: false,
      persistAcrossSessions: false,
    },
  ]);
}

/** (Re)register the recorder on every origin the author granted. */
async function syncRecorderScripts(): Promise<string[]> {
  const perms = await chrome.permissions.getAll();
  const origins = perms.origins ?? [];
  await replaceContentScript(RECORDER_ID, 'recorder.js', origins);
  return origins;
}

/** Register the auth relay on the configured Fanavari server origin. */
async function syncRelayScript(serverOrigin: string): Promise<void> {
  const origin = serverOrigin.replace(/\/+$/, '');
  await replaceContentScript(RELAY_ID, 'auth-relay.js', [`${origin}/*`]);
}

chrome.permissions.onAdded.addListener(() => void syncRecorderScripts());
chrome.permissions.onRemoved.addListener(() => void syncRecorderScripts());

chrome.runtime.onMessage.addListener((msg: PanelMessage | Record<string, unknown>, _sender, sendResponse) => {
  (async () => {
    const type = (msg as { type?: string }).type;

    if (type === 'RECORDER_EVENT') {
      await appendEvent((msg as { event: RecordedEvent }).event);
      sendResponse({ ok: true });
    } else if (type === 'RELAY_TOKEN') {
      const token = (msg as { token?: string }).token;
      if (typeof token === 'string' && token) {
        await saveSettings({ token });
        sendResponse({ ok: true });
      } else {
        sendResponse({ ok: false });
      }
    } else if (type === 'BG_SYNC_SCRIPTS') {
      const origins = await syncRecorderScripts();
      sendResponse({ ok: true, origins });
    } else if (type === 'BG_SYNC_RELAY') {
      const origin = (msg as { origin?: string }).origin;
      if (origin) {
        await syncRelayScript(origin);
        sendResponse({ ok: true });
      } else {
        sendResponse({ ok: false });
      }
    } else if (type === 'BG_START_TAB') {
      const { tabId, captureValues } = msg as { tabId: number; captureValues: boolean };
      try {
        await chrome.tabs.sendMessage(tabId, { type: 'START_RECORDING', captureValues });
        await saveBuffer({ recordingTabId: tabId, startedAt: Date.now() });
        sendResponse({ ok: true });
      } catch {
        sendResponse({ ok: false, error: 'NO_ACCESS' });
      }
    } else if (type === 'BG_STOP_TAB') {
      const buffer = await getBuffer();
      if (buffer.recordingTabId !== null) {
        try {
          await chrome.tabs.sendMessage(buffer.recordingTabId, { type: 'STOP_RECORDING' });
        } catch {
          // Tab closed or script gone — just clear state.
        }
      }
      await saveBuffer({ recordingTabId: null, startedAt: null });
      sendResponse({ ok: true });
    } else {
      sendResponse({ ok: false, error: 'UNKNOWN_MESSAGE' });
    }
  })();
  return true; // async response
});
