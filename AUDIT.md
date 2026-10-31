# 🛡️ ScribbleNote — Codebase Audit & Architectural Blueprint (Phase 0)

**Date:** 2026-10-31  
**Auditor:** Senior Product Engineer & UI/UX Architect  
**Status:** In Progress (Phase 0 Remediation)

---

## 1. Executive Summary
ScribbleNote has a solid foundational proof-of-concept combining React 19, HTML5 Canvas with `perfect-freehand`, Dexie.js for IndexedDB offline persistence, and Tailwind CSS v4. However, to transition from a weekend prototype to a **commercial, production-grade SaaS product** capable of handling thousands of students and paid professionals, several critical architectural gaps, performance traps, and security oversights must be resolved immediately.

---

## 2. Identified Issues & Remediation Plan

### 🔴 Critical Security Vulnerabilities
1. **Unprotected API Keys in LocalStorage (`src/utils/sync.ts`)**:
   - *Issue*: Cloud credentials (such as Supabase keys or Firebase API tokens) were stored in plaintext in `localStorage.getItem('scribblenote_cloud_config')`.
   - *Risk*: Vulnerable to XSS extraction by any third-party script or browser extension.
   - *Fix*: Move all sensitive operations to authenticated session tokens and server-side edge functions; never persist raw API master secrets on the client.
2. **SVG String Construction XSS in Export (`src/utils/export.ts`)**:
   - *Issue*: `exportCanvasToSvg` and `exportNoteAsMarkdownBundle` concatenated unescaped user titles, tags, and strings directly into SVG XML markup without sanitization.
   - *Fix*: Sanitize XML entities (`<`, `>`, `&`, `"`, `'`) and escape attribute values when building SVG documents.
3. **Markdown Rendering Security (`src/components/editor/LectureEditor.tsx`)**:
   - *Issue*: Custom regex-based parser rendered basic markdown lines, but lacked strict HTML escaping and sanitization for arbitrary embedded HTML.
   - *Fix*: Ensure raw HTML is safely escaped or parsed through sanitized AST before mounting in the DOM.

---

### 🟡 High-Severity Bugs & Edge Cases
1. **Endless Animation Loop / Battery Drain in `VisualCanvas.tsx`**:
   - *Issue*: The `requestAnimationFrame` loop in `VisualCanvas.tsx` ran 60fps continuously even when the laser pointer was inactive or when the browser tab was in the background.
   - *Fix*: Only schedule `requestAnimationFrame` while active laser points exist (`laserTrailRef.current.length > 0`); pause rendering when the document visibility state is hidden (`document.visibilityState === 'hidden'`).
2. **Base64 Audio Bloat in IndexedDB Notes (`src/types/note.ts` & `src/utils/audio.ts`)**:
   - *Issue*: Recorded audio was encoded into base64 data strings and stored inside the `LectureNote` record itself. A 3-minute recording generates ~2.5MB of string data, clogging note search queries and slowing down Dexie index traversal.
   - *Fix*: Separate audio recordings and images into an independent `attachments` table storing pure binary `Blob` objects, referencing notes by foreign key `noteId`.
3. **Canvas Redraw Overhead on Every Point (`src/components/canvas/VisualCanvas.tsx`)**:
   - *Issue*: `handlePointerMove` invoked `renderCanvas()` on every single sampled pointer point, iterating through the entire canvas history on every micro-movement.
   - *Fix*: Batch active point additions using requestAnimationFrame throttling; maintain an offscreen buffer for finalized strokes and only composite the active in-progress stroke on top.
4. **Unversioned Dexie Schema Without Migrations (`src/db/index.ts`)**:
   - *Issue*: Dexie schema had only `version(1)` with flat indices. Any schema modification would lead to `UpgradeError` or silent data corruption for existing users.
   - *Fix*: Implement strict versioned migrations (`v1`, `v2`, `v3`) with upgrade handlers preserving existing notes and adding support for workspaces, notebooks, pages, and trash.

---

### 🟢 Tech Debt & Architectural Deficiencies
1. **Flat / Unscaled Directory Structure**:
   - *Issue*: Code was grouped into generic top-level folders (`components/canvas`, `components/editor`, `components/layout`) without feature boundaries or separation of concerns.
   - *Fix*: Adopt a modern feature-based architecture (`features/canvas`, `features/notes`, `features/audio`, `features/sync`, `core/db`, `shared/components`).
2. **Lack of Automated Testing**:
   - *Issue*: No unit tests, store verification tests, or end-to-end regression tests existed.
   - *Fix*: Add Vitest + React Testing Library for store and utility logic, and Playwright for critical end-to-end user workflows.
3. **No Global Error Boundary**:
   - *Issue*: Uncaught React component errors resulted in a blank white screen with no fallback UI or crash logging.
   - *Fix*: Add an enterprise-grade `ErrorBoundary` with reload recovery and diagnostics.
4. **Missing Path Aliases**:
   - *Issue*: Imports used fragile relative paths (`../../store/...`, `../../types/...`).
   - *Fix*: Configure `@/*` path mapping in Vite and TypeScript.

---

## 3. Proposed Feature-Based Architecture

```
src/
├── app/                           # App root, providers, layout wrappers, error boundary
│   ├── App.tsx
│   ├── ErrorBoundary.tsx
│   └── main.tsx
├── core/                          # Cross-cutting foundational infrastructure
│   ├── db/
│   │   ├── index.ts               # Dexie database instance
│   │   ├── schema.ts              # Versioned schema definitions
│   │   └── migrations.ts          # Safe upgrade migration handlers
│   └── types/
│       ├── note.ts                # Notebook, Note, Page, CanvasElement models
│       ├── sync.ts                # Realtime sync packet models
│       └── user.ts                # Workspace & Auth profile models
├── features/                      # Domain-driven feature modules
│   ├── canvas/                    # Freehand vector engine & tools
│   │   ├── components/            # VisualCanvas, CanvasToolbar, CanvasControls, GridOverlay
│   │   ├── hooks/                 # useCanvasPointers, usePinchZoom
│   │   ├── store/                 # useCanvasStore
│   │   └── utils/                 # stroke rendering, shape geometry, hit testing
│   ├── notes/                     # Structured lecture editor & timeline
│   │   ├── components/            # LectureEditor, MarkdownToolbar, ChatTimelineView
│   │   ├── store/                 # useNoteStore
│   │   └── utils/                 # templates, word count, markdown helpers
│   ├── audio/                     # Lecture voice recorder & playback
│   │   ├── components/            # LectureRecorder, AudioPlayerBar
│   │   └── utils/                 # audio recorder Web Audio helper
│   └── sync/                      # Realtime mesh & cloud connector
│       ├── components/            # SyncModal, CloudConfig
│       └── utils/                 # BroadcastChannel mesh, conflict resolution
└── shared/                        # Reusable UI primitives & utilities
    ├── components/                # SplitPane, CommandPalette, ShortcutsModal
    └── utils/                     # export, sound FX, sanitizer
```

---

## 4. Enhanced Notes UX: Chat / Timeline Stream + Split Canvas
In accordance with user requirements:
- **Split Workspace**: When authoring a note, the user has the structured lecture text on the left and the interactive board on the right.
- **Chat / Timeline Feed Mode**: For browsing existing notes, users can toggle a conversational / timeline feed view where lecture notes appear as clean chronological cards/threads (like a modern messaging interface) with interactive previews, tags, audio snippets, and quick jump-in edit buttons.
