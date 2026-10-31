# 📝 ScribbleNote — The Hybrid Lecture Notebook & Visual Canvas (PWA)

> **"The notebook for lectures"**: Typed lecture notes + freehand handwriting + slides + audio in ONE place. 100% offline-first, synced everywhere.

---

## 🏛️ Architecture & Tech Stack (Phase 0 Foundation)
- **Frontend**: React 19 + TypeScript (Strict mode, `@/*` path mapping)
- **Styling**: Tailwind CSS v4 (Glassmorphism, Dark/Light mode, high-contrast accessible tokens)
- **Canvas Engine**: HTML5 Canvas 2D + `perfect-freehand` with pressure sensitivity & Bezier interpolation
- **State Management**: Zustand
- **Local Persistence**: Dexie.js (IndexedDB) with versioned schema migrations (`v1` → `v2`)
- **Real-Time Sync**: BroadcastChannel mesh (`scribblenote_realtime_sync`) + cloud sync interface
- **Testing**: Vitest + React Testing Library + `fake-indexeddb` + Playwright E2E
- **Reliability**: React `ErrorBoundary` with diagnostics copy & telemetry hook, battery-efficient animation loops
- **CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`)

---

## 🚀 Key Feature Modules

### 1. Hybrid Workspace & Timeline Views
- **Split Studio View**: Side-by-side workspace with structured markdown/code on the left and visual canvas on the right. Resizable divider with double-click auto-centering.
- **Chat & Timeline Stream Feed**: Browse existing lecture notes chronologically like a conversational message stream, complete with visual diagram thumbnails, audio snippet players, tags, and quick-entry input bar.
- **Dedicated Canvas & Notes Full Views**: Single-key toggle between `Timeline Feed`, `Notes Only`, `Split Studio`, and `Canvas Only`.

### 2. Freehand Drawing & Visual Canvas
- **Tools**: Pressure-sensitive Pen, Semi-transparent Highlighter, Dual-mode Eraser (Object stroke vs Pixel), Geometric Shapes (Rect, Circle, Arrow, Line, Diamond, Flowchart), and Laser Pointer.
- **Laser Pointer**: Glowing emerald laser trail for presenting/lecturing that automatically fades out smoothly.
- **Paper Grids**: Dot Matrix, Ruled Paper (with red margin), Math Graph Grid, Isometric 3D Grid, or Blank Slate.
- **Touch & Stylus**: Palm Rejection mode, 2-finger pinch-to-zoom, 2-finger panning.
- **History**: 30-level undo/redo stack (`Ctrl+Z`, `Ctrl+Y`).

### 3. Structured Lecture Notes
- Markdown formatting, interactive checklists, code blocks with one-click copy, LaTeX math formulas (`$$...$$`), and Key Takeaway callouts.
- **Snapshot Canvas**: Embed current visual board drawing directly into lecture notes (`Ctrl+Enter`).
- **Lecture Templates**: Ready-made templates for CS/Algorithms, Physics/Calculus, and Medical/Physiology.
- **Word & Reading Time Counter**.

### 4. Audio Voice Memos
- In-note recording via `MediaRecorder` API with live elapsed timer.
- Stored offline in IndexedDB.
- Integrated playback bar.

### 5. Command Palette & Shortcuts
- **Raycast Command Palette** (`Ctrl+K`): Instant search across notes, tools, and actions.
- **Keyboard Cheatsheet** (`?`): Visual overview of all one-key shortcuts (`1`–`5`, `Tab`, `G`, `B`, `D`, `F`, `[`/`]`).
- **Tactile Sound FX**: Native Web Audio API feedback (mutable).

---

## 🏃 Scripts & Commands

```bash
# Run local dev server
npm run dev

# Run unit & integration tests
npm test

# Typecheck TypeScript
npm run typecheck

# Lint codebase
npm run lint

# Format code with Prettier
npm run format

# Production build
npm run build
```
