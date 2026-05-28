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

  // ── DONE state — CINEMATIC PREMIUM REPORT ──────────────────────────────────
  const allSuggestions = report.sections.flatMap(s =>
    (s.suggestions || []).map(sg => ({ ...sg, section: s.section, sectionId: s.sectionId }))
  ).sort((a, b) => ({ High:0, Medium:1, Low:2 }[a.priority]??1) - ({ High:0, Medium:1, Low:2 }[b.priority]??1));

  const SC = (score) => score>=80?"#34d399":score>=60?"#60a5fa":score>=40?"#fbbf24":"#f87171";
  const SG = (score) => score>=80?"linear-gradient(90deg,#34d399,#10b981)":score>=60?"linear-gradient(90deg,#60a5fa,#3b82f6)":score>=40?"linear-gradient(90deg,#fbbf24,#f59e0b)":"linear-gradient(90deg,#f87171,#ef4444)";
  const PB = { High:{bg:"rgba(239,68,68,0.12)",border:"rgba(239,68,68,0.3)",color:"#f87171",dot:"#ef4444"}, Medium:{bg:"rgba(251,191,36,0.1)",border:"rgba(251,191,36,0.3)",color:"#fbbf24",dot:"#f59e0b"}, Low:{bg:"rgba(52,211,153,0.1)",border:"rgba(52,211,153,0.3)",color:"#34d399",dot:"#10b981"} };

  const TABS = [
    { id:"overview", label:"Overview",           icon:"◈" },
    { id:"sections", label:"Sections (13)",       icon:"≡" },
    { id:"upgrades", label:`Upgrades (${report.summary.totalSuggestions})`, icon:"⬆" },
  ];

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"rgba(2,6,23,0.92)",
      backdropFilter:"blur(12px)",
      display:"flex", alignItems:"flex-start", justifyContent:"center",
      overflowY:"auto", padding:"24px 16px", minHeight:"100vh",
    }}>
      <style>{`
        @keyframes rpFadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes rpBarFill{from{width:0}to{width:var(--w)}}
        @keyframes rpGlow{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes rpPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes rpSlideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
        @keyframes rpGrid{from{background-position:0 0}to{background-position:32px 32px}}
        .rp-tab:hover{color:#a5b4fc!important;background:rgba(99,102,241,0.08)!important}
        .rp-sec:hover{border-color:rgba(99,102,241,0.3)!important;background:rgba(15,23,42,0.9)!important}
        .rp-src:hover{background:rgba(99,102,241,0.15)!important;color:#a5b4fc!important}
        .rp-btn:hover{filter:brightness(1.15)}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:99px}
      `}</style>

      {/* Main card */}
      <div style={{
        width:"100%", maxWidth:900,
        background:"linear-gradient(180deg,#0d1117 0%,#0a0f1e 100%)",
        border:"1px solid rgba(99,102,241,0.2)",
        borderRadius:24, overflow:"hidden",
        boxShadow:"0 0 0 1px rgba(99,102,241,0.1),0 32px 80px rgba(0,0,0,0.8),0 0 60px rgba(99,102,241,0.06)",
        animation:"rpFadeIn 0.5s ease both",
      }}>

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div style={{
          position:"relative", overflow:"hidden",
          background:"linear-gradient(135deg,#0f0a2e 0%,#1a0a3e 50%,#0d1b3e 100%)",
          padding:"28px 32px",
          borderBottom:"1px solid rgba(99,102,241,0.15)",
        }}>
          {/* bg grid */}
          <div style={{position:"absolute",inset:0,pointerEvents:"none",opacity:0.4,
            backgroundImage:"linear-gradient(rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.07) 1px,transparent 1px)",
            backgroundSize:"32px 32px",animation:"rpGrid 6s linear infinite"}}/>
          {/* glow orbs */}
          <div style={{position:"absolute",top:-40,right:80,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-60,left:40,width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.1),transparent 70%)",pointerEvents:"none"}}/>

          <div style={{position:"relative",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#6366f1",boxShadow:"0 0 8px #6366f1",animation:"rpGlow 2s ease-in-out infinite"}}/>
                <span style={{fontSize:10,letterSpacing:3,color:"#6366f1",fontWeight:700}}>AI VALIDATION REPORT</span>
              </div>
              <h2 style={{fontSize:24,fontWeight:800,color:"#f1f5f9",marginBottom:6,letterSpacing:0.3}}>
                {report.roomName || report.roomCode}
              </h2>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                {[report.roomTypology, report.department].filter(Boolean).map((t,i)=>(
                  <span key={i} style={{fontSize:11,color:"#a5b4fc",background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.2)",padding:"2px 10px",borderRadius:99}}>{t}</span>
                ))}
                <span style={{fontSize:11,color:"#475569"}}>· Validated {new Date(report.validatedAt).toLocaleString("en-IN")}</span>
              </div>
            </div>
            <button onClick={onClose} className="rp-btn" style={{
              width:36,height:36,borderRadius:"50%",
              background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
              color:"#94a3b8",fontSize:16,cursor:"pointer",flexShrink:0,
              display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",
            }}>✕</button>
          </div>
        </div>

        {/* ── SCORE CARDS ────────────────────────────────────────────── */}
        <div style={{
          display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,
          background:"rgba(99,102,241,0.08)",
          borderBottom:"1px solid rgba(99,102,241,0.1)",
        }}>
          {[
            { label:"OVERALL SCORE",  value:`${report.overallScore}%`,  sub:report.overallStatus,                              color:SC(report.overallScore), icon:"◎" },
            { label:"ISSUES FOUND",   value:report.summary.totalIssues, sub:"across all sections",                             color:report.summary.totalIssues>10?"#f87171":report.summary.totalIssues>5?"#fbbf24":"#34d399", icon:"⚠" },
            { label:"SUGGESTIONS",    value:report.summary.totalSuggestions, sub:`${report.summary.highPriorityCount} high priority`, color:"#818cf8", icon:"💡" },
            { label:"SECTIONS",       value:"13 / 13",                  sub:"fully validated",                                 color:"#60a5fa", icon:"✓" },
          ].map((card,i)=>(
            <div key={i} style={{
              background:"linear-gradient(180deg,#0d1117,#080d1a)",
              padding:"20px 22px", position:"relative", overflow:"hidden",
            }}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${card.color}55,transparent)`}}/>
              <div style={{fontSize:9,letterSpacing:2,color:"#475569",fontWeight:700,marginBottom:8}}>{card.label}</div>
              <div style={{fontSize:28,fontWeight:900,color:card.color,lineHeight:1,marginBottom:4,
                textShadow:`0 0 20px ${card.color}44`}}>{card.value}</div>
              <div style={{fontSize:11,color:"#334155"}}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ── TABS ───────────────────────────────────────────────────── */}
        <div style={{
          display:"flex",gap:0,
          background:"#080d1a",
          borderBottom:"1px solid rgba(99,102,241,0.12)",
          padding:"0 28px",
        }}>
          {TABS.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className="rp-tab" style={{
              padding:"14px 20px",border:"none",
              background:activeTab===tab.id?"rgba(99,102,241,0.1)":"transparent",
              fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s",
              color:activeTab===tab.id?"#a5b4fc":"#475569",
              borderBottom:activeTab===tab.id?"2px solid #6366f1":"2px solid transparent",
              display:"flex",alignItems:"center",gap:6,letterSpacing:0.3,
            }}>
              <span style={{fontSize:10,opacity:0.7}}>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ────────────────────────────────────────────── */}
        <div style={{padding:"28px 32px",background:"#080d1a"}}>

          {/* OVERVIEW TAB */}
          {activeTab==="overview" && (
            <div style={{display:"flex",flexDirection:"column",gap:28}}>

              {/* Section score bars */}
              <div>
                <div style={{fontSize:10,letterSpacing:2,color:"#475569",fontWeight:700,marginBottom:16}}>SECTION ANALYSIS</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {report.sections.map((s,idx)=>(
                    <div key={s.sectionId} style={{
                      display:"flex",alignItems:"center",gap:12,
                      padding:"10px 14px",
                      background:"rgba(15,23,42,0.6)",
                      border:"1px solid rgba(99,102,241,0.08)",
                      borderRadius:10,
                      animation:`rpSlideIn 0.3s ease both`,
                      animationDelay:`${idx*0.04}s`,
                    }}>
                      <span style={{fontSize:15,width:22,textAlign:"center"}}>{SECTION_ICONS[s.sectionId-1]}</span>
                      <div style={{fontSize:11,color:"#64748b",width:210,flexShrink:0,lineHeight:1.3}}>{s.section}</div>
                      <div style={{flex:1,height:5,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden"}}>
                        <div style={{
                          width:`${s.confidence}%`,height:"100%",
                          background:SG(s.confidence),borderRadius:99,
                          boxShadow:`0 0 6px ${SC(s.confidence)}66`,
                          transition:"width 0.8s ease",
                        }}/>
                      </div>
                      <div style={{fontSize:12,fontWeight:800,width:34,textAlign:"right",color:SC(s.confidence),
                        textShadow:`0 0 8px ${SC(s.confidence)}55`}}>{s.confidence}%</div>
                      <div style={{width:18,textAlign:"center",fontSize:11}}>
                        {(s.issues?.length||0)>0
                          ? <span style={{color:"#fbbf24"}}>⚠</span>
                          : <span style={{color:"#34d399"}}>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High priority */}
              {report.summary.highPriorityCount>0 && (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                    <div style={{width:4,height:16,background:"#ef4444",borderRadius:99,boxShadow:"0 0 8px #ef444466"}}/>
                    <div style={{fontSize:10,letterSpacing:2,color:"#f87171",fontWeight:700}}>HIGH PRIORITY RECOMMENDATIONS</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {allSuggestions.filter(s=>s.priority==="High").slice(0,6).map((s,i)=>(
                      <div key={i} style={{
                        background:"rgba(239,68,68,0.06)",
                        border:"1px solid rgba(239,68,68,0.2)",
                        borderLeft:"3px solid #ef4444",
                        borderRadius:10,padding:"14px 16px",
                        animation:`rpSlideIn 0.3s ease both`,animationDelay:`${i*0.05}s`,
                      }}>
                        <div style={{fontSize:10,color:"#f87171",fontWeight:700,marginBottom:5,letterSpacing:0.5}}>
                          {SECTION_ICONS[s.sectionId-1]} {s.section}
                        </div>
                        <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>{s.recommendation}</div>
                        <div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{s.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTIONS TAB */}
          {activeTab==="sections" && (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {report.sections.map((s)=>(
                <div key={s.sectionId} className="rp-sec" style={{
                  background:"rgba(15,23,42,0.7)",
                  border:"1px solid rgba(99,102,241,0.1)",
                  borderRadius:14,overflow:"hidden",transition:"all 0.2s",
                }}>
                  {/* Section header */}
                  <button onClick={()=>toggleSection(s.sectionId)} style={{
                    width:"100%",padding:"16px 20px",
                    display:"flex",alignItems:"center",gap:12,
                    background:"none",border:"none",cursor:"pointer",textAlign:"left",
                  }}>
                    <span style={{fontSize:18,width:26}}>{SECTION_ICONS[s.sectionId-1]}</span>
                    <span style={{flex:1,fontSize:13,fontWeight:700,color:"#e2e8f0"}}>{s.sectionId}. {s.section}</span>
                    {(s.issues?.length||0)>0 && (
                      <span style={{fontSize:10,fontWeight:700,color:"#f87171",background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",padding:"2px 9px",borderRadius:99}}>
                        {s.issues.length} issue{s.issues.length>1?"s":""}
                      </span>
                    )}
                    {(s.suggestions?.length||0)>0 && (
                      <span style={{fontSize:10,fontWeight:700,color:"#818cf8",background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.25)",padding:"2px 9px",borderRadius:99}}>
                        {s.suggestions.length} suggestion{s.suggestions.length>1?"s":""}
                      </span>
                    )}
                    <span style={{fontSize:13,fontWeight:800,color:SC(s.confidence),minWidth:36,textAlign:"right",
                      textShadow:`0 0 8px ${SC(s.confidence)}55`}}>{s.confidence}%</span>
                    <span style={{color:"#334155",fontSize:11,marginLeft:4}}>{expanded.has(s.sectionId)?"▲":"▼"}</span>
                  </button>

                  {/* Expanded content */}
                  {expanded.has(s.sectionId) && (
                    <div style={{padding:"0 20px 18px",borderTop:"1px solid rgba(99,102,241,0.08)"}}>
                      <p style={{fontSize:12.5,color:"#64748b",margin:"12px 0 16px",lineHeight:1.7}}>{s.summary}</p>

                      {/* Issues */}
                      {(s.issues?.length||0)>0 && (
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:9,letterSpacing:2,color:"#f87171",fontWeight:700,marginBottom:10}}>⚠ ISSUES</div>
                          {s.issues.map((issue,i)=>(
                            <div key={i} style={{
                              background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.18)",
                              borderLeft:"2px solid #ef4444",borderRadius:8,padding:"10px 14px",marginBottom:6,
                            }}>
                              <div style={{fontSize:12,fontWeight:700,color:"#fca5a5",marginBottom:3}}>
                                {issue.field}{issue.current&&<span style={{fontWeight:400,color:"#475569"}}> — current: <em style={{color:"#94a3b8"}}>{issue.current}</em></span>}
                              </div>
                              <div style={{fontSize:12,color:"#f87171",lineHeight:1.5}}>{issue.problem}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {(s.suggestions?.length||0)>0 && (
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:9,letterSpacing:2,color:"#818cf8",fontWeight:700,marginBottom:10}}>💡 SUGGESTIONS</div>
                          {s.suggestions.map((sg,i)=>{
                            const p=PB[sg.priority]||PB.Medium;
                            return (
                              <div key={i} style={{
                                background:p.bg,border:`1px solid ${p.border}`,
                                borderLeft:`2px solid ${p.dot}`,
                                borderRadius:8,padding:"10px 14px",marginBottom:6,
                              }}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:4}}>
                                  <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",lineHeight:1.4}}>{sg.recommendation}</div>
                                  <span style={{fontSize:9,fontWeight:700,color:p.color,
                                    background:"rgba(0,0,0,0.3)",border:`1px solid ${p.border}`,
                                    padding:"2px 8px",borderRadius:99,flexShrink:0,letterSpacing:0.5}}>
                                    {sg.priority?.toUpperCase()}
                                  </span>
                                </div>
                                <div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{sg.reason}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Sources */}
                      {(s.sources?.length||0)>0 && (
                        <div>
                          <div style={{fontSize:9,letterSpacing:2,color:"#334155",fontWeight:700,marginBottom:8}}>🌐 SOURCES</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                            {s.sources.filter(src=>src.url).map((src,i)=>(
                              <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="rp-src" style={{
                                fontSize:10,color:"#6366f1",
                                background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",
                                padding:"3px 11px",borderRadius:99,textDecoration:"none",
                                maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                                transition:"all 0.2s",
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

          {/* UPGRADES TAB */}
          {activeTab==="upgrades" && (
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {["High","Medium","Low"].map(priority=>{
                const items=allSuggestions.filter(s=>s.priority===priority);
                if(!items.length) return null;
                const p=PB[priority];
                return (
                  <div key={priority}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:p.dot,boxShadow:`0 0 8px ${p.dot}`}}/>
                      <div style={{fontSize:9,letterSpacing:2,color:p.color,fontWeight:700}}>
                        {priority.toUpperCase()} PRIORITY — {items.length} ITEM{items.length>1?"S":""}
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:7}}>
                      {items.map((s,i)=>(
                        <div key={i} style={{
                          background:"rgba(15,23,42,0.8)",
                          border:`1px solid ${p.border}`,borderLeft:`3px solid ${p.dot}`,
                          borderRadius:12,padding:"14px 18px",
                          animation:`rpSlideIn 0.3s ease both`,animationDelay:`${i*0.04}s`,
                        }}>
                          <div style={{fontSize:9,color:"#334155",fontWeight:700,marginBottom:6,letterSpacing:0.5}}>
                            {SECTION_ICONS[s.sectionId-1]} {s.section}{s.field&&` · ${s.field}`}
                          </div>
                          <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",marginBottom:5,lineHeight:1.4}}>{s.recommendation}</div>
                          <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>{s.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <div style={{
          background:"linear-gradient(180deg,#080d1a,#050810)",
          borderTop:"1px solid rgba(99,102,241,0.1)",
          padding:"14px 32px",
          display:"flex",justifyContent:"space-between",alignItems:"center",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#34d399",boxShadow:"0 0 6px #34d399",animation:"rpGlow 2s ease-in-out infinite"}}/>
            <span style={{fontSize:11,color:"#334155",letterSpacing:0.3}}>
              Groq Llama 3.3 70B · Tavily Web Search · 13 Agents · {new Date(report.validatedAt).toLocaleTimeString("en-IN")}
            </span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={runValidation} className="rp-btn" style={{
              padding:"8px 16px",
              background:"rgba(99,102,241,0.1)",color:"#818cf8",
              border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,
              fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s",
              display:"flex",alignItems:"center",gap:6,
            }}>
              <span style={{fontSize:11}}>↺</span> Re-validate
            </button>
            <button onClick={onClose} className="rp-btn" style={{
              padding:"8px 20px",
              background:"linear-gradient(135deg,#6366f1,#7c3aed)",color:"#fff",
              border:"none",borderRadius:8,
              fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s",
              boxShadow:"0 4px 14px rgba(99,102,241,0.35)",
            }}>
              Done ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}