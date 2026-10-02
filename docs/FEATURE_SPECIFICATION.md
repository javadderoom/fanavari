# Fanavari Platform: Comprehensive Feature Specification

## 1. Overview
This specification details all functional capabilities, user experiences, and operational components of **Fanavari**—the Intelligent Visual SOP & Flowchart Navigation Platform. It unifies our proprietary innovations with top benchmark capabilities identified from global digital adoption and workflow tools.

### 1.1. Universal Scope: Organizational Procedures & Software Workflows
The platform is designed to handle two fundamental classes of procedural knowledge:
1. **Organizational & Government Procedures (فرایندهای سازمانی و اداری)**: Regulatory portals, government tax systems (*Samaneh Moadian*), social security (*Tamin*), digital token certification (*GICA*), internal HRMS onboarding, expense reimbursement, and inventory management.
2. **Specialized Software & Tool Workflows (دستورالعمل‌ها و کار با نرم‌افزارها)**: Task-oriented, step-by-step guides for technical and office software—such as exporting clean SVGs and design tokens in **Figma**, resolving merge conflicts and rebasing in **Git**, performing bank statement reconciliations with XLOOKUP in **Excel**, building optimized container images in **Docker**, and managing accounting entries in **Sepidar**.

### 1.2. Strict Multi-Page Architecture (No Single-Page Monolith)
To ensure optimal SEO, shareability, deep-linking, and focused user context, the application strictly adheres to a multi-page URL hierarchy:
- `/`: Central Landing Page with Google-style Omni-Search, live flow simulator, and featured catalog.
- `/process/[slug]`: Dedicated, full-screen procedural workspace for each individual workflow with flowchart stepper, error matrix, copyable field presets, and persistent scratchpad.
- `/systems`: Directory of all desktop/cloud software tools and government/enterprise portals.
- `/system/[slug]`: Dedicated hub for a specific software or portal (e.g. `/system/figma`, `/system/git`, `/system/moadian`) listing all related procedures.
- `/organizations`: Directory of public authorities, ministries, and internal enterprise departments.
- `/errors`: Global searchable error database & troubleshooting directory for instant reverse-lookup.

---

## 2. Core Functional Modules

### Module 1: Dual-Mode Process Visualization
The core engine provides two complementary views for every organizational procedure:
- **1.1. Interactive Flowchart Canvas (Macro View)**:
  - Built with `@xyflow/react` (React Flow) with customized glassmorphic nodes.
  - Pan, zoom (10% to 200%), fit-to-screen, and interactive mini-map.
  - Node types:
    - *Action Nodes* (Blue accent): Standard operational steps with target system URLs and menu paths.
    - *Decision Nodes* (Amber accent): Branching conditional questions (e.g., *"Is this a permanent employee or a contractor?"* / *"Did error 500 occur?"*).
    - *Warning Nodes* (Rose accent): Critical compliance alerts, audit cautions, and irreversible actions.
    - *End Nodes* (Emerald accent): Successful completion checkpoints with hand-off summaries.
  - Animated edge connectors showing flow direction and branch conditions.
  - Path highlighting: selecting an active node illuminates the exact upstream and downstream execution paths.
- **1.2. Guided Step Runner (Micro / Walkthrough View)**:
  - Linear, distraction-free execution mode for active task completion.
  - Focused step header showing current index, total count, and estimated time remaining.
  - Step navigation breadcrumb showing the exact menu sequence in target software (e.g., `HRMS > Settings > Employee Master > New`).
  - Next/Previous controls with keyboard navigation (Arrow keys, Space to advance).

---

### Module 2: Google-Grade Omni-Search Engine
A zero-friction, single-input search architecture that eliminates manual filter dropdowns and indexes the entire procedural universe:
- **2.1. Deep Facet Scanning**:
  - Process metadata: Titles, summaries, department names, tags, and category slugs.
  - Step content: Step titles, markdown instructions, menu click paths, and operational tips.
  - Data attributes: Copyable field labels (e.g., *«شماره شبا»*, *«کد ملی»*, *«کلید عمومی SSH»*) and sample values.
  - Error guides: Exact error codes (e.g., `ERR-403`, `TAX-INVALID-ID`, `ERR-500`), error titles, causes, and solutions.
  - Target systems & domains: Official portal names and external URLs.
- **2.2. Relevance Scoring Algorithm**:
  - Match weights: Title exact match (180 pts), Error code exact match (140 pts), Step title match (100 pts), Target system match (80 pts), Copyable field match (75 pts), Tag match (40 pts), Body text match (20 pts).
  - Normalization: Persian/Arabic character harmonization (ی/ي, ک/ك), numeric unification (۰-۹ to 0-9), and zero-width non-joiner handling.
- **2.3. Contextual Snippet Extraction**:
  - Identifies the exact occurrence location with human-readable badges (e.g., `⚠️ یافت شده در خطایابی گام ۲: خطای ۴۰۳ عدم دسترسی`).
  - Highlights matched tokens with high-contrast glowing `<mark>` tags.
  - Direct deep-linking: Clicking a search result jumps immediately to the matching step in the flowchart.

---

### Module 3: Operational Scratchpad & Data Helpers
Designed to eliminate human errors when entering sensitive or formatted information:
- **3.1. One-Click Field Copy**:
  - Sample test data, national ID formatting, regex masks, system URLs, and terminal commands can be copied with a single click.
  - Visual copy feedback: animated checkmark confirmation and toast notifications.
- **3.2. Contextual Scratchpad Drawer**:
  - An inline note-taking and temporary value cache available during SOP execution.
  - Operators can temporarily hold ticket IDs, employee temporary passwords, or tracking numbers.
  - Persisted automatically to `localStorage` for immediate resume, and synchronized with Neon Postgres when authenticated.
- **3.3. Check-Off Progress Tracker**:
  - Interactive checkboxes for each step with a live visual progress indicator (e.g., *"3 of 4 steps completed • 75%"*).

---

### Module 4: Step-by-Step Error & Troubleshooting Matrix
Prevents employee work-stoppages when unexpected conditions occur:
- **4.1. Error Documentation on Each Step**:
  - Error Code & Official Title.
  - Root Cause Analysis (why the error occurs, e.g., expired token, missing permission, browser cache issue).
  - Step-by-step resolution instructions with screenshots.
  - Escalation contact: Internal department, extension number, or ticket queue responsible for resolving this error.
- **4.2. Global Error Matrix Directory**:
  - Dedicated tab displaying all potential exceptions for an entire workflow in one unified view.
  - Reverse lookup: Searching an error code across the entire organization displays every workflow where this error might appear.

---

### Module 5: Screenshot Annotation Studio & Privacy Blurring
*(Benchmark Adoption from Scribe & Folge)*
- **5.1. Visual Hotspot Pins**:
  - Interactive numbered callouts (1, 2, 3) placed directly over target UI screenshots.
  - Pulsating focus borders around target buttons and input boxes.
- **5.2. Privacy Shield (Sensitive Data Blurring)**:
  - Built-in canvas blur/pixelate tool allowing SOP creators to redact confidential national IDs, personal phone numbers, passwords, and banking details prior to publishing.
- **5.3. Image Lightbox & Zoom**:
  - High-resolution preview with pan/zoom for viewing dense, complex ERP system screenshots.

---

### Module 6: Split-Screen & Sidecar Runner
*(Benchmark Adoption from Stonly & Tango)*
- **6.1. Dockable Sidecar Mode**:
  - Minimizes the SOP guide into a compact 380px vertical sidebar that docks to the right side of the screen.
  - Allows the operator to work inside their primary business software (e.g., HRMS, Sepidar, CRM) in one window while having the SOP step runner visible in real-time.
- **6.2. Picture-in-Picture / Always-on-Top Support**:
  - Browser-native Picture-in-Picture or pop-out window for multi-monitor setups.

---

### Module 7: Workflow Runs & Audit Compliance Log
*(Benchmark Adoption from Process Street)*
- **7.1. Workflow Run Instances**:
  - Instead of just reading a guide, an employee can launch an official "Run" (e.g., *"Onboarding Run #1403-102 for New Hire Sarah Ahmadi"*).
  - Records step completion timestamps, operator ID, and notes.
- **7.2. Supervisor Approval Gates**:
  - High-risk steps (e.g., payout above credit limit, server root access) require supervisor sign-off before unlocking subsequent stages.
- **7.3. Audit Trail Reporting**:
  - Exportable compliance logs fulfilling ISO 9001 quality management audit requirements.

---

### Module 8: Community Feedback & "Report UI Change"
*(Benchmark Adoption from Tango)*
- **8.1. Outdated Step Reporting**:
  - External websites change frequently. Any employee can click *"گزارش تغییر سامانه"* on a specific step.
  - Allows quick submission of an updated screenshot and comment for admin review.
- **8.2. Suggest an Edit Workflow**:
  - Non-destructive change proposals that administrators can review and merge with one click.

---

### Module 9: Executive & Print-Ready Export (PDF / Markdown)
- **9.1. ISO-Compliant Corporate PDF**:
  - Generates an executive, beautifully styled Persian/English PDF document containing:
    - Organization header, document code, version number, and approval date.
    - Full-resolution process flowchart diagram.
    - Numbered step instructions with high-quality screenshots.
    - Error handling guide and contact directory.
- **9.2. Markdown / HTML Embed Snippets**:
  - Enables embedding individual SOP cards or mini-flows into internal company wikis (Notion, Confluence, SharePoint).

---

### Module 10: Visual Process Builder (Admin Studio)
- **10.1. No-Code Flow Builder**:
  - Drag-and-drop node placement on an infinite canvas.
  - Edge drawing to establish parent-child relationships and conditional branches.
  - Rich Markdown editor for step text, tip boxes, and copyable parameters.
- **10.2. Version Control & Rollback**:
  - Semantic versioning (v1.0, v1.1, v2.0) with change summary logs.
  - One-click rollback to prior versions in case of circular changes or regulatory rollbacks.
