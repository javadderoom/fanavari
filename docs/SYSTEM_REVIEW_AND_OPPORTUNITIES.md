# Farayandnama (فرآیندنما) — Comprehensive System Review & Improvement Roadmap
**Generated:** October 2026  
**Platform Domain:** [farayandnama.ir](https://farayandnama.ir)  
**Status:** Active Production & Expansion Architecture  

---

## 1. Executive Summary
Farayandnama has achieved a robust foundation featuring Next.js 16 (App Router), PostgreSQL persistence via Prisma 7, Google-grade Omni-Search, live step execution with checkpoints, audit trails, permission bitfields, a printable SOP layout, desktop sidecar runner mode, and real-time database view tracking.

This document serves as an exhaustive reference covering:
1. **Recent Milestones Completed** (October 2026).
2. **Technical & Infrastructure Enhancements** (Security, Rate Limiting, Caching, PWA Offline Resilience, Analytics).
3. **Client & User Experience (UX/UI) Enhancements** (Sharing, Bookmarks, Interactive Branching Diagrams, Feedback Loops).
4. **Prioritized Action Plan (Impact vs. Effort)**.

---

## 2. Recent Milestones Completed (October 2026)

- **Domain Branding & PWA**:
  - Full domain alignment to `https://farayandnama.ir` across metadata, OpenGraph, canonical URLs, and `manifest.webmanifest`.
  - Service Worker registration (`sw.js`) and PWA installation prompts.
- **Mobile Navigation Overhaul**:
  - Dual navigation optimization with a persistent 5-slot mobile bottom navigation bar featuring instant access to the core Process Catalog (`کاتالوگ فرآیندها`), Home, Directives (`بخشنامه‌ها`), Administrative Timeline (`گاه‌شمار`), and User Profile.
- **Interactive Onboarding & Help Center**:
  - Step-by-step interactive Spotlight Tour (`SpotlightTour`) powered by clean spotlight overlays and smooth scrolling.
  - Dedicated Help & Training Hub (`/guide`) featuring tabbed visual documentation, simulated interactive components, and restartable tours.
- **Database-Backed View Tracking & "پرمراجعه" System**:
  - Real database persistence (`viewCount` and `isPopular` on `Process` model) replacing client-side static placeholders.
  - Session-deduplicated tracking (`POST /api/processes/[id]/view`), dynamic popularity thresholds (`viewCount >= 10`), editorial toggle controls in `ProcessEditorModal`, and search relevance ranking boost (+20 points).

---

## 3. Technical & Infrastructure Enhancements

### 3.1. API Rate Limiting & Anti-Abuse Protection (High Priority)
* **Current State**: Public endpoints such as `POST /api/processes/[id]/view`, `POST /api/auth/otp/request`, and `POST /api/auth/login` lack server-side rate limits.
* **Risk**:
  - Automated scripts could repeatedly invoke the view counter, inflating metrics.
  - Brute-force attacks against authentication or automated exhaustion of SMS OTP credit balances.
* **Architecture Solution**:
  - Implement a sliding-window token-bucket rate limiter in Next.js middleware or route wrappers.
  - Support IP-based keys via `x-forwarded-for` with strict limits (e.g., max 30 view increments per IP/minute, max 5 OTP requests per phone/10 minutes).

### 3.2. Database Read Caching & Edge TTFB Optimization (High Priority)
* **Current State**: Public catalog queries (`GET /api/processes`, `/api/departments`, `/api/systems`) query PostgreSQL on every client navigation.
* **Optimization**:
  - Leverage Next.js `unstable_cache` with tag-based invalidation (`revalidateTag('processes')`).
  - Add standard HTTP caching response headers (`Cache-Control: s-maxage=60, stale-while-revalidate=300`).
  - Result: Reduces server response time from 100–300ms down to sub-30ms for repeated catalog visits while eliminating database CPU spikes.

### 3.3. True Offline PWA Support for Field & Substation Workers (Medium Priority)
* **Current State**: The existing `sw.js` caches static assets (icons, manifest) but falls back to `/` when offline navigation occurs.
* **Gap**: Administrative staff, teachers, or field technicians frequently work in environments with unstable internet (basements, remote offices, school server closets).
* **Architecture Solution**:
  - Introduce a **Stale-While-Revalidate** caching strategy in `sw.js` for `/process/*` HTML documents and process JSON payloads.
  - Enable an offline shell or IndexedDB cache so any previously opened process can be executed and read without internet connectivity.

### 3.4. Time-Decayed & Trending Analytics (Medium Priority)
* **Current State**: `viewCount` is an all-time monotonic counter.
* **Gap**: Over months and years, older established processes will permanently dominate the "پرمراجعه" tag, while newly issued critical circulars or time-sensitive workflows (e.g. annual tax declarations or semester registrations) remain hidden.
* **Architecture Solution**:
  - Track a rolling 30-day view window or a lightweight `ProcessViewHistory` table.
  - Compute a "Trending This Month" (`پربازدیدهای ماه جاری`) score alongside all-time metrics.

### 3.5. Automated End-to-End (E2E) Browser Testing (Medium Priority)
* **Current State**: 101 unit tests cover permissions bitfields, search algorithms, and slug transformations, but zero automated browser-level tests exist.
* **Architecture Solution**:
  - Introduce Playwright tests covering critical paths:
    1. Search query $\rightarrow$ card click $\rightarrow$ step runner navigation.
    2. Interactive Spotlight Tour startup and step progression.
    3. Process Editor modal creation and persistence.

---

## 4. Client & User Experience (UX/UI) Enhancements

### 4.1. Separation of Social Sharing from Access Control (High Priority)
* **Current State**: In the process detail header, the "اشتراک‌گذاری" (Share) button currently triggers `ProcessAccessModal` (security ACL permissions).
* **Friction**: Regular staff members clicking "Share" expect to copy a link or forward the guide to a colleague, not manage security roles and department restrictions.
* **UX Solution**:
  - Reserve the existing `ProcessAccessModal` strictly for authors/administrators with permission (`EDIT_PROCESSES`).
  - For general users, introduce a clean **اشتراک‌گذاری فرایند (Share Sheet Modal)** containing:
    1. One-click copy link with formatted Persian title and URL.
    2. Direct share buttons to domestic Iranian messaging platforms (**ایتا - Eitaa**, **بله - Bale**) and **تلگرام (Telegram)**.
    3. Native mobile Web Share API (`navigator.share`) trigger.
    4. Dynamic QR code for instant mobile camera scanning.

### 4.2. User Bookmarks & Favorites («نشان‌شده‌ها / فرایندهای من») (High Priority)
* **Current State**: Users must re-search or navigate through catalogs every time they need their frequent workflows.
* **Friction**: Employees in accounting, HR, or education repeatedly execute the same 3–4 standard workflows throughout the year.
* **UX Solution**:
  - Add a Bookmark / Star icon (`Bookmark` / `Star`) on process cards and headers.
  - Store favorites locally in `localStorage` for guests, synced to `UserBookmark` in the database when logged in.
  - Add a dedicated "نشان‌شده‌ها" (Saved) filter tab on the homepage catalog and a direct filter in the mobile bottom bar.

### 4.3. Interactive Visual Flowchart & Branching Diagram (High Priority)
* **Current State**: Workflows are presented linearly as vertical lists or runners.
* **Friction**: Administrative procedures frequently contain branching decisions (`decision` step type, e.g. "اگر ابلاغ تایید شد $\rightarrow$ گام ۴ / اگر رد شد $\rightarrow$ گام ۳ و ارجاع به سیدا"). Linear text does not convey condition paths as intuitively as a diagram.
* **UX Solution**:
  - Add a toggleable **نمای فلوچارت (Flowchart Diagram)** tab beside the timeline view.
  - Render an interactive, lightweight SVG or Mermaid/node diagram showing start, action, decision diamonds, and end nodes with clickable zoom-to-step capabilities.

### 4.4. Active Workflow Resumption Hero Banner (Medium Priority)
* **Current State**: Session progress is saved to `/api/processes/[id]/session`, but returning users are not greeted with their unfinished work.
* **UX Solution**:
  - If a user has an active, incomplete process run, display a prominent yet elegant resumption card on the homepage hero:
    > **«شما یک فرایند نیمه‌کاره دارید: به‌روزرسانی ابلاغ و حکم همکار (گام ۳ از ۵) — [ادامه فرایند]»**

### 4.5. Step Clarity Micro-Feedback Widget («آیا این راهنما مفید بود؟») (Medium Priority)
* **Current State**: No mechanism exists for civil servants to report whether a guide solved their problem.
* **UX Solution**:
  - At the bottom of each process walkthrough, embed a micro-feedback widget:
    - *"آیا این راهنما مشکل شما را حل کرد؟ (👍 بله / 👎 خیر)"*
    - Quick tags on negative response: *"منوهای سامانه تغییر کرده"*, *"مراحل ناقص است"*, *"کد خطای دیگری دریافت کردم"*.
  - Gives platform editors real, actionable telemetry on which guides require updates.

### 4.6. Physical Notice QR Codes on Printed SOPs (Low/Medium Priority)
* **Current State**: The dedicated `/process/[slug]/print` page generates clean A4 sheets.
* **Friction**: Bureaucratic offices routinely print SOPs to post on department bulletin boards or service counters.
* **UX Solution**:
  - Embed an auto-generated SVG QR code directly on the printed document header linking to `https://farayandnama.ir/process/[slug]`.
  - Visiting employees or teachers can scan the physical bulletin board notice with their smartphone and immediately interact with the digital runner.

---

## 5. Prioritized Implementation Matrix

| Phase | Feature / Enhancement | Category | Expected Impact | Implementation Effort |
| :---: | :--- | :---: | :---: | :---: |
| **Q4-A** | **User Bookmarks & Favorites («نشان‌شده‌ها»)** | Client UX | ⭐⭐⭐⭐⭐ (Very High) | Low (1-2 days) |
| **Q4-A** | **Dedicated Share Sheet (Eitaa, Bale, Telegram, QR)** | Client UX | ⭐⭐⭐⭐⭐ (Very High) | Low (1 day) |
| **Q4-B** | **API Rate Limiting & Abuse Prevention Middleware** | Technical | ⭐⭐⭐⭐ (High) | Low (1 day) |
| **Q4-B** | **Database Read Caching (`unstable_cache` & headers)** | Technical | ⭐⭐⭐⭐⭐ (Very High) | Low (1 day) |
| **Q4-C** | **Interactive Branching Flowchart Diagram View** | Client UX | ⭐⭐⭐⭐⭐ (Very High) | Medium (3-4 days) |
| **Q4-C** | **Homepage Resume Incomplete Workflow Banner** | Client UX | ⭐⭐⭐⭐ (High) | Low (1 day) |
| **Q4-D** | **Helpfulness Micro-Feedback («آیا این راهنما مفید بود؟»)** | Client UX | ⭐⭐⭐⭐ (High) | Low (1-2 days) |
| **Q4-D** | **PWA Offline Stale-While-Revalidate Cache Strategy** | Technical | ⭐⭐⭐⭐ (High) | Medium (2 days) |
| **Q4-E** | **Time-Decayed & Trending Popularity Windows** | Technical | ⭐⭐⭐ (Medium) | Medium (2 days) |
| **Q4-E** | **Playwright End-to-End Test Suite** | Technical | ⭐⭐⭐⭐ (High) | Medium (3 days) |

---

## 6. Conclusion
By addressing these items systematically—starting with **User Bookmarks**, **Dedicated Share Sheet**, **API Rate Limiting**, and **Database Caching**—Farayandnama will significantly increase daily active user retention, streamline viral internal adoption across Iranian government and educational institutions, and harden system security.
