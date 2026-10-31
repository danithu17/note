# ScribbleNote Privacy Policy & Student Data Commitment

*Last updated: October 2026*

At **ScribbleNote**, we believe that student and professional notes, handwriting, voice memos, and lecture recordings are private intellectual property. Our platform is built from the ground up on a **local-first** architecture designed to guarantee maximum privacy, security, and data autonomy.

---

## 1. Core Principles

1. **Local-First by Default**: Your notes, canvas drawings, audio memos, and flashcards are stored locally in your browser/device database (IndexedDB via Dexie). You retain full access to your notes even completely offline.
2. **Zero Third-Party Advertising & Telemetry Tracking**: We do not sell your personal data, lecture contents, or handwriting to data brokers or advertising networks.
3. **Zero AI Training on Your Notes**: Your lecture notes, handwritten formulas, uploaded slide decks, and audio transcripts are **never** used to train commercial or public artificial intelligence models.
4. **Complete Data Portability**: You can export individual notes as Markdown + SVG, download single-note JSONs, or export full database backups at any time with one click.

---

## 2. Information We Collect

### A. Local-Only Data (Stored on Your Device)
- Handwritten vector strokes, pressure dynamics, and shape geometries.
- Text notes, Markdown content, and mathematical formulas.
- Audio recordings of lecture sessions (stored locally as compressed binary blobs).
- Spaced repetition flashcard review history and SM-2 interval states.

### B. Account & Cloud Sync Data (Optional when signing up)
- **Account Credentials**: Email address and secure password hashes (managed via Supabase Auth).
- **Encrypted Sync Outbox**: When cloud sync is enabled, your notes and vector strokes are synchronized using Postgres Row Level Security (RLS), ensuring that only your authenticated user ID can read or mutate your records.

---

## 3. Row Level Security & Multi-Tenant Isolation

All cloud data is governed by strict PostgreSQL Row Level Security (RLS) policies:
```sql
CREATE POLICY "Users can only read their own notes"
ON public.notes FOR SELECT
USING (auth.uid() = user_id);
```
No user, peer, or unauthorized third party can inspect your lecture notes, course notebooks, or flashcards.

---

## 4. Artificial Intelligence & Study Tools

When you invoke the **AI Study Assistant** (for note summaries, concept quizzes, or "Ask My Notes" Q&A):
- Only the specific text content of the active note is transmitted over an encrypted TLS connection to the secure server function.
- The content is processed statelessly in-memory to generate the summary or quiz and is not retained or cached on server disks after the request completes.

---

## 5. Data Retention, Trash & Deletion Rights (GDPR & FERPA)

- **30-Day Soft Delete Retention**: When you delete a note, it moves to the local Trash where you have 30 days to restore it before permanent automatic purge.
- **Immediate Permanent Deletion**: You can permanently delete any note, version history snapshot, or audio attachment at any time.
- **Account Erasure**: Deleting your account immediately drops all associated cloud records and storage objects in compliance with GDPR Right to Erasure.

---

## 6. Contact & Data Protection Officer

For questions regarding data privacy or student privacy rights under FERPA/GDPR, contact our privacy engineering team at `privacy@scribblenote.app`.
