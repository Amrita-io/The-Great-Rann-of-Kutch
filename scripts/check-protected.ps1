$protectedPaths = @(
  "src/components/Globe3D.jsx",
  "src/components/DestinationView.jsx",
  "src/components/SoundControl.jsx",
  "src/utils/audio.js",
  "src/utils/earthTexture.js",
  "src/App.jsx",
  "src/main.jsx",
  "src/index.css",
  "index.html",
  "package.json",
  "package-lock.json",
  "vite.config.js",
  "tailwind.config.js",
  "postcss.config.js",
  "public/assets/desert-aura.jpg",
  "public/assets/earth",
  "public/audio",
  "public/vid/WhatsApp Video 2026-11-09 at 5.26.53 PM.mp4",
  "public/vid/kutch_hero.mp4"
)

Write-Host "Checking protected files against baseline-v1..."
$diff = git diff --stat baseline-v1 -- $protectedPaths

if ($diff) {
  Write-Host "ERROR: Protected files have been modified since baseline-v1!" -ForegroundColor Red
  Write-Host $diff
  exit 1
} else {
  Write-Host "SUCCESS: All protected files are intact and match baseline-v1." -ForegroundColor Green
  exit 0
}
