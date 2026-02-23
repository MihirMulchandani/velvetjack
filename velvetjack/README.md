# VelvetJack

VelvetJack is a premium, enterprise-grade 2D web-based blackjack simulator designed with restraint, elegance, and immersive interaction.

## Features

- **Premium Visual Identity**: Deep casino green, soft gold accents, and a clean, distraction-free interface.
- **Realistic Gameplay**: Authentic blackjack rules (Dealer stands on 17, Blackjack pays 3:2).
- **Smooth Animations**: CSS-based animations for dealing, chip movement, and results.
- **Persistent State**: Bankroll and stats are saved automatically to local storage.
- **Audio Feedback**: Subtle, synthesized sound effects for actions (can be toggled).
- **Responsive Design**: Works on desktop and tablet sizes.

## Architecture

VelvetJack is built with Vanilla JavaScript (ES6 Modules) and CSS3, following a strict separation of concerns:

- **/css**: Contains modular CSS files (`base`, `layout`, `components`, `animations`).
- **/js**:
  - `main.js`: Application entry point and event binding.
  - `stateManager.js`: Single source of truth for application state.
  - `gameEngine.js`: Pure functions for Blackjack logic.
  - `uiController.js`: Handles all DOM manipulation and rendering.
  - `bettingSystem.js`: Logic for chip selection and validation.
  - `storageManager.js`: Handles LocalStorage persistence.
  - `utils.js`: Helper functions.

## How to Run Locally

1. Clone the repository.
2. Open `index.html` in a modern browser.
   - Note: Because the app uses ES Modules, you must serve it via a local server (e.g., Live Server in VS Code, or `python3 -m http.server`). Opening the file directly (`file://`) will cause CORS errors.

## Future Roadmap

- **Multiplayer Mode**: WebSocket integration for live tables.
- **3D Upgrade**: WebGL implementation for realistic card physics.
- **Leaderboards**: Global ranking system.
- **Themes**: Dark mode and holiday variations.

## Credits

Designed and engineered as a portfolio-quality simulation.
No real money is involved.

---
*VelvetJack v1.0.0*
