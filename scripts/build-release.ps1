# ScribbleNote Release AAB (App Bundle) Build Script
$ErrorActionPreference = "Stop"

Write-Host "==> 1. Building Web Assets..." -ForegroundColor Cyan
npm run build:web

Write-Host "==> 2. Syncing Capacitor Android..." -ForegroundColor Cyan
npx cap sync android

Write-Host "==> 3. Compiling Android Release AAB..." -ForegroundColor Cyan
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
Push-Location android
try {
    .\gradlew.bat bundleRelease
} finally {
    Pop-Location
}

$sourceAab = "android\app\build\outputs\bundle\release\app-release.aab"
$outputDir = "E:\A\apk"
$targetAab = "$outputDir\ScribbleNote-release.aab"

if (Test-Path $sourceAab) {
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    Copy-Item -Path $sourceAab -Destination $targetAab -Force
    $sizeMb = [Math]::Round((Get-Item $targetAab).Length / 1MB, 2)
    Write-Host "`n[SUCCESS] Release AAB generated successfully!" -ForegroundColor Green
    Write-Host "Location: $targetAab" -ForegroundColor Green
    Write-Host "Size: $sizeMb MB" -ForegroundColor Green
} else {
    Write-Host "Build finished. Check android/app/build/outputs/ for generated artifacts."
}
