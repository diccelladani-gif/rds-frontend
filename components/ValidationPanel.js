"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "";

const SECTION_ICONS = ["🏷️","📐","🎨","💡","⚕️","📊","🗺️","⚙️","💻","🛡️","👤","🔧","♻️"];

const AGENT_COLORS = [
  "#818cf8","#34d399","#f472b6","#facc15","#38bdf8",
  "#fb923c","#a78bfa","#4ade80","#e879f9","#67e8f9",
  "#fca5a5","#86efac","#fde68a"
];

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

  :root {
    --void: #020617;
    --deep: #060d1f;
    --surface: #0d1b3e;
    --glass: rgba(13,27,62,0.6);
    --glass-light: rgba(255,255,255,0.04);
    --border: rgba(99,102,241,0.18);
    --border-bright: rgba(99,102,241,0.4);
    --indigo: #6366f1;
    --violet: #8b5cf6;
    --cyan: #22d3ee;
    --emerald: #10b981;
    --rose: #f43f5e;
    --amber: #f59e0b;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #475569;
    --glow-indigo: rgba(99,102,241,0.35);
    --glow-violet: rgba(139,92,246,0.35);
    --glow-cyan: rgba(34,211,238,0.25);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .vp-root {
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* ─── ANIMATIONS ─────────────────────────────────────────────────── */
  @keyframes vp-spin        { to { transform: rotate(360deg) } }
  @keyframes vp-spin-r      { to { transform: rotate(-360deg) } }
  @keyframes vp-pulse       { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes vp-pulse-glow  { 0%,100%{box-shadow:0 0 12px var(--glow-indigo)} 50%{box-shadow:0 0 32px var(--glow-indigo),0 0 60px rgba(99,102,241,0.15)} }
  @keyframes vp-fade-up     { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes vp-fade-in     { from{opacity:0} to{opacity:1} }
  @keyframes vp-slide-in    { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
  @keyframes vp-pop         { from{opacity:0;transform:scale(0.88) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes vp-grid-move   { from{background-position:0 0} to{background-position:60px 60px} }
  @keyframes vp-scan-h      { 0%{top:-4px} 100%{top:100%} }
  @keyframes vp-scan-v      { 0%{left:-4px} 100%{left:100%} }
  @keyframes vp-star        { 0%,100%{opacity:0.06} 50%{opacity:0.55} }
  @keyframes vp-orbit       { from{transform:rotate(0deg) translateX(var(--r,60px)) rotate(0deg)} to{transform:rotate(360deg) translateX(var(--r,60px)) rotate(-360deg)} }
  @keyframes vp-bar-load    { from{width:0%} to{width:var(--w,80%)} }
  @keyframes vp-tick        { 0%{opacity:0;transform:translateY(-3px)} 40%{opacity:1} 100%{opacity:0;transform:translateY(3px)} }
  @keyframes vp-flicker     { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.85} 94%{opacity:1} }
  @keyframes vp-particle    { 0%{transform:translateY(0) translateX(0);opacity:0.6} 100%{transform:translateY(-120px) translateX(var(--dx,10px));opacity:0} }
  @keyframes vp-shimmer     { from{background-position:-200% 0} to{background-position:200% 0} }
  @keyframes vp-float       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes vp-ring-pulse  { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }
  @keyframes vp-typewriter  { from{width:0} to{width:100%} }
  @keyframes vp-number-roll { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes vp-tab-slide   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes vp-card-reveal { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes vp-glow-pulse  { 0%,100%{opacity:0.5} 50%{opacity:1} }
  @keyframes vp-rotate-bg   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes vp-progress-fill { from{width:0} to{width:var(--pw,50%)} }
  @keyframes vp-node-appear { from{transform:scale(0) rotate(-90deg);opacity:0} to{transform:scale(1) rotate(0deg);opacity:1} }

  /* ─── SCROLLBAR ───────────────────────────────────────────────────── */
  .vp-scroll::-webkit-scrollbar { width: 4px }
  .vp-scroll::-webkit-scrollbar-track { background: transparent }
  .vp-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.35); border-radius: 99px }
  .vp-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.6) }

  /* ─── INTERACTIVE STATES ─────────────────────────────────────────── */
  .vp-btn { transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1) !important }
  .vp-btn:hover { transform: translateY(-2px) !important; filter: brightness(1.1) !important }
  .vp-btn:active { transform: translateY(0) !important; filter: brightness(0.95) !important }

  .vp-section-card { transition: all 0.25s ease !important }
  .vp-section-card:hover { border-color: rgba(99,102,241,0.35) !important; transform: translateY(-1px) !important }

  .vp-tab-btn { transition: all 0.2s ease !important }
  .vp-tab-btn:hover { color: var(--text-primary) !important; background: rgba(99,102,241,0.08) !important }

  .vp-issue-card { transition: all 0.2s ease !important }
  .vp-issue-card:hover { transform: translateX(3px) !important; border-left-width: 3px !important }

  .vp-suggestion-card { transition: all 0.2s ease !important }
  .vp-suggestion-card:hover { transform: translateY(-2px) !important }

  .vp-score-bar { animation: vp-progress-fill 1.4s cubic-bezier(0.16,1,0.3,1) both }
  .vp-score-bar:nth-child(1) { animation-delay: 0.1s }

  .vp-stat-num { 
    animation: vp-number-roll 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
    display: inline-block;
    overflow: hidden;
  }

  .vp-card-reveal { animation: vp-card-reveal 0.5s cubic-bezier(0.34,1.2,0.64,1) both }

  .vp-shimmer-text {
    background: linear-gradient(90deg, #94a3b8 25%, #f1f5f9 50%, #94a3b8 75%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: vp-shimmer 3s linear infinite;
  }

  .vp-glow-dot {
    width: 8px; height: 8px; border-radius: 50%;
    animation: vp-glow-pulse 1.5s ease-in-out infinite;
  }
`;

/* ─────────────────────────────────────────────────────── helpers ── */
const scoreColor = (score) => {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#6366f1";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
};

const scoreGlow = (score) => {
  if (score >= 80) return "rgba(16,185,129,0.4)";
  if (score >= 60) return "rgba(99,102,241,0.4)";
  if (score >= 40) return "rgba(245,158,11,0.4)";
  return "rgba(244,63,94,0.4)";
};

const scoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Review";
  return "Critical";
};

/* ─── Particle background ─────────────────────────────────────────── */
function StarField({ count = 28 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          borderRadius: "50%",
          width: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
          height: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
          background: ["#a5b4fc","#7dd3fc","#c4b5fd","#e0f2fe","#fff"][i % 5],
          left: `${(i * 13 + 7) % 100}%`,
          top: `${(i * 19 + 11) % 100}%`,
          animation: `vp-star ${2 + i * 0.22}s ease-in-out infinite`,
          animationDelay: `${i * 0.13}s`,
          pointerEvents: "none",
        }} />
      ))}
    </>
  );
}

/* ─── Grid background ─────────────────────────────────────────────── */
function GridBg() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      backgroundImage: "linear-gradient(rgba(99,102,241,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.06) 1px,transparent 1px)",
      backgroundSize: "60px 60px",
      animation: "vp-grid-move 8s linear infinite",
    }} />
  );
}

/* ─── Central AI Orb ─────────────────────────────────────────────── */
function AIOrb({ size = 120, emoji = "🤖", pulseColor = "#6366f1" }) {
  const r = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Outer ring */}
      <div style={{
        position: "absolute", inset: -size * 0.18,
        border: "1px solid rgba(99,102,241,0.12)",
        borderRadius: "50%",
        animation: "vp-spin-r 14s linear infinite",
      }}>
        <div style={{
          position: "absolute", top: -3, left: "28%",
          width: 6, height: 6, borderRadius: "50%",
          background: "#38bdf8", boxShadow: "0 0 10px #38bdf8",
        }} />
      </div>
      {/* Mid ring */}
      <div style={{
        position: "absolute", inset: -size * 0.05,
        border: "1.5px solid rgba(124,58,237,0.18)",
        borderRadius: "50%",
        animation: "vp-spin 8s linear infinite",
      }}>
        <div style={{
          position: "absolute", top: -4, left: "65%",
          width: 7, height: 7, borderRadius: "50%",
          background: "#a78bfa", boxShadow: "0 0 12px #a78bfa",
        }} />
        <div style={{
          position: "absolute", bottom: -4, left: "15%",
          width: 5, height: 5, borderRadius: "50%",
          background: "#f472b6", boxShadow: "0 0 8px #f472b6",
        }} />
      </div>
      {/* Spinner ring */}
      <div style={{
        position: "absolute", inset: size * 0.07,
        border: "2px solid rgba(99,102,241,0.25)",
        borderTopColor: "#6366f1",
        borderRadius: "50%",
        animation: "vp-spin 2s linear infinite",
      }} />
      {/* Pulse ring */}
      <div style={{
        position: "absolute", inset: size * 0.15,
        borderRadius: "50%",
        border: `1px solid ${pulseColor}`,
        animation: "vp-ring-pulse 2.5s ease-out infinite",
      }} />
      {/* Core */}
      <div style={{
        position: "absolute", inset: size * 0.18,
        borderRadius: "50%",
        background: `linear-gradient(135deg, #4f46e5, #7c3aed)`,
        boxShadow: `0 0 ${size * 0.35}px rgba(99,102,241,0.7), 0 0 ${size * 0.7}px rgba(99,102,241,0.2)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.27,
        animation: "vp-pulse 2.5s ease-in-out infinite",
      }}>
        {emoji}
      </div>
    </div>
  );
}

/* ─── Scan lines ─────────────────────────────────────────────────── */
function ScanLines() {
  return (
    <>
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2, pointerEvents: "none",
        background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.5),rgba(139,92,246,0.5),transparent)",
        animation: "vp-scan-h 4s linear infinite", zIndex: 1,
      }} />
    </>
  );
}

/* ─────────────────────────────────────────────── FETCHING STATE ── */
function FetchingState({ roomName, roomCode }) {
  return (
    <div className="vp-root" style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(145deg,#020617 0%,#0d1b3e 50%,#0a0a1a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    }}>
      <GridBg />
      <StarField count={20} />
      <ScanLines />
      <div style={{
        position: "relative", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 24,
        animation: "vp-fade-up 0.7s cubic-bezier(0.34,1.2,0.64,1) both",
      }}>
        <AIOrb size={110} />
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 9, letterSpacing: 5, color: "#6366f1",
            fontWeight: 700, marginBottom: 10, fontFamily: "'Syne', sans-serif",
            animation: "vp-flicker 4s ease-in-out infinite",
          }}>
            LOADING VALIDATION REPORT
          </div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 6,
            fontFamily: "'Syne', sans-serif",
          }}>
            {roomName || roomCode}
          </div>
          <div style={{ fontSize: 12, color: "#475569", letterSpacing: 0.5 }}>
            Fetching saved analysis from quantum store...
          </div>
        </div>
        {/* Loading bar */}
        <div style={{
          width: 200, height: 2,
          background: "rgba(99,102,241,0.15)",
          borderRadius: 99, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: "40%",
            background: "linear-gradient(90deg,#6366f1,#8b5cf6,#22d3ee)",
            borderRadius: 99,
            boxShadow: "0 0 12px rgba(99,102,241,0.8)",
            animation: "vp-shimmer 1.5s linear infinite",
            backgroundSize: "200% 100%",
          }} />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────── IDLE STATE ── */
function IdleState({ roomCode, roomName, onClose, onRun }) {
  return (
    <div className="vp-root" style={{
      position: "fixed", inset: 0,
      background: "rgba(2,6,23,0.8)",
      backdropFilter: "blur(12px)",
      zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "linear-gradient(145deg,rgba(13,27,62,0.95),rgba(6,13,31,0.98))",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 24,
        padding: "44px 40px",
        maxWidth: 540, width: "90%",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04),inset 0 1px 0 rgba(255,255,255,0.06)",
        textAlign: "center",
        animation: "vp-pop 0.6s cubic-bezier(0.34,1.2,0.64,1) both",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Corner accent */}
        <div style={{
          position: "absolute", top: 0, right: 0, width: 180, height: 180,
          background: "radial-gradient(circle at top right,rgba(99,102,241,0.12),transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <AIOrb size={90} />
          </div>
          <div style={{
            fontSize: 9, letterSpacing: 5, color: "#6366f1",
            fontWeight: 700, marginBottom: 12, fontFamily: "'Syne', sans-serif",
          }}>
            AI VALIDATION ENGINE
          </div>
          <h2 style={{
            fontSize: 24, fontWeight: 800, color: "#f1f5f9", marginBottom: 8,
            fontFamily: "'Syne', sans-serif", lineHeight: 1.2,
          }}>
            Ready to Validate
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 6 }}>
            Room <span style={{ color: "#a5b4fc", fontWeight: 600 }}>{roomCode}</span> — {roomName}
          </p>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.8, marginBottom: 32 }}>
            13 specialized AI agents will validate each section, search the latest
            standards, and generate intelligent recommendations.
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10, marginBottom: 32,
          }}>
            {[
              ["🔍", "Validates", "All 13 sections"],
              ["🌐", "Searches", "Live web standards"],
              ["💡", "Suggests", "Smart improvements"],
            ].map(([icon, label, sub]) => (
              <div key={label} style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 14, padding: "16px 10px",
                transition: "all 0.2s ease",
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 2, fontFamily: "'Syne', sans-serif" }}>{label}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={onClose} className="vp-btn" style={{
              padding: "12px 24px",
              background: "rgba(255,255,255,0.04)",
              color: "#64748b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Skip for now
            </button>
            <button onClick={onRun} className="vp-btn" style={{
              padding: "12px 30px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(99,102,241,0.5),0 0 0 1px rgba(255,255,255,0.08)",
              fontFamily: "'Syne', sans-serif", letterSpacing: 0.3,
            }}>
              🚀 Run AI Validation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── LOADING / CINEMATIC ── */
const SECTIONS_LIST = [
  "Room Identity & General Information","Architectural & Spatial Requirements",
  "Interior Finishes & Aesthetics","Interior Lighting & Furniture",
  "Clinical Functionality & Workflow","Capacity & Operations",
  "Adjacency Matrix","MEP & Engineering Systems","Digital & Smart Systems",
  "Safety & Infection Control","Stakeholder Experience",
  "Fittings, Fixtures & Equipment","Waste Management"
];

const AGENT_STATUS_POOL = [
  "Scanning data fields…","Web-searching standards…",
  "Cross-validating…","Analysing trends…",
  "Generating report…","Querying FGI guidelines…",
  "Checking compliance…","Evaluating benchmarks…",
];

function LoadingState({ roomName, roomCode }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="vp-root" style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(145deg,#020617 0%,#0d1b3e 45%,#0f0a2e 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      overflowY: "auto", fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <GridBg />
      <StarField count={30} />
      <ScanLines />

      {/* Vertical scan */}
      <div style={{
        position: "fixed", top: 0, bottom: 0, width: 2, pointerEvents: "none",
        background: "linear-gradient(180deg,transparent,rgba(34,211,238,0.3),transparent)",
        animation: "vp-scan-v 6s linear infinite", zIndex: 1,
      }} />

      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: 760,
        padding: "36px 20px 40px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 28,
        animation: "vp-fade-up 0.5s ease both",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <AIOrb size={130} />
          <div style={{ marginTop: 20 }}>
            <div style={{
              fontSize: 9, letterSpacing: 5, color: "#6366f1",
              fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif",
              animation: "vp-flicker 3s ease-in-out infinite",
            }}>
              AI VALIDATION ENGINE · ACTIVE
            </div>
            <h2 style={{
              fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 6,
              fontFamily: "'Syne', sans-serif",
            }}>
              Validating Room Data Sheet
            </h2>
            <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.8 }}>
              13 specialized agents · parallel execution · live web search
            </p>
          </div>
        </div>

        {/* Agent grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
          gap: 8, width: "100%",
        }}>
          {SECTIONS_LIST.map((sec, i) => {
            const col = AGENT_COLORS[i];
            const statusIdx = (tick + i) % AGENT_STATUS_POOL.length;
            return (
              <div key={i} style={{
                background: "rgba(6,13,31,0.7)",
                border: `1px solid ${col}22`,
                borderRadius: 12, padding: "12px 14px",
                position: "relative", overflow: "hidden",
                backdropFilter: "blur(10px)",
                animation: `vp-pop 0.45s ease both`,
                animationDelay: `${i * 0.05}s`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`,
              }}>
                {/* Animated bottom bar */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, height: 2,
                  background: `linear-gradient(90deg,${col},transparent)`,
                  animation: `vp-bar-load ${2.2 + i * 0.18}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.08}s`,
                  "--w": "100%",
                }} />
                <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 3,
                    background: col,
                    boxShadow: `0 0 8px ${col}`,
                    animation: `vp-pulse ${1.3 + i * 0.09}s ease-in-out infinite`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 9, color: "#334155", fontWeight: 700,
                      marginBottom: 2, letterSpacing: 1, fontFamily: "'Syne', sans-serif",
                    }}>
                      AGENT {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{
                      fontSize: 11, color: "#cbd5e1", fontWeight: 600,
                      lineHeight: 1.3, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {SECTION_ICONS[i]} {sec}
                    </div>
                    <div style={{
                      fontSize: 9, color: col, marginTop: 5,
                      letterSpacing: 0.3,
                      animation: `vp-tick ${1.7 + i * 0.11}s ease-in-out infinite`,
                      animationDelay: `${i * 0.07}s`,
                    }}>
                      ◈ {AGENT_STATUS_POOL[statusIdx]}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        <div style={{
          width: "100%",
          background: "rgba(6,13,31,0.7)",
          border: "1px solid rgba(99,102,241,0.15)",
          borderRadius: 12, padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backdropFilter: "blur(10px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="vp-glow-dot" style={{
              background: "#4ade80",
              boxShadow: "0 0 10px #4ade80",
            }} />
            <span style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 0.5, fontFamily: "'Syne', sans-serif" }}>
              PROCESSING — ALL 13 AGENTS RUNNING IN PARALLEL
            </span>
          </div>
          <span style={{ fontSize: 10, color: "#334155", fontFamily: "'Syne', sans-serif" }}>
            Groq · Tavily
          </span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────── ERROR STATE ── */
function ErrorState({ isNotFound, roomCode, errorMsg, onClose, onRun, onRetry }) {
  const noReport = isNotFound;
  return (
    <div className="vp-root" style={{
      position: "fixed", inset: 0,
      background: "rgba(2,6,23,0.85)",
      backdropFilter: "blur(12px)",
      zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "linear-gradient(145deg,rgba(13,27,62,0.95),rgba(6,13,31,0.98))",
        border: noReport ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(244,63,94,0.25)",
        borderRadius: 22, padding: "40px 36px",
        maxWidth: 460, width: "90%", textAlign: "center",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
        animation: "vp-pop 0.6s cubic-bezier(0.34,1.2,0.64,1) both",
      }}>
        <div style={{ fontSize: 48, marginBottom: 18 }}>{noReport ? "🤖" : "⚠️"}</div>
        <h3 style={{
          fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 10,
          fontFamily: "'Syne', sans-serif",
        }}>
          {noReport ? "No Validation Report Yet" : "Validation Failed"}
        </h3>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8, lineHeight: 1.7 }}>
          {noReport ? `Room ${roomCode} has not been validated yet.` : errorMsg}
        </p>
        {noReport && (
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 28, lineHeight: 1.8 }}>
            Run the AI Validation now — 13 agents will analyse all sections,
            search for the latest standards, and generate a full report.
          </p>
        )}
        {!noReport && (
          <p style={{ fontSize: 12, color: "#475569", marginBottom: 24 }}>{errorMsg}</p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onClose} className="vp-btn" style={{
            padding: "11px 22px",
            background: "rgba(255,255,255,0.04)",
            color: "#64748b",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Close</button>
          {noReport ? (
            <button onClick={onRun} className="vp-btn" style={{
              padding: "11px 26px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
              fontFamily: "'Syne', sans-serif",
            }}>
              🚀 Run AI Validation Now
            </button>
          ) : (
            <button onClick={onRetry} className="vp-btn" style={{
              padding: "11px 22px",
              background: "rgba(99,102,241,0.15)",
              color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Try Again</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────── FULL REPORT — DONE STATE ── */

/* Stat card */
function StatCard({ label, value, sub, color, glow, delay = 0 }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, padding: "18px 20px",
      position: "relative", overflow: "hidden",
      animation: `vp-card-reveal 0.55s cubic-bezier(0.34,1.2,0.64,1) both`,
      animationDelay: `${delay}s`,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at top left, ${glow || color + "18"}, transparent 60%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        fontSize: 10, color: "#475569", fontWeight: 700,
        marginBottom: 8, letterSpacing: 1.5,
        fontFamily: "'Syne', sans-serif",
      }}>
        {label}
      </div>
      <div className="vp-stat-num" style={{
        fontSize: 30, fontWeight: 800, color,
        fontFamily: "'Syne', sans-serif",
        animationDelay: `${delay + 0.1}s`,
        textShadow: `0 0 20px ${color}60`,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

/* Score bar row */
function ScoreBarRow({ section, icon, score, hasIssues, index }) {
  const col = scoreColor(score);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      animation: `vp-slide-in 0.4s ease both`,
      animationDelay: `${index * 0.04}s`,
    }}>
      <div style={{ width: 20, fontSize: 13, flexShrink: 0 }}>{icon}</div>
      <div style={{
        fontSize: 12, color: "#94a3b8", width: 215, flexShrink: 0,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {section}
      </div>
      <div style={{
        flex: 1, height: 6, background: "rgba(255,255,255,0.06)",
        borderRadius: 99, overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${score}%`,
          background: `linear-gradient(90deg, ${col}, ${col}bb)`,
          borderRadius: 99,
          boxShadow: `0 0 8px ${col}60`,
          "--pw": `${score}%`,
          animation: `vp-progress-fill 1.2s cubic-bezier(0.16,1,0.3,1) both`,
          animationDelay: `${0.2 + index * 0.04}s`,
        }} />
      </div>
      <div style={{
        fontSize: 12, fontWeight: 700, width: 36,
        color: col, textAlign: "right",
        fontFamily: "'Syne', sans-serif",
      }}>
        {score}%
      </div>
      <div style={{ width: 16, textAlign: "center" }}>
        {hasIssues ? (
          <span style={{ fontSize: 10, color: "#f59e0b" }}>⚠</span>
        ) : (
          <span style={{ fontSize: 10, color: "#10b981" }}>✓</span>
        )}
      </div>
    </div>
  );
}

/* Issue card */
function IssueCard({ issue, index }) {
  return (
    <div className="vp-issue-card" style={{
      background: "rgba(244,63,94,0.06)",
      border: "1px solid rgba(244,63,94,0.2)",
      borderLeft: "2px solid #f43f5e",
      borderRadius: "0 10px 10px 0",
      padding: "11px 14px",
      marginBottom: 6,
      animation: `vp-fade-up 0.35s ease both`,
      animationDelay: `${index * 0.05}s`,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>
        {issue.field}
        {issue.current && (
          <span style={{ fontWeight: 400, color: "#64748b" }}>
            {" "}— current: <em style={{ color: "#94a3b8" }}>{issue.current}</em>
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "#f87171", marginTop: 4, lineHeight: 1.5 }}>
        {issue.problem}
      </div>
    </div>
  );
}

/* Suggestion card */
function SuggestionCard({ sg, index, compact = false }) {
  const pColor = sg.priority === "High" ? "#f43f5e" : sg.priority === "Low" ? "#10b981" : "#f59e0b";
  const pBg = sg.priority === "High" ? "rgba(244,63,94,0.08)" : sg.priority === "Low" ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)";
  const pBorder = sg.priority === "High" ? "rgba(244,63,94,0.22)" : sg.priority === "Low" ? "rgba(16,185,129,0.22)" : "rgba(245,158,11,0.22)";

  return (
    <div className="vp-suggestion-card" style={{
      background: pBg,
      border: `1px solid ${pBorder}`,
      borderRadius: 12, padding: compact ? "11px 14px" : "14px 16px",
      animation: `vp-card-reveal 0.4s ease both`,
      animationDelay: `${index * 0.04}s`,
    }}>
      {!compact && sg.section && (
        <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, marginBottom: 5, letterSpacing: 0.4 }}>
          {SECTION_ICONS[sg.sectionId - 1]} {sg.section}{sg.field ? ` · ${sg.field}` : ""}
        </div>
      )}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 10, marginBottom: 4,
      }}>
        <div style={{ fontSize: compact ? 13 : 13.5, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.4 }}>
          {sg.recommendation}
        </div>
        <span style={{
          fontSize: 9, fontWeight: 800, color: pColor,
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${pBorder}`,
          padding: "2px 8px", borderRadius: 99, flexShrink: 0,
          letterSpacing: 0.5, fontFamily: "'Syne', sans-serif",
        }}>
          {sg.priority?.toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{sg.reason}</div>
    </div>
  );
}

/* Source chip */
function SourceChip({ src }) {
  return (
    <a href={src.url} target="_blank" rel="noopener noreferrer" style={{
      fontSize: 10, color: "#818cf8",
      background: "rgba(99,102,241,0.1)",
      border: "1px solid rgba(99,102,241,0.2)",
      padding: "3px 10px", borderRadius: 99,
      textDecoration: "none",
      maxWidth: 200, overflow: "hidden",
      textOverflow: "ellipsis", whiteSpace: "nowrap",
      display: "inline-block",
      transition: "all 0.15s",
    }}>
      {src.title || src.url}
    </a>
  );
}

/* Section row in Sections tab */
function SectionRow({ s, expanded, onToggle }) {
  const col = scoreColor(s.confidence);
  const isOpen = expanded.has(s.sectionId);

  return (
    <div className="vp-section-card" style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14, overflow: "hidden",
      animation: `vp-card-reveal 0.5s ease both`,
      animationDelay: `${s.sectionId * 0.04}s`,
    }}>
      {/* Header */}
      <button onClick={() => onToggle(s.sectionId)} style={{
        width: "100%", padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 12,
        background: "none", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <span style={{ fontSize: 18 }}>{SECTION_ICONS[s.sectionId - 1]}</span>
        <span style={{
          flex: 1, fontSize: 14, fontWeight: 700, color: "#e2e8f0",
          fontFamily: "'Syne', sans-serif",
        }}>
          {s.sectionId}. {s.section}
        </span>
        {(s.issues?.length || 0) > 0 && (
          <span style={{
            background: "rgba(244,63,94,0.12)", color: "#f87171",
            border: "1px solid rgba(244,63,94,0.25)",
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            fontFamily: "'Syne', sans-serif",
          }}>
            {s.issues.length} issue{s.issues.length > 1 ? "s" : ""}
          </span>
        )}
        {(s.suggestions?.length || 0) > 0 && (
          <span style={{
            background: "rgba(99,102,241,0.1)", color: "#818cf8",
            border: "1px solid rgba(99,102,241,0.25)",
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            fontFamily: "'Syne', sans-serif",
          }}>
            {s.suggestions.length} suggestion{s.suggestions.length > 1 ? "s" : ""}
          </span>
        )}
        <span style={{
          fontSize: 14, fontWeight: 800, color: col, minWidth: 38, textAlign: "right",
          fontFamily: "'Syne', sans-serif",
          textShadow: `0 0 14px ${col}80`,
        }}>
          {s.confidence}%
        </span>
        <span style={{ color: "#334155", fontSize: 11, marginLeft: 2 }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* Expanded */}
      {isOpen && (
        <div style={{
          padding: "0 20px 18px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          animation: "vp-fade-up 0.3s ease both",
        }}>
          <p style={{
            fontSize: 13, color: "#64748b", margin: "14px 0 16px",
            lineHeight: 1.7, borderLeft: "2px solid rgba(99,102,241,0.3)",
            paddingLeft: 12,
          }}>
            {s.summary}
          </p>

          {(s.issues?.length || 0) > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "#f43f5e",
                marginBottom: 10, letterSpacing: 1,
                fontFamily: "'Syne', sans-serif",
              }}>
                ⚠ ISSUES
              </div>
              {s.issues.map((issue, i) => (
                <IssueCard key={i} issue={issue} index={i} />
              ))}
            </div>
          )}

          {(s.suggestions?.length || 0) > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "#6366f1",
                marginBottom: 10, letterSpacing: 1,
                fontFamily: "'Syne', sans-serif",
              }}>
                💡 SUGGESTIONS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {s.suggestions.map((sg, i) => (
                  <SuggestionCard key={i} sg={sg} index={i} compact />
                ))}
              </div>
            </div>
          )}

          {(s.sources?.length || 0) > 0 && (
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "#334155",
                marginBottom: 8, letterSpacing: 1,
                fontFamily: "'Syne', sans-serif",
              }}>
                🌐 SOURCES
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {s.sources.filter(src => src.url).map((src, i) => (
                  <SourceChip key={i} src={src} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN DONE/REPORT RENDER ────────────────────────────────────── */
function ReportView({ report, onClose, onRevalidate }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [expanded, setExpanded] = useState(new Set([1]));

  const toggleSection = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSuggestions = report.sections.flatMap(s =>
    (s.suggestions || []).map(sg => ({ ...sg, section: s.section, sectionId: s.sectionId }))
  ).sort((a, b) => {
    const p = { High: 0, Medium: 1, Low: 2 };
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1);
  });

  const tabs = [
    { id: "overview",  label: "Overview",    icon: "◈", count: null },
    { id: "sections",  label: "Sections",    icon: "⬡", count: 13 },
    { id: "upgrades",  label: "Suggestions", icon: "◆", count: report.summary.totalSuggestions },
  ];

  return (
    <div className="vp-root vp-scroll" style={{
      position: "fixed", inset: 0,
      background: "rgba(2,6,23,0.88)",
      backdropFilter: "blur(16px)",
      zIndex: 9999,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      overflowY: "auto", padding: "28px 16px", minHeight: "100vh",
    }}>
      <div style={{
        background: "linear-gradient(180deg,#0d1b3e 0%,#060d1f 100%)",
        borderRadius: 22,
        maxWidth: 860, width: "100%",
        boxShadow: "0 30px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(99,102,241,0.15),inset 0 1px 0 rgba(255,255,255,0.04)",
        overflow: "hidden",
        animation: "vp-pop 0.6s cubic-bezier(0.34,1.2,0.64,1) both",
      }}>

        {/* ── HEADER ── */}
        <div style={{
          background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#1e1b4b 100%)",
          padding: "26px 30px 22px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Radial accent */}
          <div style={{
            position: "absolute", top: -60, right: -60, width: 260, height: 260,
            background: "radial-gradient(circle,rgba(139,92,246,0.18),transparent 65%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -40, left: 60, width: 200, height: 200,
            background: "radial-gradient(circle,rgba(34,211,238,0.07),transparent 65%)",
            pointerEvents: "none",
          }} />
          {/* Scan line */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.4),transparent)",
            bottom: 0,
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
            <div>
              <div style={{
                fontSize: 9, letterSpacing: 5, color: "#a5b4fc",
                fontWeight: 700, marginBottom: 6, fontFamily: "'Syne', sans-serif",
              }}>
                AI VALIDATION REPORT
              </div>
              <h2 style={{
                fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 5,
                fontFamily: "'Syne', sans-serif", lineHeight: 1.2,
              }}>
                {report.roomName || report.roomCode}
              </h2>
              <div style={{ fontSize: 12, color: "#c7d2fe", display: "flex", alignItems: "center", gap: 8 }}>
                <span>{report.roomTypology}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{report.department}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>Validated {new Date(report.validatedAt).toLocaleString("en-IN")}</span>
              </div>
            </div>
            <button onClick={onClose} className="vp-btn" style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#94a3b8", fontSize: 16, cursor: "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{
          padding: "20px 28px",
          display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <StatCard
            label="OVERALL SCORE"
            value={`${report.overallScore}%`}
            sub={scoreLabel(report.overallScore)}
            color={scoreColor(report.overallScore)}
            glow={scoreGlow(report.overallScore)}
            delay={0}
          />
          <StatCard
            label="ISSUES FOUND"
            value={report.summary.totalIssues}
            sub="across all sections"
            color={report.summary.totalIssues > 10 ? "#f43f5e" : report.summary.totalIssues > 5 ? "#f59e0b" : "#10b981"}
            delay={0.05}
          />
          <StatCard
            label="SUGGESTIONS"
            value={report.summary.totalSuggestions}
            sub={`${report.summary.highPriorityCount} high priority`}
            color="#6366f1"
            delay={0.1}
          />
          <StatCard
            label="SECTIONS"
            value="13 / 13"
            sub="fully validated"
            color="#22d3ee"
            delay={0.15}
          />
        </div>

        {/* ── TABS ── */}
        <div style={{
          display: "flex", gap: 2, padding: "0 28px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.2)",
        }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} className="vp-tab-btn" onClick={() => setActiveTab(tab.id)} style={{
                padding: "14px 18px", border: "none",
                background: "none",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                color: active ? "#818cf8" : "#475569",
                position: "relative",
                fontFamily: "'Syne', sans-serif",
                letterSpacing: 0.2,
              }}>
                <span style={{ marginRight: 6, fontSize: 10, opacity: 0.7 }}>{tab.icon}</span>
                {tab.label}
                {tab.count !== null && (
                  <span style={{
                    marginLeft: 6, fontSize: 10,
                    background: active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                    color: active ? "#818cf8" : "#334155",
                    padding: "1px 7px", borderRadius: 99,
                  }}>
                    {tab.count}
                  </span>
                )}
                {active && (
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                    background: "linear-gradient(90deg,transparent,#6366f1,#8b5cf6,transparent)",
                    borderRadius: "2px 2px 0 0",
                    animation: "vp-tab-slide 0.25s ease both",
                    transformOrigin: "left",
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="vp-scroll" style={{ padding: "24px 28px", maxHeight: "62vh", overflowY: "auto" }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ animation: "vp-fade-up 0.35s ease both" }}>
              {/* Section scores */}
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#334155",
                  marginBottom: 16, letterSpacing: 2,
                  fontFamily: "'Syne', sans-serif",
                }}>
                  SECTION SCORES
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {report.sections.map((s, i) => (
                    <ScoreBarRow
                      key={s.sectionId}
                      section={s.section}
                      icon={SECTION_ICONS[s.sectionId - 1]}
                      score={s.confidence}
                      hasIssues={(s.issues?.length || 0) > 0}
                      index={i}
                    />
                  ))}
                </div>
              </div>

              {/* High priority */}
              {report.summary.highPriorityCount > 0 && (
                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: "#f43f5e",
                    marginBottom: 14, letterSpacing: 2,
                    fontFamily: "'Syne', sans-serif",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#f43f5e", display: "inline-block",
                      boxShadow: "0 0 8px #f43f5e",
                      animation: "vp-pulse 1.4s ease-in-out infinite",
                    }} />
                    HIGH PRIORITY RECOMMENDATIONS
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {allSuggestions.filter(s => s.priority === "High").slice(0, 6).map((s, i) => (
                      <SuggestionCard key={i} sg={s} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTIONS */}
          {activeTab === "sections" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "vp-fade-up 0.35s ease both" }}>
              {report.sections.map(s => (
                <SectionRow key={s.sectionId} s={s} expanded={expanded} onToggle={toggleSection} />
              ))}
            </div>
          )}

          {/* ALL SUGGESTIONS */}
          {activeTab === "upgrades" && (
            <div style={{ animation: "vp-fade-up 0.35s ease both" }}>
              {["High", "Medium", "Low"].map(priority => {
                const items = allSuggestions.filter(s => s.priority === priority);
                if (!items.length) return null;
                const pColor = priority === "High" ? "#f43f5e" : priority === "Low" ? "#10b981" : "#f59e0b";
                const pBg = priority === "High" ? "rgba(244,63,94,0.08)" : priority === "Low" ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)";
                const pBorder = priority === "High" ? "rgba(244,63,94,0.2)" : priority === "Low" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)";
                return (
                  <div key={priority} style={{ marginBottom: 24 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: pColor,
                      marginBottom: 12, display: "flex", alignItems: "center", gap: 10,
                      fontFamily: "'Syne', sans-serif", letterSpacing: 1.5,
                    }}>
                      <span style={{
                        background: pBg, border: `1px solid ${pBorder}`,
                        padding: "4px 14px", borderRadius: 99, fontSize: 10,
                      }}>
                        {priority.toUpperCase()} PRIORITY — {items.length} ITEM{items.length > 1 ? "S" : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {items.map((s, i) => (
                        <SuggestionCard key={i} sg={s} index={i} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "16px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 11, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "#10b981",
              boxShadow: "0 0 6px #10b981", display: "inline-block",
            }} />
            Powered by Groq (Llama 3.3 70B) + Tavily · 13 agents ·{" "}
            {new Date(report.validatedAt).toLocaleTimeString("en-IN")}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onRevalidate} className="vp-btn" style={{
              padding: "9px 18px",
              background: "rgba(255,255,255,0.04)",
              color: "#64748b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              🔄 Re-validate
            </button>
            <button onClick={onClose} className="vp-btn" style={{
              padding: "9px 20px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
              fontFamily: "'Syne', sans-serif",
            }}>
              Done ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════ ROOT EXPORT ══════════ */
export default function ValidationPanel({ roomId, roomCode, roomName, onClose, readOnly = false }) {
  const [status, setStatus]       = useState(readOnly ? "fetching" : "idle");
  const [report, setReport]       = useState(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    // Inject global styles once
    if (!document.getElementById("vp-global-styles")) {
      const el = document.createElement("style");
      el.id = "vp-global-styles";
      el.textContent = GLOBAL_STYLES;
      document.head.appendChild(el);
    }
    if (readOnly) fetchSavedReport();
  }, []);

  const fetchSavedReport = async () => {
    setStatus("fetching");
    setErrorMsg("");
    setIsNotFound(false);
    try {
      const { data } = await axios.get(`${API}/validate-rds/${roomId}`);
      setReport(data);
      setStatus("done");
    } catch (e) {
      const is404 = e?.response?.status === 404;
      setIsNotFound(is404);
      setErrorMsg(is404
        ? "No validation report found for this room yet."
        : (e?.response?.data?.error || e.message || "Failed to load report"));
      setStatus("error");
    }
  };

  const runValidation = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const { data } = await axios.post(`${API}/validate-rds`, { roomId });
      setReport(data);
      setStatus("done");
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || e.message || "Validation failed");
      setStatus("error");
    }
  };

  if (status === "fetching") return <FetchingState roomName={roomName} roomCode={roomCode} />;
  if (status === "idle")     return <IdleState roomCode={roomCode} roomName={roomName} onClose={onClose} onRun={runValidation} />;
  if (status === "loading")  return <LoadingState roomName={roomName} roomCode={roomCode} />;
  if (status === "error")    return (
    <ErrorState
      isNotFound={isNotFound}
      roomCode={roomCode}
      errorMsg={errorMsg}
      onClose={onClose}
      onRun={runValidation}
      onRetry={fetchSavedReport}
    />
  );

  return (
    <ReportView
      report={report}
      onClose={onClose}
      onRevalidate={runValidation}
    />
  );
}