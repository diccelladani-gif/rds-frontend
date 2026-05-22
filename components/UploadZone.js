"use client";
import { useState, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

async function extractFromBackend(type, content) {
  const res = await fetch(`${API}/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, content })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Extraction failed");
  return data; // { fields, image }
}

// ─── COMPONENT ────────────────────────────────────────────
export default function UploadZone({ onExtracted }) {
  const [status,   setStatus]   = useState("idle");
  const [msg,      setMsg]      = useState("");
  const [dragging, setDragging] = useState(false);
  const [hovered,  setHovered]  = useState(false);
  const inputRef = useRef();

  async function processFile(file) {
    if (!file) return;

    const isXLS  = file.type.includes("spreadsheet") || /\.xlsx?$/i.test(file.name);
    const isDOCX = file.type.includes("wordprocessingml") || /\.docx?$/i.test(file.name);
    const isPDF  = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

    if (!isXLS && !isDOCX && !isPDF) {
      setStatus("error");
      setMsg("Unsupported file. Please upload an Excel (.xlsx), Word (.docx), or PDF (.pdf).");
      return;
    }

    setStatus("loading");
    setMsg("Reading file…");

    try {
      // Read file as base64
      const base64Content = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });

      // Determine type for backend
      const type = isPDF ? "pdf" : isDOCX ? "word" : "excel";

      setMsg("AI is mapping fields…");
      const result = await extractFromBackend(type, base64Content);
      const fields = result.fields;
      const image  = result.image || null;
      const count  = Object.keys(fields).length;

      if (count === 0 && !image) {
        setStatus("error");
        setMsg("No matching RDS fields found. Check that the file contains RDS data.");
        return;
      }

      onExtracted(fields, image);
      setStatus("done");
      const imgMsg = image ? " (image extracted)" : "";
      setMsg(`${count} fields auto-filled from "${file.name}"${imgMsg}. Review and complete remaining fields.`);
    } catch (e) {
      setStatus("error");
      setMsg(e.message || "Something went wrong.");
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }

  const S = {
    idle:    { border:"#e2e8f0", bg:"#f8fafc",  icon:"📂", iconBg:"#eff6ff" },
    loading: { border:"#93c5fd", bg:"#eff6ff",  icon:"⏳", iconBg:"#dbeafe" },
    done:    { border:"#86efac", bg:"#f0fdf4",  icon:"✅", iconBg:"#dcfce7" },
    error:   { border:"#fca5a5", bg:"#fef2f2",  icon:"❌", iconBg:"#fee2e2" },
  }[status];

  const isIdle = status === "idle";
  const isActive = dragging || (hovered && isIdle);

  return (
    <div style={{ marginBottom: 22 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes uploadPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.2); }
          50%      { box-shadow: 0 0 0 8px rgba(37,99,235,0); }
        }
        @keyframes iconBounce {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-4px) scale(1.1); }
        }
        @keyframes scanLine {
          0%   { top: 0%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes tagFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
        @keyframes progressWave {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div
        onClick={() => status !== "loading" && inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: `2px dashed ${dragging ? "#2563eb" : isActive ? "#93c5fd" : S.border}`,
          background: dragging
            ? "linear-gradient(135deg, #eff6ff, #dbeafe)"
            : isActive && isIdle
            ? "linear-gradient(135deg, #f5f9ff, #eef5ff)"
            : S.bg,
          borderRadius: 16, padding: "22px",
          display: "flex", alignItems: "center", gap: 18,
          cursor: status === "loading" ? "wait" : "pointer",
          transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
          boxShadow: dragging
            ? "0 0 0 4px rgba(37,99,235,0.15), 0 12px 32px rgba(37,99,235,0.1)"
            : isActive && isIdle
            ? "0 0 0 3px rgba(37,99,235,0.08), 0 8px 20px rgba(37,99,235,0.06)"
            : "0 2px 8px rgba(15,23,42,0.04)",
          transform: dragging ? "scale(1.01)" : "scale(1)",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Scan line during loading */}
        {status === "loading" && (
          <div style={{
            position: "absolute", left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.6), rgba(6,182,212,0.6), transparent)",
            animation: "scanLine 1.5s ease-in-out infinite",
            zIndex: 1,
            pointerEvents: "none",
          }} />
        )}

        {/* Shimmer overlay on hover */}
        {isActive && isIdle && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: 14,
            background: "linear-gradient(135deg, rgba(37,99,235,0.03), rgba(6,182,212,0.02), transparent)",
            pointerEvents: "none",
          }} />
        )}

        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: isActive && isIdle ? "#dbeafe" : S.iconBg,
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 24,
          transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
          boxShadow: isActive && isIdle
            ? "0 8px 20px rgba(37,99,235,0.15), inset 0 1px 0 rgba(255,255,255,0.7)"
            : "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
          animation: isActive && isIdle ? "iconBounce 1s ease-in-out infinite" : "none",
          transform: dragging ? "scale(1.1) rotate(-5deg)" : "scale(1)",
        }}>
          {S.icon}
        </div>

        <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
          {status === "idle" && (
            <>
              <div style={{
                fontWeight: 700, fontSize: 14, color: isActive ? "#1d4ed8" : "#0f172a",
                transition: "color 0.25s ease",
              }}>
                Upload Room Data Sheet to Auto-Fill
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                Drag &amp; drop or click — Excel, Word, or PDF. AI extracts fields and images automatically.
              </div>
            </>
          )}
          {status === "loading" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 20, height: 20,
                border: "2px solid rgba(37,99,235,0.2)",
                borderTopColor: "#2563eb", borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#2563eb" }}>{msg}</div>
                <div style={{
                  marginTop: 6, height: 2, background: "rgba(37,99,235,0.1)", borderRadius: 2, overflow: "hidden", width: 200,
                }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    background: "linear-gradient(90deg, #2563eb, #06b6d4, #2563eb)",
                    backgroundSize: "200% 100%",
                    animation: "progressWave 1.5s linear infinite",
                  }} />
                </div>
              </div>
            </div>
          )}
          {status === "done" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#15803d" }}>{msg}</div>
              <button
                onClick={e => { e.stopPropagation(); setStatus("idle"); setMsg(""); }}
                style={{
                  marginTop: 5, fontSize: 12, color: "#64748b", background: "none", border: "none",
                  cursor: "pointer", padding: 0, textDecoration: "underline",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={e => e.target.style.color="#2563eb"}
                onMouseLeave={e => e.target.style.color="#64748b"}
              >
                Upload a different file
              </button>
            </>
          )}
          {status === "error" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#dc2626" }}>{msg}</div>
              <button
                onClick={e => { e.stopPropagation(); setStatus("idle"); setMsg(""); }}
                style={{
                  marginTop: 5, fontSize: 12, color: "#64748b", background: "none", border: "none",
                  cursor: "pointer", padding: 0, textDecoration: "underline",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={e => e.target.style.color="#2563eb"}
                onMouseLeave={e => e.target.style.color="#64748b"}
              >
                Try again
              </button>
            </>
          )}
        </div>

        {status === "idle" && (
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            {[["XLSX","#dcfce7","#15803d"],["DOCX","#dbeafe","#1d4ed8"],["PDF","#fee2e2","#dc2626"]].map(([t, bg, c], i) => (
              <span key={t} style={{
                background: bg, color: c, padding: "3px 10px",
                borderRadius: 20, fontSize: 11, fontWeight: 700,
                transition: "all 0.25s cubic-bezier(0.23,1,0.32,1)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                animation: `tagFloat 2s ${i * 0.2}s ease-in-out infinite`,
                cursor: "default",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px) scale(1.08)"; e.currentTarget.style.boxShadow=`0 6px 14px ${c}30`; }}
                onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"; }}
              >{t}</span>
            ))}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.docx,.doc,.pdf"
        style={{ display: "none" }}
        onChange={e => processFile(e.target.files[0])}
      />
    </div>
  );
}