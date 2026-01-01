# EMUNI (Emergent Unification)

A physics-themed card game built with React + Vite + Tailwind.

## Run locally

```bash
npm install
npm run dev
```
# 🎲 EmUni - Emergent Unification

<div align="center">

![EmUni Logo](https://img.shields.io/badge/EmUni-v4.0-cyan?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A physics-themed card game where you bridge incompatible forces**

[Play Now](https://emuni.vercel.app) • [Game Rules](docs/RULES.md) • [Report Bug](https://github.com/YOUR_USERNAME/emuni-game/issues)

</div>

---

## 🌟 About

**EmUni (Emergent Unification)** is a strategic card game inspired by the physics challenge of unifying fundamental forces. Connect Gravity and Forces using Wiggles in this fast-paced, 15-20 minute browser game!

### ✨ Key Features

- 🎮 **Play vs AI** - Three difficulty levels
- 📚 **Interactive Tutorial** - Learn in 5 minutes
- 🎨 **Beautiful UI** - Dark quantum theme with smooth animations
- 📱 **Mobile Friendly** - Play on any device
- ⚡ **Instant Play** - No download, no signup required
- 🎯 **Strategic Depth** - Easy to learn, challenging to master

---

## 🎮 How to Play

### Goal
Be the first player to **empty your hand**!

### Game Flow
1. **Draw 1 card** (skip on first turn if you're first player)
2. **Play 1 card** to either end of The Chain
3. **End turn**

### Connection Rules

| Chain End | Can Connect |
|-----------|-------------|
| **Gravity (●)** | Gravity, Wiggle, Chaos |
| **Force (⚡)** | Force (max 2 in row), Wiggle, Chaos |
| **Wiggle (〰)** | ANYTHING (universal bridge!) |

### ⚡ UNIFY Bonus
When you play a card **adjacent to a Wiggle**, you may draw 2 extra cards!
- **Early game:** Accept to build your hand
- **Late game:** Decline to empty your hand faster

### 🃏 Card Types
- **18 Gravity** (Ball-1/2/3) - Spacetime curvature
- **12 Force** (Red/Blue/Yellow/Green) - Gauge fields
- **18 Wiggle** (Wave-1/2/3) - Universal bridge
- **6 Chaos** (Squish!/Gauge-Break!/Big Bang!) - Disruption

---

## 🚀 Quick Start

### Play Online
Visit **[emuni.vercel.app](https://emuni.vercel.app)** to play instantly!

### Run Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/emuni-game.git

# Navigate to project
cd emuni-game

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **AI Logic:** Custom rule-based engine

---

## 📁 Project Structure

```
emuni-game/
├── src/
│   ├── App.jsx          # Main game component
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind imports
├── public/
│   └── favicon.svg      # Game icon
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind settings
└── README.md            # This file
```

---

## 🎯 Game Design

### v4.0 Rules
- **54-card deck** (optimized for 15-20 min games)
- **7-card hand limit** (prevents runaway games)
- **Optional UNIFY** (strategic depth)
- **Deadlock breaker** (prevents stalemates)

### Design Philosophy
EmUni is based on real physics concepts:
- **Gravity** = General Relativity (curved spacetime)
- **Forces** = Standard Model (quantum fields)
- **Wiggles** = Theoretical bridges (gravitons, strings)
- **Chaos** = Disruption and uncertainty

The game mirrors the real challenge physicists face: **how do you connect incompatible frameworks?**

---

## 🎨 Design Credits

- **Game Design:** Prahlad Lama
- **UI/UX:** Dark quantum theme with gradient cards
- **Inspiration:** Physics, card games (Splendor, Ticket to Ride)

---

## 📊 Game Stats

- **Average game length:** 35-45 turns (~18 minutes)
- **Players:** 2-4 (currently 1 vs AI)
- **Complexity:** 3.5/10 (accessible gateway game)
- **Strategic depth:** Medium-High

---

## 🗺️ Roadmap

### v1.1 (Planned)
- [ ] Hard AI difficulty
- [ ] Sound effects
- [ ] Card animations (flip, slide)
- [ ] Game statistics tracking

### v1.2 (Future)
- [ ] Pass-and-play multiplayer (local)
- [ ] Daily challenges
- [ ] Achievement system
- [ ] Replay system

### v2.0 (Long-term)
- [ ] Online multiplayer
- [ ] Tournament mode
- [ ] Custom card skins
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

**Prahlad Lama**
- Email: emergentunification@gmail.com
- Game Design Portfolio: [Your Portfolio Link]

---

## 🙏 Acknowledgments

- Physics community for inspiration
- Anthropic Claude for development assistance
- React and Vite teams for excellent tools
- All playtesters and feedback providers

---

## 📈 Version History

- **v1.0.0** (Jan 2026) - Initial release with tutorial mode
- **v4.0** - Game rules finalized (54-card deck)
- **v3.2** - Optional UNIFY feature
- **v3.1** - Hand limit added
- **v3.0** - Core mechanics established

---

<div align="center">

**Made with ⚛️ by Prahlad Lama**

[Play Game](https://emuni.vercel.app) • [Report Bug](https://github.com/YOUR_USERNAME/emuni-game/issues) • [Request Feature](https://github.com/YOUR_USERNAME/emuni-game/issues)

</div>
