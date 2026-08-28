<div align="center">

# Still · Meditation Timer

**A calm, focused meditation & breathing timer with deep personal insights.**

Private. Offline-first. On your device.

[Live App](https://fluxmeditate.netlify.app/)

</div>

---

## ✨ Features

**🧘 Meditation Timer**
- Neumorphic progress ring with a soft, ambient dark theme
- Fullscreen countdown with pause, resume, and stop controls
- Spacebar shortcut, haptics, and a chime at the end of each session
- Optional interval bell for periodic sound cues
- Screen stays awake during a session

**🌬️ Breathing Timer**
- Guided 4-4-4-4 box breathing (inhale → hold → exhale → hold)
- Six rounds with an animated breathing orb and audio cues
- Each completed round is logged as a session

**📊 Deep Insights**
- Daily goal progress check (weekly projected pace too)
- This Week vs Last 28 Days vs Month-over-Month trends
- Bucketed time-of-day, day-of-week, and session-length breakdowns
- Longest streak, consistency over 30 days, and personal milestones
- A short weekly practice note summarizing your training

**🗂️ History & Data**
- Filter sessions by all / week / month
- Delete individual sessions, export your full history
- Backup & restore via Settings — full export/import of your data

**📱 Progressive Web App (PWA)**
- Installable — works offline after first visit, add to home screen from Settings
- App shortcuts/icons for home screen (portrait, standalone mode)
- Self-hosted fonts, so the whole app renders identically offline
- Auto-updating service worker, static asset precaching

**🔒 Private by design**
- Everything is stored locally in your browser's `localStorage`
- No accounts, no servers, no tracking — your practice stays yours

## 🧰 Built With

- [React 18](https://react.dev/)
- [Vite 5](https://vite.dev/) + `vite-plugin-pwa`
- [Material UI](https://mui.com/) (MUI v9)
- [Recharts](https://recharts.org/) for the analytics dashboard
- Custom inline SVG icons and CSS — no image dependencies
- A hand-written PNG encoder (`scripts/gen-icons.mjs`) to generate all PWA icons without external tooling

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev        # http://localhost:5173

# 3. Create a production build
npm run build      # outputs to ./dist

# 4. Preview the production build locally
npm run preview
```

## 🌍 Deployment

Works out of the box with any static host. On Netlify:

| Setting      | Value                    |
| ------------ | ------------------------ |
| Build command | `npm run build`         |
| Publish directory | `dist`             |

For full offline PWA support, make sure your host serves `sw.js` and `manifest.webmanifest` with the right headers (Netlify does this by default for `dist`).

## 🗂️ Project Structure

```
still/
├── public/                    # PWA icons + favicon (generated)
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── maskable-192.png
│   ├── maskable-512.png
│   ├── apple-touch-icon.png
│   └── favicon.png
├── scripts/
│   └── gen-icons.mjs          # Generates all PWA icons (no image tools needed)
├── src/
│   ├── pages/
│   │   ├── Timer.jsx          # Meditation + breathing timers
│   │   ├── Insights.jsx       # Recharts analytics dashboard
│   │   ├── History.jsx        # Session list, filters, delete, export
│   │   └── Settings.jsx       # Preferences + data backup/restore
│   ├── components/            # Ring, ProgressRing, TabBar, Icons, controls, boundaries
│   ├── lib/
│   │   ├── storage.js         # localStorage persistence
│   │   ├── date.js            # Timezone-safe day/streak math
│   │   ├── analytics.js       # All chart metrics engine
│   │   └── audio.js           # WebAudio chimes & bells
│   ├── App.jsx                # App shell (lazy-loaded pages)
│   └── App.css                # Design system, theme, animations
├── index.html
└── vite.config.js             # PWA + build configuration
```

## 🧠 How it works

- **Sessions** are recorded as `{ duration, timestamp, completed }` whenever a timer completes.
- **Streaks** and every insight chart are computed client-side from that local list — nothing leaves the device.
- Pages are lazy-loaded (`React.lazy`), and Recharts is code-split out of the main bundle so the timer feels instant.

## 📄 License

This project is provided for personal and educational use. Reach out if you'd like to use it commercially.