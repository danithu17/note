# 🔐 ScribbleNote — Google OAuth & Authentication Setup Guide

This comprehensive guide details every step required to configure **Google OAuth (Sign in with Google)**, **Apple Sign-In**, and **Supabase Auth** for ScribbleNote across **Web**, **Android**, and **Cloud/Production environments**.

---

## 📋 Overview of Phase 1 Auth Specifications

- **Mandatory Authentication**: Zero anonymous or guest access. Unauthenticated users are routed directly to the Apple-grade Welcome/Auth screen.
- **Authentication Providers**:
  1. **Continue with Google** (Primary, prominent, adhering to official Google branding guidelines).
  2. **Continue with Apple** (Placeholder-ready option for the upcoming iOS release).
  3. **Email + Password** (Sign up / Log in with real-time password complexity meter).
  4. **Passwordless Magic Link** / OTP Email.
- **Session & Offline Architecture**:
  - Persistent sessions with secure refresh tokens and auto sign-in on return visits.
  - **Offline Behavior**: Users who have already signed in can continue using the app and all local notes/canvases 100% offline via cached session tokens and local Dexie IndexedDB.
  - First-time login, signup, and cloud sync require internet connectivity (with clear offline warning indicators).
- **Post-Signup Onboarding**:
  - Name, academic role, and primary subject configuration.
  - Automatic activation of the **14-Day Free Pro Scholar Trial** (10 GB cloud storage, AI study assistant, no credit card required).
- **Row-Level Security (RLS)**:
  - Automatic user profile creation via Postgres trigger on `auth.users` into `public.profiles`.

---

## 🛠️ Step 1: Google Cloud Console Configuration

### 1.1 Create or Select a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top navigation bar and select **New Project**.
3. Set the **Project Name** (e.g. `ScribbleNote` or `ScribbleNote Production`).
4. Click **Create** and ensure your newly created project is selected.

---

### 1.2 Configure the OAuth Consent Screen
1. In the left navigation menu, go to **APIs & Services** > **OAuth consent screen**.
2. Select **User Type**:
   - Choose **External** (to allow any user with a Google Account to sign in).
   - Click **Create**.
3. Fill in the **App Information**:
   - **App name**: `ScribbleNote`
   - **User support email**: Your support email address (e.g. `dnprog1@gmail.com` or `support@scribblenote.app`).
   - **App logo**: Upload the official ScribbleNote logo (500x500 PNG).
4. Fill in the **App Domain Links**:
   - **Application home page**: `https://note-eta-ten.vercel.app` (or your custom domain).
   - **Application privacy policy link**: `https://note-eta-ten.vercel.app/PRIVACY.md`
   - **Application terms of service link**: `https://note-eta-ten.vercel.app/TERMS.md`
5. **Authorized Domains**:
   - Add `supabase.co`
   - Add `vercel.app` (and your custom domain if applicable).
6. **Developer Contact Information**:
   - Enter your email address.
7. Click **Save and Continue**.
8. **Scopes**:
   - Click **Add or Remove Scopes**.
   - Select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **Update** > **Save and Continue**.
9. **Publishing Status**:
   - While testing, you can add Test Users.
   - When launching to the public, click **Publish App** to switch to **Production** status so any Google user can sign in without restriction.

---

### 1.3 Create OAuth 2.0 Client IDs

#### A. Web Client ID (Web Application)
1. Go to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** > **OAuth client ID**.
3. Set **Application type**: **Web application**.
4. Set **Name**: `ScribbleNote Web Client`.
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (Local development)
   - `http://localhost:4173` (Local preview)
   - `https://note-eta-ten.vercel.app` (Vercel production)
6. Under **Authorized redirect URIs**, add your **Supabase Auth Callback URL**:
   ```
   https://psxggugvbiuiqkdpukcn.supabase.co/auth/v1/callback
   ```
   *(If using a second instance, e.g. `xnjbvgbkrhqkglfgkeqz`, add its callback URL as well).*
7. Click **Create**.
8. **Copy your Client ID and Client Secret** securely:
   - `Client ID`: `e.g. 1234567890-abcdefg.apps.googleusercontent.com`
   - `Client Secret`: `e.g. GOCSPX-xxxxxxxxxxxxxxxxxxxx`

---

#### B. Android Client ID (Native Android / Capacitor)
1. In **APIs & Services** > **Credentials**, click **+ Create Credentials** > **OAuth client ID**.
2. Set **Application type**: **Android**.
3. Set **Name**: `ScribbleNote Android Client`.
4. Set **Package name**: `com.danithu.scribblenote` (matches `capacitor.config.ts`).
5. Set **SHA-1 certificate fingerprint**:
   - For debug:
     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
   - For release: extract the SHA-1 from your release keystore.
6. Click **Create**.

---

## ⚡ Step 2: Supabase Auth Configuration

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project (`psxggugvbiuiqkdpukcn`).
3. In the sidebar, navigate to **Authentication** > **Providers**.
4. Scroll to **Google** and toggle it **Enabled**:
   - Paste the **Client ID** obtained from Google Cloud Console.
   - Paste the **Client Secret** obtained from Google Cloud Console.
   - Ensure the displayed Callback URL matches the one added to Google Cloud Console:
     ```
     https://psxggugvbiuiqkdpukcn.supabase.co/auth/v1/callback
     ```
5. Click **Save**.

### 2.1 Verify URL Configuration in Supabase
1. In the sidebar, navigate to **Authentication** > **URL Configuration**.
2. Set **Site URL**:
   ```
   https://note-eta-ten.vercel.app
   ```
3. In **Redirect URLs**, add:
   - `http://localhost:5173`
   - `http://localhost:5173/*`
   - `https://note-eta-ten.vercel.app`
   - `https://note-eta-ten.vercel.app/*`
4. Click **Save**.

### 2.2 Account Merging & Bot Protection
1. In **Authentication** > **Providers**, ensure **"Confirm email"** and account linking are configured so that if a user signs in with Google using the same email address as an email/password account, Supabase automatically links both identities into one unified account without duplicate data.
2. In **Authentication** > **Bot Protection**, optionally enable **Cloudflare Turnstile** or **hCaptcha** to protect sign-up and sign-in endpoints from automated credential stuffing.

---

## 🗄️ Step 3: Database Profiles & RLS Automation

ScribbleNote automatically provisions user profiles upon signup using an automated trigger on `auth.users`.

The table schema is located in `src/core/supabase/sql/schema.sql`:
```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  locale text default 'en',
  plan text default 'pro',
  trial_start timestamp with time zone default now(),
  trial_end timestamp with time zone default (now() + interval '14 days'),
  study_role text,
  subject text,
  consent_version text default 'v1.0',
  consent_timestamp timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
```

---

## 📱 Step 4: Local Environment Configuration

Ensure your local `.env` file contains your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://psxggugvbiuiqkdpukcn.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

To run the app locally:
```bash
npm install
npm run dev
```

To run tests:
```bash
npm test
```

To build production bundle:
```bash
npm run build
```
