# 🎡 UNILAG Chow: The Food Wheel

A modern, high-contrast, bold "spin the wheel" game designed for UNILAG (University of Lagos) students to instantly decide where to eat next on campus.

**Live Demo:** [https://unilag-food-wheel.vercel.app/](https://unilag-food-wheel.vercel.app/)

---

## 🍽️ Featured Spots

- 🔴 **Jaja New Hall Amala**
- 🟡 **Korede Spaghetti**
- 🟢 **Faculty of Arts**
- 🔵 **Cook Indomie**

---

## ✨ Features

- **Realistic Physics & Easing:** High-fidelity spinning mechanics that slow down realistically with custom easing.
- **Audio & Sound Effects:** Immersive ticker feedback sounds during spins and a celebratory victory fanfare when landing on a spot (with mute controls).
- **Confetti Explosion:** Pop-up celebration with canvas-confetti on winning a spot.
- **Bold Typography Theme:** Beautiful Swiss-style minimalist visual aesthetic utilizing high contrast, premium colors, and clean lines.

---

## 🛠️ Local Development

Follow these steps to run the project locally on your machine:

1.  **Clone or download** the project files.
2.  **Install dependencies** inside the project folder:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:3000` (or the port specified in your terminal) in your browser.

---

## 📦 Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Framer Motion** (for physical wheel rotational kinetics)
- **Canvas Confetti** (for celebrations)
- **Web Audio API** (for responsive, latency-free synthesized sounds)
