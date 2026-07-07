"use client";

import { useState, useEffect } from "react";

export default function BirthdayCake({ onAllBlownOut }) {
  const [candles, setCandles] = useState([
    { id: 1, lit: true, x: 70 },
    { id: 2, lit: true, x: 100 },
    { id: 3, lit: true, x: 130 },
  ]);
  const [blownCount, setBlownCount] = useState(0);
  const [wished, setWished] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Play a beautiful chime sound when a candle is clicked using Web Audio API
  const playChime = (pitch) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Audio Context blocked or failed:", e);
    }
  };

  const handleBlow = (id, index) => {
    if (!candles[index].lit) return;

    // Extinguish candle and hide instruction tooltip
    setShowTooltip(false);
    setCandles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, lit: false } : c))
    );

    // Play a distinct note for each candle (ascending pentatonic notes)
    const pitches = [293.66, 329.63, 392.00];
    playChime(pitches[index] || 300);

    setBlownCount((prev) => {
      const next = prev + 1;
      if (next === candles.length) {
        setTimeout(() => {
          setWished(true);
          if (onAllBlownOut) onAllBlownOut();
        }, 800);
      }
      return next;
    });
  };

  const resetCake = () => {
    setCandles([
      { id: 1, lit: true, x: 70 },
      { id: 2, lit: true, x: 100 },
      { id: 3, lit: true, x: 130 },
    ]);
    setBlownCount(0);
    setWished(false);
    setShowTooltip(true);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl max-w-sm mx-auto shadow-2xl relative border-white/10 mt-12">
      {/* Pop-up Instruction Banner */}
      {showTooltip && !wished && (
        <div className="absolute -top-14 bg-gradient-to-r from-primary to-secondary text-on-primary-container text-xs font-label-md px-4 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(236,178,255,0.4)] flex items-center gap-2 border border-white/20 select-none animate-bounce z-30">
          <span className="material-symbols-outlined text-sm block">lightbulb</span>
          <span>Click the candles to blow them out! 🕯️</span>
          <button 
            onClick={() => setShowTooltip(false)} 
            className="hover:text-white font-bold ml-1 text-sm leading-none block active:scale-90 transition-transform cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
      <h4 className="font-headline-md text-headline-md text-center text-white mb-4">
        {wished ? "✨ Make a Wish! ✨" : "Blow the Candles!"}
      </h4>

      {/* SVG Birthday Cake */}
      <div className="relative w-[200px] h-[220px] flex items-end justify-center select-none cursor-pointer">
        <svg viewBox="0 0 200 220" className="w-full h-full">
          {/* Cake Stand */}
          <path d="M 20 200 L 180 200 L 160 215 L 40 215 Z" fill="#cfd8dc" />
          <rect x="90" y="200" width="20" height="15" fill="#b0bec5" />

          {/* Cake Layer 1 (Bottom) */}
          <rect x="30" y="140" width="140" height="60" rx="10" fill="url(#cakeGrad)" />
          {/* Frosting Drips Layer 1 */}
          <path
            d="M 30 150 Q 40 165 50 150 T 70 150 T 90 160 T 110 150 T 130 150 T 150 165 T 170 150"
            fill="none"
            stroke="#ffeb3b"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Cake Layer 2 (Top) */}
          <rect x="45" y="80" width="110" height="60" rx="8" fill="url(#cakeGrad2)" />
          {/* Frosting Drips Layer 2 */}
          <path
            d="M 45 90 Q 55 105 65 90 T 85 95 T 105 90 T 125 105 T 145 90 T 155 90"
            fill="none"
            stroke="#e91e63"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Candles & Flames */}
          {candles.map((c, idx) => (
            <g key={c.id} onClick={() => handleBlow(c.id, idx)} className="cursor-pointer group">
              {/* Candle Body (centered on c.x) */}
              <rect x={c.x - 3} y="50" width="6" height="30" rx="2" fill={idx % 2 === 0 ? "#00bcd4" : "#ffeb3b"} />
              {/* Wick */}
              <line x1={c.x} y1="50" x2={c.x} y2="45" stroke="#37474f" strokeWidth="2" />

              {/* Flame (Only if lit) */}
              {c.lit ? (
                <g className="animate-pulse" style={{ transformOrigin: `${c.x}px 35px` }}>
                  <path
                    d={`M ${c.x} 43 C ${c.x - 5} 38 ${c.x - 3} 30 ${c.x} 26 C ${c.x + 3} 30 ${c.x + 5} 38 ${c.x} 43 Z`}
                    fill="#ff9800"
                  />
                  <path
                    d={`M ${c.x} 42 C ${c.x - 3} 38 ${c.x - 2} 33 ${c.x} 30 C ${c.x + 2} 33 ${c.x + 3} 38 ${c.x} 42 Z`}
                    fill="#ffeb3b"
                  />
                </g>
              ) : (
                // Smoke trail if extinguished
                <path
                  className="animate-smoke"
                  d={`M ${c.x} 43 Q ${c.x - 5} 35 ${c.x + 3} 25 T ${c.x - 3} 10`}
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ animationDuration: "1.5s" }}
                />
              )}
            </g>
          ))}

          {/* Gradients */}
          <defs>
            <linearGradient id="cakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8e24aa" />
              <stop offset="100%" stopColor="#4a148c" />
            </linearGradient>
            <linearGradient id="cakeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec407a" />
              <stop offset="100%" stopColor="#ad1457" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {wished && (
        <button
          onClick={resetCake}
          className="mt-4 px-4 py-2 text-xs font-label-md bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors active:scale-95 cursor-pointer"
        >
          Relight Candles 🔄
        </button>
      )}
    </div>
  );
}
