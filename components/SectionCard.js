import { useState } from "react";

// ─── Premium styles — scoped via scx- prefix, injected once ──────────────────
const SC_STYLES = `
  @keyframes scxHeaderIn {
    from { opacity: 0; transform: translateY(14px); filter: blur(6px); }
    to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
  }
  @keyframes scxIconFloat {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-5px); }
  }
  @keyframes scxIconGlowPulse {
    0%,100% { opacity: 0.45; transform: scale(1); }
    50%     { opacity: 0.85; transform: scale(1.15); }
  }
  @keyframes scxRingSpin { to { transform: rotate(360deg); } }
  @keyframes scxUnderlineDraw {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes scxWatermarkIn {
    from { opacity: 0; transform: translateX(24px) scale(0.9); }
    to   { opacity: 0.07; transform: translateX(0) scale(1); }
  }
  @keyframes scxRingProgress {
    from { stroke-dashoffset: var(--ring-circ); }
    to   { stroke-dashoffset: var(--ring-offset); }
  }
  @keyframes scxNotesIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Header cascade */
  .scx-header { position: relative; z-index: 2; }
  .scx-header .scx-icon-stage { animation: scxHeaderIn 0.55s cubic-bezier(0.23,1,0.32,1) both; }
  .scx-header .scx-title-wrap  { animation: scxHeaderIn 0.55s 0.08s cubic-bezier(0.23,1,0.32,1) both; }
  .scx-header .scx-badge-wrap  { animation: scxHeaderIn 0.55s 0.16s cubic-bezier(0.23,1,0.32,1) both; }

  /* Icon stage */
  .scx-icon-stage { position: relative; flex-shrink: 0; width: 52px; height: 52px; }
  .scx-icon-glow {
    position: absolute; inset: -10px; border-radius: 50%;
    filter: blur(14px); z-index: 0;
    animation: scxIconGlowPulse 3.4s ease-in-out infinite;
    pointer-events: none;
  }
  .scx-icon-ring {
    position: absolute; inset: -4px; border-radius: 18px; z-index: 1;
    padding: 2px; pointer-events: none; opacity: 0.55;
    animation: scxRingSpin 7s linear infinite;
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  .scx-icon {
    position: relative; z-index: 2;
    animation: scxIconFloat 5s ease-in-out infinite;
  }

  /* Title underline */
  .scx-title-underline {
    height: 3px; width: 64px; border-radius: 4px; margin-top: 10px;
    transform-origin: left;
    animation: scxUnderlineDraw 0.7s 0.25s cubic-bezier(0.23,1,0.32,1) both;
  }

  /* Editorial watermark number */
  .scx-watermark {
    position: absolute; top: -34px; right: 12px; z-index: 1;
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 150px; font-weight: 400; line-height: 1;
    pointer-events: none; user-select: none;
    animation: scxWatermarkIn 0.9s 0.2s cubic-bezier(0.23,1,0.32,1) both;
    -webkit-text-fill-color: currentColor;
  }

  /* Ambient corner glow */
  .scx-corner-glow {
    position: absolute; bottom: -90px; right: -90px;
    width: 260px; height: 260px; border-radius: 50%;
    z-index: 0; pointer-events: none; filter: blur(10px); opacity: 0.5;
  }

  /* Premium ring badge */
  .scx-badge-wrap {
    margin-left: auto; display: flex; align-items: center; gap: 10px;
    flex-shrink: 0; padding: 6px 14px 6px 8px; border-radius: 40px;
    transition: all 0.28s cubic-bezier(0.23,1,0.32,1); cursor: default;
  }
  .scx-badge-wrap:hover { transform: translateY(-2px) scale(1.04); }
  .scx-ring-svg { transform: rotate(-90deg); flex-shrink: 0; }
  .scx-ring-track { opacity: 0.18; }
  .scx-ring-fill {
    stroke-linecap: round;
    animation: scxRingProgress 1s 0.3s cubic-bezier(0.23,1,0.32,1) both;
  }
  .scx-badge-label {
    font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 800;
    letter-spacing: 0.6px; text-transform: uppercase; line-height: 1;
  }
  .scx-badge-label small { display: block; font-size: 8.5px; opacity: 0.6; margin-top: 2px; letter-spacing: 1px; }

  /* Validation notes entrance */
  .scx-notes { animation: scxNotesIn 0.45s cubic-bezier(0.23,1,0.32,1) both; }
`;

export default function SectionCard({ title, icon, color, children, badge, description, validationNote, onNoteChange }) {
  // normalise — note can be string (legacy) or array
  const notePoints = Array.isArray(validationNote)
    ? validationNote
    : validationNote ? [String(validationNote)] : [];

  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(notePoints.join("\n"));

  const handleSave = () => {
    const lines = draft.split("\n").map(l => l.trim()).filter(Boolean);
    onNoteChange?.(lines);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(notePoints.join("\n"));
    setEditing(false);
  };

  // ── Parse "X of Y" badge into a progress ring ──
  const badgeMatch = typeof badge === "string" && badge.match(/(\d+)\s*of\s*(\d+)/i);
  const current = badgeMatch ? parseInt(badgeMatch[1], 10) : null;
  const total   = badgeMatch ? parseInt(badgeMatch[2], 10) : null;

  // Ring geometry
  const R = 13, STROKE = 3;
  const CIRC = 2 * Math.PI * R;
  const pct  = current && total ? current / total : 0;
  const OFFSET = CIRC * (1 - pct);

  return (
    <div className="rds-card" style={{ "--section-color": color }}>
      <style>{SC_STYLES}</style>

      {/* Editorial watermark number */}
      {current && (
        <span className="scx-watermark" style={{ color }}>
          {String(current).padStart(2, "0")}
        </span>
      )}

      {/* Ambient corner glow */}
      <div
        className="scx-corner-glow"
        style={{ background: `radial-gradient(circle, ${color}22, transparent 70%)` }}
      />

      <div className="section-header scx-header">
        {/* ── Icon stage: glow halo + rotating ring + floating icon ── */}
        <div className="scx-icon-stage">
          <div className="scx-icon-glow" style={{ background: `radial-gradient(circle, ${color}55, transparent 70%)` }} />
          <div
            className="scx-icon-ring"
            style={{ background: `conic-gradient(from 0deg, ${color}, transparent 40%, ${color}88 70%, transparent)` }}
          />
          <div
            className="section-icon-wrap scx-icon"
            style={{
              background: `linear-gradient(145deg, ${color}18, ${color}0a)`,
              border: `1px solid ${color}30`,
              transition: "all 0.4s cubic-bezier(0.25,1.2,0.5,1)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.12) rotate(-6deg)";
              e.currentTarget.style.boxShadow = `0 8px 28px ${color}40, inset 0 1px 0 rgba(255,255,255,0.6)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1) rotate(0deg)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)";
            }}
          >
            <span style={{ display: "block" }}>{icon}</span>
          </div>
        </div>

        {/* ── Title + animated underline ── */}
        <div className="section-header-text scx-title-wrap">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
          <div
            className="scx-title-underline"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}00)` }}
          />
        </div>

        {/* ── Premium ring badge ── */}
        {badge && current && total ? (
          <div
            className="scx-badge-wrap"
            style={{
              background: `${color}0f`,
              border: `1px solid ${color}25`,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}1c`; e.currentTarget.style.boxShadow = `0 6px 18px ${color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${color}0f`; e.currentTarget.style.boxShadow = "none"; }}
          >
            <svg className="scx-ring-svg" width="32" height="32" viewBox="0 0 32 32"
                 style={{ "--ring-circ": CIRC, "--ring-offset": OFFSET }}>
              <circle className="scx-ring-track" cx="16" cy="16" r={R} fill="none" stroke={color} strokeWidth={STROKE} />
              <circle className="scx-ring-fill"  cx="16" cy="16" r={R} fill="none" stroke={color} strokeWidth={STROKE}
                      strokeDasharray={CIRC} strokeDashoffset={OFFSET} />
            </svg>
            <span className="scx-badge-label" style={{ color }}>
              {current} / {total}
              <small>SECTION</small>
            </span>
          </div>
        ) : badge ? (
          <span
            className="section-badge scx-badge-wrap"
            style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}
          >
            {badge}
          </span>
        ) : null}
      </div>

      {children}

      {/* ── Validation Notes Box ── */}
      {(notePoints.length > 0 || editing) && (
        <div className="scx-notes" style={{
          marginTop: 24,
          border: `1px solid ${color}30`,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: `0 4px 18px ${color}10`,
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "9px 14px",
            background: `linear-gradient(135deg, ${color}12, ${color}06)`,
            borderBottom: `1px solid ${color}20`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}80` }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color, letterSpacing: 0.3 }}>
                AI Validation Notes
              </span>
              {notePoints.length > 0 && !editing && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: `${color}15`, color,
                  border: `1px solid ${color}25`,
                  borderRadius: 99, padding: "1px 7px",
                }}>
                  {notePoints.length} point{notePoints.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {!editing ? (
              <button
                type="button"
                onClick={() => { setDraft(notePoints.join("\n")); setEditing(true); }}
                style={{
                  fontSize: 11, fontWeight: 600, color,
                  background: `${color}15`, border: `1px solid ${color}30`,
                  borderRadius: 6, padding: "3px 10px", cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${color}25`}
                onMouseLeave={e => e.currentTarget.style.background = `${color}15`}
              >
                Edit
              </button>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" onClick={handleSave} style={{
                  fontSize: 11, fontWeight: 700, color: "#fff",
                  background: color, border: "none",
                  borderRadius: 6, padding: "3px 10px", cursor: "pointer",
                }}>Save</button>
                <button type="button" onClick={handleCancel} style={{
                  fontSize: 11, fontWeight: 600, color: "#64748b",
                  background: "#f1f5f9", border: "1px solid #e2e8f0",
                  borderRadius: 6, padding: "3px 10px", cursor: "pointer",
                }}>Cancel</button>
              </div>
            )}
          </div>

          {/* Body */}
          {!editing ? (
            <div style={{ padding: "10px 14px", background: "#fafafa" }}>
              {notePoints.map((pt, i) => (
                <div key={i} style={{
                  display: "flex", gap: 8, alignItems: "flex-start",
                  padding: "5px 0",
                  borderBottom: i < notePoints.length - 1 ? "1px solid #f1f5f9" : "none",
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: color, flexShrink: 0, marginTop: 5,
                  }} />
                  <span style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>{pt}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "#fff", padding: "8px 14px" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 6px" }}>
                One point per line
              </p>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={Math.max(notePoints.length + 1, 3)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 12px", fontSize: 12.5, lineHeight: 1.7,
                  color: "#1e293b", background: "#f8fafc",
                  border: `1px solid ${color}30`, borderRadius: 8,
                  outline: "none", resize: "vertical", fontFamily: "inherit",
                }}
                placeholder={"Point 1\nPoint 2\nPoint 3"}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
