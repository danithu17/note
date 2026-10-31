# ScribbleNote: Commercial Deployment, Packaging & Store Checklist

Welcome to **ScribbleNote** — the commercial-grade, Apple-inspired lecture notebook and visual canvas.

---

## 🚀 1. Platform Running & Build Commands

### A. Web Application & PWA
- **Development**:
  ```bash
  npm run dev
  ```
- **Production Build (with Workbox PWA precaching)**:
  ```bash
  npm run build
  ```
- **Local Production Preview**:
  ```bash
  npm run preview
  ```

---

### B. PC Desktop App (Electron)
> Built specifically per your directive: **"pc ekt electron walin hdnn hode"**.

- **Running Electron Desktop locally**:
  ```bash
  npm run electron:dev
  ```
- **Architecture**:
  - `electron/main.cjs`: Native desktop process with frameless window design, macOS `hiddenInset` title bar, native save dialogs, and platform capability reporting.
  - `electron/preload.cjs`: Secure `contextBridge` sandbox isolating renderer from Node.js runtime.
  - `src/platform/index.ts`: Unified cross-platform abstraction layer routing file I/O and window controls safely.

---

### C. Android App (Capacitor)
- **Sync web assets to native Android project**:
  ```bash
  npm run build
  npm run cap:sync
  ```
- **Open in Android Studio**:
  ```bash
  npx cap open android
  ```
- **Run on connected device / emulator**:
  ```bash
  npm run android:dev
  ```

---

## 🎨 2. Apple-Grade UI & Chat-Style AI Assistant Guide

1. **Apple Human Interface Guidelines (HIG) Visual Language**:
   - **System Typography**: `-apple-system, "SF Pro Text", "SF Pro Display", Inter` with semibold headings and tight tracking.
   - **Apple Vibrancy**: Frosted glass `apple-blur` bars with `backdrop-filter: blur(25px) saturate(190%)` and 0.5px hairline separators.
   - **iOS Accent Color**: High-contrast iOS blue (`#007AFF` light / `#0A84FF` dark).
   - **Continuous Corners**: Continuous 14px–22px rounded corners and subtle multi-tier elevation shadows.

2. **Chat-Style AI Study Assistant (iMessage-Inspired)**:
   - **Shortcut**: `Cmd + J` (macOS) or `Ctrl + J` (Windows/Linux).
   - **Context Chips**: Automatically binds to the active note, selected text, or slide deck page.
   - **iMessage Speech Bubbles**: User speech bubbles on the right in iOS blue; Assistant on the left in subtle elevation fill with real-time streaming token animation.
   - **Post-Reply Instant Actions**:
     - 📥 **Insert**: Directly appends response into open lecture note markdown.
     - 📝 **Save Note**: Creates a brand-new lecture note from the response.
     - 🧠 **Flashcards**: Auto-parses Q&A pairs into the Dexie SM-2 spaced repetition deck.

3. **Commercial Landing Page**:
   - Access anytime by clicking the **ScribbleNote** logo in the header or selecting **"View ScribbleNote Landing Page"** in `Ctrl + K`.
   - Features hero showcase, interactive live feature preview tabs, Apple bento grid, pricing tiers, and a "Launch Notebook" call-to-action.

4. **Mobile Navigation Tab Bar**:
   - Native bottom tab bar on mobile (`< 768px`) with touch targets >= 44px and `env(safe-area-inset-bottom)` support:
     - 📝 **Notes** (Lecture markdown & code)
     - 🎨 **Canvas** (Full-screen freehand drawing)
     - 🤖 **Assistant** (iMessage AI study chat)
     - ⏱️ **Study** (Pomodoro focus timer & streaks)

---

## 📋 3. Release & Manual Store Checklist

### A. Google Play Store (Android)
1. **Google Play Console Account**: Register a developer account at `play.google.com/console` ($25 one-time fee).
2. **Keystore Generation**:
   ```bash
   keytool -genkey -v -keystore scribblenote-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias scribblenote
   ```
   *(Keep `scribblenote-release.jks` and credentials safe; never commit to Git).*
3. **Build Release AAB**:
   ```bash
   cd android && ./gradlew bundleRelease
   ```
4. **Store Assets**:
   - App Icon (512x512 PNG)
   - Feature Graphic (1024x500 PNG)
   - Phone Screenshots (minimum 2, 16:9 or 18:9)
   - Tablet Screenshots (7-inch and 10-inch)
   - Privacy Policy URL pointing to [`PRIVACY.md`](file:///e:/A/note/PRIVACY.md).

### B. Windows Store / PC Installer (Electron)
1. **Package Windows Installer**:
   Install `electron-builder` (`npm i -D electron-builder`) and run `npx electron-builder --win`.
2. **Code Signing (Optional for testing, required for SmartScreen bypass)**:
   - Obtain an EV or Standard Code Signing Certificate from Sectigo, DigiCert, or SSL.com.

### C. macOS Distribution (Electron)
1. **Apple Developer Program**: Register at `developer.apple.com` ($99/year).
2. **Notarization**: Submit the built `.dmg` with `xcrun notarytool` for Apple Gatekeeper notarization.
