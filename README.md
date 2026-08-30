# Premium Tic-Tac-Toe Web Application

A feature-rich, high-aesthetic Tic-Tac-Toe game featuring an ultra-clean Light Theme, Unbeatable Minimax AI, Web Audio API sound effects, SVG vector graphics, HTML5 Canvas particle celebrations, and multiple grid sizes.

---

## ✨ Features

- 🎨 **Modern Light Aesthetics**: Soft glassmorphism cards, ambient mesh background, and vibrant blue/coral accents.
- 🚫 **Zero Emojis**: 100% SVG vector graphics used for icons and symbols.
- 🤖 **Single Player (PvE)**:
  - **Easy**: Casual semi-random play.
  - **Medium**: Blocks win paths and takes immediate wins.
  - **Impossible**: **Minimax Algorithm with Alpha-Beta Pruning** (undefeatable).
- 👥 **2-Player Local (PvP)**: Play with a friend on the same device.
- 📐 **Multiple Grid Sizes**: 3x3 (classic), 4x4, and 5x5 grids.
- 🔊 **Procedural Web Audio**: Built-in synth sound effects for moves, wins, ties, and clicks (with mute toggle).
- 🎆 **Particle Celebration**: HTML5 Canvas confetti bursts on victory.
- ✏️ **SVG Win Line**: Dynamic animated line drawn across winning combinations.
- ⏪ **Move Undo & Timer**: Undo last moves in single/multiplayer, with turn timer.
- 📊 **Match History & Scores**: LocalStorage persistence of scores and session history.
- ⌨️ **Keyboard Navigation**: Full arrow keys + Enter/Space accessibility.

---

## 🚀 Getting Started

1. Clone or download this repository:
   ```bash
   git clone https://github.com/AshleyImmanuel/tic-tac-toe.git
   cd tic-tac-toe
   ```

2. Open `index.html` in any modern web browser, or serve locally using any HTTP server:
   ```bash
   npx http-server . -p 9090
   ```

3. Navigate to `http://localhost:9090` in your web browser.

---

## 📁 Project Structure

```text
├── index.html       # Primary HTML5 structure & SVG symbol definitions
├── style.css        # Light theme styling, CSS variables, & animations
├── favicon.svg      # Custom SVG favicon icon
├── js/
│   ├── app.js       # Main game controller & UI event binding
│   ├── audio.js     # Web Audio API sound synthesizer
│   ├── minimax.js   # Minimax AI solver algorithm
│   ├── particles.js # HTML5 Canvas victory confetti system
│   └── storage.js   # LocalStorage manager for persistence
└── README.md        # Project documentation
```
