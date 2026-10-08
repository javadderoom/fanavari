/**
 * Auth relay: runs on the Fanavari server origin (registered dynamically
 * once the author configures + grants it). Watches /extension-auth for the
 * issued-token meta tag and stores the token for the side panel.
 */

const META_NAME = 'fanavari-ext-token';

function readToken(): string | null {
  if (!location.pathname.startsWith('/extension-auth')) return null;
  const meta = document.querySelector(`meta[name="${META_NAME}"]`);
  return meta?.getAttribute('content') || null;
}

function relay(): void {
  const token = readToken();
  if (token) {
    chrome.runtime.sendMessage({ type: 'RELAY_TOKEN', token }).catch(() => {});
  }
}

const observer = new MutationObserver(relay);
observer.observe(document.documentElement, { childList: true, subtree: true });
relay();
