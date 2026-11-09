#!/usr/bin/env bash
set -e

PROTECTED_PATHS=(
  "src/components/Globe3D.jsx"
  "src/components/DestinationView.jsx"
  "src/components/SoundControl.jsx"
  "src/utils/audio.js"
  "src/utils/earthTexture.js"
  "src/App.jsx"
  "src/main.jsx"
  "src/index.css"
  "index.html"
  "package.json"
  "package-lock.json"
  "vite.config.js"
  "tailwind.config.js"
  "postcss.config.js"
  "public/assets/desert-aura.jpg"
  "public/assets/earth"
  "public/audio"
  "public/vid/WhatsApp Video 2026-11-09 at 5.26.53 PM.mp4"
  "public/vid/kutch_hero.mp4"
)

echo "Checking protected files against baseline-v1..."
DIFF_OUTPUT=$(git diff --stat baseline-v1 -- "${PROTECTED_PATHS[@]}")

if [ -n "$DIFF_OUTPUT" ]; then
  echo "ERROR: Protected files have been modified since baseline-v1!"
  echo "$DIFF_OUTPUT"
  exit 1
else
  echo "SUCCESS: All protected files are intact and match baseline-v1."
  exit 0
fi
