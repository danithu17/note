# 📝 ScribbleNote — Commercial-Grade Hybrid Lecture Notebook & Visual Canvas (PWA)

> **"The notebook for lectures"**: Typed lecture notes + freehand handwriting + slides + audio in ONE place. 100% offline-first, synced everywhere.

---

## 🏛️ Architecture & Tech Stack

- **Frontend**: React 19 + TypeScript (Strict mode, `@/*` path mapping)
- **Styling**: Tailwind CSS v4 (Glassmorphism design system, Dark/Light mode, high-contrast accessible tokens)
- **Canvas Engine**: HTML5 Canvas 2D + `perfect-freehand` with pressure sensitivity & Bezier interpolation
- **State Management**: Zustand
- **Local Persistence & Source of Truth**: Dexie.js (IndexedDB) with strict versioned migrations (`v1` → `v2` → `v3`)
- **Cloud Backend & Real-Time Sync**: Supabase (Postgres with Row-Level Security, Auth, Storage, and Realtime WebSocket replication)
- **Offline Mesh Fallback**: `BroadcastChannel` (`scribblenote_crdt_mesh`) + local outbox sync queue with automatic retry
- **Testing**: Vitest + React Testing Library + `fake-indexeddb` + Playwright E2E
- **Reliability**: React `ErrorBoundary` with diagnostics copy & telemetry hook, visibility-aware animation loops
- **CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`)

---

## 🚀 Phase 1 Features: Real Data Model & Cloud Sync

### 1. Hierarchy: Workspaces > Notebooks > Notes > Pages
- **Workspaces**: Multi-workspace organization (e.g., *Academic Workspace*, *Research Lab*, *Personal*).
- **Notebooks**: Course-specific subjects (e.g., *CS 204: Graph Theory*, *MATH 301: Linear Algebra*) with color badges and icons.
- **Notes**: Lecture notes with markdown, tags, inline renaming, and pinned notes.
- **Multi-Page Canvas**: Notes can contain unlimited visual canvas pages. Floating canvas page pill (`Page 1 of 3`, `[< Prev]`, `[Next >]`, `[+ Add Page]`, page switcher drawer).

### 2. Cloud Sync & Offline-First CRDT Outbox
- **Supabase Cloud Backend**:
  - Postgres tables with Row-Level Security (RLS) restricting all access to `auth.uid() = user_id`.
  - Schema migrations script located at `src/core/supabase/sql/schema.sql`.
- **Dexie Single Source of Truth**: UI reads and renders directly from IndexedDB with zero latency.
- **Background Sync Queue**: Operations are enqueued to `syncQueue` and pushed to Supabase when online.
- **Canvas CRDT Reconciliation**: Per-stroke append-only unique IDs with timestamps (`stroke_${timestamp}_${random}`). Chronologically merges incoming strokes across devices with Last-Write-Wins (LWW) conflict resolution.
- **Sync Status Pill**: Real-time status in top header: `Synced` (emerald), `Syncing` (pulsing blue), `Offline` (amber), or `Conflict` (rose).

### 3. Phase 1 Auth (Replacement): Mandatory Account & Google Sign-In
- **Rule: No Anonymous/Guest Use**: All features (notes, canvas, AI assistant, storage) require signing in. The Welcome/Auth screen gates access upon first launch.
- **Authentication Providers**:
  - **Continue with Google** (Primary button meeting official Google branding guidelines).
  - **Continue with Apple** (Placeholder-ready option for iOS App Store release).
  - **Email + Password**: Includes real-time password complexity meter (8+ chars, upper/lowercase, numbers, symbols) and email confirmation.
  - **Passwordless Magic Link**: 1-click OTP sign-in delivered to email.
- **Terms & Privacy Consent**: Checkbox on signup recording consent timestamp and version (`v1.0`).
- **Post-Signup Onboarding**: Prompts user for name, academic role, and subject, then auto-activates the **14-Day Free Pro Scholar Trial** (no credit card required).
- **Persistent Sessions & Offline Architecture**:
  - Auto sign-in on return visits via secure refresh tokens.
  - **Offline Behavior**: Previously authenticated users continue taking notes and sketches completely offline via cached sessions + Dexie IndexedDB.
  - First-time login and cloud sync require internet connectivity with automatic status indicators.
- **Account & Security Settings**: Change password, change email, sign out of all devices, and permanent account deletion (wiping Dexie and cloud data).
- **Automated Database Trigger**: `public.profiles` records created automatically via trigger on `auth.users` with Row-Level Security (RLS).
- **Setup Guide**: Detailed Google Cloud Console and Supabase setup steps documented in [SETUP.md](SETUP.md).

### 4. Version History & Snapshots
- Auto-saves snapshots on major edits or via manual checkpoint creation (*Save Snapshot*).
- Interactive revision timeline: inspect creation time, word count, drawings count, and preview markdown excerpts.
- 1-click restore with automated safety backup.

### 5. 30-Day Trash Retention
- Soft delete: accidentally deleted notes are preserved in the Trash bin for 30 days before permanent purging.
- Visual countdown: shows days remaining before deletion.
- 1-click note restore and *Empty Trash* functionality.

### 6. Binary Attachment Storage & Quota Meter
- Recorded lecture voice memos stored as binary `Blob` objects in Dexie (`attachments` table) and Supabase Storage (`scribblenote-media` bucket) instead of memory-heavy Base64 strings.
- Storage Quota visual progress bar in sidebar footer (`4.2 MB / 100 MB Free` or `10 GB Pro`).

---

## 🏃 Scripts & Commands

```bash
# Run local dev server
npm run dev

# Run all unit & integration tests
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

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

When no environment variables are provided, ScribbleNote functions seamlessly in 100% offline-first guest mode using IndexedDB and BroadcastChannel peer mesh.
