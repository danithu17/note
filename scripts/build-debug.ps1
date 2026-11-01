# ScribbleNote Debug APK Build Script
$ErrorActionPreference = "Stop"

Write-Host "==> 1. Building Web Assets..." -ForegroundColor Cyan
npm run build:web

Write-Host "==> 2. Syncing Capacitor Android..." -ForegroundColor Cyan
npx cap sync android

Write-Host "==> 3. Compiling Android Debug APK..." -ForegroundColor Cyan
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
Push-Location android
try {
    .\gradlew.bat assembleDebug
} finally {
    Pop-Location
}

$sourceApk = "android\app\build\outputs\apk\debug\app-debug.apk"
$outputDir = "E:\A\apk"
$targetApk = "$outputDir\ScribbleNote-debug.apk"

if (Test-Path $sourceApk) {
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    Copy-Item -Path $sourceApk -Destination $targetApk -Force
    $sizeMb = [Math]::Round((Get-Item $targetApk).Length / 1MB, 2)
    Write-Host "`n[SUCCESS] Debug APK generated successfully!" -ForegroundColor Green
    Write-Host "Location: $targetApk" -ForegroundColor Green
    Write-Host "Size: $sizeMb MB" -ForegroundColor Green
} else {
    Write-Error "Build finished but APK was not found at $sourceApk"
}
