# 🪙 3D Coin Toss Website

A modern, minimal, and realistic 3D Coin Toss website built with pure HTML5, CSS3, and Vanilla JavaScript.

## ✨ Features

- **Realistic 3D Physics:** Built using CSS 3D transforms (`perspective`, `preserve-3d`, and custom cubic-bezier easing) simulating a real toss arc, deceleration at apex, continuous forward rotations, and micro-bounce on landing.
- **Physical Coin Volume:** Custom multi-layered cylindrical edge giving true metallic thickness when rotating edge-on.
- **Minted Coin Relief:**
  - **Heads:** Classical Liberty portrait with laurel wreath, `"★ LIBERTY ★"`, `"HEADS"` banner, and `"★ 2026 ★"`.
  - **Tails:** Majestic heraldic eagle crest with shield, `"★ E PLURIBUS UNUM ★"`, `"TAILS"` banner, and `"★ ONE DOLLAR ★"`.
- **Dynamic Floor Shadow:** Ground shadow dynamically shrinks, diffuses, and blurs as the coin ascends, snapping sharp on touchdown.
- **True 50/50 Random Logic:** Strict 50% probability via `Math.random()`. Single outcome synchronizes both the 3D flip animation and the display.
- **Sound Effects:** Synchronized coin flick, air flutter, ringing harmonics, and landing tap with graceful Web Audio API synthesis fallback.
- **Minimal, Responsive UI:** Fits cleanly across desktop, tablet, and mobile screens without vertical scrollbars.

---

## 🚀 Getting Started

### Option 1: Direct File
Simply open `index.html` in any modern web browser:
```bash
# On Windows
Start-Process index.html
```

### Option 2: Local Dev Server
```bash
# Run dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **HTML5**
- **CSS3** (3D Transforms & Keyframe Animations)
- **Vanilla JavaScript** (ES6+)
- **No external frameworks or libraries**
