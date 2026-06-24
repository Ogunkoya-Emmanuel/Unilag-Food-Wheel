/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence, useMotionValue, useAnimationFrame } from 'motion/react';
import { Utensils, RotateCcw, Award, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

const FOOD_SPOTS = [
  { name: 'Jaja New hall amala', color: '#FF595E' }, // Red
  { name: 'Korede Spaghetti', color: '#FFCA3A' },   // Yellow
  { name: 'Faculty of Arts', color: '#8AC926' },    // Green
  { name: 'Cook Indomie', color: '#1982C4' },       // Blue
];

// Audio Context Manager
class AudioManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  playTick() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx!.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.05);
  }

  playWin() {
    if (this.muted) return;
    this.init();
    const now = this.ctx!.currentTime;
    
    const playNote = (freq: number, delay: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.6);
    };

    playNote(523.25, 0);   // C5
    playNote(659.25, 0.1); // E5
    playNote(783.99, 0.2); // G5
    playNote(1046.50, 0.3); // C6
  }
}

const audioManager = new AudioManager();

export default function App() {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const rotation = useMotionValue(0);
  const wheelControls = useAnimation();
  const lastSliceRef = useRef(-1);

  const numSlices = FOOD_SPOTS.length;
  const sliceAngle = 360 / numSlices;

  // Sound effects listener
  useAnimationFrame(() => {
    if (!spinning) return;
    
    const currentRot = rotation.get();
    // Offset by half slice angle to align with arrow at top
    // Arrow is at 0 degrees visually (top)
    // Slices are 90 degrees offset in SVG
    const adjustedRot = (currentRot + sliceAngle / 2) % 360;
    const currentSlice = Math.floor(adjustedRot / sliceAngle);
    
    if (currentSlice !== lastSliceRef.current) {
      audioManager.playTick();
      lastSliceRef.current = currentSlice;
    }
  });

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioManager.setMuted(newMuted);
  };

  const spin = async () => {
    if (spinning) return;

    setWinner(null);
    setSpinning(true);
    
    const randomIndex = Math.floor(Math.random() * numSlices);
    const extraRotations = 5 + Math.floor(Math.random() * 5); 
    const currentRotation = rotation.get();
    
    // Calculate target so the index lands at the top (0 degrees)
    // The wheel starts with slice 0 at 0 degrees (pointing right in SVG, but we rotate -90)
    // So slice 0 is at top. We want slice 'randomIndex' to land at top.
    // That means we need to rotate by: target = (extra * 360) + (360 - (index * sliceAngle))
    const targetRotation = currentRotation + (extraRotations * 360) + (360 - (randomIndex * sliceAngle));

    await wheelControls.start({
      rotate: targetRotation,
      transition: {
        duration: 4,
        ease: [0.15, 0, 0.15, 1],
      }
    });

    setWinner(FOOD_SPOTS[randomIndex].name);
    setSpinning(false);
    audioManager.playWin();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const reset = () => {
    setWinner(null);
    rotation.set(0);
    wheelControls.set({ rotate: 0 });
    lastSliceRef.current = -1;
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-sans text-[#1D1D1F] flex flex-col items-center justify-center p-4 relative overflow-hidden" id="app-root">
      {/* Background patterns */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#FF595E] rounded-full opacity-5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#1982C4] rounded-full opacity-5 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center z-10 w-full max-w-lg"
      >
        <header className="text-center mb-10">
          <h1 className="text-6xl md:text-[84px] font-black tracking-tighter leading-none uppercase italic">
            UNILAG <span className="text-[#FF595E]">CHOW</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40 mt-2">Where are we eating today?</p>
        </header>

        {/* Wheel Container */}
        <div className="relative mb-12 group scale-90 md:scale-100">
          {/* Arrow Indicator */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 40L37.3205 10H2.67949L20 40Z" fill="#1D1D1F"/>
            </svg>
          </div>

          <motion.div
            animate={wheelControls}
            style={{ 
              width: 'min(85vw, 480px)', 
              height: 'min(85vw, 480px)',
              rotate: rotation 
            }}
            className="rounded-full border-[12px] border-[#1D1D1F] shadow-[0_0_80px_rgba(0,0,0,0.1)] relative overflow-hidden bg-white cursor-pointer"
            onClick={() => !spinning && spin()}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {FOOD_SPOTS.map((spot, i) => {
                const startAngle = i * sliceAngle;
                const endAngle = (i + 1) * sliceAngle;
                
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={spot.name}>
                    <path
                      d={d}
                      fill={spot.color}
                      stroke="#1D1D1F"
                      strokeWidth="0.5"
                    />
                    <text
                      x="72"
                      y="50"
                      fill={spot.color === '#FFCA3A' ? '#1D1D1F' : 'white'}
                      fontSize="5"
                      fontWeight="900"
                      textAnchor="middle"
                      className="uppercase"
                      transform={`rotate(${startAngle + sliceAngle / 2} 50 50)`}
                      style={{ letterSpacing: '0.02em' }}
                    >
                      {spot.name.split(' ').map((word, idx) => (
                        <tspan x="75" dy={idx === 0 ? 0 : 5.5} key={idx}>{word}</tspan>
                      ))}
                    </text>
                  </g>
                );
              })}
              <circle cx="50" cy="50" r="6" fill="#1D1D1F" />
              <circle cx="50" cy="50" r="2.5" fill="white" />
            </svg>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 w-full">
          <button
            id="spin-button"
            onClick={spin}
            disabled={spinning}
            className={`
              w-full py-6 rounded-2xl font-black text-2xl uppercase tracking-[0.1em] transition-all
              ${spinning 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95' 
                : 'bg-[#1D1D1F] text-white hover:scale-105 active:scale-95 shadow-xl'
              }
            `}
          >
            {spinning ? 'Spinning...' : 'SPIN THE WHEEL'}
          </button>

          <div className="flex gap-4">
            <button
              id="reset-button"
              onClick={reset}
              disabled={spinning}
              className="flex-1 py-4 border-2 border-[#1D1D1F] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1D1D1F] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw size={20} />
              RESET
            </button>
            <button
              id="mute-button"
              onClick={toggleMute}
              className="px-6 border-2 border-[#1D1D1F] rounded-2xl font-bold flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Result Popup */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white border-[8px] border-[#1D1D1F] p-12 rounded-[40px] w-full max-w-md text-center shadow-2xl relative"
            >
              <p className="text-sm font-black uppercase tracking-[0.3em] opacity-40 mb-2">The Winner Is</p>
              <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-8 leading-none">
                {winner}
              </h2>
              
              <button
                onClick={() => setWinner(null)}
                className="w-full py-4 bg-[#FF595E] text-white rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Sapa Avoided!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="absolute bottom-6 left-0 right-0 text-center text-[10px] uppercase font-black tracking-[0.4em] opacity-20 select-none">
        JAJA • KOREDE • ARTS • INDOMIE
      </footer>
    </div>
  );
}
