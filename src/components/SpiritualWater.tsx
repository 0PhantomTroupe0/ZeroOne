"use client";

import { useEffect, useRef } from "react";
import styles from "./SpiritualWater.module.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  isSliding: boolean;
  type: 'mist' | 'star';
  color: string;
  morphed: boolean;
}

const STAR_COLORS = [
  '#00f2ff', // Cyan
  '#7000ff', // Purple
  '#ff00f2', // Pink
  '#ff003c', // Red
  '#ff7e00', // Orange
  '#ffeb00', // Yellow
  '#00ff8e', // Green
  '#0084ff', // Blue
  '#ffffff', // White
  '#bd00ff', // Violet
  '#00ffea', // Aquamarine
  '#ffae00'  // Gold
];

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface WindowRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export default function SpiritualWater({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationId = useRef<number | null>(null);
  const windows = useRef<WindowRect[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // Update window positions periodically to handle scroll/animations
    const updateWindows = () => {
      const els = document.querySelectorAll('[data-window="true"]');
      const newWindows: WindowRect[] = [];
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        newWindows.push({
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom
        });
      });
      windows.current = newWindows;
    };

    const windowInterval = setInterval(updateWindows, 500);
    updateWindows();

    const createParticle = (): Particle => {
      const x = window.innerWidth / 2 + (Math.random() - 0.5) * 120;
      const y = window.innerHeight * 0.2; 
      
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 1.5 + 0.8,
        size: Math.random() * 5 + 3,
        alpha: Math.random() * 0.2 + 0.05,
        life: 1.0,
        isSliding: false,
        type: 'mist',
        color: '#ffffff',
        morphed: false
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (active) {
        if (Math.random() > 0.3) {
          particles.current.push(createParticle());
        }
      }

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        
        let onSurface = false;

        // Pulse logic: Every 7s, have a 1s burst of 100% colored stars
        // Cycle is 8s total: 7s normal, 1s burst
        const now = Date.now();
        const cyclePosition = (now % 8000); 
        const isBurst = cyclePosition >= 7000;

        // Morphing logic: Morph much earlier (near birth)
        if (!p.morphed && p.life < 0.95 && Math.random() < 0.035) {
           p.morphed = true;
           p.type = 'star';
           // If in burst mode, 100% chance for color. Otherwise 10% (even rarer now to contrast)
           const isColored = isBurst || Math.random() < 0.1;
           p.color = isColored 
             ? STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
             : '#ffffff';
           
           // Drastic slow down upon morphing
           p.vy *= 0.3;
           p.vx *= 0.3;
        }
        
        // Efficient Collision Detection - Only mist and non-morphed stars slide
        if (p.y > window.innerHeight * 0.25) { 
            for (const win of windows.current) {
                if (p.x > win.left && p.x < win.right) {
                    if (p.y >= win.top - 8 && p.y <= win.top + 2) {
                        onSurface = true;
                        p.vy = p.type === 'star' ? 0.15 : 0.3; // Stars slide even slower
                        p.y = win.top - 1;
                        const centerX = (win.left + win.right) / 2;
                        p.vx += p.x < centerX ? -0.1 : 0.1;
                        p.isSliding = true;
                    } 
                    else if (p.y > win.top && p.y < win.bottom && !p.morphed) {
                        p.vx += p.x < (win.left + win.right) / 2 ? -0.1 : 0.1;
                    }
                }
            }
        }

        if (!onSurface) {
          p.vy += p.type === 'star' ? 0.005 : 0.03; // Stars are extremely floaty
          p.vx += (Math.random() - 0.5) * (p.type === 'star' ? 0.02 : 0.05); 
          p.vx *= p.type === 'star' ? 0.95 : 0.98; // Stars have more "air resistance"
          p.isSliding = false;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.002;

        if (p.life <= 0 || p.y > canvas.height) {
          particles.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        const mainAlpha = p.alpha * p.life * (p.type === 'star' ? 2 : 1);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        
        const baseColor = p.type === 'star' ? p.color : '#ffffff';
        gradient.addColorStop(0, hexToRgba(baseColor, mainAlpha));
        gradient.addColorStop(p.type === 'star' ? 0.2 : 0.6, hexToRgba(baseColor, mainAlpha * 0.3));
        gradient.addColorStop(1, hexToRgba(baseColor, 0));
        
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra flare for stars
        if (p.type === 'star') {
          ctx.beginPath();
          ctx.fillStyle = hexToRgba(baseColor, mainAlpha * 0.5);
          // Small cross flare
          ctx.fillRect(p.x - p.size, p.y - 0.5, p.size * 2, 1);
          ctx.fillRect(p.x - 0.5, p.y - p.size, 1, p.size * 2);
        } else if (Math.random() > 0.8) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * p.life * 0.05})`;
          ctx.arc(p.x - p.vx * 4, p.y - p.vy * 4, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(windowInterval);
      if (animationId.current) cancelAnimationFrame(animationId.current);
    };
  }, [active]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`${styles.canvas} ${active ? styles.active : ''}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}
