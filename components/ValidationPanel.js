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

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(15,23,42,0.75)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      overflowY: "auto", padding: "24px 16px", minHeight: "100vh",
    }}>
      <div style={{
        background: "#f8fafc", borderRadius: 20,
        maxWidth: 820, width: "100%",
        boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e1b4b, #312e81)",
          padding: "24px 28px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 600, marginBottom: 4 }}>
              AI VALIDATION REPORT
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
              {report.roomName || report.roomCode}
            </h2>
            <div style={{ fontSize: 12, color: "#c7d2fe" }}>
              {report.roomTypology} · {report.department} · Validated {new Date(report.validatedAt).toLocaleString("en-IN")}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)", border: "none",
            color: "#fff", fontSize: 18, cursor: "pointer", flexShrink: 0,
          }}>✕</button>
        </div>

        {/* Score bar */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #e2e8f0",
          padding: "20px 28px",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
        }}>
          {[
            {
              label: "Overall Score",
              value: `${report.overallScore}%`,
              sub: report.overallStatus,
              color: scoreColor(report.overallScore),
            },
            {
              label: "Issues Found",
              value: report.summary.totalIssues,
              sub: "across all sections",
              color: report.summary.totalIssues > 10 ? "#dc2626" : report.summary.totalIssues > 5 ? "#d97706" : "#16a34a",
            },
            {
              label: "Suggestions",
              value: report.summary.totalSuggestions,
              sub: `${report.summary.highPriorityCount} high priority`,
              color: "#6366f1",
            },
            {
              label: "Sections",
              value: "13 / 13",
              sub: "fully validated",
              color: "#0369a1",
            },
          ].map(card => (
            <div key={card.label} style={{
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: 12, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>
                {card.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #e2e8f0",
          padding: "0 28px",
          display: "flex", gap: 4,
        }}>
          {[
            { id: "overview",  label: "📊 Overview" },
            { id: "sections",  label: "📋 Sections (13)" },
            { id: "upgrades",  label: `💡 All Suggestions (${report.summary.totalSuggestions})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "13px 18px", border: "none", background: "none",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              color: activeTab === tab.id ? "#6366f1" : "#64748b",
              borderBottom: activeTab === tab.id ? "2px solid #6366f1" : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: "24px 28px" }}>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div>
              {/* Section score grid */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 12 }}>
                  Section Scores
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {report.sections.map((s) => (
                    <div key={s.sectionId} style={{
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{ width: 24, fontSize: 14 }}>{SECTION_ICONS[s.sectionId - 1]}</div>
                      <div style={{ fontSize: 12, color: "#475569", width: 220, flexShrink: 0 }}>
                        {s.section}
                      </div>
                      <div style={{
                        flex: 1, height: 8, background: "#e2e8f0",
                        borderRadius: 99, overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${s.confidence}%`, height: "100%",
                          background: `linear-gradient(90deg, ${scoreColor(s.confidence)}, ${scoreColor(s.confidence)}aa)`,
                          borderRadius: 99, transition: "width 0.6s ease",
                        }} />
                      </div>
                      <div style={{
                        fontSize: 12, fontWeight: 700, width: 36,
                        color: scoreColor(s.confidence), textAlign: "right",
                      }}>
                        {s.confidence}%
                      </div>
                      <div style={{
                        fontSize: 11, color: "#94a3b8", width: 16, textAlign: "center",
                      }}>
                        {(s.issues?.length || 0) > 0 ? `⚠️` : "✅"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High priority highlights */}
              {report.summary.highPriorityCount > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 12 }}>
                    🔴 High Priority Recommendations
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {allSuggestions.filter(s => s.priority === "High").slice(0, 6).map((s, i) => (
                      <div key={i} style={{
                        background: "#fef2f2", border: "1px solid #fca5a5",
                        borderRadius: 10, padding: "12px 14px",
                      }}>
                        <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 700, marginBottom: 4 }}>
                          {SECTION_ICONS[s.sectionId - 1]} {s.section} · HIGH PRIORITY
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 3 }}>
                          {s.recommendation}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{s.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTIONS TAB */}
          {activeTab === "sections" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {report.sections.map((s) => (
                <div key={s.sectionId} style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: 14, overflow: "hidden",
                }}>
                  {/* Section header — clickable */}
                  <button onClick={() => toggleSection(s.sectionId)} style={{
                    width: "100%", padding: "14px 18px",
                    display: "flex", alignItems: "center", gap: 12,
                    background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  }}>
                    <span style={{ fontSize: 18 }}>{SECTION_ICONS[s.sectionId - 1]}</span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                      {s.sectionId}. {s.section}
                    </span>
                    {/* Issues badge */}
                    {(s.issues?.length || 0) > 0 && (
                      <span style={{
                        background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5",
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      }}>
                        {s.issues.length} issue{s.issues.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {/* Suggestions badge */}
                    {(s.suggestions?.length || 0) > 0 && (
                      <span style={{
                        background: "#eff6ff", color: "#2563eb", border: "1px solid #93c5fd",
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      }}>
                        {s.suggestions.length} suggestion{s.suggestions.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {/* Score */}
                    <span style={{
                      fontSize: 13, fontWeight: 800,
                      color: scoreColor(s.confidence), minWidth: 38, textAlign: "right",
                    }}>
                      {s.confidence}%
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>
                      {expanded.has(s.sectionId) ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Expanded content */}
                  {expanded.has(s.sectionId) && (
                    <div style={{
                      padding: "0 18px 16px", borderTop: "1px solid #f1f5f9",
                    }}>
                      {/* Summary */}
                      <p style={{ fontSize: 13, color: "#475569", margin: "12px 0", lineHeight: 1.6 }}>
                        {s.summary}
                      </p>

                      {/* Issues */}
                      {(s.issues?.length || 0) > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>
                            ⚠️ Issues
                          </div>
                          {s.issues.map((issue, i) => (
                            <div key={i} style={{
                              background: "#fef2f2", border: "1px solid #fecaca",
                              borderRadius: 8, padding: "10px 12px", marginBottom: 6,
                            }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                                {issue.field}
                                {issue.current && (
                                  <span style={{ fontWeight: 400, color: "#6b7280" }}>
                                    {" "}— current: <em>{issue.current}</em>
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: "#dc2626", marginTop: 3 }}>
                                {issue.problem}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {(s.suggestions?.length || 0) > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>
                            💡 Suggestions
                          </div>
                          {s.suggestions.map((sg, i) => {
                            const ps = PRIORITY_STYLES[sg.priority] || PRIORITY_STYLES.Medium;
                            return (
                              <div key={i} style={{
                                background: ps.bg, border: `1px solid ${ps.border}`,
                                borderRadius: 8, padding: "10px 12px", marginBottom: 6,
                              }}>
                                <div style={{
                                  display: "flex", justifyContent: "space-between",
                                  alignItems: "flex-start", gap: 8, marginBottom: 4,
                                }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                                    {sg.recommendation}
                                  </div>
                                  <span style={{
                                    fontSize: 10, fontWeight: 700, color: ps.color,
                                    background: "#fff", border: `1px solid ${ps.border}`,
                                    padding: "2px 7px", borderRadius: 99, flexShrink: 0,
                                  }}>
                                    {sg.priority}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, color: "#64748b" }}>{sg.reason}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Sources */}
                      {(s.sources?.length || 0) > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>
                            🌐 Sources
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {s.sources.filter(src => src.url).map((src, i) => (
                              <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                style={{
                                  fontSize: 11, color: "#3b82f6",
                                  background: "#eff6ff", border: "1px solid #bfdbfe",
                                  padding: "3px 10px", borderRadius: 99,
                                  textDecoration: "none", maxWidth: 200,
                                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                {src.title || src.url}
                              </a>
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

          {/* UPGRADES / ALL SUGGESTIONS TAB */}
          {activeTab === "upgrades" && (
            <div>
              {["High", "Medium", "Low"].map(priority => {
                const items = allSuggestions.filter(s => s.priority === priority);
                if (!items.length) return null;
                const ps = PRIORITY_STYLES[priority];
                return (
                  <div key={priority} style={{ marginBottom: 20 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: ps.color, marginBottom: 10,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{
                        background: ps.bg, border: `1px solid ${ps.border}`,
                        padding: "3px 12px", borderRadius: 99, fontSize: 12,
                      }}>
                        {priority} Priority — {items.length} item{items.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {items.map((s, i) => (
                        <div key={i} style={{
                          background: "#fff", border: `1px solid ${ps.border}`,
                          borderRadius: 12, padding: "14px 16px",
                        }}>
                          <div style={{
                            fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 5,
                          }}>
                            {SECTION_ICONS[s.sectionId - 1]} {s.section}
                            {s.field && ` · ${s.field}`}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 5 }}>
                            {s.recommendation}
                          </div>
                          <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                            {s.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: "#fff", borderTop: "1px solid #e2e8f0",
          padding: "16px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Powered by Groq (Llama 3.3 70B) + Tavily Web Search · 13 agents · {new Date(report.validatedAt).toLocaleTimeString("en-IN")}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={runValidation} style={{
              padding: "9px 18px", background: "#f1f5f9", color: "#475569",
              border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}>
              🔄 Re-validate
            </button>
            <button onClick={onClose} style={{
              padding: "9px 18px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              Done ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}