"use client";
import { useEffect, useRef } from "react";

export default function AmbientBackground() {
  const canvasRef = useRef(null);
  const animRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Airy particles (light theme)
    const COUNT = window.innerWidth < 768 ? 24 : 50;
    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      r:  Math.random() * 1.5 + 0.4,
      o:  Math.random() * 0.20 + 0.05,
    }));

    const draw = () => {
      t += 0.004;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Soft drifting aurora blobs
      const blobs = [
        { x: canvas.width * 0.12 + Math.sin(t * 0.6) * 90,  y: canvas.height * 0.15 + Math.cos(t * 0.5) * 70,  r: 420, c: "rgba(59,130,246,0.06)"  },
        { x: canvas.width * 0.88 + Math.cos(t * 0.5) * 80,  y: canvas.height * 0.80 + Math.sin(t * 0.7) * 60,  r: 380, c: "rgba(6,182,212,0.05)"   },
        { x: canvas.width * 0.55 + Math.sin(t * 0.4) * 110, y: canvas.height * 0.45 + Math.cos(t * 0.8) * 90,  r: 320, c: "rgba(124,58,237,0.04)"  },
        { x: canvas.width * 0.72 + Math.cos(t * 0.9) * 70,  y: canvas.height * 0.10 + Math.sin(t * 0.6) * 50,  r: 260, c: "rgba(16,185,129,0.035)" },
      ];
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Particles
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,116,139,${p.o})`;
        ctx.fill();
      });

      // Connecting lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59,130,246,${0.04 * (1 - d / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}