import { useState } from "react";

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

  return (
    <div className="rds-card" style={{ "--section-color": color }}>
      <div className="section-header">
        <div
          className="section-icon-wrap"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}25`,
            transition: "all 0.4s cubic-bezier(0.25,1.2,0.5,1)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.12) rotate(-6deg)";
            e.currentTarget.style.background = `${color}28`;
            e.currentTarget.style.boxShadow = `0 8px 28px ${color}30, inset 0 1px 0 rgba(255,255,255,0.6)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            e.currentTarget.style.background = `${color}15`;
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)";
          }}
        >
          <span style={{ display: "block", transition: "transform 0.3s ease" }}>{icon}</span>
        </div>

        <div className="section-header-text">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>

        {badge && (
          <span
            className="section-badge"
            style={{
              background: `${color}12`,
              color: color,
              border: `1px solid ${color}25`,
              transition: "all 0.25s cubic-bezier(0.23,1,0.32,1)",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.06) translateY(-1px)";
              e.currentTarget.style.background = `${color}22`;
              e.currentTarget.style.boxShadow = `0 6px 18px ${color}20`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1) translateY(0)";
              e.currentTarget.style.background = `${color}12`;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {children}

      {/* ── Validation Notes Box ── */}
      {(notePoints.length > 0 || editing) && (
        <div style={{
          marginTop: 24,
          border: `1px solid ${color}30`,
          borderRadius: 10,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 14px",
            background: `${color}10`,
            borderBottom: `1px solid ${color}20`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 2,
                background: color, flexShrink: 0,
              }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: color, letterSpacing: 0.3 }}>
                AI Validation Notes
              </span>
              {notePoints.length > 0 && !editing && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: `${color}15`, color: color,
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
                  fontSize: 11, fontWeight: 600, color: color,
                  background: `${color}15`, border: `1px solid ${color}30`,
                  borderRadius: 6, padding: "3px 10px", cursor: "pointer",
                }}
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