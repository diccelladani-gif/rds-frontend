"use client";

import { useState } from "react";
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

export default function ValidationPanel({ roomId, roomCode, roomName, onClose }) {
  const [status, setStatus]   = useState("idle"); // idle | loading | done | error
  const [report, setReport]   = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [expanded, setExpanded] = useState(new Set([1])); // section 1 open by default
  const [activeTab, setActiveTab] = useState("overview"); // overview | sections

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

  // ── LOADING state ────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(4px)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          background: "#fff", borderRadius: 20, padding: "44px 40px",
          maxWidth: 440, width: "90%", textAlign: "center",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        }}>
          {/* Spinner */}
          <div style={{
            width: 64, height: 64, margin: "0 auto 20px",
            border: "5px solid #e2e8f0",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
            Validating Room Data Sheet
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
            13 AI agents are running in parallel — searching the internet and analyzing each section…
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, textAlign: "left" }}>
            {[
              "Room Identity & General Information",
              "Architectural & Spatial Requirements",
              "Interior Finishes & Aesthetics",
              "Interior Lighting & Furniture",
              "Clinical Functionality & Workflow",
              "Capacity & Operations",
              "Adjacency Matrix",
              "MEP & Engineering Systems",
              "Digital & Smart Systems",
              "Safety & Infection Control",
              "Stakeholder Experience",
              "Fittings, Fixtures & Equipment",
              "Waste Management",
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: "2px solid #e2e8f0",
                  borderTopColor: "#6366f1",
                  animation: `spin ${0.8 + i * 0.05}s linear infinite`,
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: "#475569" }}>{SECTION_ICONS[i]} {s}</span>
              </div>
            ))}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── ERROR state ──────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(4px)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          background: "#fff", borderRadius: 20, padding: "36px 32px",
          maxWidth: 420, width: "90%", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Validation Failed</h3>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>{errorMsg}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={onClose} style={{
              padding: "10px 20px", background: "#f1f5f9", color: "#475569",
              border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}>Close</button>
            <button onClick={runValidation} style={{
              padding: "10px 20px", background: "#6366f1", color: "#fff",
              border: "none", borderRadius: 10, fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}>Retry</button>
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
      overflowY: "auto", padding: "24px 16px",
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
        <div style={{ padding: "24px 28px", maxHeight: "55vh", overflowY: "auto" }}>

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
