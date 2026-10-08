# Fanavari Authoring Extension (MV3)

Side-panel interaction recorder for SOP authors: records clicked-element text
and input field labels on any granted portal tab, then sends them to Fanavari
as reviewable step drafts. Labels-only by default; typed values only with an
explicit per-session confirm (passwords never).

## Develop

```bash
cd chrome-extension
npm install
npm run build      # outputs loadable extension to dist/
```

Load in Chrome via `chrome://extensions` → Developer mode → **Load unpacked** → `dist/`.

## Use

1. Open the side panel (toolbar icon), set the server URL.
2. **ورود با مرورگر** opens `<server>/extension-auth`; pick the author account —
   the token is relayed back automatically (relay needs the server-origin grant,
   requested during login).
3. Grant site access: **specific site** (default) or **all sites**.
4. **شروع ضبط** on the portal tab, click/type, then pick process + step and
   **ارسال به گام**. Review the appended draft in the dashboard step editor.

## Server pieces

- `User.extensionToken` (hashed at rest) + `POST /api/extension/token`, `GET /api/extension/me`
- `POST /api/processes/[id]/steps/[stepId]/events` (EDIT_PROCESSES-gated)
- `src/app/extension-auth/page.tsx` (browser-login handoff page)
