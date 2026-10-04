# Fanavari Platform: Comprehensive Feature Specification

## 1. Overview
This specification details all functional capabilities, user experiences, and operational components of **Fanavari**—the Intelligent Visual SOP & Flowchart Navigation Platform. It unifies our proprietary innovations with top benchmark capabilities identified from global digital adoption and workflow tools, and incorporates the operational requirements established in the official platform circular (*"آپدیت مورد نیاز در فناوری"*).

### 1.1. Universal Scope: Organizational Procedures & Software Workflows
The platform is designed to handle two fundamental classes of procedural knowledge:
1. **Organizational & Government Procedures (فرایندهای سازمانی و اداری)**: Regulatory portals, government tax systems (*Samaneh Moadian*), social security (*Tamin*), digital token certification (*GICA*), internal HRMS onboarding, expense reimbursement, and inventory management.
2. **Specialized Software & Tool Workflows (دستورالعمل‌ها و کار با نرم‌افزارها)**: Task-oriented, step-by-step guides for technical and office software—such as exporting clean SVGs and design tokens in **Figma**, resolving merge conflicts and rebasing in **Git**, performing bank statement reconciliations with XLOOKUP in **Excel**, building optimized container images in **Docker**, and managing accounting entries in **Sepidar**.

### 1.2. Strict Multi-Page Architecture (No Single-Page Monolith)
To ensure optimal SEO, shareability, deep-linking, and focused user context, the application strictly adheres to a multi-page URL hierarchy:
- `/`: Central Landing Page with Google-style Omni-Search, dynamic trending chips, live flow simulator, and featured catalog.
- `/process/[slug]`: Dedicated procedural workspace with multi-view switcher (Flowchart Canvas / Step Stepper / Timeline), error matrix, copyable field presets, and persistent scratchpad.
- `/process/[slug]/print`: High-contrast, clean print view without navigation bars, designed specifically for A4 paper and PDF printing.
- `/information`: Knowledge base of administrative circulars, guidelines, technical announcements, and directives.
- `/information/[slug]`: Individual announcement/circular reading view with rich markdown/HTML rendering.
- `/systems`: Directory of all desktop/cloud software tools and government/enterprise portals.
- `/system/[slug]`: Dedicated hub for a specific software or portal listing all related procedures.
- `/organizations`: Directory of public authorities, ministries, and internal enterprise departments.
- `/dashboard`: Management dashboard for processes, systems, organizations, and announcements.

---

## 2. Core Functional Modules

### Module 1: Multi-Mode Process Visualization & Node Hierarchy
The core engine provides three complementary view modes for every organizational procedure:

- **1.1. Interactive Flowchart Canvas (Macro View)**:
  - Built with `@xyflow/react` (React Flow) with customized glassmorphic nodes.
  - Pan, zoom (10% to 200%), fit-to-screen, and interactive mini-map.
  - **Strict Node Geometries & Differentiation**:
    - *Action Nodes* (Blue accent): Rectangular cards with target system URLs, step order badge, and software menu click sequence.
    - *Decision Nodes* (Amber accent): Distinct diamond geometry representing conditional questions (e.g., *"آیا خطا رخ داد؟"* / *"نوع قرارداد چیست؟"*) with dual branching edges (*"بله" / "خیر"* or labeled condition branches).
    - *Warning / Checkpoint Nodes* (Rose accent): High-contrast alert boxes highlighting mandatory audit checkpoints, security cautions, and irreversible actions.
    - *End / Terminal Nodes* (Emerald accent): Rounded double-ring pill cards indicating successful completion with hand-off summaries.
  - Animated edge connectors showing flow direction and branch conditions.
  - Path highlighting: selecting an active node illuminates the exact upstream and downstream execution paths.

- **1.2. Guided Step Runner (Micro / Walkthrough View)**:
  - Linear, distraction-free execution mode for active task completion.
  - Step navigation breadcrumb showing the exact software menu sequence as visual boxed chips (`HRMS > Settings > Employee Master > New`).
  - Next/Previous controls with keyboard navigation (Arrow keys, Space to advance).
  - Dedicated callouts for Step Tips (`نکات`), Warnings (`هشدارها`), and Prerequisites (`پیش‌نیازها`).

- **1.3. Process Timeline View Mode (Chronological Milestone View)**:
  - An alternative linear chronological milestone view.
  - Displays steps sequentially along a vertical or horizontal timeline with estimated durations, dependency markers, and completion status.
  - Optimized for managers and auditors needing a fast overview of process stages and time allocation.

- **1.4. Hierarchical Sub-Processes (زیر-فرایندها)**:
  - Any step can be designated as a sub-process parent node linked to another existing process.
  - Renders with a distinct sub-flow badge on the canvas and in the stepper.
  - One-click drill-down opens the child procedure in a nested drawer or focused view with persistent back-navigation breadcrumbs.

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
- **7.1. Workflow Run Instances**:
  - Launch an official execution run with operator name, start timestamp, and checklist progress.
- **7.2. Supervisor Approval Gates**:
  - High-risk compliance steps requiring manager approval before proceeding.
- **7.3. Audit Trail Reporting**:
  - Exportable compliance logs fulfilling ISO 9001 quality management requirements.

---

### Module 8: Community Feedback & "Report UI Change"
- **8.1. Outdated Step Reporting**:
  - Any employee can click *"گزارش تغییر سامانه"* on a specific step to submit an updated screenshot and comment for admin review.
- **8.2. Suggest an Edit Workflow**:
  - Non-destructive change proposals that administrators can review and merge with one click.

---

### Module 9: Executive & Print-Ready Export (PDF / Print)
- **9.1. Dedicated High-Contrast Print View**:
  - Clean, dedicated `/process/[slug]/print` route without navigation bars or footers.
  - Numbered step instructions, boxed menu click routes, and full error matrices optimized for A4 paper.
- **9.2. ISO-Compliant Corporate PDF**:
  - Exportable branded PDF with organization headers, document codes, version numbers, and approval signatures.

---

### Module 10: Process Builder & Taxonomy Studio (Admin Mode)
- **10.1. Visual Process Builder & Step Inspector**:
  - Drag-and-drop node placement on an infinite canvas.
  - Interactive Menu Path Box Editor (`MenuPathEditor`) with visual tag chips, reordering arrows, and raw text toggle.
  - Rich Markdown instruction editor with live preview.
- **10.2. Thematic Category Management (مدیریت دسته‌بندی موضوعی)**:
  - Admin management interface for creating, editing, and organizing thematic categories (e.g., مالی, منابع انسانی, فناوری اطلاعات, حقوقی).
  - Real-time categorization of processes and circulars for simplified filtering.
- **10.3. Version Control & Rollback**:
  - Semantic versioning (v1.0, v1.1, v2.0) with change summary logs and one-click rollback.
