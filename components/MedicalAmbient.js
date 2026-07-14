"use client";
import { useEffect, useRef } from "react";

export default function MedicalAmbient() {
  const canvasRef = useRef(null);
  const animRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── ECG waveform generator ──────────────────────────────
    // Returns y-offset for a given x within one heartbeat cycle
    const ecgWave = (x) => {
      // x is 0..1 across one beat cycle
      const p = x % 1;
      // Flat baseline most of the time, then the classic PQRST spike
      if (p < 0.60) return 0;                          // flat line
      if (p < 0.63) return -6 * ((p - 0.60) / 0.03);   // small P dip up
      if (p < 0.66) return -6 + 6 * ((p - 0.63) / 0.03);
      if (p < 0.68) return 10 * ((p - 0.66) / 0.02);   // Q down
      if (p < 0.70) return 10 - 70 * ((p - 0.68) / 0.02); // R spike UP (big)
      if (p < 0.72) return -60 + 80 * ((p - 0.70) / 0.02); // S down
      if (p < 0.74) return 20 - 20 * ((p - 0.72) / 0.02);  // back to baseline
      if (p < 0.85) return 0;
      if (p < 0.90) return -14 * Math.sin(((p - 0.85) / 0.05) * Math.PI); // T wave
      return 0;
    };

    const pulses = [];  // expanding rings
    let lastPulse = 0;
    let t = 0;

    const draw = (now) => {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const H = canvas.height;
      const W = canvas.width;

      // ── 1. Live ECG line (lower third of screen) ──
      const baseY = H * 0.82;
      const beatsOnScreen = 4;             // how many heartbeats visible
      const cycleW = W / beatsOnScreen;
      const scroll = (t * 60) % cycleW;    // continuous scroll

      ctx.beginPath();
      ctx.lineWidth = 2;
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0,   "rgba(16,185,129,0)");
      grad.addColorStop(0.15,"rgba(16,185,129,0.35)");
      grad.addColorStop(0.5, "rgba(6,182,212,0.45)");
      grad.addColorStop(0.85,"rgba(16,185,129,0.35)");
      grad.addColorStop(1,   "rgba(16,185,129,0)");
      ctx.strokeStyle = grad;
      ctx.shadowColor = "rgba(16,185,129,0.5)";
      ctx.shadowBlur  = 8;

      for (let px = 0; px <= W; px += 2) {
        const cyclePos = ((px + scroll) / cycleW);
        const y = baseY + ecgWave(cyclePos);
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Glowing dot riding the leading edge of the wave
      const leadX = W - 2;
      const leadY = baseY + ecgWave((leadX + scroll) / cycleW);
      ctx.beginPath();
      ctx.arc(leadX, leadY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(52,211,153,0.9)";
      ctx.shadowColor = "rgba(52,211,153,1)";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── 2. Heartbeat pulse rings (spawn periodically) ──
      if (now - lastPulse > 2600) {
        lastPulse = now;
        pulses.push({ x: W * 0.5, y: H * 0.4, r: 0, life: 1 });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += 1.4;
        p.life -= 0.006;
        if (p.life <= 0) { pulses.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6,182,212,${p.life * 0.18})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        pointerEvents: "none", opacity: 0.7,
      }}
    />
  );
}