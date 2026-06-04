# FareShare — Premium Bill & Tip Calculator

FareShare is a premium, fully responsive, glassmorphic web application for splitting bills, calculating tips, and tracking calculation history. It transitions the logic of a command-line Python calculator into a high-end, responsive, accessible Single Page Application (SPA).

---

## ✨ Features

- **💎 Luxury Obsidian Aesthetic**: Premium design system styled with glassmorphism effects (`backdrop-filter`), glowing backgrounds, and elegant custom fonts (`Outfit` and `Playfair Display`).
- **📱 Fully Responsive Design**: Mobile-first architecture that reflows into a single column on smaller viewports and stacks command controls and history actions to accommodate tap targets.
- **⚡ Real-Time Calculations**: Instantly recalculates rates as you type a bill amount, select preset tip percentages, use the slider, or increment split groups.
- **🔢 Animated Transitions**: Smooth, quadratic-eased numeric counter transitions on calculation outputs.
- **💾 LocalStorage Split History**: Persistent saving of recent split entries to local browser storage, with quick options to reload or delete past splits.
- **📋 Shareable Summaries**: Instantly format and copy receipts containing itemized breakdowns (base share, tip share, totals) to the clipboard, accompanied by dynamic toast notifications.
- **♿ Optimized Accessibility**: Full ARIA markup, semantic HTML elements, keyboard navigation compatibility, and `:has()` parent form validation indicator layouts.

---

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla JavaScript (ES6+)
- **Styling**: Modern CSS3 (CSS Variables, Flexbox, CSS Grid, `:has()` and `:user-invalid` styling)
- **Dev Tooling**: [Vite](https://vitejs.dev/) for local dev server & production building

---

## 📁 File Structure

```text
Hotel_Bill_calculator/
├── index.html          # Semantic page layout, SVG logo, and output regions
├── style.css           # Styling system, glassmorphic variables, animations, and media queries
├── app.js              # State handlers, JS calculations, animations, and LocalStorage history
├── package.json        # Node script configurations and Vite dev-dependencies
├── vite.config.js      # Custom dev-server config (runs on port 3000)
├── hotel_bill.py       # Original CLI Python bill calculator
└── README.md           # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone or open the directory in your terminal:
   ```bash
   cd Hotel_Bill_calculator
   ```

2. Install Vite:
   ```bash
   npm install
   ```

### Running Locally

1. Start the Vite development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the address output in the terminal (usually `http://localhost:3000`).

### Production Build

To build the static assets for hosting:
```bash
npm run build
```
The compiled, optimized files will be generated inside the `dist/` folder.

---

## 🛡️ License

This project is open-source and available under the MIT License.
