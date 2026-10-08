import { appendEvent, getBuffer, getSettings, saveBuffer, saveSettings } from './shared/storage';
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

/**
 * Dynamically registered scripts (persistAcrossSessions: false) vanish on
 * extension reload/update/browser restart while the *grants* persist.
 * Re-register on every worker startup so recording keeps working without
 * asking the author to re-grant access.
 */
async function healRegistrations(): Promise<void> {
  try {
    await syncRecorderScripts();
  } catch {
    // Permissions API momentarily unavailable — panel open heals it.
  }
  try {
    const settings = await getSettings();
    const origin = settings.serverUrl.replace(/\/+$/, '');
    const hasRelayAccess = await chrome.permissions.contains({ origins: [`${origin}/*`] });
    if (hasRelayAccess) {
      await syncRelayScript(origin);
    }
  } catch {
    // No server configured yet — nothing to heal.
  }
}

chrome.runtime.onStartup.addListener(() => void healRegistrations());
chrome.runtime.onInstalled.addListener(() => void healRegistrations());
void healRegistrations();

chrome.runtime.onMessage.addListener((msg: PanelMessage | Record<string, unknown>, sender, sendResponse) => {
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
      const startRecording = async (): Promise<void> => {
        await chrome.tabs.sendMessage(tabId, { type: 'START_RECORDING', captureValues });
      };
      try {
        await startRecording();
      } catch {
        // Tab was already open before the recorder was registered (dynamic
        // registration only covers new navigations). Inject on demand, then
        // retry — this works wherever the author already granted access.
        try {
          await chrome.scripting.executeScript({ target: { tabId }, files: ['recorder.js'] });
          await startRecording();
        } catch {
          sendResponse({ ok: false, error: 'NO_ACCESS' });
          return;
        }
      }
      await saveBuffer({ recordingTabId: tabId, startedAt: Date.now(), captureValues });
      sendResponse({ ok: true });
    } else if (type === 'BG_AM_I_RECORDING') {
      // Asked by a freshly injected recorder after a page load/navigation.
      const buffer = await getBuffer();
      const tabId = sender.tab?.id ?? null;
      const recording = tabId !== null && buffer.recordingTabId === tabId;
      sendResponse({ recording, captureValues: recording ? buffer.captureValues : false });
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
