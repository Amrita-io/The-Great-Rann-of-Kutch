# Protected Files Registry

> [!IMPORTANT]
> The following files are strictly protected under the task Protection Rules.
> They MUST NOT be modified, renamed, moved, restyled, reformatted, or deleted.
> Any new features, sections, or styles must be implemented by adding **new** files and components using the `sx-` CSS class prefix.

---

## 1. 3D Globe, Zoom-In Animation & Landing Hero
These files render the procedural Three.js starfield, Rayleigh atmospheric shell, daytime/nighttime shaders, Gujarat coordinate tracking, celestial cartographic needle beacon, the camera dolly-zoom dive into the Great Rann of Kutch, the title *"Great Rann of Kutch / The Breathing Desert"*, and the *Start Story* frosted CTA capsule:

- `src/components/Globe3D.jsx`
- `src/utils/earthTexture.js`
- `public/assets/earth/earth_clouds.png`
- `public/assets/earth/earth_clouds_2k.jpg`
- `public/assets/earth/earth_day.jpg`
- `public/assets/earth/earth_day_2k.jpg`
- `public/assets/earth/earth_lights.png`
- `public/assets/earth/earth_night_2k.jpg`
- `public/assets/earth/earth_normal.jpg`
- `public/assets/earth/earth_specular.jpg`
- `public/assets/desert-aura.jpg`

---

## 2. Kutch Destination Hero (Musicians, Camel, Editorial Title & Nav)
These files render the auto-playing single-play hero background video (traditional Kutchi folk musicians and adorned camel), the elevated twilight sky editorial typography, the top navigation links, and the frosted *Discover ↓* button:

- `src/components/DestinationView.jsx`
- `public/vid/WhatsApp Video 2026-11-09 at 5.26.53 PM.mp4`
- `public/vid/kutch_hero.mp4`

---

## 3. Hi-Fi Sound Toggle & Audio Engine
These files render the persistent frosted audio capsule in the bottom-left corner with the 4-bar dynamic CSS equalizer, keyboard `[M]` toggle shortcut, and Web Audio API synthesizer / sound manager:

- `src/components/SoundControl.jsx`
- `src/utils/audio.js`
- `public/audio/kutch_theme.mp3`
- `public/audio/video_audio.mp3`

---

## 4. Shared Foundation, Core Layout & Typography
These files govern application mounting, view mode routing between Orbit and Destination, global typography (`Cinzel`, `Cormorant Garamond`, `Inter`, `Montserrat`), and base stylesheets:

- `src/App.jsx`
- `src/main.jsx`
- `src/index.css`
- `index.html`

---

## 5. Build & Dependency Configuration
- `package.json`
- `package-lock.json`
- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`

---

## Verification Command
To verify that none of these protected files have been modified since the `baseline-v1` tag:

```bash
bash scripts/check-protected.sh
```
