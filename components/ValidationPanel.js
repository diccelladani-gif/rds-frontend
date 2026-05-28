"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "";

const SECTION_ICONS = ["🏷️","📐","🎨","💡","⚕️","📊","🗺️","⚙️","💻","🛡️","👤","🔧","♻️"];

const STATUS_COLORS = {
  Excellent:    { bg: "#f0fdf4", border: "#86efac", text: "#15803d", badge: "#16a34a" },
  Good:         { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8", badge: "#2563eb" },
  "Needs Review": { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", badge: "#d97706" },
  Critical:     { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", badge: "#dc2626" },
};

const PRIORITY_STYLES = {
  High:   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
  Medium: { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  Low:    { bg: "#f0fdf4", color: "#16a34a", border: "#86efac" },
};

export default function ValidationPanel({ roomId, roomCode, roomName, onClose, readOnly = false }) {
  // readOnly=true  → fetch saved report instantly, zero AI tokens
  // readOnly=false → show Run button, user triggers AI validation
  const [status, setStatus]     = useState(readOnly ? "fetching" : "idle");
  const [report, setReport]     = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [expanded, setExpanded] = useState(new Set([1]));
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (readOnly) fetchSavedReport();
  }, []);

  const [isNotFound, setIsNotFound] = useState(false);

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
      setActiveTab("overview");
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || e.message || "Validation failed");
      setStatus("error");
    }
  };

  const toggleSection = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const scoreColor = (score) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#2563eb";
    if (score >= 40) return "#d97706";
    return "#dc2626";
  };

  // ── FETCHING saved report state (cinematic)
  if (status === "fetching") {
    return (
      <div style={{position:"fixed",inset:0,zIndex:9999,background:"linear-gradient(135deg,#020617 0%,#0d1b3e 50%,#0a0a1a 100%)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
        <style>{`
          @keyframes fSpin{to{transform:rotate(360deg)}}
          @keyframes fSpinR{to{transform:rotate(-360deg)}}
          @keyframes fPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.09)}}
          @keyframes fFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
          @keyframes fGrid{from{background-position:0 0}to{background-position:40px 40px}}
          @keyframes fStar{0%,100%{opacity:0.08}50%{opacity:0.5}}
        `}</style>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)",backgroundSize:"40px 40px",animation:"fGrid 4s linear infinite"}}/>
        {[...Array(16)].map((_,i)=><div key={i} style={{position:"absolute",borderRadius:"50%",width:i%4===0?3:2,height:i%4===0?3:2,background:["#a5b4fc","#7dd3fc","#c4b5fd","#fff"][i%4],left:`${(i*17+9)%100}%`,top:`${(i*23+13)%100}%`,animation:`fStar ${2+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.18}s`,pointerEvents:"none"}}/>)}
        <div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:20,animation:"fFade 0.6s ease both"}}>
          <div style={{position:"relative",width:130,height:130}}>
            <div style={{position:"absolute",inset:-16,border:"1px solid rgba(99,102,241,0.13)",borderRadius:"50%",animation:"fSpinR 10s linear infinite"}}>
              <div style={{position:"absolute",top:-3,left:"40%",width:6,height:6,borderRadius:"50%",background:"#38bdf8",boxShadow:"0 0 8px #38bdf8"}}/>
            </div>
            <div style={{position:"absolute",inset:-4,border:"1.5px solid rgba(124,58,237,0.2)",borderRadius:"50%",animation:"fSpin 6s linear infinite"}}>
              <div style={{position:"absolute",bottom:-4,left:"55%",width:7,height:7,borderRadius:"50%",background:"#a78bfa",boxShadow:"0 0 10px #a78bfa"}}/>
            </div>
            <div style={{position:"absolute",inset:10,border:"2px solid transparent",borderTopColor:"#6366f1",borderRadius:"50%",animation:"fSpin 1.4s linear infinite"}}/>
            <div style={{position:"absolute",inset:22,borderRadius:"50%",background:"linear-gradient(135deg,#4f46e5,#7c3aed)",boxShadow:"0 0 40px rgba(99,102,241,0.7),0 0 80px rgba(99,102,241,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,animation:"fPulse 2s ease-in-out infinite"}}>🤖</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,letterSpacing:4,color:"#6366f1",fontWeight:700,marginBottom:8}}>LOADING VALIDATION REPORT</div>
            <div style={{fontSize:16,fontWeight:700,color:"#e2e8f0",marginBottom:6}}>{roomName || roomCode}</div>
            <div style={{fontSize:12,color:"#475569"}}>Fetching saved analysis...</div>
          </div>
        </div>
      </div>
    );
  }

  // ── IDLE state ───────────────────────────────────────────────────────────────
  if (status === "idle") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(4px)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          background: "#fff", borderRadius: 20, padding: "40px 36px",
          maxWidth: 520, width: "90%", textAlign: "center",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🤖</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
            AI Validation Engine
          </h2>
          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 6 }}>
            Room <strong>{roomCode}</strong> — {roomName}
          </p>
          <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
            13 specialized AI agents will validate each section of this room data sheet,
            search the internet for the latest standards, and suggest improvements.
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10, marginBottom: 28,
          }}>
            {[
              ["🔍", "Validates", "all 13 sections"],
              ["🌐", "Searches", "latest standards"],
              ["💡", "Suggests", "modern alternatives"],
            ].map(([icon, label, sub]) => (
              <div key={label} style={{
                background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: 12, padding: "14px 10px",
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{label}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={onClose} style={{
              padding: "11px 22px", background: "#f1f5f9", color: "#475569",
              border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14,
              fontWeight: 600, cursor: "pointer",
            }}>
              Skip for now
            </button>
            <button onClick={runValidation} style={{
              padding: "11px 26px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
            }}>
              🚀 Run AI Validation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING state — CINEMATIC
  if (status === "loading") {
    const SL=["Room Identity & General Information","Architectural & Spatial Requirements","Interior Finishes & Aesthetics","Interior Lighting & Furniture","Clinical Functionality & Workflow","Capacity & Operations","Adjacency Matrix","MEP & Engineering Systems","Digital & Smart Systems","Safety & Infection Control","Stakeholder Experience","Fittings, Fixtures & Equipment","Waste Management"];
    const AC=["#818cf8","#34d399","#f472b6","#facc15","#38bdf8","#fb923c","#a78bfa","#4ade80","#e879f9","#67e8f9","#fca5a5","#86efac","#fde68a"];
    const ST=["Scanning data...","Web searching...","Cross-validating...","Analysing trends...","Generating report..."];
    return (
      <div style={{position:"fixed",inset:0,zIndex:9999,background:"linear-gradient(135deg,#020617 0%,#0d1b3e 40%,#0f0a2e 100%)",display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",fontFamily:"system-ui,sans-serif"}}>
        <style>{`
          @keyframes cSpin{to{transform:rotate(360deg)}}
          @keyframes cSpinR{to{transform:rotate(-360deg)}}
          @keyframes cPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
          @keyframes cFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
          @keyframes cScan{0%{top:0%}100%{top:100%}}
          @keyframes cGrid{from{background-position:0 0}to{background-position:40px 40px}}
          @keyframes cStar{0%,100%{opacity:0.08}50%{opacity:0.55}}
          @keyframes cPop{from{opacity:0;transform:scale(0.82)}to{opacity:1;transform:scale(1)}}
          @keyframes cBar{from{width:0%}to{width:100%}}
          @keyframes cTick{0%{opacity:0;transform:translateY(-4px)}50%{opacity:1}100%{opacity:0;transform:translateY(4px)}}
          @keyframes cHex{0%,100%{opacity:0.05;transform:translateY(0)}50%{opacity:0.11;transform:translateY(-10px)}}
        `}</style>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)",backgroundSize:"40px 40px",animation:"cGrid 4s linear infinite"}}/>
        {[...Array(22)].map((_,i)=><div key={i} style={{position:"absolute",borderRadius:"50%",width:i%5===0?3:i%3===0?2:1.5,height:i%5===0?3:i%3===0?2:1.5,background:["#a5b4fc","#7dd3fc","#c4b5fd","#e0f2fe","#fff"][i%5],left:`${(i*13+7)%100}%`,top:`${(i*19+11)%100}%`,animation:`cStar ${2+i*0.25}s ease-in-out infinite`,animationDelay:`${i*0.14}s`,pointerEvents:"none"}}/>)}
        {[...Array(5)].map((_,i)=><div key={i} style={{position:"absolute",fontSize:80+i*22,color:"rgba(99,102,241,0.05)",left:`${i*22}%`,top:`${i%2===0?8:52}%`,animation:`cHex ${4+i}s ease-in-out infinite`,animationDelay:`${i*0.7}s`,pointerEvents:"none",userSelect:"none"}}>&#x2B21;</div>)}
        <div style={{position:"absolute",left:0,right:0,height:2,pointerEvents:"none",background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.6),rgba(139,92,246,0.6),transparent)",animation:"cScan 3s linear infinite",zIndex:1}}/>
        <div style={{position:"relative",zIndex:10,width:"100%",maxWidth:740,padding:"32px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:22,animation:"cFadeIn 0.5s ease both"}}>
          <div style={{textAlign:"center"}}>
            <div style={{position:"relative",width:138,height:138,margin:"0 auto 16px"}}>
              <div style={{position:"absolute",inset:-18,border:"1px solid rgba(99,102,241,0.1)",borderRadius:"50%",animation:"cSpinR 12s linear infinite"}}>
                <div style={{position:"absolute",top:-3,left:"30%",width:6,height:6,borderRadius:"50%",background:"#38bdf8",boxShadow:"0 0 8px #38bdf8"}}/>
              </div>
              <div style={{position:"absolute",inset:-5,border:"1.5px solid rgba(124,58,237,0.2)",borderRadius:"50%",animation:"cSpin 7s linear infinite"}}>
                <div style={{position:"absolute",top:-4,left:"62%",width:7,height:7,borderRadius:"50%",background:"#a78bfa",boxShadow:"0 0 10px #a78bfa"}}/>
                <div style={{position:"absolute",bottom:-4,left:"18%",width:5,height:5,borderRadius:"50%",background:"#f472b6",boxShadow:"0 0 8px #f472b6"}}/>
              </div>
              <div style={{position:"absolute",inset:9,border:"2px solid rgba(99,102,241,0.35)",borderTopColor:"#6366f1",borderRadius:"50%",animation:"cSpin 2s linear infinite"}}/>
              <div style={{position:"absolute",inset:22,borderRadius:"50%",background:"linear-gradient(135deg,#4f46e5,#7c3aed)",boxShadow:"0 0 40px rgba(99,102,241,0.7),0 0 80px rgba(99,102,241,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,animation:"cPulse 2.5s ease-in-out infinite"}}>🤖</div>
            </div>
            <div style={{fontSize:10,letterSpacing:4,color:"#6366f1",fontWeight:700,marginBottom:7}}>AI VALIDATION ENGINE · ACTIVE</div>
            <h2 style={{fontSize:21,fontWeight:800,color:"#f1f5f9",marginBottom:5}}>Validating Room Data Sheet</h2>
            <p style={{fontSize:12,color:"#475569",lineHeight:1.7}}>13 specialized agents · parallel execution · live web search</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(196px,1fr))",gap:7,width:"100%"}}>
            {SL.map((sec,i)=>(
              <div key={i} style={{background:"rgba(15,23,42,0.75)",border:`1px solid ${AC[i]}28`,borderRadius:10,padding:"10px 12px",position:"relative",overflow:"hidden",animation:"cPop 0.4s ease both",animationDelay:`${i*0.055}s`,backdropFilter:"blur(8px)"}}>
                <div style={{position:"absolute",bottom:0,left:0,height:2,background:`linear-gradient(90deg,${AC[i]},transparent)`,animation:`cBar ${2.4+i*0.2}s ease-in-out infinite alternate`,animationDelay:`${i*0.09}s`}}/>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:AC[i],boxShadow:`0 0 6px ${AC[i]}`,animation:`cPulse ${1.4+i*0.1}s ease-in-out infinite`}}/>
                  <div>
                    <div style={{fontSize:9,color:"#475569",fontWeight:700,marginBottom:1,letterSpacing:0.8}}>AGENT {String(i+1).padStart(2,"0")}</div>
                    <div style={{fontSize:11,color:"#e2e8f0",fontWeight:600,lineHeight:1.3}}>{SECTION_ICONS[i]} {sec}</div>
                  </div>
                </div>
                <div style={{fontSize:9,color:AC[i],marginTop:5,letterSpacing:0.4,animation:`cTick ${1.8+i*0.12}s ease-in-out infinite`,animationDelay:`${i*0.08}s`}}>◈ {ST[i%ST.length]}</div>
              </div>
            ))}
          </div>
          <div style={{width:"100%",background:"rgba(15,23,42,0.6)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:12,padding:"11px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(8px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 8px #4ade80",animation:"cPulse 1.2s ease-in-out infinite"}}/>
              <span style={{fontSize:11,color:"#94a3b8",letterSpacing:0.5}}>PROCESSING — ALL 13 AGENTS RUNNING IN PARALLEL</span>
            </div>
            <span style={{fontSize:10,color:"#334155"}}>Groq · Tavily</span>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR state ──────────────────────────────────────────────────────────────
  if (status === "error") {
    const noReport = readOnly && isNotFound;
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(4px)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          background: "#fff", borderRadius: 20, padding: "40px 36px",
          maxWidth: 460, width: "90%", textAlign: "center",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>{noReport ? "🤖" : "⚠️"}</div>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
            {noReport ? "No Validation Report Yet" : "Validation Failed"}
          </h3>
          <p style={{ fontSize: 13.5, color: "#64748b", marginBottom: 8, lineHeight: 1.6 }}>
            {noReport
              ? `Room ${roomCode} has not been validated yet.`
              : errorMsg}
          </p>
          {noReport && (
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 28, lineHeight: 1.6 }}>
              Run the AI Validation now — 13 agents will analyse all sections,
              search for the latest standards, and generate a full report.
              This runs once and is saved permanently.
            </p>
          )}
          {!noReport && (
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24 }}>{errorMsg}</p>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onClose} style={{
              padding: "11px 22px", background: "#f1f5f9", color: "#475569",
              border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}>Close</button>
            {noReport ? (
              <button onClick={runValidation} style={{
                padding: "11px 26px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
              }}>
                🚀 Run AI Validation Now
              </button>
            ) : (
              <button onClick={fetchSavedReport} style={{
                padding: "11px 22px", background: "#6366f1", color: "#fff",
                border: "none", borderRadius: 10, fontSize: 13,
                fontWeight: 600, cursor: "pointer",
              }}>Try Again</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── DONE state — Full Report ─────────────────────────────────────────────────
    const statusStyle = STATUS_COLORS[report.overallStatus] || STATUS_COLORS["Good"];
  const allSuggestions = report.sections.flatMap(s =>
    (s.suggestions || []).map(sg => ({ ...sg, section: s.section, sectionId: s.sectionId }))
  ).sort((a, b) => {
    const p = { High: 0, Medium: 1, Low: 2 };
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1);
  });

  const SC  = score => score>=80?"#10b981":score>=60?"#6366f1":score>=40?"#f59e0b":"#ef4444";
  const SCG = score => score>=80?"90deg,#10b981,#059669":score>=60?"90deg,#6366f1,#8b5cf6":score>=40?"90deg,#f59e0b,#d97706":"90deg,#ef4444,#dc2626";
  const PRI = {
    High:   { g:"135deg,#3b0a0a,#1a0404", border:"rgba(239,68,68,0.3)",  glow:"rgba(239,68,68,0.12)",  dot:"#ef4444", text:"#fca5a5", label:"#f87171" },
    Medium: { g:"135deg,#3b1a03,#1a0c00", border:"rgba(245,158,11,0.3)", glow:"rgba(245,158,11,0.1)",  dot:"#f59e0b", text:"#fcd34d", label:"#fbbf24" },
    Low:    { g:"135deg,#042713,#021409", border:"rgba(16,185,129,0.25)", glow:"rgba(16,185,129,0.08)", dot:"#10b981", text:"#6ee7b7", label:"#34d399" },
  };

  const [hoveredSection, setHoveredSection] = React.useState ? null : null;
  const [hs, setHs] = useState(null);

  const REPORT_CSS = `
    @keyframes rp-in    { from{opacity:0;transform:scale(0.97) translateY(14px)} to{opacity:1;transform:none} }
    @keyframes rp-slide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
    @keyframes rp-glow  { 0%,100%{opacity:0.35} 50%{opacity:0.9} }
    @keyframes rp-hdr   { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes rp-grid  { from{background-position:0 0} to{background-position:48px 48px} }
    @keyframes rp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    @keyframes rp-bar   { from{width:0} to{width:100%} }
    .rp-sec:hover  { border-color:rgba(99,102,241,0.35)!important; background:rgba(20,30,60,0.85)!important }
    .rp-card:hover { transform:translateY(-1px); box-shadow:0 8px 32px rgba(0,0,0,0.5)!important }
    .rp-src:hover  { background:rgba(99,102,241,0.18)!important; color:#c7d2fe!important }
    .rp-tab:hover  { background:rgba(99,102,241,0.1)!important; color:#c7d2fe!important }
    .rp-x:hover    { background:rgba(255,255,255,0.12)!important; transform:rotate(90deg) }
    .rp-re:hover   { background:rgba(99,102,241,0.18)!important }
    .rp-dn:hover   { filter:brightness(1.18); transform:translateY(-1px) }
    ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.35);border-radius:99px}
  `;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"rgba(2,6,23,0.92)",
      backdropFilter:"blur(16px)",
      display:"flex", alignItems:"flex-start", justifyContent:"center",
      overflowY:"auto", padding:"20px 16px", minHeight:"100vh",
    }}>
      <style>{REPORT_CSS}</style>

      <div style={{
        width:"100%", maxWidth:940,
        borderRadius:24, overflow:"hidden",
        boxShadow:"0 0 0 1px rgba(99,102,241,0.18),0 40px 100px rgba(0,0,0,0.88),0 0 100px rgba(99,102,241,0.05)",
        animation:"rp-in 0.45s cubic-bezier(0.16,1,0.3,1) both",
      }}>

        {/* ═══ HEADER ════════════════════════════════════════════════════════ */}
        <div style={{
          position:"relative", overflow:"hidden",
          padding:"30px 36px 26px",
          background:"linear-gradient(135deg,#0b0820 0%,#110a2e 45%,#0c1a3a 100%)",
          borderBottom:"1px solid rgba(99,102,241,0.12)",
        }}>
          {/* Animated shimmer */}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(270deg,rgba(99,102,241,0.07),rgba(139,92,246,0.07),rgba(59,130,246,0.04),rgba(99,102,241,0.07))",backgroundSize:"400% 400%",animation:"rp-hdr 9s ease infinite"}}/>
          {/* Grid */}
          <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)",backgroundSize:"40px 40px",animation:"rp-grid 8s linear infinite",opacity:0.5}}/>
          {/* Top accent */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent 0%,#6366f1 30%,#8b5cf6 60%,#3b82f6 80%,transparent 100%)"}}/>
          {/* Glow orbs */}
          <div style={{position:"absolute",top:-50,right:80,width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.14),transparent 65%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-70,left:30,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.09),transparent 65%)",pointerEvents:"none"}}/>

          <div style={{position:"relative",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
            <div>
              {/* Live indicator */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  {["#6366f1","#8b5cf6","#3b82f6"].map((c,i)=>(
                    <div key={i} style={{width:5,height:5,borderRadius:"50%",background:c,boxShadow:`0 0 8px ${c}`,animation:`rp-glow 2s ease-in-out infinite`,animationDelay:`${i*0.35}s`}}/>
                  ))}
                </div>
                <span style={{fontSize:9,letterSpacing:3.5,color:"#6366f1",fontWeight:700}}>AI VALIDATION REPORT</span>
              </div>
              {/* Title */}
              <h1 style={{fontSize:26,fontWeight:900,color:"#fff",marginBottom:10,letterSpacing:"-0.3px",textShadow:"0 0 40px rgba(99,102,241,0.35)"}}>
                {report.roomName || report.roomCode}
              </h1>
              {/* Tags */}
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                {[report.roomTypology, report.department].filter(Boolean).map((t,i)=>(
                  <span key={i} style={{fontSize:11,color:"#a5b4fc",background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.28)",padding:"3px 12px",borderRadius:99,fontWeight:500,letterSpacing:0.2}}>{t}</span>
                ))}
                <span style={{fontSize:11,color:"#1e293b",marginLeft:2}}>
                  · Validated {new Date(report.validatedAt).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="rp-x" style={{
              width:36,height:36,borderRadius:"50%",flexShrink:0,
              background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",
              color:"#64748b",fontSize:16,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s",
            }}>✕</button>
          </div>
        </div>

        {/* ═══ SCORE CARDS ═══════════════════════════════════════════════════ */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#04070e",borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
          {[
            {label:"OVERALL SCORE", value:`${report.overallScore}%`, sub:report.overallStatus,                         color:SC(report.overallScore)},
            {label:"ISSUES FOUND",  value:report.summary.totalIssues, sub:"across all sections",                       color:report.summary.totalIssues>10?"#ef4444":report.summary.totalIssues>5?"#f59e0b":"#10b981"},
            {label:"SUGGESTIONS",   value:report.summary.totalSuggestions, sub:`${report.summary.highPriorityCount} high priority`, color:"#818cf8"},
            {label:"SECTIONS",      value:"13 / 13", sub:"fully validated",                                            color:"#38bdf8"},
          ].map((card,i)=>(
            <div key={i} style={{
              padding:"20px 24px",position:"relative",overflow:"hidden",
              borderRight:i<3?"1px solid rgba(99,102,241,0.07)":"none",
              background:"linear-gradient(180deg,#050912,#030608)",
            }}>
              {/* Top accent per card */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:1.5,background:`linear-gradient(90deg,transparent,${card.color}80,transparent)`}}/>
              {/* Subtle radial bg */}
              <div style={{position:"absolute",bottom:-15,right:-5,width:80,height:80,borderRadius:"50%",background:`radial-gradient(circle,${card.color}12,transparent)`,pointerEvents:"none"}}/>
              <div style={{fontSize:8,letterSpacing:2.5,color:"#1e293b",fontWeight:700,marginBottom:9}}>{card.label}</div>
              <div style={{fontSize:30,fontWeight:900,color:card.color,lineHeight:1,marginBottom:5,textShadow:`0 0 24px ${card.color}60`}}>{card.value}</div>
              <div style={{fontSize:10,color:"#1e293b",letterSpacing:0.2}}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ═══ TABS ═══════════════════════════════════════════════════════════ */}
        <div style={{display:"flex",background:"#030609",borderBottom:"1px solid rgba(99,102,241,0.1)",padding:"0 28px",gap:2}}>
          {[
            {id:"overview", icon:"◈", label:"Overview"},
            {id:"sections", icon:"≡", label:"Sections (13)"},
            {id:"upgrades", icon:"↑", label:`Upgrades (${report.summary.totalSuggestions})`},
          ].map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className="rp-tab" style={{
              padding:"13px 22px",border:"none",cursor:"pointer",letterSpacing:0.3,
              background:activeTab===tab.id?"rgba(99,102,241,0.1)":"transparent",
              color:activeTab===tab.id?"#a5b4fc":"#334155",
              borderBottom:activeTab===tab.id?"2px solid #6366f1":"2px solid transparent",
              fontSize:12,fontWeight:600,transition:"all 0.18s",
              display:"flex",alignItems:"center",gap:7,
            }}>
              <span style={{fontSize:10,opacity:0.55}}>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* ═══ CONTENT ════════════════════════════════════════════════════════ */}
        <div style={{background:"#030609",padding:"28px 32px"}}>

          {/* ── OVERVIEW ───────────────────────────────────────────────── */}
          {activeTab==="overview" && (
            <div style={{display:"flex",flexDirection:"column",gap:30}}>

              {/* Section score rows */}
              <div>
                <div style={{fontSize:8,letterSpacing:3,color:"#1e293b",fontWeight:700,marginBottom:14}}>SECTION ANALYSIS</div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {report.sections.map((s,idx)=>(
                    <div key={s.sectionId}
                      onMouseEnter={()=>setHs(s.sectionId)}
                      onMouseLeave={()=>setHs(null)}
                      style={{
                        display:"flex",alignItems:"center",gap:12,
                        padding:"11px 16px",
                        background:hs===s.sectionId?"rgba(20,30,60,0.85)":"rgba(10,15,35,0.6)",
                        border:`1px solid ${hs===s.sectionId?"rgba(99,102,241,0.35)":"rgba(99,102,241,0.07)"}`,
                        borderRadius:11,transition:"all 0.18s",
                        animation:"rp-slide 0.3s ease both",animationDelay:`${idx*0.03}s`,
                      }}>
                      <span style={{fontSize:14,width:22,textAlign:"center",flexShrink:0}}>{SECTION_ICONS[s.sectionId-1]}</span>
                      <div style={{fontSize:11,color:"#475569",width:215,flexShrink:0,lineHeight:1.3}}>{s.section}</div>
                      <div style={{flex:1,height:4,background:"rgba(255,255,255,0.04)",borderRadius:99,overflow:"hidden"}}>
                        <div style={{
                          width:`${s.confidence}%`,height:"100%",
                          background:`linear-gradient(${SCG(s.confidence)})`,
                          borderRadius:99,
                          boxShadow:`0 0 8px ${SC(s.confidence)}55`,
                          transition:"width 0.9s cubic-bezier(0.16,1,0.3,1)",
                        }}/>
                      </div>
                      <div style={{fontSize:12,fontWeight:800,width:34,textAlign:"right",color:SC(s.confidence),textShadow:`0 0 10px ${SC(s.confidence)}66`}}>{s.confidence}%</div>
                      <div style={{width:18,textAlign:"center",fontSize:12,flexShrink:0}}>
                        {(s.issues?.length||0)>0
                          ? <span style={{color:"#f59e0b"}}>⚠</span>
                          : <span style={{color:"#10b981"}}>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High priority */}
              {report.summary.highPriorityCount>0 && (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                    <div style={{width:3,height:18,borderRadius:99,background:"linear-gradient(180deg,#ef4444,#dc2626)",boxShadow:"0 0 10px #ef444466"}}/>
                    <div style={{fontSize:8,letterSpacing:3,color:"#f87171",fontWeight:700}}>HIGH PRIORITY RECOMMENDATIONS</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {allSuggestions.filter(s=>s.priority==="High").slice(0,5).map((s,i)=>(
                      <div key={i} className="rp-card" style={{
                        background:`linear-gradient(${PRI.High.g})`,
                        border:`1px solid ${PRI.High.border}`,
                        borderLeft:"3px solid #ef4444",
                        borderRadius:12,padding:"14px 18px",
                        boxShadow:`0 0 20px ${PRI.High.glow}`,
                        transition:"all 0.2s",
                        animation:"rp-slide 0.3s ease both",animationDelay:`${i*0.06}s`,
                      }}>
                        <div style={{fontSize:9,color:"#f87171",fontWeight:700,letterSpacing:0.5,marginBottom:6}}>
                          {SECTION_ICONS[s.sectionId-1]} {s.section}
                        </div>
                        <div style={{fontSize:13,fontWeight:700,color:"#fef2f2",marginBottom:4,lineHeight:1.4}}>{s.recommendation}</div>
                        <div style={{fontSize:12,color:"#7f1d1d",lineHeight:1.55}}>{s.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SECTIONS ───────────────────────────────────────────────── */}
          {activeTab==="sections" && (
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {report.sections.map((s)=>(
                <div key={s.sectionId} className="rp-sec" style={{
                  background:"rgba(10,15,35,0.7)",
                  border:"1px solid rgba(99,102,241,0.1)",
                  borderRadius:14,overflow:"hidden",
                  transition:"all 0.22s",
                  boxShadow:"0 2px 16px rgba(0,0,0,0.45)",
                }}>
                  <button onClick={()=>toggleSection(s.sectionId)} style={{
                    width:"100%",padding:"15px 20px",
                    display:"flex",alignItems:"center",gap:12,
                    background:"none",border:"none",cursor:"pointer",textAlign:"left",
                  }}>
                    <span style={{fontSize:17,width:24,flexShrink:0}}>{SECTION_ICONS[s.sectionId-1]}</span>
                    <span style={{flex:1,fontSize:13,fontWeight:700,color:"#e2e8f0"}}>{s.sectionId}. {s.section}</span>
                    {(s.issues?.length||0)>0 && (
                      <span style={{fontSize:9,fontWeight:700,color:"#f87171",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",padding:"2px 9px",borderRadius:99,flexShrink:0,letterSpacing:0.3}}>
                        {s.issues.length} issue{s.issues.length>1?"s":""}
                      </span>
                    )}
                    {(s.suggestions?.length||0)>0 && (
                      <span style={{fontSize:9,fontWeight:700,color:"#818cf8",background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",padding:"2px 9px",borderRadius:99,flexShrink:0,letterSpacing:0.3}}>
                        {s.suggestions.length} suggestion{s.suggestions.length>1?"s":""}
                      </span>
                    )}
                    <span style={{fontSize:13,fontWeight:800,minWidth:36,textAlign:"right",color:SC(s.confidence),flexShrink:0,textShadow:`0 0 10px ${SC(s.confidence)}55`}}>
                      {s.confidence}%
                    </span>
                    <span style={{color:"#1e293b",fontSize:10,marginLeft:2,flexShrink:0}}>{expanded.has(s.sectionId)?"▲":"▼"}</span>
                  </button>

                  {expanded.has(s.sectionId) && (
                    <div style={{padding:"0 20px 18px",borderTop:"1px solid rgba(99,102,241,0.08)"}}>
                      <p style={{fontSize:12.5,color:"#475569",margin:"12px 0 16px",lineHeight:1.7}}>{s.summary}</p>

                      {/* Issues */}
                      {(s.issues?.length||0)>0 && (
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:8,letterSpacing:2,color:"#f87171",fontWeight:700,marginBottom:10}}>⚠ ISSUES</div>
                          {s.issues.map((issue,i)=>(
                            <div key={i} style={{
                              background:"rgba(239,68,68,0.06)",
                              border:"1px solid rgba(239,68,68,0.18)",
                              borderLeft:"2px solid #ef4444",
                              borderRadius:9,padding:"10px 14px",marginBottom:6,
                            }}>
                              <div style={{fontSize:12,fontWeight:700,color:"#fca5a5",marginBottom:3}}>
                                {issue.field}
                                {issue.current && <span style={{fontWeight:400,color:"#334155"}}> — current: <em style={{color:"#475569"}}>{issue.current}</em></span>}
                              </div>
                              <div style={{fontSize:12,color:"#ef4444",lineHeight:1.5}}>{issue.problem}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {(s.suggestions?.length||0)>0 && (
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:8,letterSpacing:2,color:"#818cf8",fontWeight:700,marginBottom:10}}>💡 SUGGESTIONS</div>
                          {s.suggestions.map((sg,i)=>{
                            const p = PRI[sg.priority] || PRI.Medium;
                            return (
                              <div key={i} style={{
                                background:`linear-gradient(${p.g})`,
                                border:`1px solid ${p.border}`,
                                borderLeft:`2px solid ${p.dot}`,
                                borderRadius:9,padding:"11px 14px",marginBottom:6,
                                boxShadow:`0 0 12px ${p.glow}`,
                              }}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:4}}>
                                  <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",lineHeight:1.4}}>{sg.recommendation}</div>
                                  <span style={{fontSize:8,fontWeight:700,color:p.label,background:"rgba(0,0,0,0.35)",border:`1px solid ${p.border}`,padding:"2px 8px",borderRadius:99,flexShrink:0,letterSpacing:1}}>
                                    {sg.priority?.toUpperCase()}
                                  </span>
                                </div>
                                <div style={{fontSize:12,color:"#475569",lineHeight:1.55}}>{sg.reason}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Sources */}
                      {(s.sources?.length||0)>0 && (
                        <div>
                          <div style={{fontSize:8,letterSpacing:2,color:"#1e293b",fontWeight:700,marginBottom:8}}>🌐 SOURCES</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                            {s.sources.filter(src=>src.url).map((src,i)=>(
                              <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="rp-src" style={{
                                fontSize:10,color:"#6366f1",
                                background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)",
                                padding:"3px 12px",borderRadius:99,textDecoration:"none",
                                maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                                transition:"all 0.18s",
                              }}>{src.title||src.url}</a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── UPGRADES ───────────────────────────────────────────────── */}
          {activeTab==="upgrades" && (
            <div style={{display:"flex",flexDirection:"column",gap:22}}>
              {["High","Medium","Low"].map(priority=>{
                const items = allSuggestions.filter(s=>s.priority===priority);
                if(!items.length) return null;
                const p = PRI[priority];
                return (
                  <div key={priority}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:p.dot,boxShadow:`0 0 10px ${p.dot}aa`}}/>
                      <div style={{fontSize:8,letterSpacing:3,color:p.label,fontWeight:700}}>
                        {priority.toUpperCase()} PRIORITY — {items.length} ITEM{items.length>1?"S":""}
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {items.map((s,i)=>(
                        <div key={i} className="rp-card" style={{
                          background:`linear-gradient(${p.g})`,
                          border:`1px solid ${p.border}`,
                          borderLeft:`3px solid ${p.dot}`,
                          borderRadius:12,padding:"14px 18px",
                          boxShadow:`0 0 16px ${p.glow}`,
                          transition:"all 0.2s",
                          animation:"rp-slide 0.3s ease both",animationDelay:`${i*0.04}s`,
                        }}>
                          <div style={{fontSize:9,color:p.label,fontWeight:700,marginBottom:6,letterSpacing:0.3,opacity:0.8}}>
                            {SECTION_ICONS[s.sectionId-1]} {s.section}{s.field&&` · ${s.field}`}
                          </div>
                          <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",marginBottom:5,lineHeight:1.4}}>{s.recommendation}</div>
                          <div style={{fontSize:12,color:"#475569",lineHeight:1.6}}>{s.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
        <div style={{
          background:"#020508",
          borderTop:"1px solid rgba(99,102,241,0.08)",
          padding:"13px 32px",
          display:"flex",justifyContent:"space-between",alignItems:"center",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 7px #10b981",animation:"rp-glow 2s ease-in-out infinite"}}/>
            <span style={{fontSize:10,color:"#1e293b",letterSpacing:0.3}}>
              Groq Llama 3.3 70B · Tavily Web Search · 13 Agents · {new Date(report.validatedAt).toLocaleTimeString("en-IN")}
            </span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={runValidation} className="rp-re" style={{
              padding:"8px 16px",
              background:"rgba(99,102,241,0.07)",color:"#6366f1",
              border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,
              fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.2s",
              display:"flex",alignItems:"center",gap:5,
            }}>↺ Re-validate</button>
            <button onClick={onClose} className="rp-dn" style={{
              padding:"8px 20px",
              background:"linear-gradient(135deg,#6366f1,#7c3aed)",color:"#fff",
              border:"none",borderRadius:8,fontSize:11,fontWeight:700,
              cursor:"pointer",transition:"all 0.2s",
              boxShadow:"0 4px 16px rgba(99,102,241,0.4)",
            }}>Done ✓</button>
          </div>
        </div>

      </div>
    </div>
  );
}