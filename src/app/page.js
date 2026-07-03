"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import BackgroundShader from "@/components/BackgroundShader";
import ConfettiCanvas from "@/components/ConfettiCanvas";
import TypewriterLetter from "@/components/TypewriterLetter";

// Web Audio API Synth to play self-contained ambient celebration music
class AmbientSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.gainNode = null;
    this.intervalId = null;
  }

  start() {
    if (this.isPlaying) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    try {
      this.ctx = new AudioContext();
      this.isPlaying = true;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.04, this.ctx.currentTime); // Soft background level
      this.gainNode.connect(this.ctx.destination);

      // Relaxing major pentatonic scale arpeggio notes in Hz
      const scale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00];

      const playNote = () => {
        if (!this.isPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;
        const pitch = scale[Math.floor(Math.random() * scale.length)];

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(pitch, now);

        // Soft arpeggiated piano-like envelop
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.06, now + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start(now);
        osc.stop(now + 4.0);
      };

      // Play notes at random intervals (arpeggio loop)
      playNote();
      this.intervalId = setInterval(playNote, 1200);
    } catch (e) {
      console.error("Web Audio API failed to initialize:", e);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export default function Home() {
  const [friendName, setFriendName] = useState("Denguuuuu");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [shareStatus, setShareStatus] = useState("share"); // 'share' | 'copied'
  const [particles, setParticles] = useState([]);
  const [balloons, setBalloons] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  const synthRef = useRef(null);

  // Generate particle positions on mount and setup mouse parallax listener
  useEffect(() => {
    setIsLoaded(true);

    const list = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 8 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5,
    }));
    setParticles(list);

    const balloonList = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 90 + 5,
      size: Math.random() * 20 + 20, // 20px to 40px
      duration: Math.random() * 8 + 12, // 12s to 20s
      delay: Math.random() * 15, // 0s to 15s delay
    }));
    setBalloons(balloonList);

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((sec) => observer.observe(sec));

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, []);

  const toggleMusic = () => {
    if (!synthRef.current) {
      synthRef.current = new AmbientSynth();
    }

    if (isMusicPlaying) {
      synthRef.current.stop();
      setIsMusicPlaying(false);
    } else {
      synthRef.current.start();
      setIsMusicPlaying(true);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShareStatus("check");
      setTimeout(() => {
        setShareStatus("share");
      }, 2000);
    }
  };

  const triggerSurprise = () => {
    setShowSurpriseModal(true);
    setConfettiActive(true);
  };

  const closeSurprise = () => {
    setShowSurpriseModal(false);
    setConfettiActive(false);
  };

  // Letter contents from Stitch
  const letterText = "To my best friend, another year has passed, and I'm still amazed by your light. You have this incredible ability to make even the greyest days feel like gold. Thank you for being the person who answers my 2 AM calls and for laughing at my terrible jokes. Life is so much better with you in it. Today is all about you — shine on!";

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Ambient Background Shader */}
      <BackgroundShader />

      {/* Confetti Animation Layer */}
      <ConfettiCanvas active={confettiActive} />

      {/* Floating Balloons Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
        {balloons.map((b) => (
          <span
            key={b.id}
            className="balloon-float select-none block"
            style={{
              left: `${b.left}%`,
              fontSize: `${b.size}px`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          >
            🎈
          </span>
        ))}
      </div>

      {/* Header / Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/40 backdrop-blur-xl border-b border-white/10 shadow-sm">
        <div className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto">
          <h1 className="font-headline-md text-headline-md font-bold text-primary cursor-pointer active:scale-95 transition-transform">
            BirthdayWish
          </h1>
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#memories" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              Gallery
            </a>
            <a href="#timeline" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              Timeline
            </a>
            <a href="#surprise" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              Surprise
            </a>
          </nav>

        </div>
      </header>

      <main className="relative z-10 pt-20">
        {/* Section 1: Hero */}
        <section className="min-h-screen flex flex-col items-center justify-center relative px-margin-mobile overflow-hidden">
          {/* Neon Glow Ambient Orbs (Parallax Layer) */}
          <div
            className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-primary/10 blur-[130px] pointer-events-none transition-transform duration-300 ease-out z-0"
            style={{
              transform: `translate3d(${-mousePos.x * 60}px, ${-mousePos.y * 60}px, 0)`,
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] rounded-full bg-secondary/10 blur-[110px] pointer-events-none transition-transform duration-300 ease-out z-0"
            style={{
              transform: `translate3d(${mousePos.x * 40}px, ${-mousePos.y * 40}px, 0)`,
            }}
          />

          {/* Decorative Floating Particles */}
          <div className="particle-container">
            {particles.map((p) => (
              <div
                key={p.id}
                className="particle"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  animationDuration: `${p.duration}s`,
                  animationDelay: `${p.delay}s`,
                  opacity: p.opacity,
                }}
              />
            ))}
          </div>

          <div
            className={`text-center space-y-stack-md relative z-20 transition-all duration-1000 ease-out`}
            style={{
              transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0)`,
              opacity: isLoaded ? 1 : 0,
            }}
          >
            <h2 className="font-headline-xl text-headline-xl md:text-[80px] text-glow-primary leading-tight">
              Happy Birthday <br />
              {isEditingName ? (
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                  autoFocus
                  className="bg-transparent border-b border-tertiary text-tertiary text-center font-headline-xl outline-none w-full max-w-lg mt-2"
                />
              ) : (
                <span className="inline-flex items-center gap-4">
                  <span
                    onClick={() => setIsEditingName(true)}
                    className="text-tertiary text-glow-gold cursor-pointer border-b border-dashed border-tertiary/40 hover:border-tertiary transition-all"
                    title="Click to edit name"
                  >
                    {friendName}
                  </span>
                  <span
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = rect.left + rect.width / 2;
                      const y = rect.top + rect.height / 2;
                      const event = new CustomEvent("confetti-blast", {
                        detail: { x, y }
                      });
                      window.dispatchEvent(event);
                    }}
                    className="cursor-pointer inline-block hover:scale-125 active:scale-95 transition-transform duration-200 select-none animate-bounce"
                    style={{ animationDuration: "3s" }}
                    title="Click for a party blast!"
                  >
                    🎉
                  </span>
                </span>
              )}
            </h2>
            <p
              className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto italic transition-all duration-1000 delay-300"
              style={{
                transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
              }}
            >
              "You are not just my friend, you are my family ❤️"
            </p>
            <div
              className="pt-stack-lg transition-all duration-1000 delay-500"
              style={{
                transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 8}px, 0)`,
              }}
            >
              <a
                href="#memories"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-container to-primary text-white font-label-md text-label-md px-10 py-4 rounded-full btn-glow transition-all duration-500 hover:-translate-y-1"
              >
                Explore Memories
                <span className="material-symbols-outlined block">arrow_downward</span>
              </a>
            </div>
          </div>
        </section>

        {/* Section 2: Memories Polaroid Gallery */}
        <section className="py-stack-xl max-w-container-max mx-auto px-gutter reveal-section" id="memories">
          <div className="mb-stack-lg text-center">
            <h3 className="font-headline-lg text-headline-lg mb-stack-sm">Frozen Moments</h3>
            <div className="w-24 h-1 bg-tertiary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Polaroid 1 */}
            <div className="space-y-6">
              <div className="group relative overflow-hidden rounded-xl glass-panel aspect-[3/4] p-4 flex flex-col justify-between floating-card-1">
                <div className="w-full h-[85%] relative rounded-lg overflow-hidden">
                  <Image
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    src="/Images/IMG20181219122821.jpg"
                    alt="First trip to Kailash Temple"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                </div>
                <div className="h-[12%] flex items-center justify-center">
                  <p className="font-label-md text-label-md text-white/90 font-serif">Class Bunk Trip ⛰️</p>
                </div>
              </div>
            </div>

            {/* Polaroid 2 */}
            <div className="space-y-6 md:pt-12">
              <div className="group relative overflow-hidden rounded-xl glass-panel aspect-[3/4] p-4 flex flex-col justify-between floating-card-2">
                <div className="w-full h-[85%] relative rounded-lg overflow-hidden">
                  <Image
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    src="/Images/IMG20181112115519.jpg"
                    alt="First meet in school"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="h-[12%] flex items-center justify-center">
                  <p className="font-label-md text-label-md text-white/90 font-serif">Masti in College 🏫</p>
                </div>
              </div>
            </div>

            {/* Polaroid 3 */}
            <div className="space-y-6">
              <div className="group relative overflow-hidden rounded-xl glass-panel aspect-[3/4] p-4 flex flex-col justify-between floating-card-3">
                <div className="w-full h-[85%] relative rounded-lg overflow-hidden">
                  <Image
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    src="/Images/IMG20190627103828.jpg"
                    alt="Playing games and talking late night"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="h-[12%] flex items-center justify-center">
                  <p className="font-label-md text-label-md text-white/90 font-serif">Ghumi Ghumi After Cyclone 🌀</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Special Typed Letter */}
        <section className="py-stack-xl bg-surface-container-lowest/50 reveal-section">
          <div className="max-w-3xl mx-auto px-gutter">
            <div className="glass-panel p-stack-lg rounded-xl relative floating-card-2">
              <span className="material-symbols-outlined absolute -top-6 -left-4 text-6xl text-primary/30 select-none">
                format_quote
              </span>
              <div className="min-h-[200px]">
                <TypewriterLetter text={letterText} />
              </div>
              <div className="mt-stack-md text-right">
                <p className="font-label-caps text-label-caps text-tertiary">- Ranjit 😊</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Timeline */}
        <section className="py-stack-xl max-w-container-max mx-auto px-gutter overflow-hidden" id="timeline">
          <div className="mb-stack-lg text-center">
            <h3 className="font-headline-lg text-headline-lg mb-stack-sm">Our Journey</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">The milestones that define us</p>
          </div>
          <div className="relative flex flex-col gap-16 py-stack-lg">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px timeline-line hidden md:block"></div>

            {/* Milestone 1 */}
            <div className="relative flex flex-col md:flex-row items-center justify-between w-full reveal-section">
              <div className="md:w-5/12 text-center md:text-right">
                <h4 className="font-headline-md text-headline-md text-primary">First Meet</h4>
                <p className="font-body-md text-on-surface-variant">
                  Meeting each other back in 8th class at our school, where this beautiful bond first began with a simple handshake and a "hello".
                </p>
              </div>
              <div className="z-20 w-12 h-12 rounded-full glass-panel flex items-center justify-center my-stack-sm md:my-0 border-tertiary/50 border-2">
                <span className="material-symbols-outlined text-tertiary block">school</span>
              </div>
              <div className="hidden md:block md:w-5/12"></div>
            </div>

            {/* Milestone 2 */}
            <div className="relative flex flex-col md:flex-row-reverse items-center justify-between w-full reveal-section">
              <div className="md:w-5/12 text-center md:text-left">
                <h4 className="font-headline-md text-headline-md text-primary">First Trip</h4>
                <p className="font-body-md text-on-surface-variant">
                  Taking our very first trip together to Barunei Hill, the hot water springs, the Hanuman Temple on the mountaintop, and the sacred, beautiful Kailash Temple.
                </p>
              </div>
              <div className="z-20 w-12 h-12 rounded-full glass-panel flex items-center justify-center my-stack-sm md:my-0 border-tertiary/50 border-2">
                <span className="material-symbols-outlined text-tertiary block">temple_hindu</span>
              </div>
              <div className="hidden md:block md:w-5/12"></div>
            </div>

            {/* Milestone 3 */}
            <div className="relative flex flex-col md:flex-row items-center justify-between w-full reveal-section">
              <div className="md:w-5/12 text-center md:text-right">
                <h4 className="font-headline-md text-headline-md text-primary">Quarantine & Games</h4>
                <p className="font-body-md text-on-surface-variant">
                  Staying connected through endless late-night talks and playing games like "Among Us" together during Covid times.
                </p>
              </div>
              <div className="z-20 w-12 h-12 rounded-full glass-panel flex items-center justify-center my-stack-sm md:my-0 border-tertiary/50 border-2">
                <span className="material-symbols-outlined text-tertiary block">sports_esports</span>
              </div>
              <div className="hidden md:block md:w-5/12"></div>
            </div>
          </div>
        </section>

        {/* Section 5: Surprise */}
        <section className="py-stack-xl flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-primary/10 reveal-section" id="surprise">
          <div className="text-center space-y-stack-md">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-stack-md animate-bounce">
              <span className="material-symbols-outlined text-4xl text-primary block">
                featured_seasonal_and_gifts
              </span>
            </div>
            <h3 className="font-headline-lg text-headline-lg">Wait, there's one more thing...</h3>
            <button
              onClick={triggerSurprise}
              className="bg-tertiary text-on-tertiary font-label-md text-label-md px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-tertiary-fixed transition-colors active:scale-95 shadow-[0_0_40px_rgba(233,196,0,0.3)]"
            >
              Click for Surprise 🎁
            </button>
          </div>
        </section>

        {/* Section 6: Final Wish */}
        <section className="py-stack-xl min-h-[60vh] flex flex-col items-center justify-center text-center px-gutter reveal-section">
          <div className="mb-stack-lg">
            <span
              className="material-symbols-outlined text-[120px] text-tertiary animate-pulse-gold block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
          <h4 className="max-w-3xl font-headline-md text-headline-md leading-relaxed text-on-surface">
            "May your life be filled with <span className="text-primary">happiness</span>,{" "}
            <span className="text-secondary">success</span>, and endless{" "}
            <span className="text-tertiary">smiles</span> 😊"
          </h4>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-stack-lg bg-surface-container-lowest flex flex-col items-center justify-center gap-stack-sm relative z-10 border-t border-white/5">
        <p className="font-label-caps text-label-caps text-on-surface-variant">BirthdayWish</p>
        <p className="font-body-md text-body-md text-tertiary">Made with love</p>

      </footer>

      {/* Surprise Modal Dialog */}
      {showSurpriseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500">
          <div className="absolute inset-0 bg-black/80 modal-blur" onClick={closeSurprise}></div>
          <div className="glass-panel p-stack-lg rounded-xl max-w-md w-full relative z-10 mx-margin-mobile border-tertiary/30">
            <button
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary"
              onClick={closeSurprise}
            >
              <span className="material-symbols-outlined block">close</span>
            </button>
            <div className="text-center space-y-stack-md">
              <div className="text-6xl">🌳 😏</div>
              <h3 className="font-headline-md text-headline-md text-tertiary">Remember that one time?</h3>
              <p className="font-body-md text-on-surface-variant italic">
                "Do you remember that park girl? The one you went to the park for every single day just to see her once... Do you still remember her? Do you miss her?"
              </p>
              <div className="pt-4">
                <button
                  className="w-full py-3 rounded-lg border border-primary/30 text-primary font-label-md hover:bg-primary/10 transition-colors"
                  onClick={closeSurprise}
                >
                  Close &amp; Keep Celebrating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
