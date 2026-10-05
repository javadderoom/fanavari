# Graph Report - fanavari  (2026-10-05)

## Corpus Check
- 179 files · ~312,232 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3105 nodes · 6947 edges · 161 communities (145 shown, 16 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 131 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `84972b8b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- live-browser.js
- checks.mjs
- index.mjs
- handleKeyDown
- resumeSession
- modern-screenshot.umd.js
- live-inject.mjs
- initPageChat
- hook-lib.mjs
- live-commit-manual-edits.mjs
- impeccable-config.mjs
- design-system.mjs
- el
- live-server.mjs
- manual-apply.mjs
- svelte-component.mjs
- process.ts
- detect-html.mjs
- hook-before-edit.mjs
- hook-admin.mjs
- hasPermission
- detect-antipatterns.mjs
- detect-antipatterns-browser.js
- css-cascade.mjs
- db-service.ts
- context.mjs
- dashboard/page.tsx
- live-wrap.mjs
- design-parser.mjs
- live-accept.mjs
- user-session-provider.tsx
- live-copy-edit-agent.mjs
- detect-url.mjs
- compilerOptions
- Responsive Design
- documentRefForElement
- live-poll.mjs
- live-manual-edit-evidence.mjs
- document.md
- impeccable/SKILL.md
- initGlobalBar
- handleManualEditActivity
- insert-ui.mjs
- dependencies
- onboard.md
- parseRgb
- devDependencies
- discoverTargetCandidates
- The Toolkit
- onAnnotDown
- manual-edit-routes.mjs
- animate.md
- Polish Systematically
- readLiveServerInfo
- Delight Techniques
- live.mjs
- impeccable-paths.mjs
- collectBrowserFindings
- colorize.md
- runHook
- Interaction Design
- Improve Copy Systematically
- UX Writing
- Phase 1: Discovery Interview
- Typography
- refreshParamsPanel
- 2. Core Functional Modules
- Generate Report
- Color & Contrast
- parseAnyColor
- resolveLengthPx
- Brand register
- layout.md
- live.md
- optimize.md
- context-signals.mjs
- scheduleLazyVisualContrast
- GENERIC_FONTS
- StaticElement
- parseRgb
- event-validation.mjs
- critique-storage.mjs
- sampleCssBackground
- scripts
- craft.md
- Simplify the Design
- Hardening Dimensions
- ui-core.mjs
- session-store.mjs
- Rules for all projects
- critique.md
- Nielsen's 10 Heuristics
- Handle `generate`
- quieter.md
- collectVisualContrastCandidates
- SAFE_TAGS
- palette.mjs
- pin.mjs
- General rules
- 2. Granular Breakdown of Global Competitors
- 2. Phase-by-Phase Execution Plan
- Craft Flow
- Generate Combined Critique Report
- Product register
- syncEditBadgeHitProxies
- Design Engineering
- Common Cognitive Load Violations
- serializeFindings
- Component Building Principles
- Flutter Architecture & Best Practices for StoryForge
- Persona-Based Design Testing
- Extract Flow
- Init Flow
- readWorkspacePatterns
- expandScanTargets
- Amplify the Design
- Cognitive Load Assessment
- $impeccable hooks
- Step 3: Ask strategic questions (for PRODUCT.md)
- CSP detection (first-time only)
- Interactive Fiction & AI Narrative Architecture
- test-all.js
- The Animation Decision Framework
- clip-path for Animation
- Performance Rules
- Gesture and Drag Interactions
- isScreenReaderOnlyTextStyle
- normalizeGitHubEvent
- syncEditBadgeHitProxies
- isGeneratedFile
- StoryForge AI Engine & Oracle Debug Guide
- CSS Transform Mastery
- The Sonner Principles (Building Loved Components)
- Spring Animations
- readConfig
- Handle fallback
- Agentation Setup
- Core Philosophy
- Debugging Animations
- Heuristics Scoring Guide
- detect.mjs
- package.json
- README.md
- AGENTS.md
- rules/graphify.md
- workflows/graphify.md
- eslint.config.mjs
- lucide-react
- next.config.ts
- pg
- @prisma/client
- react-dom
- @tiptap/extension-link
- pg
- @tiptap/extension-table-header
- @tiptap/react
- postcss.config.mjs
- migrate-deploy.js
- @tiptap/extension-highlight

## God Nodes (most connected - your core abstractions)
1. `el()` - 55 edges
2. `runHook()` - 32 edges
3. `hasPermission()` - 31 edges
4. `setLiveState()` - 29 edges
5. `handleKeyDown()` - 29 edges
6. `detectHtml()` - 28 edges
7. `initGlobalBar()` - 28 edges
8. `collectBrowserFindings()` - 26 edges
9. `buildInsertConfigureRow()` - 26 edges
10. `showToast()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `OmniSearch()` --indirect_call--> `handleKeyDown()`  [INFERRED]
  src/components/omni-search.tsx → .agents/skills/impeccable/scripts/live-browser.js
- `ProcessDetailModal()` --indirect_call--> `handleKeyDown()`  [INFERRED]
  src/components/process-detail-modal.tsx → .agents/skills/impeccable/scripts/live-browser.js
- `RichTextEditor()` --indirect_call--> `handleKeyDown()`  [INFERRED]
  src/components/rich-text-editor.tsx → .agents/skills/impeccable/scripts/live-browser.js
- `DashboardPage()` --indirect_call--> `q()`  [INFERRED]
  src/app/dashboard/page.tsx → .agents/skills/impeccable/scripts/modern-screenshot.umd.js
- `InformationClientView()` --indirect_call--> `q()`  [INFERRED]
  src/components/information-client-view.tsx → .agents/skills/impeccable/scripts/modern-screenshot.umd.js

## Import Cycles
- None detected.

## Communities (161 total, 16 thin omitted)

### Community 0 - "live-browser.js"
Cohesion: 0.03
Nodes (129): acceptedDomAlreadyClean(), applyPlaceholderSizingStyles(), applySvelteComponentVariantStyle(), averageRgb01(), bindEditBadgeProxy(), bufferToBase64(), buildCollapsible(), buildColorModels() (+121 more)

### Community 1 - "checks.mjs"
Cohesion: 0.05
Nodes (92): borderColorsFromStyle(), borderWidthsFromStyle(), checkClippedOverflow(), checkColors(), checkCreamPalette(), checkElementAIPaletteDOM(), checkElementClippedOverflow(), checkElementClippedOverflowDOM() (+84 more)

### Community 2 - "index.mjs"
Cohesion: 0.06
Nodes (68): addBrowserFindings(), addVisualContrastFindings(), addVisualContrastResult(), analyzeVisualContrast(), analyzeVisualContrastCandidate(), blendRgba(), browserColorsClose(), browserDesignSystemConfig() (+60 more)

### Community 3 - "handleKeyDown"
Cohesion: 0.09
Nodes (68): abortSvelteComponentInjection(), applyEditing(), buildLocatorForLeaf(), buildPickedAnchorSnapshot(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanup() (+60 more)

### Community 4 - "resumeSession"
Cohesion: 0.07
Nodes (62): applyOriginalAttrsToSvelteAnchor(), applySavedSessionMeta(), buildInsertPlaceholderSnapshotFromDom(), checkpointPayload(), clampVariantIndex(), clearHandled(), commitAcceptedSvelteComponentToDom(), elementMatchesOriginalMarkup() (+54 more)

### Community 5 - "modern-screenshot.umd.js"
Cohesion: 0.07
Nodes (64): extractRegister(), cli(), COMMON_DEV_PORTS, devServerSignals(), gatherSignals(), gitSignals(), hasCode(), latestCritique() (+56 more)

### Community 6 - "live-inject.mjs"
Cohesion: 0.10
Nodes (40): buffer, appendOriginToDirective(), buildTagBlock(), commentClose(), commentOpen(), CONFIG_PATH, detectLineEnding(), __dirname (+32 more)

### Community 7 - "initPageChat"
Cohesion: 0.10
Nodes (40): applyGlobalBarLabelState(), armPageChatForTyping(), buildSteerProcessingDots(), clearSteerAwaitTimer(), collapsePageChat(), configureVoiceContext(), expandPageChat(), finishVoiceSession() (+32 more)

### Community 8 - "hook-lib.mjs"
Cohesion: 0.08
Nodes (48): ACK_EXTS, applyConfigSource(), applyDetectorConfigSource(), clampByte(), clampGroupedToBudget(), clampToBudget(), cleanIgnoreValueDisplay(), CO_SCAN_STYLE_NAMES (+40 more)

### Community 9 - "live-commit-manual-edits.mjs"
Cohesion: 0.10
Nodes (50): allEntryIds(), argVal(), buildRepairBatch(), candidatesForEntry(), changedFilesSinceSnapshot(), clearAppliedEntries(), collectApplyOwnedFiles(), collectRollbackFiles() (+42 more)

### Community 10 - "impeccable-config.mjs"
Cohesion: 0.10
Nodes (48): applyDetectionConfigSource(), clampByte(), cleanIgnoreValueDisplay(), cloneDetectionConfig(), cloneRawDetectionConfig(), colorIgnoreKey(), DEFAULT_DETECTION_CONFIG, DETECTOR_CONFIG_KEYS (+40 more)

### Community 11 - "design-system.mjs"
Cohesion: 0.10
Nodes (47): addColorObject(), addDesignColor(), addRoundedScale(), addRoundedToken(), addSidecarColors(), addSidecarRadii(), addTypographyFonts(), canonicalDesignFindingKey() (+39 more)

### Community 12 - "el"
Cohesion: 0.09
Nodes (47): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+39 more)

### Community 13 - "live-server.mjs"
Cohesion: 0.09
Nodes (43): assembleLiveBrowserScript(), assertLiveBrowserScriptParts(), LIVE_BROWSER_SCRIPT_PARTS, readLiveBrowserScriptParts(), resolveLiveBrowserScriptParts(), acknowledgePendingEvent(), activeSessionSummaries(), agentPollingConnected() (+35 more)

### Community 14 - "manual-apply.mjs"
Cohesion: 0.10
Nodes (36): addOpToManualApplyChunk(), APPLY_EVENT_HARD_TIMEOUT_MS, APPLY_EVENT_SOFT_DEADLINE_MS, buildManualApplyAgentAction(), clearManualApplyTransaction(), collectManualApplyFiles(), compactManualApplyBatch(), compactManualApplyCandidates() (+28 more)

### Community 15 - "svelte-component.mjs"
Cohesion: 0.10
Nodes (44): applyLegacyDeferredAcceptsOnStartup(), appendCssToSvelteStyle(), appendSanitizedCssRule(), applyDeferredSvelteComponentAccepts(), bakeParamValuesInCss(), buildInsertVariantStub(), buildPropContract(), buildPropsScript() (+36 more)

### Community 16 - "process.ts"
Cohesion: 0.09
Nodes (33): generateStaticParams(), Props, MenuPathDisplay(), MenuPathDisplayProps, parseMenuPath(), MenuPathEditor(), MenuPathEditorProps, QUICK_SUGGESTIONS (+25 more)

### Community 17 - "detect-html.mjs"
Cohesion: 0.40
Nodes (9): addRules(), applyInlineIgnores(), getSet(), hasDirectives(), isInlineIgnored(), normalizeRule(), parseInlineIgnores(), parseRuleList() (+1 more)

### Community 18 - "hook-before-edit.mjs"
Cohesion: 0.11
Nodes (40): allow(), bumpCursorDenial(), cursorBlockMessage(), deny(), done(), escapeRegExp(), findingSignature(), firstMatch() (+32 more)

### Community 19 - "hook-admin.mjs"
Cohesion: 0.14
Nodes (39): ACTIONS, addIgnoreFile(), addIgnoreRule(), addIgnoreValue(), DETECTOR_CONFIG_KEYS, detectorSection(), fileHasImpeccableHookMarker(), HOOK_MANIFEST_TARGETS (+31 more)

### Community 20 - "hasPermission"
Cohesion: 0.09
Nodes (31): DELETE(), POST(), PUT(), DELETE(), POST(), PUT(), DELETE(), GET() (+23 more)

### Community 21 - "detect-antipatterns.mjs"
Cohesion: 0.22
Nodes (11): checkElementHeroEyebrow(), checkElementHeroEyebrowDOM(), checkElementIconTile(), checkElementIconTileDOM(), checkHeroEyebrow(), checkIconTile(), isAccentColor(), parseRadiusToPx() (+3 more)

### Community 22 - "detect-antipatterns-browser.js"
Cohesion: 0.08
Nodes (36): buildSelectorSegment(), checkBorders(), checkClippedOverflow(), checkElementBorders(), checkElementBordersDOM(), checkElementClippedOverflow(), checkElementClippedOverflowDOM(), checkElementOversizedH1() (+28 more)

### Community 23 - "css-cascade.mjs"
Cohesion: 0.08
Nodes (38): detectCsp(), INLINE_HEADER_SIGNALS, LAYOUT_EXTS, MONOREPO_HELPER_SIGNALS, NUXT_ROUTE_RULES_SIGNALS, NUXT_SECURITY_SIGNALS, SCAN_EXTS, SKIP_DIRS (+30 more)

### Community 24 - "db-service.ts"
Cohesion: 0.09
Nodes (37): ErrorsDirectoryPage(), metadata, InformationPage(), metadata, generateMetadata(), InformationDetailPage(), Props, metadata (+29 more)

### Community 25 - "context.mjs"
Cohesion: 0.05
Nodes (82): buildMissingTargetDirective(), buildResolvedContextDirective(), buildTargetSelectionDirective(), buildUpdateDirective(), cli(), compareSemver(), computeUpdateDirective(), contextSourcePath() (+74 more)

### Community 26 - "dashboard/page.tsx"
Cohesion: 0.11
Nodes (30): payload(), POST(), PUT(), DashboardPage(), AVAILABLE_ICONS, DepartmentEditorModal(), InformationEditorModal(), InformationEditorModalProps (+22 more)

### Community 27 - "live-wrap.mjs"
Cohesion: 0.13
Nodes (35): argVal(), buildInsertWrapperLines(), computeInsertLine(), INSERT_POSITIONS, insertCli(), isInsertPosition(), resolveElementMatch(), buildSvelteComponentCssAuthoring() (+27 more)

### Community 28 - "design-parser.mjs"
Cohesion: 0.15
Nodes (33): buildColor(), CANONICAL_SECTIONS, collectBullets(), collectColorValues(), collectParagraphs(), detectFormat(), extractColors(), extractComponents() (+25 more)

### Community 29 - "live-accept.mjs"
Cohesion: 0.14
Nodes (32): acceptCli(), argVal(), buildCarbonizeReplacement(), decodeHtmlAttr(), deindentContent(), detectCommentSyntax(), escapeRegExp(), expandReplaceRange() (+24 more)

### Community 30 - "user-session-provider.tsx"
Cohesion: 0.13
Nodes (14): metadata, vazirmatn, Theme, ThemeContext, ThemeContextType, ThemeProvider(), useTheme(), ThemeToggle() (+6 more)

### Community 31 - "live-copy-edit-agent.mjs"
Cohesion: 0.14
Nodes (31): applyMockWrites(), buildCopyEditBatchPrompt(), checkFrameworkSourceSyntax(), chooseCopyEditAgent(), COMMAND_AUTH_CACHE, commandAuthed(), commandExists(), compactBatchForPrompt() (+23 more)

### Community 32 - "detect-url.mjs"
Cohesion: 0.14
Nodes (24): barPaletteForTheme(), brandMarkSvg(), buildParamsPanel(), detectPageTheme(), ensureAgentPollTooltip(), fetchAgentPollingStatus(), formatRangeValue(), hideAgentPollTooltip() (+16 more)

### Community 33 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 34 - "Responsive Design"
Cohesion: 0.12
Nodes (15): Assess Adaptation Challenge, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Techniques, Mobile Adaptation (Desktop → Mobile), Navigation Adaptation (+7 more)

### Community 35 - "documentRefForElement"
Cohesion: 0.11
Nodes (37): mergeDesignSystemFindings(), detectUrl(), runVisualContrastFallback(), serializeDesignSystemForBrowser(), runTextContentAnalyzers(), buildStaticWindow(), collectStaticCssText(), detectHtml() (+29 more)

### Community 36 - "live-poll.mjs"
Cohesion: 0.18
Nodes (24): completionAckForAcceptResult(), completionTypeForAcceptResult(), augmentEventWithAcceptHandling(), buildAcceptScriptArgs(), buildPollReplyPayload(), EVENT_TYPES_NEEDING_AGENT_REPLY, fetchNextEvent(), fetchServerStatus() (+16 more)

### Community 37 - "live-manual-edit-evidence.mjs"
Cohesion: 0.16
Nodes (26): analyzeSourceHint(), buildCandidatesForOp(), buildContextHintsByRef(), buildManualEditEvidence(), collectSearchFiles(), countOps(), decodeBasicHtml(), escapeRegExp() (+18 more)

### Community 38 - "document.md"
Cohesion: 0.08
Nodes (24): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Confirm seed mode, Step 1: Find the design assets (+16 more)

### Community 39 - "impeccable/SKILL.md"
Cohesion: 0.15
Nodes (11): Assess Current Typography, Establish Hierarchy, Fix Readability, Font Selection, Improve Typography Systematically, Live-mode signature params, Plan Typography Improvements, Refine Details (+3 more)

### Community 40 - "initGlobalBar"
Cohesion: 0.18
Nodes (17): bumpEditCount(), dedupeAgainstCache(), depthIsSet(), ensureFile(), ensureSession(), findingCacheKey(), parseApplyPatchPaths(), relativize() (+9 more)

### Community 41 - "handleManualEditActivity"
Cohesion: 0.19
Nodes (24): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey(), manualEditEventForCurrentPage(), numberOrNull() (+16 more)

### Community 42 - "insert-ui.mjs"
Cohesion: 0.11
Nodes (10): canCreateInsert(), clampPlaceholderSize(), computeInsertPosition(), groupSiblingRows(), hitSiblingInsertGap(), horizontalOverlap(), insertCreateDisabledReason(), insertLineCoords() (+2 more)

### Community 43 - "dependencies"
Cohesion: 0.09
Nodes (23): agentation, next, dependencies, agentation, next, @prisma/adapter-pg, react, @tiptap/extension-table (+15 more)

### Community 44 - "onboard.md"
Cohesion: 0.12
Nodes (16): Assess Onboarding Needs, Context Over Ceremony, Design Onboarding Experiences, Documentation & Help, Feature Discovery & Adoption, Guided Tours & Walkthroughs, Implementation Patterns, Initial Product Onboarding (+8 more)

### Community 45 - "parseRgb"
Cohesion: 0.15
Nodes (28): analyzeVisualContrast(), analyzeVisualContrastCandidate(), checkColors(), checkElementAIPaletteDOM(), checkElementColors(), checkElementColorsDOM(), checkElementGlow(), checkElementGlowDOM() (+20 more)

### Community 46 - "devDependencies"
Cohesion: 0.09
Nodes (23): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss (+15 more)

### Community 47 - "discoverTargetCandidates"
Cohesion: 0.08
Nodes (30): addManualContextText(), canRestoreManualEditElement(), collectManualContextPieces(), contextElementForManualEdit(), copyEditContainerContext(), copyEditLeafContext(), cssIdent(), directMixedTextRestoreNodes() (+22 more)

### Community 48 - "The Toolkit"
Cohesion: 0.15
Nodes (12): Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Iterate with Browser Automation, Performance rules (+4 more)

### Community 49 - "onAnnotDown"
Cohesion: 0.15
Nodes (21): applyPlaceholderDimensions(), beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), clampPlaceholderSize(), finalizeEditingPin(), initAnnotOverlay() (+13 more)

### Community 50 - "manual-edit-routes.mjs"
Cohesion: 0.19
Nodes (19): args, cwd, pageUrlFilter, remaining, compactManualLogText(), summarizeManualApplyFailures(), summarizeManualDiagnostics(), summarizeManualLogFile() (+11 more)

### Community 51 - "animate.md"
Cohesion: 0.17
Nodes (11): Assess Animation Opportunities, Delight Moments, Entrance Animations, Feedback & Guidance, Implement Animations, Micro-interactions, Navigation & Flow, Plan Animation Strategy (+3 more)

### Community 52 - "Polish Systematically"
Cohesion: 0.10
Nodes (19): Clean Up, Code Quality, Color & Contrast, Content & Copy, Design System Discovery, Edge Cases & Error States, Final Verification, Forms & Inputs (+11 more)

### Community 53 - "readLiveServerInfo"
Cohesion: 0.21
Nodes (17): isLiveServerPidReachable(), readLiveServerInfo(), completeCli(), completeThroughServer(), parseArgs(), readServerInfo(), collectManualApplyFiles(), manualApplyReplyCommand() (+9 more)

### Community 54 - "Delight Techniques"
Cohesion: 0.11
Nodes (18): Appropriate to Context, Assess Delight Opportunities, Celebration Moments, Compound Over Time, Delight Amplifies, Never Blocks, Delight Principles, Delight Techniques, Easter Eggs & Hidden Delights (+10 more)

### Community 55 - "live.mjs"
Cohesion: 0.29
Nodes (14): attachSteerFocusDebug(), attachSteerFocusGuard(), clearSteerFocusRecoverTimer(), focusConfigureInput(), focusSteerChat(), notePagePointerDown(), pageHasHostTextSelection(), scheduleSteerFocusRecover() (+6 more)

### Community 56 - "impeccable-paths.mjs"
Cohesion: 0.24
Nodes (15): firstExisting(), getDesignSidecarCandidates(), getDesignSidecarPath(), getImpeccableDir(), getLegacyLiveConfigPath(), getLegacyLiveServerPath(), getLiveAnnotationsDir(), getLiveConfigPath() (+7 more)

### Community 57 - "collectBrowserFindings"
Cohesion: 0.16
Nodes (14): browserDesignSystemConfig(), browserFindingsFromMap(), browserPrimaryFont(), checkBrowserDesignSystemSources(), checkElementItalicSerif(), checkElementItalicSerifDOM(), checkHtmlPatterns(), checkItalicSerif() (+6 more)

### Community 58 - "colorize.md"
Cohesion: 0.06
Nodes (31): Apply Clarity Principles, Assess Current Copy, Avoid Redundant Copy, Button & CTA Text, Confirmation Dialogs, Confirmation Dialogs: Use Sparingly, Consistency: The Terminology Problem, Don't Blame the User (+23 more)

### Community 59 - "runHook"
Cohesion: 0.36
Nodes (8): coLocatedStylesheets(), expandScanTargets(), hasPathTraversal(), isInsideProject(), normalizeScanTargets(), parseStaticStyleImports(), STYLE_EXTS, UI_CODE_EXTS

### Community 60 - "Interaction Design"
Cohesion: 0.12
Nodes (17): CSS Anchor Positioning, Destructive Actions: Undo > Confirm, Dropdown & Overlay Positioning, Fixed Positioning Fallback, Focus Rings: Do Them Right, Form Design: The Non-Obvious, Gesture Discoverability, Interaction Design (+9 more)

### Community 61 - "Improve Copy Systematically"
Cohesion: 0.30
Nodes (13): OmniSearch(), OmniSearchProps, createSnippet(), highlightMatchText(), normalizeText(), searchAnnouncements(), searchOmni(), searchProcesses() (+5 more)

### Community 62 - "UX Writing"
Cohesion: 0.26
Nodes (12): FORBIDDEN_MANUAL_EDIT_TEXT_CHARS, INSERT_POSITIONS, isValidId(), isValidVariantId(), validateAnnotationFields(), validateEvent(), validateInsertGenerate(), validateManualEditEvent() (+4 more)

### Community 63 - "Phase 1: Discovery Interview"
Cohesion: 0.12
Nodes (15): Anti-Goals, Brief Structure, Constraints, Content & Data, Design Direction, How to use the probes, Important limits, Interview cadence (+7 more)

### Community 64 - "Typography"
Cohesion: 0.12
Nodes (16): Accessibility Considerations, Anti-reflexes worth defending against, Classic Typography Principles, Fluid Type, Font Selection & Pairing, Modern Web Typography, Modular Scale & Hierarchy, OpenType Features (+8 more)

### Community 65 - "refreshParamsPanel"
Cohesion: 0.20
Nodes (16): applyParamDefaults(), applyParamValue(), buildCyclingRow(), closedClipPath(), cycleVariant(), getVisibleVariantEl(), hideParamsPanel(), navBtn() (+8 more)

### Community 66 - "2. Core Functional Modules"
Cohesion: 0.12
Nodes (15): 1.1. Universal Scope: Organizational Procedures & Software Workflows, 1.2. Strict Multi-Page Architecture (No Single-Page Monolith), 1. Overview, 2. Core Functional Modules, Fanavari Platform: Comprehensive Feature Specification, Module 10: Process Builder & Taxonomy Studio (Admin Mode), Module 1: Multi-Mode Process Visualization & Node Hierarchy, Module 2: Google-Grade Omni-Search & Real-Time Discovery (+7 more)

### Community 67 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Anti-Patterns (CRITICAL), Anti-Patterns Verdict, Audit Health Score, Detailed Findings by Severity (+6 more)

### Community 68 - "Color & Contrast"
Cohesion: 0.13
Nodes (15): Alpha Is A Design Smell, Building Functional Palettes, Color & Contrast, Color Spaces: Use OKLCH, Contrast & Accessibility, Dangerous Color Combinations, Dark Mode Is Not Inverted Light Mode, Palette Structure (+7 more)

### Community 69 - "parseAnyColor"
Cohesion: 0.12
Nodes (21): borderColorsFromStyle(), borderWidthsFromStyle(), browserColorsClose(), browserHasDirectText(), browserRadiusTokens(), browserSampleText(), checkCreamPalette(), checkElementDesignSystemDOM() (+13 more)

### Community 70 - "resolveLengthPx"
Cohesion: 0.17
Nodes (16): checkElementQuality(), checkElementQualityDOM(), checkQuality(), checkRepeatedSectionKickers(), checkRepeatedSectionKickersDOM(), checkRepeatedSectionKickersFromDoc(), cleanInlineText(), collectRepeatedSectionKickerCandidates() (+8 more)

### Community 71 - "Brand register"
Cohesion: 0.14
Nodes (14): Brand bans (on top of the shared absolute bans), Brand permissions, Brand register, Color, Font selection procedure, Imagery, Layout, Motion (+6 more)

### Community 72 - "layout.md"
Cohesion: 0.14
Nodes (13): Assess Current Layout, Break Card Grid Monotony, Choose the Right Layout Tool, Create Visual Rhythm, Establish a Spacing System, Improve Layout Systematically, Live-mode signature params, Manage Depth & Elevation (+5 more)

### Community 73 - "live.md"
Cohesion: 0.14
Nodes (13): Cleanup, Exit, Handle `accept`, Handle `discard`, Handle `manual_edit_apply`, Handle `prefetch`, Handle `steer`, Poll loop (+5 more)

### Community 74 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), First Input Delay (FID < 100ms) / INP (< 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 75 - "context-signals.mjs"
Cohesion: 0.19
Nodes (8): HomePageContent(), FEATURES, FeaturesSection(), InteractiveFlowSimulator(), ProcessCard(), ProcessCardProps, CATEGORIES, ProcessCategoryConfig

### Community 76 - "scheduleLazyVisualContrast"
Cohesion: 0.18
Nodes (13): addBrowserFindings(), addVisualContrastFindings(), addVisualContrastResult(), clearOverlays(), detachOverlay(), disconnectLazyVisualContrastObserver(), postExtensionError(), rememberVisualContrastAnalysis() (+5 more)

### Community 77 - "GENERIC_FONTS"
Cohesion: 0.16
Nodes (17): checkPageTypography(), checkTypography(), isBrandFontOnOwnDomain(), checkStaticPageTypography(), checkBorders(), checkElementBorders(), checkElementBordersDOM(), checkPageTypography() (+9 more)

### Community 79 - "parseRgb"
Cohesion: 0.25
Nodes (8): Accessibility, CSS Animations, JavaScript Animation, Motion Materials, Perceived Performance, Performance, Technical Implementation, Timing & Easing

### Community 80 - "event-validation.mjs"
Cohesion: 0.25
Nodes (8): Accent Color Application, Background & Surfaces, Borders & Accents, Data Visualization, Decorative Elements, Introduce Color Strategically, Semantic Color, Typography Color

### Community 81 - "critique-storage.mjs"
Cohesion: 0.32
Nodes (11): kebab(), listSnapshotsForSlug(), main(), nowFilenameStamp(), parseFrontmatter(), readLatestSnapshot(), readTrend(), serializeFrontmatter() (+3 more)

### Community 82 - "sampleCssBackground"
Cohesion: 0.20
Nodes (15): blendRgba(), clampByte(), firstCssUrl(), getLayerValue(), loadVisualContrastImage(), parseObjectPosition(), parsePositionPair(), parsePositionToken() (+7 more)

### Community 83 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, build:app, dev, lint, postinstall, prisma:deploy, prisma:generate (+5 more)

### Community 84 - "craft.md"
Cohesion: 0.17
Nodes (9): After This File, Codex: Visual Direction & Asset Production, Four stop points before code, Step A: Explore Directions with the User, Step B: Generate the Brand Palette First, Step C: Generate 1-3 Visual Mocks Against the Palette, Step D: Approval Loop, Step E: Mock Fidelity Inventory (+1 more)

### Community 85 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 86 - "Hardening Dimensions"
Cohesion: 0.17
Nodes (11): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+3 more)

### Community 87 - "ui-core.mjs"
Cohesion: 0.23
Nodes (10): createLiveBrowserDomHelpers(), activeElementDeep(), appendStyleToLiveUiRoot(), appendToLiveUiRoot(), escapeCssIdent(), getLiveUiElementById(), LIVE_CHROME_MOUNT_CONTRACT, LIVE_UI_COMPONENT_IDS (+2 more)

### Community 88 - "session-store.mjs"
Cohesion: 0.24
Nodes (10): getLegacyLiveSessionsDir(), applyEvent(), baseSnapshot(), COMPLETED_PHASES, getJournalPath(), getSnapshotPath(), rebuildSnapshotFromJournal(), safeSessionId() (+2 more)

### Community 89 - "Rules for all projects"
Cohesion: 0.18
Nodes (10): Choice Options UI Rule, Database Integrity & No In-Code Fallbacks, Database Migration Rules, Git Commit Rule (No Auto-Push), Language and Communication, Large File Downloads (> 30MB), Prisma 7 Configuration Rules, RTL Text & Number/Symbol Formatting Rules (+2 more)

### Community 90 - "critique.md"
Cohesion: 0.18
Nodes (10): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Hard Invariants, Persist the Snapshot, Purpose (+2 more)

### Community 91 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 92 - "Handle `generate`"
Cohesion: 0.12
Nodes (16): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Write all variants in a single edit, 7. Parameters (composition-sized, 0–4 per variant), 8. Signal done (+8 more)

### Community 93 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Register, Simplification (+2 more)

### Community 94 - "collectVisualContrastCandidates"
Cohesion: 0.25
Nodes (8): Animate complex properties, Interact with the device, Make data feel alive, Make transitions feel cinematic, Push performance boundaries, Render beyond CSS, The Toolkit, Tie animation to scroll position

### Community 95 - "SAFE_TAGS"
Cohesion: 0.11
Nodes (33): confirm(), detectCli(), formatFindings(), formatFindingSummary(), handleStdin(), printUsage(), loadDesignSystemForCwd(), parseFrontmatter() (+25 more)

### Community 96 - "palette.mjs"
Cohesion: 0.24
Nodes (7): args, buildWeights(), hashUnit(), pickSeed(), seed, SEEDS, weightedPick()

### Community 97 - "pin.mjs"
Cohesion: 0.25
Nodes (9): __dirname, findHarnessDirs(), generatePinnedSkill(), HARNESS_DIRS, loadCommandMetadata(), pin(), root, unpin() (+1 more)

### Community 98 - "General rules"
Cohesion: 0.18
Nodes (11): Absolute bans, Color, Color & Theme, Design guidance, General rules, Interaction, Layout, Motion (+3 more)

### Community 99 - "2. Granular Breakdown of Global Competitors"
Cohesion: 0.18
Nodes (10): 1. Executive Summary, 2.1. Scribe (scribehow.com), 2.2. Tango (tango.us), 2.3. Stonly (stonly.com), 2.4. Process Street (process.st), 2.5. Guidde (guidde.com) & Folge (folge.me), 2. Granular Breakdown of Global Competitors, 3. High-Value Benchmark Features to Adopt into Fanavari (+2 more)

### Community 100 - "2. Phase-by-Phase Execution Plan"
Cohesion: 0.15
Nodes (12): 1. Roadmap Architecture, 2. Phase-by-Phase Execution Plan, 3. Prioritized Master Task Backlog, Fanavari: Phased Implementation Roadmap & Execution Plan, Phase 1: Foundation, Omni-Search & Knowledge Hub (Status: ✅ COMPLETED), Phase 2: Visual Canvas, Node Differentiation & Timeline (Status: ⏳ NEXT UP / IN PROGRESS), Phase 3: Media Studio, Sub-Processes & Taxonomies (Priority: P1/P2), Phase 4: Sidecar Runner & Operator Productivity (Priority: P2) (+4 more)

### Community 101 - "Craft Flow"
Cohesion: 0.20
Nodes (10): Craft Flow, Gates: do not compress, Production bar, Step 0: Project Foundation, Step 1: Shape the Design, Step 2: Load References, Step 3: Visual Direction & Assets (Harness-Gated), Step 4: Build to Production Quality (+2 more)

### Community 102 - "Generate Combined Critique Report"
Cohesion: 0.20
Nodes (10): Anti-Patterns Verdict, Design Health Score, Generate Combined Critique Report, Minor Observations, Overall Impression, Persona Red Flags, Priority Issues, Questions to Consider (+2 more)

### Community 103 - "Product register"
Cohesion: 0.20
Nodes (9): Color, Components, Layout, Motion, Product bans (on top of the shared absolute bans), Product permissions, Product register, The product slop test (+1 more)

### Community 104 - "syncEditBadgeHitProxies"
Cohesion: 0.14
Nodes (13): AdministrativeTimelineView(), AdministrativeTimelineViewProps, getCurrentPersianMonth(), PERSIAN_MONTHS, SEASON_CONFIG, DepartmentEditorModalProps, InformationClientView(), InformationClientViewProps (+5 more)

### Community 105 - "Design Engineering"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 106 - "Common Cognitive Load Violations"
Cohesion: 0.22
Nodes (9): 1. The Wall of Options, 2. The Memory Bridge, 3. The Hidden Navigation, 4. The Jargon Barrier, 5. The Visual Noise Floor, 6. The Inconsistent Pattern, 7. The Multi-Task Demand, 8. The Context Switch (+1 more)

### Community 107 - "serializeFindings"
Cohesion: 0.32
Nodes (8): checkElementTextOverflowDOM(), classSelector(), clippedByInset(), clippedByRect(), expandBoxShorthand(), firstMetricLengthPx(), isScreenReaderOnlyTextStyle(), metricLengthPx()

### Community 108 - "Component Building Principles"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 109 - "Flutter Architecture & Best Practices for StoryForge"
Cohesion: 0.25
Nodes (7): 1. Core Architecture (Feature-First), 2. State Management (Riverpod), 3. Reader Typography & UX Principles, 4. Choice & Action Interface, 5. Modern Dart & Widget Construction Idioms, Flutter Architecture & Best Practices for StoryForge, Null-Aware Collection Elements (Dart 3.8+)

### Community 110 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 111 - "Extract Flow"
Cohesion: 0.25
Nodes (7): Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich, Step 5: Migrate, Step 6: Document

### Community 112 - "Init Flow"
Cohesion: 0.13
Nodes (14): Accessibility & Inclusion, Brand & Personality, Init Flow, Interview mode, not confirmation mode, Minimum viable interview, Register (ask first; it shapes everything below), Step 1: Load current state, Step 2: Explore the codebase (+6 more)

### Community 113 - "readWorkspacePatterns"
Cohesion: 0.33
Nodes (6): Contextual Help, Empty State Design, How to Get Started, Visual Interest, What Will Be Here, Why It Matters

### Community 114 - "expandScanTargets"
Cohesion: 0.20
Nodes (10): Breakpoints: Content-Driven, Detect Input Method, Not Just Screen Size, Layout Adaptation Patterns, Mobile-First: Write It Right, Picture Element for Art Direction, Responsive Design, Responsive Images: Get It Right, Safe Areas: Handle the Notch (+2 more)

### Community 115 - "Amplify the Design"
Cohesion: 0.17
Nodes (11): Amplify the Design, Assess Current State, Color Intensification, Composition Boldness, Motion & Animation, Plan Amplification, Register, Spatial Drama (+3 more)

### Community 116 - "Cognitive Load Assessment"
Cohesion: 0.29
Nodes (7): Cognitive Load Assessment, Cognitive Load Checklist, Extraneous Load: Bad Design, Germane Load: Learning Effort, Intrinsic Load: The Task Itself, The Working Memory Rule, Three Types of Cognitive Load

### Community 117 - "$impeccable hooks"
Cohesion: 0.15
Nodes (11): Constraints, Failure modes, Flow, $impeccable hooks, Intentional findings, Routing, Commands, Hooks (+3 more)

### Community 118 - "Step 3: Ask strategic questions (for PRODUCT.md)"
Cohesion: 0.47
Nodes (6): clippedByInset(), clippedByRect(), expandBoxShorthand(), firstMetricLengthPx(), isScreenReaderOnlyTextStyle(), metricLengthPx()

### Community 119 - "CSP detection (first-time only)"
Cohesion: 0.29
Nodes (7): append-arrays, append-string, Consent prompt template, CSP detection (first-time only), Drift-heal warning, First-time setup (config missing or invalid), Troubleshooting

### Community 120 - "Interactive Fiction & AI Narrative Architecture"
Cohesion: 0.29
Nodes (6): 1. Golden Law: AI Is Narrator, Not Game Engine, 2. Action Validation Guardrail Pipeline, 3. Hierarchical Memory Management (0–10 Scoring), 4. Structured Output Format, Importance Scoring Rules:, Interactive Fiction & AI Narrative Architecture

### Community 121 - "test-all.js"
Cohesion: 0.29
Nodes (5): adapter, { Pool }, prisma, { PrismaClient }, { PrismaPg }

### Community 122 - "The Animation Decision Framework"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 123 - "clip-path for Animation"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 124 - "Performance Rules"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 125 - "Gesture and Drag Interactions"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 126 - "isScreenReaderOnlyTextStyle"
Cohesion: 0.47
Nodes (6): applyPatchText(), envProjectDir(), looksLikeApplyPatch(), normalizeGitHubEvent(), normalizeHookEvent(), parseGitHubToolArgs()

### Community 127 - "normalizeGitHubEvent"
Cohesion: 0.28
Nodes (9): checkElementMotion(), checkElementMotionDOM(), checkLayout(), checkMotion(), checkPageLayout(), isCardLike(), isCardLikeDOM(), isCardLikeFromProps() (+1 more)

### Community 128 - "syncEditBadgeHitProxies"
Cohesion: 0.33
Nodes (6): cloneDefaultConfig(), detectorSection(), hookSection(), readCache(), readConfig(), safeReadJson()

### Community 129 - "isGeneratedFile"
Cohesion: 0.70
Nodes (4): hasGeneratedHeader(), HEADER_MARKERS, isGeneratedFile(), isGitIgnored()

### Community 130 - "StoryForge AI Engine & Oracle Debug Guide"
Cohesion: 0.33
Nodes (5): 1. End-to-End Ingestion Pipeline Map, 2. Instant Triage Matrix (What File to Check), 3. Ultra-Fast Micro Test Commands, 4. Live Action Debugging in Studio UI, StoryForge AI Engine & Oracle Debug Guide

### Community 131 - "CSS Transform Mastery"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 132 - "The Sonner Principles (Building Loved Components)"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 133 - "Spring Animations"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 134 - "readConfig"
Cohesion: 0.20
Nodes (9): Accessibility, Assess Color Opportunity, Balance & Refinement, Cohesion, Live-mode signature params, Maintain Hierarchy, Plan Color Strategy, Register (+1 more)

### Community 135 - "Handle fallback"
Cohesion: 0.40
Nodes (5): Handle fallback, Step 1: Identify where the element actually lives, Step 2: Show three variants in the DOM for preview, Step 3: On accept, write to true source, Step 4: On discard, clean up the served file

### Community 136 - "Agentation Setup"
Cohesion: 0.50
Nodes (3): Agentation Setup, Notes, Steps

### Community 137 - "Core Philosophy"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 138 - "Debugging Animations"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 139 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 140 - "detect.mjs"
Cohesion: 0.50
Nodes (3): candidates, detectorPath, __dirname

### Community 141 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 142 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 147 - "lucide-react"
Cohesion: 0.36
Nodes (8): editBadgeProxyTargets(), initEditBadge(), initEditBadgeHitProxies(), positionEditBadge(), setImportantStyle(), styleEditBadgeProxy(), syncEditBadgeHitProxies(), usesShadowChromeRoot()

## Knowledge Gaps
- **768 isolated node(s):** `COMMON_DEV_PORTS`, `SOURCE_DIRS`, `PRODUCT_NAMES`, `DESIGN_NAMES`, `FALLBACK_DIRS` (+763 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `live-browser.js`, `checks.mjs`, `index.mjs`, `documentRefForElement`, `refreshParamsPanel`, `parseAnyColor`, `resolveLengthPx`, `detect-url.mjs`, `initPageChat`, `handleKeyDown`, `design-system.mjs`, `GENERIC_FONTS`, `parseRgb`, `detect-antipatterns-browser.js`, `css-cascade.mjs`, `collectBrowserFindings`, `normalizeGitHubEvent`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `buffer` connect `live-inject.mjs` to `isGeneratedFile`, `initGlobalBar`, `live-server.mjs`, `hook-before-edit.mjs`, `manual-edit-routes.mjs`, `css-cascade.mjs`, `SAFE_TAGS`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `q()` connect `modern-screenshot.umd.js` to `syncEditBadgeHitProxies`, `dashboard/page.tsx`, `live-wrap.mjs`, `Improve Copy Systematically`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 29 inferred relationships involving `el()` (e.g. with `browserFindingsFromMap()` and `collectVisualContrastCandidates()`) actually correct?**
  _`el()` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `handleKeyDown()` (e.g. with `init()` and `teardown()`) actually correct?**
  _`handleKeyDown()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `COMMON_DEV_PORTS`, `SOURCE_DIRS`, `PRODUCT_NAMES` to the rest of the system?**
  _768 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `live-browser.js` be split into smaller, more focused modules?**
  _Cohesion score 0.03134397409206569 - nodes in this community are weakly interconnected._