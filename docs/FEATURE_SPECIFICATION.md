# Farayandnema (فرآیندنما) Platform: Comprehensive Feature Specification

## 1. Overview
This specification details all functional capabilities, user experiences, and operational components of **Farayandnema (فرآیندنما)**—the Intelligent Visual SOP & Flowchart Navigation Platform. It unifies our proprietary innovations with top benchmark capabilities identified from global digital adoption and workflow tools, and incorporates the operational requirements established in the official platform circular (*"آپدیت مورد نیاز در فناوری"*).

### 1.1. Universal Scope: Organizational Procedures & Software Workflows
The platform is designed to handle two fundamental classes of procedural knowledge:
1. **Organizational & Government Procedures (فرایندهای سازمانی و اداری)**: Regulatory portals, government tax systems (*Samaneh Moadian*), social security (*Tamin*), digital token certification (*GICA*), internal HRMS onboarding, expense reimbursement, and inventory management.
2. **Specialized Software & Tool Workflows (دستورالعمل‌ها و کار با نرم‌افزارها)**: Task-oriented, step-by-step guides for technical and office software—such as exporting clean SVGs and design tokens in **Figma**, resolving merge conflicts and rebasing in **Git**, performing bank statement reconciliations with XLOOKUP in **Excel**, building optimized container images in **Docker**, and managing accounting entries in **Sepidar**.

### 1.2. Strict Multi-Page Architecture (No Single-Page Monolith)
To ensure optimal SEO, shareability, deep-linking, and focused user context, the application strictly adheres to a multi-page URL hierarchy:
- `/`: Central Landing Page with Google-style Omni-Search, dynamic trending chips, live flow simulator, and featured catalog.
- `/process/[slug]`: Dedicated procedural workspace with step-by-step walkthrough (menu-path boxes, screenshots, error matrix, copyable fields, persistent scratchpad).
- `/process/[slug]/print`: High-contrast, clean print view without navigation bars, designed specifically for A4 paper and PDF printing.
- `/information`: Knowledge base of administrative circulars, guidelines, technical announcements, and directives.
- `/information/[slug]`: Individual announcement/circular reading view with rich markdown/HTML rendering.
- `/systems`: Directory of all desktop/cloud software tools and government/enterprise portals.
- `/system/[slug]`: Dedicated hub for a specific software or portal listing all related procedures.
- `/organizations`: Directory of public authorities, ministries, and internal enterprise departments.
- `/dashboard`: Management dashboard for processes, systems, organizations, and announcements.

---

## 2. Core Functional Modules

### Module 1: Step Runner Walkthrough & Node Hierarchy
The core engine is a single linear walkthrough view for every procedure
(the macro flowchart canvas was removed Oct 2026 by owner decision):

- **1.1. Guided Step Runner (Execution View)**:
  - Linear, distraction-free execution mode for active task completion.
  - Step navigation breadcrumb showing the exact software menu sequence as visual boxed chips (`HRMS > Settings > Employee Master > New`).
  - Next/Previous controls with per-step completion checkboxes (persisted to localStorage and logged to active workflow runs).
  - Dedicated callouts for Step Tips (`نکات`), Warnings (`هشدارها`), and Prerequisites (`پیش‌نیازها`).
  - Step-type badges (action / decision / warning / end / sub-process) shown inline.

- **1.2. Hierarchical Sub-Processes (زیر-فرایندها)**:
  - Any step can be designated as a sub-process parent node linked to another existing process.
  - Renders with a distinct sub-flow badge in the stepper.
  - One-click drill-down opens the child procedure in a nested drawer or focused view with persistent back-navigation breadcrumbs.

> **Removed Oct 2026:** the macro flowchart canvas (1.1 old), the process
> timeline view mode (never built), the runner progress bar/celebration UI,
> and all estimated-time display.

---

### Module 2: Google-Grade Omni-Search & Real-Time Discovery
A zero-friction, single-input search architecture indexing the entire procedural and administrative universe:

- **2.1. Deep Facet Scanning Across Multiple Entities**:
  - **Processes & Steps**: Titles, summaries, department names, step instructions, menu click paths, and operational tips.
  - **Announcements & Circulars (`InformationPost`)**: Administrative directives, policy updates, technical announcements, and executive summaries.
  - **Data Attributes**: Copyable field labels (e.g., *«شماره شبا»*, *«کد ملی»*, *«کلید عمومی SSH»*) and sample values.
  - **Error Guides**: Exact error codes (e.g., `ERR-403`, `TAX-INVALID-ID`), titles, causes, and solutions.
  - **Target Systems & Domains**: Official portal names and external URLs.

- **2.2. Real-Data Quick Suggestions & Trending Queries**:
  - Replaces static placeholder chips with dynamic aggregates computed from Neon Postgres.
  - Surfaces real-time popular categories, most-searched keywords, recently updated portals, and trending circular topics.

- **2.3. Relevance Scoring Algorithm**:
  - Title exact match (180 pts), Error code match (140 pts), Announcement title match (120 pts), Step title match (100 pts), Target system match (80 pts), Copyable field match (75 pts), Tag match (40 pts), Body text match (20 pts).
  - Persian/Arabic character harmonization (ی/ي, ک/ك), numeric unification (۰-۹ to 0-9), and zero-width non-joiner (ZWNJ) handling.

- **2.4. Contextual Snippet Badges**:
  - Highlights exact match locations with human-readable badges (e.g., `⚠️ یافت شده در خطایابی گام ۲`, `📢 یافت شده در بخشنامه‌ها`).
  - Direct deep-linking: Clicking a search result jumps immediately to the matching step in the flowchart or announcement page.

---

### Module 3: Operational Helpers, Media & Rich Step Authoring
Designed to eliminate human errors and provide rich, visual instructions:

- **3.1. Structured Step Callout Boxes (`نکات، هشدارها و میانبرها`)**:
  - Standardized callout blocks inside step descriptions:
    - 💡 **نکته کاربردی (Tip)**: Shortcuts and efficiency advice.
    - ⚠️ **هشدار مهم (Warning)**: Pitfalls and irreversible consequences.
    - 📌 **توجه و الزام (Note/Mandatory)**: Legal/compliance obligations.

- **3.2. Internal In-Text Cross-Linking**:
  - Support linking directly to other procedures (`/process/[slug]`), software portals (`/system/[slug]`), or circulars (`/information/[slug]`) directly inside step instructions.
  - Clean preview chips when hovering over linked internal references.

- **3.3. Inline Single-Line Images & Screenshot Lightbox**:
  - Support inline micro-images (e.g., small UI button icons like `[📁 دکمه آپلود]`) directly inside markdown text lines.
  - Full-screen image lightbox with zoom and pan for high-resolution ERP and government portal screenshots.

- **3.4. One-Click Field Copy & Scratchpad**:
  - Sample test data, national ID formatting, regex masks, system URLs, and terminal commands copyable with one click.
  - Contextual scratchpad drawer persisted across browser refreshes and synchronized with user sessions.

---

### Module 4: Step-by-Step Error & Troubleshooting Matrix
Prevents employee work-stoppages when unexpected conditions occur:
- **4.1. Error Documentation on Each Step**:
  - Error Code, Official Title, Root Cause Analysis, step-by-step resolution instructions, and escalation contacts.
- **4.2. Global Error Matrix Directory**:
  - Reverse lookup: Searching an error code displays every workflow where this error might appear.

---

### Module 5: Screenshot Annotation Studio & Privacy Blurring
- **5.1. Visual Hotspot Pins**:
  - Interactive numbered callouts (1, 2, 3) placed directly over target UI screenshots.
- **5.2. Privacy Shield (Sensitive Data Blurring)**:
  - Built-in canvas blur/pixelate tool allowing SOP creators to redact confidential national IDs, personal phone numbers, passwords, and banking details prior to publishing.

---

### Module 6: Split-Screen & Sidecar Runner
- **6.1. Dockable Sidecar Mode**:
  - Compact 380px vertical sidebar that docks to the right side of the screen.
  - Allows employees to operate target government/internal portals (e.g., *Moadian*, *HRMS*, *Sepidar*) side-by-side with the SOP guide.
- **6.2. Picture-in-Picture / Pop-out Window**:
  - Multi-monitor pop-out support for continuous operation.

---

### Module 7: Workflow Runs & Audit Compliance Log
- **7.1. Workflow Run Instances** ✅: official execution runs with operator name,
  start timestamp, checklist progress, and step logs.
- **7.2. Supervisor Approval Gates** ❌: data fields exist but no UX enforces
  manager approval before proceeding.
- **7.3. Audit Trail Reporting** ✅: compliance audit sheet/certificate viewer
  per run.

---

### Module 8: Community Feedback & "Report UI Change" ❌ NOT BUILT
- **8.1. Outdated Step Reporting**: not implemented — no code exists.
- **8.2. Suggest an Edit Workflow**: not implemented — no code exists.

---

### Module 9: Executive & Print-Ready Export (PDF / Print)
- **9.1. Dedicated High-Contrast Print View** ✅:
  - Clean `/process/[slug]/print` route without navigation bars, optimized for A4.
- **9.2. ISO-Compliant Corporate PDF** ❌: not implemented — no branded export
  with headers, version numbers, or approval signatures.

---

### Module 10: Process Builder & Taxonomy Studio (Admin Mode)
- **10.1. Visual Process Builder & Step Inspector**: form-based
  `ProcessEditorModal` only (no drag-and-drop canvas). Includes the
  `MenuPathEditor` chip editor and rich Markdown instruction editing.
- **10.2. Thematic Category Management (مدیریت دسته‌بندی موضوعی)** ✅:
  - Admin UI for creating, editing, and organizing thematic categories.
- **10.3. Version Control & Rollback** ❌: not implemented.

### Module 11: Authoring Chrome Extension (added Oct 2026, outside original spec)
- **11.1. Interaction recorder (M1)** ✅: MV3 side panel recording click texts
  and input labels (labels-only default), browser-login token auth, single-account
  `/extension-auth` handoff; clicks land in menu-path boxes, inputs in step drafts.
- **11.2. Screenshot attach (M2)** ❌: planned, not built.
