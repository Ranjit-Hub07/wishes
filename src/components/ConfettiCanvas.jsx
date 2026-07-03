"use client";

import { useEffect, useRef } from "react";

export default function ConfettiCanvas({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    let particles = [];
    const colors = ["#ecb2ff", "#b9f1ff", "#e9c400", "#ffb4ab", "#a5eeff", "#ffe16d"];

    // Function to add rain particles
    const addRain = () => {
      for (let i = 0; i < 120; i++) {
        particles.push({
          type: "rain",
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 4 + 3,
          angle: Math.random() * 6.28,
          rotationSpeed: Math.random() * 0.1 - 0.05,
          rotation: Math.random() * 6.28,
        });
      }
    };

    // If active on mount or change, add rain
    if (active) {
      addRain();
    }

    // Function to add blast particles (cake sprinkles & nonpareils)
    const addBlast = (startX, startY) => {
      for (let i = 0; i < 120; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 12 + 4;
        particles.push({
          type: "blast",
          shape: Math.random() > 0.4 ? "pill" : "circle", // 60% pills, 40% circles
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3, // slightly upward push
          size: Math.random() * 4 + 3, // delicate sizes for sprinkles
          color: colors[Math.floor(Math.random() * colors.length)],
          gravity: 0.28,
          friction: 0.96,
          opacity: 1,
          decay: Math.random() * 0.02 + 0.01, // stays on screen a bit longer
          rotationSpeed: Math.random() * 0.3 - 0.15,
          rotation: Math.random() * 6.28,
        });
      }
    };

    const handleBlastEvent = (e) => {
      const { x, y } = e.detail;
      addBlast(x, y);
    };

    window.addEventListener("confetti-blast", handleBlastEvent);

    let animationId;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Filter out dead particles
      particles = particles.filter((p) => {
        if (p.type === "blast" && p.opacity <= 0) {
          return false;
        }
        return true;
      });

      particles.forEach((p) => {
        if (p.type === "rain") {
          p.y += p.speed;
          p.x += Math.sin(p.angle) * 1.5;
          p.rotation += p.rotationSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();

          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
        } else if (p.type === "blast") {
          p.vy += p.gravity;
          p.vx *= p.friction;
          p.vy *= p.friction;
          p.x += p.vx;
          p.y += p.vy;
          p.opacity -= p.decay;
          p.rotation += p.rotationSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          
          if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            const w = p.size * 2.8; // elongated capsule sprinkle
            const h = p.size * 0.8;
            ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("confetti-blast", handleBlastEvent);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[110] pointer-events-none" />;
}
