# International Benchmark & Competitive Analysis

## 1. Executive Summary
This document delivers a thorough, granular analysis of the world's leading **Digital Adoption Platforms (DAP)**, **Interactive Standard Operating Procedure (SOP) Runners**, and **Visual Process Documentation Tools**. 

While international tools have achieved high sophistication in automated screen capture and basic linear walkthroughs, they suffer from critical gaps when applied to complex operational workflows, error management, and regional requirements. By benchmarking **Scribe**, **Tango**, **Stonly**, **Process Street**, **Guidde**, and **Folge**, we identify the high-value features **Fanavari** should adopt to build a category-defining, enterprise-grade solution.

---

## 2. Granular Breakdown of Global Competitors

### 2.1. Scribe (scribehow.com)
*Core Value Proposition: Auto-generating visual how-to guides from browser and desktop clicks.*

- **Key Strengths**:
  - **Auto-Capture Engine**: Records mouse clicks and keystrokes, automatically creating annotated screenshots with glowing orange click indicators.
  - **AI Text Synthesis**: Generates concise, action-oriented instructions for each captured step (e.g., *"Click on 'Submit' button"*).
  - **Smart Privacy Redaction**: Automatically identifies and blurs passwords, credit card numbers, and PII on capture.
  - **Universal Embedding**: Embeds seamlessly into Notion, Confluence, SharePoint, and custom intranets.
- **Critical Shortcomings**:
  - **Strictly Linear**: Cannot handle non-linear decision trees, conditional branches (*"If contractor, do X; if permanent, do Y"*), or rollback paths.
  - **No Operational Context or Error Handling**: Lacks dedicated troubleshooting sections for when a user encounters system errors or timeout exceptions.
  - **Zero Execution Utilities**: Does not provide scratchpads, field calculation helpers, or temporary session state for the operator.

---

### 2.2. Tango (tango.us)
*Core Value Proposition: Interactive browser overlay guidance and SOP documentation.*

- **Key Strengths**:
  - **"Guide Me" Live Overlay**: A Chrome extension that overlays real-time guidance directly onto the live web page the user is operating on, pointing out buttons on the live DOM.
  - **Manual Hotspot & Crop Editor**: Lets creators fine-tune focus areas, add numbered badges (1, 2, 3), and add callouts.
  - **Viewer Analytics & Drop-off Detection**: Reports exact completion rates and pinpoints which step causes users to abandon the guide.
- **Critical Shortcomings**:
  - **No Macro Diagram / Flowchart View**: Forces users into a step-by-step tunnel view with no bird's-eye perspective of the overall business process.
  - **No In-Depth Data Tooling**: Lacks clipboard data presets or input scratchpads.

---

### 2.3. Stonly (stonly.com)
*Core Value Proposition: Interactive, multi-path decision trees and dynamic knowledge bases.*

- **Key Strengths**:
  - **Decision-Tree Architecture**: Allows users to choose paths based on conditions, roles, or outcomes, altering the subsequent steps dynamically.
  - **Sidecar Widget**: A floating, docked sidebar that runs adjacent to the active application without requiring tab-switching.
  - **Multi-step Forms**: Gathers feedback or user inputs right inside the guide.
- **Critical Shortcomings**:
  - **Clunky Visual Overview**: Lacks an interactive visual canvas (pan/zoom flowchart with connected edges) to grasp the full workflow architecture.
  - **High Configuration Complexity**: Creating and maintaining complex trees is time-consuming for non-technical managers.

---

### 2.4. Process Street (process.st)
*Core Value Proposition: Workflow checklist execution with team approvals and audit trails.*

- **Key Strengths**:
  - **Actionable Workflow Runs**: SOPs are not just passive articles; they are instantiated as "runs" with assignees, due dates, and tracked progress.
  - **Role-based Approvals & Gates**: Steps can be locked until a team lead or financial officer electronically approves the prior step.
  - **Audit Trail & ISO Compliance**: Generates complete logs of who completed which step, when, and with what values.
- **Critical Shortcomings**:
  - **Text-Heavy & Form-Centric**: Lacks rich visual UI screenshots, hotspots, and interactive flowchart maps.
  - **Expensive Enterprise Pricing**: Prohibitive licensing models for medium or emerging organizations.

---

### 2.5. Guidde (guidde.com) & Folge (folge.me)
*Guidde: AI-powered interactive video walkthroughs with synthetic voiceover.*
*Folge: Offline desktop capture app with advanced annotation, arrows, and blurring tools.*

- **Key Strengths**:
  - **Folge**: Unmatched image editing (custom numbered pins, pixelate/blur zones, magnifying glass callouts, high-resolution exports).
  - **Guidde**: Generates 30-second AI spoken voice guides per step, perfect for audio-visual learners.

---

## 3. High-Value Benchmark Features to Adopt into Fanavari

From this benchmark analysis, the following high-value capabilities have been identified for integration into the Fanavari platform:

| Benchmark Feature | Source Inspiration | Value to Fanavari Users | Priority |
| :--- | :--- | :--- | :--- |
| **1. Split-Screen / Sidecar Runner Mode** | Stonly & Tango | Operators can dock the step-by-step guide to the right side of their monitor while working on the target portal. | High (Phase 2) |
| **2. Screenshot Annotation & Privacy Blur** | Scribe & Folge | Allows SOP creators to highlight target buttons with numbered badges and blur sensitive national IDs, phone numbers, and credentials. | High (Phase 3) |
| **3. Change Request / "Report UI Change"** | Tango | Flag outdated steps with fresh screenshots. Status: ❌ no code exists (Phase 8). | High (Phase 8) |
| **4. Actionable Workflow Runs & Audit Log** | Process Street | Official runs with timestamps in Postgres. Status: ✅ built (Phase 5). | Medium (Phase 5) |
| **5. Step Approval Gates** | Process Street | Supervisor sign-off before critical steps. Status: ❌ fields only, no UX (Phase 5). | Medium (Phase 5) |
| **6. ISO & Audit Print-Ready Export (PDF/HTML)** | Scribe & Folge | Branded Persian PDF with flowchart, steps, compliance metadata. Status: ❌ print view only. | High (Phase 6.2) |
| **7. AI Flow Generator from Plain Text / Notes** | Scribe & Guidde | Paste circulars → draft steps. Status: ❌ not started. | Medium (Phase 6.3) |
| **8. Authoring browser extension (recorder)** | Scribe (capture) | M1 done: click/label capture → step drafts. M2 screenshots pending. | High (Phase 7, added Oct 2026) |

---

## 4. Fanavari's Defensible Market Advantages

Fanavari is strategically positioned to outperform these international tools in our target segment by uniting capabilities that no competitor has unified:

1. **Focused Step Runner + Sidecar (rescoped Oct 2026)**: where Scribe and Tango
   force a tunnel view with no overview, Fanavari keeps a single distraction-free
   linear walkthrough with menu-path breadcrumbs, error matrix, and scratchpad —
   plus a dockable sidecar for dual-window operation. (The former macro flowchart
   canvas was deliberately removed; visual overview is an explicit non-goal.)
2. **Google-Grade Omni-Search Engine**: Competitors offer basic keyword searches. Fanavari provides deep-scanning relevance scoring that searches across step titles, menu paths, copyable fields, and exact error codes (`ERR-403`).
3. **Per-Step Error & Troubleshooting Matrix**: International tools treat the "happy path" as the only path. Fanavari embeds root causes, solutions, and escalation contacts directly onto every step.
4. **Contextual Scratchpad & Clipboard Presets**: First-class support for storing intermediate variables, test IDs, and operational data during execution.
5. **Native Persian RTL & Local Infrastructure**: Flawless bidirectional typography, zero risk of data exposure to foreign cloud servers, and serverless hosting on modern stacks.
