# ScribbleNote Android Guide & Release Documentation

## 1. Overview
ScribbleNote uses a single, shared React TypeScript codebase wrapped with Capacitor 8 as a native Android application.

- **Package / Application ID**: `com.scribblenote.app`
- **Application Name**: `ScribbleNote`
- **Minimum SDK**: 24 (Android 7.0 Nougat)
- **Target SDK**: 36 (Android 16 / Latest Google Play requirement)
- **Compile SDK**: 36
- **Architecture**: Single codebase with an isolated Platform Abstraction Layer (`src/platform/`).

---

## 2. Platform Abstraction Layer (`src/platform/`)
The UI components never invoke Capacitor or browser-specific globals directly. Feature detection (`Capacitor.isNativePlatform()`) dynamically routes all operations through dedicated platform adapters:

| Capability | Interface | Web Implementation | Android Implementation |
| :--- | :--- | :--- | :--- |
| **Files & Storage** | `IStoragePlatform` | Blob URL download / `<input file>` | `@capacitor/filesystem` (Documents / Cache) |
| **Share Sheet** | `ISharePlatform` | Web Share API / Clipboard fallback | `@capacitor/share` (System Chooser) |
| **Haptics** | `IHapticsPlatform` | `navigator.vibrate` | `@capacitor/haptics` (Impact & Notification) |
| **Network Status** | `INetworkPlatform` | `window.addEventListener('online')` | `@capacitor/network` |
| **Notifications** | `INotificationsPlatform` | Web `Notification` API | `@capacitor/local-notifications` |
| **Audio Recording** | `IAudioRecorderPlatform` | Web `MediaRecorder` | Native audio stream & cache storage |
| **Authentication** | `IAuthPlatform` | Supabase OAuth browser redirect | Native Credential Manager / ID Token |
| **Subscriptions** | `IBillingPlatform` | Stripe / PayHere web checkout | Google Play Billing API |
| **App Lifecycle** | `IAppPlatform` | Window controls | `@capacitor/app` & `@capacitor/status-bar` |

---

## 3. NPM Scripts & Build Commands

| Command | Action |
| :--- | :--- |
| `npm run build:web` | Compiles TypeScript and builds Vite web assets to `dist/` |
| `npm run cap:sync` | Syncs web assets and native plugins into `android/` |
| `npm run android:debug` | Builds web app, syncs Capacitor, runs Gradle `assembleDebug`, and copies APK to `E:\A\apk\ScribbleNote-debug.apk` |
| `npm run android:dev` | Runs live reload on a connected Android phone or emulator |
| `npm run android:release` | Builds production web bundle and compiles signed release App Bundle (`.aab`) to `E:\A\apk\ScribbleNote-release.aab` |

---

## 4. How to Test the Debug APK

The debug APK has been built and placed in the separate folder:
📁 **`E:\A\apk\ScribbleNote-debug.apk`** (Size: ~5.05 MB)

### Method A: Install via ADB (Command Line)
1. Enable **Developer Options** and **USB Debugging** on your Android device.
2. Connect your device via USB cable.
3. Run:
```powershell
adb install -r "E:\A\apk\ScribbleNote-debug.apk"
```

### Method B: Direct Transfer
1. Transfer `E:\A\apk\ScribbleNote-debug.apk` to your phone via Google Drive, WhatsApp, Telegram, or USB file transfer.
2. Tap the APK file on your phone and choose **Install**. (Allow "Install unknown apps" if prompted).
3. Open **ScribbleNote**. Verify the Welcome/Auth screen appears, touch drawing works with low latency, and offline reopening works.

---

## 5. Owner Checklist: Manual Setup Steps
To prepare for Google Play Store release:

1. **Google Play Console Account**:
   - Register at [play.google.com/console](https://play.google.com/console) ($25 one-time fee).
   - Complete identity verification.

2. **Google Cloud OAuth Client (Android)**:
   - Go to Google Cloud Console > APIs & Services > Credentials.
   - Create an OAuth 2.0 Client ID for **Android**.
   - Package name: `com.scribblenote.app`.
   - Add SHA-1 fingerprint for your debug keystore AND release upload keystore.

3. **Supabase Authentication**:
   - Enable Google provider in Supabase Dashboard.
   - Configure Web Client ID & Secret.
   - For Android, Supabase accepts `signInWithIdToken({ provider: 'google', token: idToken })`.
