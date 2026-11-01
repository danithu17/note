# =============================================================================
# ScribbleNote — ProGuard & R8 Release Shrinking / Obfuscation Rules
# =============================================================================

# 1. Preserve JavaScript Interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 2. Preserve Capacitor Plugins and Bridge
-keep public class * extends com.getcapacitor.Plugin
-keep public class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# 3. Preserve Google Play Services & Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# 4. Preserve Line numbers and source files for Crash Reporting
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses,EnclosingMethod

# 5. Native File Provider & SQLite
-keep class androidx.core.content.FileProvider { *; }
