# ScribbleNote Android Guide & Release Documentation

## 1. Overview
ScribbleNote is packaged as a high-performance native Android application using Capacitor 8, wrapping a shared React + TypeScript codebase without requiring a separate Kotlin or Flutter rewrite.

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
| **Authentication** | `IAuthPlatform` | Firebase Cloud Auth / Google popup | Native Credential Manager / ID Token |
| **Subscriptions** | `IBillingPlatform` | Stripe / PayHere web checkout | Google Play Billing API |
| **App Lifecycle** | `IAppPlatform` | Window controls | `@capacitor/app` & `@capacitor/status-bar` |

---

## 3. Real Cloud Authentication (Firebase) & Auto-Account Creation

To ensure accounts are stored in real cloud infrastructure and eliminate Supabase's free-tier SMTP 429 `"email rate limit exceeded"` error, the app connects directly to **Google Firebase Authentication**:

- **Firebase Project ID**: `chat-3af33`
- **Web App ID**: `1:542945871024:web:894c2e23d4492a2c082775`
- **Android App ID**: `1:542945871024:android:8113c26331bec4cf082775`
- **Configuration File**: [`android/app/google-services.json`](file:///E:/A/note/android/app/google-services.json)

### Auto-Account Creation Behavior:
1. **Email Sign-In**: If a user enters an email that does not exist in the database, the app automatically creates a cloud account and signs them in immediately with a 14-day Pro trial.
2. **Email Sign-Up**: If a user tries to sign up with an email that already exists, the app automatically logs them in with their password.
3. **Google Sign-In**: Automatically provisions or signs in the user account seamlessly across Web and Android.
4. **Rate Limit Immunity**: Built-in cloud fallback ensures the user is never blocked by SMTP rate limits.

### Registered Certificate Fingerprints (Google Play / Firebase Auth):
Both Debug and Release certificates are registered directly in the Firebase Android App:
- **Debug SHA-1**: `84:09:95:1C:F3:8C:A4:FE:F1:D5:E8:59:D1:9D:40:1F:AE:31:53:EB`
- **Debug SHA-256**: `6D:E6:31:4E:0F:4F:47:EF:50:BA:C4:E6:3C:00:0E:EC:61:28:E2:F1:A7:EE:41:61:16:D7:32:D9:90:55:1C:EA`
- **Release SHA-1**: `4B:41:00:16:98:C6:5F:7F:97:68:DC:BD:95:09:42:47:6B:FF:D7:B0`
- **Release SHA-256**: `3F:E6:B4:0E:44:6B:0B:06:A3:F2:31:48:FB:ED:60:C5:64:69:84:8A:AB:CF:94:85:A3:CC:66:EF:BA:68:6E:5D`

---

## 4. Native Look & Feel and Canvas Optimizations

1. **Hardware Acceleration & Desynchronized Context**:
   - Canvas context initialized with `{ desynchronized: true, alpha: true }` to bypass compositor queue and reduce input latency to near-zero for S-Pen and stylus drawing.
   - Native WebView configured with `View.LAYER_TYPE_HARDWARE`.
2. **Gesture Conflicts & System Back Gestures**:
   - System gesture exclusion zones (`setSystemGestureExclusionRects`) applied to screen edges on Android 10+ (API 29+) so drawing near screen edges does not trigger accidental back navigation.
   - `OVER_SCROLL_NEVER` configured on WebView to prevent overscroll glow / pull-to-refresh conflicts with canvas.
3. **Predictive Back Navigation (`useAndroidIntegration`)**:
   - Order: Close active modal -> Close Command Palette -> Close Shortcuts -> Close Assistant -> Close Drawer -> If on root, double-tap back within 2.5s to exit with on-screen confirmation toast.
4. **Edge-to-Edge & Theming**:
   - Android 15 edge-to-edge support enabled.
   - Status bar and navigation bar colors dynamically synchronize with light (`#f2f2f7`) and dark (`#000000`) modes.
   - Material You themed monochrome adaptive icons enabled (`mipmap-anydpi-v26/ic_launcher.xml`).
5. **Touch Targets & Keyboard**:
   - Touch targets set to >= 48dp on navigation bars and canvas tools.
   - Keyboard resize mode configured to `body` so inputs are never covered by the soft keyboard.

---

## 5. Build Artifacts & Output Directory

All build outputs are saved to:
📁 **`E:\A\apk\`**

| Artifact | File Path | Size | Description |
| :--- | :--- | :--- | :--- |
| **Debug APK** | `E:\A\apk\ScribbleNote-debug.apk` | **5.1 MB** | For local testing on connected physical devices or emulators |
| **Release AAB** | `E:\A\apk\ScribbleNote-release.aab` | **3.67 MB** | Signed production App Bundle for upload to Google Play Console |

### Build Commands:
```powershell
# Build Debug APK
npm run android:debug
# Or: powershell -ExecutionPolicy Bypass -File scripts\build-debug.ps1

# Build Signed Release AAB (Play Store)
npm run android:release
# Or: powershell -ExecutionPolicy Bypass -File scripts\build-release.ps1
```

---

## 6. How to Install and Test the Debug APK

### Method A: Install via ADB (Recommended)
1. Enable **Developer Options** and **USB Debugging** on your Android device.
2. Connect your device via USB.
3. Run:
```powershell
adb install -r "E:\A\apk\ScribbleNote-debug.apk"
```

### Method B: Direct File Transfer
1. Transfer `E:\A\apk\ScribbleNote-debug.apk` to your phone via USB, Google Drive, or messaging.
2. Tap the APK file and select **Install** (allow "Install unknown apps" if prompted).
3. Open **ScribbleNote**:
   - Enter any email & password -> automatically creates your cloud account and logs in!
   - Test stylus / touch drawing on the canvas.
   - Press the Android back button -> dismisses modals first, then confirms exit.

---

## 7. Keystore & Signing Configuration

- **Keystore Location**: [`android/app/scribblenote-upload.jks`](file:///E:/A/note/android/app/scribblenote-upload.jks)
- **Key Alias**: `scribblenote`
- **Store Password**: `ScribblePass2026!`
- **Key Password**: `ScribblePass2026!`

> [!IMPORTANT]
> **Keystore Backup**: Store `scribblenote-upload.jks` and its passwords in a secure password manager or offline drive. If this keystore is lost before Google Play App Signing is configured, you will not be able to update the app on Google Play.

---

## 8. Owner Checklist: Steps for Google Play Console Release

1. **Google Play Developer Account**:
   - Register at [play.google.com/console](https://play.google.com/console) ($25 one-time registration fee).
   - Verify identity (passport/ID and billing address).

2. **Create Application in Play Console**:
   - App Name: `ScribbleNote`
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free (with In-App Purchases / Subscriptions)

3. **Play App Signing**:
   - When creating your first release in the **Internal Testing** track, choose **Use Google-generated key** or let Google Play manage the app signing key.
   - Upload `E:\A\apk\ScribbleNote-release.aab`.

4. **Closed Testing Track (20 Testers Requirement)**:
   - For new personal developer accounts created after November 2023, Google requires a **closed test with a minimum of 20 testers opted in for at least 14 days continuously** before applying for Production access.
   - Add tester email addresses to a Google Group or email list in Play Console.
   - Share the opt-in link with your testers.

5. **Store Listing Assets**:
   - **App Icon**: 512 x 512 px PNG (32-bit, up to 1 MB).
   - **Feature Graphic**: 1024 x 500 px JPEG or 24-bit PNG.
   - **Phone Screenshots**: Minimum 4 screenshots (aspect ratio 16:9 or 9:16, e.g. 1080 x 1920 or 1080 x 2400).
   - **Tablet Screenshots**: 7-inch and 10-inch screenshots recommended.

6. **Google Play Billing Setup**:
   - In Play Console under **Monetize > Products > Subscriptions**, create:
     - `scribble_pro_monthly`
     - `scribble_pro_yearly`
     - `scribble_student_monthly`
     - `scribble_student_yearly`
   - Set up base plans and regional pricing (LKR for Sri Lanka, USD elsewhere).
