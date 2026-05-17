"use client";

import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { rdsSchema } from "../schema";
import SectionCard from "./SectionCard";
import FieldRenderer from "./FieldRenderer";
import UploadZone from "./UploadZone";
import SuccessOverlay from "./SuccessOverlay";

const DRAFT_KEY = "rds_draft_v2";
const API = process.env.NEXT_PUBLIC_API_URL || "";
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

if (!API) console.error("API URL missing");
if (!GROQ_API_KEY) console.warn("GROQ_API_KEY missing — AI suggestions disabled");

const sectionDesc = {
  "Room identity and General Information":          "Basic identification and classification of this room",
  "Architectural and spatial-requirements":         "Dimensions, clearances, and compliance requirements",
  "Interior finishes and Aesthetics":               "Material specifications for all surfaces",
  "Clinical functionality and workflow":             "Define the clinical purpose, operational workflow, functional zones, and circulation",
  "capacity-operations":                            "Occupancy, staffing, and operational hour requirements",
  "adjacency-matrix":                               "Spatial relationships with neighbouring spaces",
  "MEP & engineering-systems":                      "HVAC, electrical, medical gas and plumbing requirements",
  "digital-smart-systems":                          "IT, clinical systems and smart technology integration",
  "safety-infection-control":                       "Infection prevention, safety and hazard provisions",
  "Stakeholder experience":                         "Comfort, privacy, lighting and wayfinding considerations",
  "fittings-fixtures-and-equipment":                "Fixed/loose furniture, and clinical equipment & services",
};

// ─── Extract all select + yesno fields from schema for Groq prompt ──────────
function buildFieldsManifest() {
  const manifest = [];
  for (const section of rdsSchema) {
    const allFields = section.subsections
      ? section.subsections.flatMap(s => s.fields)
      : (section.fields || []);
    for (const f of allFields) {
      if (f.type === "select" && f.options?.length) {
        manifest.push({ name: f.name, label: f.label, type: "select", options: f.options });
      } else if (f.type === "yesno") {
        manifest.push({ name: f.name, label: f.label, type: "yesno", options: ["yes", "no"] });
      } else if (f.type === "number") {
        manifest.push({ name: f.name, label: f.label, type: "number" });
      }
    }
  }
  return manifest;
}

const FIELDS_MANIFEST = buildFieldsManifest();

// ─── Call Groq to get recommendations ───────────────────────────────────────
async function fetchGroqRecommendations(roomName, department, category) {
  if (!GROQ_API_KEY) return null;

  const fieldsJson = JSON.stringify(
    FIELDS_MANIFEST.map(f => ({
      name: f.name,
      label: f.label,
      ...(f.options ? { options: f.options } : {}),
      ...(f.type === "number" ? { type: "number" } : {}),
    })),
    null, 2
  );

  const prompt = `You are an expert healthcare facility planner with deep knowledge of hospital design standards (HTM, HBN, ASHRAE, FGI Guidelines).

A user is configuring a Room Data Sheet for:
- Room Name: ${roomName}
- Department: ${department || "Not specified"}
- Category: ${category || "Not specified"}

Based on this room type, recommend the best value for each field below. Return ONLY a valid JSON object — no explanation, no markdown, no extra text.

Rules:
- For "select" fields: the value MUST be exactly one of the listed options (copy it verbatim)
- For "yesno" fields: value must be exactly "yes" or "no"
- For "number" fields: provide a realistic numeric value as a number
- If you are unsure about a field, omit it from the response
- Only include fields where you have high confidence in the recommendation

Fields:
${fieldsJson}

Respond with ONLY this JSON structure (no code block, no explanation):
{
  "recommendations": {
    "fieldName": "recommended value",
    ...
  },
  "reasons": {
    "fieldName": "one-line clinical reason why",
    ...
  }
}`;

  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 3000,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const raw = response.data.choices[0].message.content.trim();
  // Strip any accidental markdown fences
  const cleaned = raw.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(cleaned);
}

// ─── Toast hook ──────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };
  return { toasts, addToast };
}

// ─── AI Suggestion Banner ────────────────────────────────────────────────────
function AiBanner({ status, count, onApply, onDismiss, roomName }) {
  if (status === "idle") return null;

  if (status === "loading") return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "13px 18px", marginBottom: 16,
      background: "#f5f3ff", border: "1.5px solid #c4b5fd",
      borderRadius: 12,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        border: "2.5px solid #c4b5fd", borderTopColor: "#7c3aed",
        animation: "rds-spin 0.7s linear infinite", flexShrink: 0,
      }} />
      <span style={{ fontSize: 13, color: "#5b21b6", fontWeight: 500 }}>
        Analysing <strong>{roomName}</strong> — fetching AI recommendations…
      </span>
    </div>
  );

  if (status === "error") return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px", marginBottom: 16,
      background: "#fff1f2", border: "1.5px solid #fecdd3", borderRadius: 12,
    }}>
      <span style={{ fontSize: 16 }}>⚠️</span>
      <span style={{ fontSize: 12.5, color: "#be123c" }}>
        AI suggestions unavailable — check your Groq API key in .env
      </span>
      <button onClick={onDismiss} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#be123c", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );

  if (status === "ready") return (
    <div style={{
      padding: "14px 18px", marginBottom: 16,
      background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
      border: "1.5px solid #a78bfa", borderRadius: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>✦</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#4c1d95" }}>
            AI found {count} recommendations for <em>{roomName}</em>
          </span>
          <span style={{ fontSize: 11.5, color: "#6d28d9", marginLeft: 6 }}>
            — powered by Groq · Llama 3 70B
          </span>
        </div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onApply} style={{
          padding: "8px 18px", borderRadius: 8, fontSize: 12.5, fontWeight: 700,
          background: "#7c3aed", color: "#fff", border: "none", cursor: "pointer",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#6d28d9"}
          onMouseLeave={e => e.currentTarget.style.background = "#7c3aed"}
        >
          ✓ Apply All Suggestions
        </button>
        <button onClick={onDismiss} style={{
          padding: "8px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
          background: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd", cursor: "pointer",
        }}>
          Dismiss
        </button>
      </div>
    </div>
  );

  if (status === "applied") return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "11px 16px", marginBottom: 16,
      background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12,
    }}>
      <span style={{ fontSize: 15 }}>✅</span>
      <span style={{ fontSize: 13, color: "#15803d", fontWeight: 500 }}>
        {count} AI suggestions applied — you can override any field freely
      </span>
      <button onClick={onDismiss} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#15803d", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );

  return null;
}

// ─── SectionFields renderer ──────────────────────────────────────────────────
function SectionFields({ section, register, errors, setValue, watch, aiReasons }) {
  if (section.subsections) {
    return (
      <>
        {section.subsections.map((sub, si) => (
          <div key={si} className={si > 0 ? "rds-subsection" : ""}>
            <div className="rds-subsection-title">{sub.title}</div>
            <div className="form-grid">
              {sub.fields.map(field => (
                <FieldRendererWithBadge
                  key={field.name}
                  field={field}
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  aiReason={aiReasons?.[field.name]}
                />
              ))}
            </div>
          </div>
        ))}
      </>
    );
  }
  return (
    <div className="form-grid">
      {(section.fields || []).map(field => (
        <FieldRendererWithBadge
          key={field.name}
          field={field}
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
          aiReason={aiReasons?.[field.name]}
        />
      ))}
    </div>
  );
}

// ─── Wraps FieldRenderer with AI badge + tooltip ─────────────────────────────
function FieldRendererWithBadge({ field, register, errors, setValue, watch, aiReason }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <FieldRenderer
        field={field}
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
      />
      {aiReason && (
        <div style={{ position: "absolute", top: 2, right: 2, zIndex: 10 }}>
          <div
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "2px 7px", borderRadius: 10,
              background: "#ede9fe", border: "1px solid #c4b5fd",
              cursor: "help", fontSize: 10, fontWeight: 700, color: "#6d28d9",
              userSelect: "none",
            }}
          >
            ✦ AI
          </div>
          {showTip && (
            <div style={{
              position: "absolute", right: 0, top: "100%", marginTop: 4,
              background: "#1e1b4b", color: "#e0e7ff",
              borderRadius: 8, padding: "8px 12px",
              fontSize: 11.5, lineHeight: 1.5, width: 220,
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              zIndex: 100, pointerEvents: "none",
            }}>
              <div style={{ fontWeight: 700, marginBottom: 3, color: "#a5b4fc" }}>Why AI suggested this:</div>
              {aiReason}
              <div style={{
                position: "absolute", right: 10, top: -5,
                width: 10, height: 10, background: "#1e1b4b",
                transform: "rotate(45deg)",
              }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main form ───────────────────────────────────────────────────────────────
export default function RdsForm({ onSectionChange, jumpToSection, editRecord, onEditDone }) {
  const [currentIdx,        setCurrentIdx]        = useState(0);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [lastSaved,         setLastSaved]         = useState(null);
  const [roomImage,         setRoomImage]         = useState(null);
  const [showSuccess,       setShowSuccess]       = useState(false);
  const [submittedRoom,     setSubmittedRoom]     = useState({ code: "", name: "" });
  const [isEditMode,        setIsEditMode]        = useState(false);
  const [editId,            setEditId]            = useState(null);

  // ── AI state ────────────────────────────────────────────────────────────────
  const [aiStatus,      setAiStatus]      = useState("idle"); // idle | loading | ready | applied | error
  const [aiData,        setAiData]        = useState(null);   // { recommendations, reasons }
  const [aiReasons,     setAiReasons]     = useState({});     // active reasons shown on fields
  const lastRoomRef = useRef("");                              // avoid duplicate calls

  const { toasts, addToast } = useToast();

  const {
    register, handleSubmit, setValue, watch, trigger, getValues, reset,
    formState: { errors, isDirty: formIsDirty },
  } = useForm({ mode: "onBlur" });

  const currentSection = rdsSchema[currentIdx];

  // ── Watch room identity fields to trigger AI ────────────────────────────────
  const watchedRoomName   = watch("roomName");
  const watchedDepartment = watch("department");
  const watchedCategory   = watch("category");

  // ── Trigger Groq when roomName is filled in section 0 ──────────────────────
  useEffect(() => {
    if (!watchedRoomName || watchedRoomName.trim().length < 3) return;
    if (watchedRoomName === lastRoomRef.current) return;
    if (isEditMode) return;

    const timer = setTimeout(async () => {
      lastRoomRef.current = watchedRoomName;
      setAiStatus("loading");
      setAiData(null);
      setAiReasons({});
      try {
        const result = await fetchGroqRecommendations(
          watchedRoomName,
          watchedDepartment,
          watchedCategory
        );
        if (result?.recommendations) {
          setAiData(result);
          setAiStatus("ready");
        } else {
          setAiStatus("idle");
        }
      } catch (err) {
        console.error("Groq error:", err?.response?.data || err.message);
        setAiStatus("error");
      }
    }, 1200); // 1.2s debounce after user stops typing

    return () => clearTimeout(timer);
  }, [watchedRoomName, watchedDepartment, watchedCategory, isEditMode]);

  // ── Apply all AI recommendations ───────────────────────────────────────────
  const handleApplyAi = useCallback(() => {
    if (!aiData?.recommendations) return;
    const { recommendations, reasons } = aiData;
    let count = 0;
    Object.entries(recommendations).forEach(([fieldName, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        setValue(fieldName, value, { shouldDirty: true, shouldValidate: false });
        count++;
      }
    });
    setAiReasons(reasons || {});
    setAiStatus("applied");
    addToast(`✦ ${count} AI suggestions applied across all sections`, "success");
  }, [aiData, setValue, addToast]);

  const handleDismissAi = () => {
    setAiStatus("idle");
    setAiReasons({});
  };

  // ── Sync sidebar jump ───────────────────────────────────────────────────────
  useEffect(() => {
    if (jumpToSection && typeof jumpToSection.idx === "number") {
      setCurrentIdx(jumpToSection.idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [jumpToSection]);

  // ── Load edit record ────────────────────────────────────────────────────────
  useEffect(() => {
    if (editRecord && editRecord.id && editRecord.data) {
      localStorage.removeItem(DRAFT_KEY);
      reset(editRecord.data);
      setCompletedSections(new Set(rdsSchema.map(s => s.id)));
      setIsEditMode(true);
      setEditId(editRecord.id);
      setCurrentIdx(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
      addToast("Room data loaded — make your changes and resubmit", "success");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRecord]);

  // ── Restore draft (only when NOT editing) ──────────────────────────────────
  useEffect(() => {
    if (editRecord) return;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        reset(parsed.data);
        if (parsed.completedSections) setCompletedSections(new Set(parsed.completedSections));
        if (parsed.roomImage) setRoomImage(parsed.roomImage);
        setLastSaved(new Date(parsed.timestamp));
        addToast("Draft restored automatically", "success");
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-save draft every 30s ───────────────────────────────────────────────
  useEffect(() => {
    if (!formIsDirty || isEditMode) return;
    const timer = setTimeout(() => saveDraft(true), 30000);
    return () => clearTimeout(timer);
  }, [formIsDirty, isEditMode]);

  const watchedValues = watch();

  const filledSectionsCount = rdsSchema.filter(section => {
    const allNames = section.subsections
      ? section.subsections.flatMap(s => s.fields.map(f => f.name))
      : (section.fields || []).map(f => f.name);
    return allNames.some(n => {
      const v = watchedValues[n];
      return v !== undefined && v !== null && v !== "" && !(typeof v === "number" && isNaN(v));
    });
  }).length;

  useEffect(() => {
    onSectionChange?.({ current: currentIdx, completed: filledSectionsCount });
  }, [currentIdx, filledSectionsCount, onSectionChange]);

  const saveDraft = useCallback((auto = false) => {
    try {
      const data = getValues();
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        data, completedSections: [...completedSections],
        timestamp: new Date().toISOString(), roomImage,
      }));
      setLastSaved(new Date());
      if (!auto) addToast("Draft saved successfully", "success");
    } catch { addToast("Could not save draft", "error"); }
  }, [getValues, completedSections, roomImage, addToast]);

  const getSectionFieldNames = (section) => {
    if (section.subsections) return section.subsections.flatMap(s => s.fields.map(f => f.name));
    return (section.fields || []).map(f => f.name);
  };

  const handleNext = async () => {
    const valid = await trigger(getSectionFieldNames(currentSection));
    if (!valid) { addToast("Please complete required fields", "error"); return; }
    setCompletedSections(prev => new Set([...prev, currentSection.id]));
    if (currentIdx < rdsSchema.length - 1) {
      setCurrentIdx(i => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data) => {
    if (currentIdx !== rdsSchema.length - 1) return;
    setIsSubmitting(true);
    try {
      const user = JSON.parse(sessionStorage.getItem("rds_user") || "{}");
      const payload = { ...data, roomImage, _submittedBy: user.name || "system" };
      await axios.post(`${API}/save`, payload);
      localStorage.removeItem(DRAFT_KEY);
      setCompletedSections(new Set(rdsSchema.map(s => s.id)));
      setSubmittedRoom({ code: data.roomCode || "", name: data.roomName || "" });
      setShowSuccess(true);
    } catch (error) {
      console.error("Submit error:", error.response?.data || error.message);
      addToast("Submission failed — please try again", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdate = async (data) => {
    if (currentIdx !== rdsSchema.length - 1) return;
    setIsSubmitting(true);
    try {
      const user = JSON.parse(sessionStorage.getItem("rds_user") || "{}");
      await axios.put(`${API}/data/${editId}`, { ...data, roomImage, _editedBy: user.name || "system" });
      setSubmittedRoom({ code: data.roomCode || "", name: data.roomName || "" });
      addToast("Room updated successfully!", "success");
      setShowSuccess(true);
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      addToast("Update failed — please try again", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtracted = useCallback((fields, image) => {
    Object.entries(fields).forEach(([key, value]) => {
      setValue(key, value, { shouldDirty: true, shouldValidate: false });
    });
    if (image) setRoomImage(image);
    addToast(`✓ ${Object.keys(fields).length} fields auto-filled${image ? " + room image extracted" : ""}`, "success");
    window.scrollTo({ top: 300, behavior: "smooth" });
  }, [setValue, addToast]);

  const handleReset = () => {
    if (!confirm("Reset all fields and start over? Your draft will be lost.")) return;
    reset({});
    setCompletedSections(new Set());
    setCurrentIdx(0);
    localStorage.removeItem(DRAFT_KEY);
    setRoomImage(null);
    setIsEditMode(false);
    setEditId(null);
    setAiStatus("idle");
    setAiData(null);
    setAiReasons({});
    lastRoomRef.current = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
    addToast("Form reset — start fresh", "success");
  };

  const isLastSection  = currentIdx === rdsSchema.length - 1;
  const funcSectionIdx = rdsSchema.findIndex(s => s.id === "Clinical functionality and workflow");
  const aiCount        = aiData ? Object.keys(aiData.recommendations || {}).length : 0;

  return (
    <>
      {/* ── EDIT MODE BANNER ── */}
      {isEditMode && (
        <div style={{
          background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
          border: "1px solid #bfdbfe", borderRadius: 12,
          padding: "14px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>✏️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "#1d4ed8" }}>
                Edit Mode — Modifying existing room data sheet
              </div>
              <div style={{ fontSize: 12, color: "#3b82f6", marginTop: 2 }}>
                Make your changes across any section, then click "Update RDS" on the last section to save.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsEditMode(false); setEditId(null); reset({});
              setCompletedSections(new Set()); setCurrentIdx(0);
              if (onEditDone) onEditDone();
            }}
            style={{
              padding: "6px 14px", background: "#fff", color: "#1d4ed8",
              border: "1px solid #bfdbfe", borderRadius: 8,
              cursor: "pointer", fontSize: 12, fontWeight: 600, flexShrink: 0,
            }}>
            ✕ Cancel Edit
          </button>
        </div>
      )}

      {/* ── AI SUGGESTION BANNER ── */}
      <AiBanner
        status={aiStatus}
        count={aiCount}
        roomName={watchedRoomName}
        onApply={handleApplyAi}
        onDismiss={handleDismissAi}
      />

      {/* Upload zone — only on section 0 and not in edit mode */}
      {currentIdx === 0 && !isEditMode && <UploadZone onExtracted={handleExtracted} />}

      {/* STEPPER DOTS */}
      <div className="section-stepper">
        {rdsSchema.map((s, i) => (
          <div key={s.id}
            className={`stepper-dot ${completedSections.has(s.id) ? "done" : i === currentIdx ? "active" : ""}`}
            onClick={() => setCurrentIdx(i)} title={s.section} />
        ))}
      </div>

      {/* FORM */}
      <form onSubmit={e => e.preventDefault()}>
        <SectionCard
          title={currentSection.section}
          icon={currentSection.icon}
          color={currentSection.color}
          description={sectionDesc[currentSection.id]}
          badge={`${currentIdx + 1} of ${rdsSchema.length}`}
        >
          {currentIdx === funcSectionIdx && roomImage && (
            <div style={{
              marginBottom: 20, padding: 14,
              background: "#f0f9ff", border: "1px solid #bae6fd",
              borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 14,
            }}>
              <img src={roomImage} alt="Room layout / floor plan" style={{
                maxWidth: 220, maxHeight: 180, objectFit: "contain",
                borderRadius: 8, border: "1px solid #e0f2fe", background: "#fff",
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: "#0369a1", marginBottom: 4 }}>
                  📐 Room Image (extracted from uploaded file)
                </div>
                <div style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.5 }}>
                  This image was automatically extracted from your uploaded document.
                </div>
                <button type="button"
                  onClick={() => setRoomImage(null)}
                  style={{ marginTop: 8, fontSize: 11, color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  × Remove image
                </button>
              </div>
            </div>
          )}

          <SectionFields
            section={currentSection}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            aiReasons={aiReasons}
          />
        </SectionCard>

        {/* STEP NAV */}
        <div className="step-nav">
          <div className="step-counter">
            Section <strong>{currentIdx + 1}</strong> of <strong>{rdsSchema.length}</strong>
            {isEditMode && (
              <span style={{ marginLeft: 12, background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100 }}>
                EDIT MODE
              </span>
            )}
            {!isEditMode && lastSaved && (
              <span style={{ marginLeft: 16, color: "#94a3b8", fontSize: 11 }}>
                Draft saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ghost btn-sm"
              onClick={handleReset}
              style={{ color: "#dc2626", borderColor: "#fecaca" }}
              title="Clear all fields">
              🔄 Reset
            </button>
            {!isEditMode && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => saveDraft(false)}>
                💾 Save Draft
              </button>
            )}
            {currentIdx > 0 && (
              <button type="button" className="btn btn-ghost"
                onClick={() => { setCurrentIdx(i => i - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                ← Back
              </button>
            )}
            {!isLastSection ? (
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                Next Section →
              </button>
            ) : isEditMode ? (
              <button type="button" className="btn btn-primary"
                disabled={isSubmitting}
                onClick={() => handleSubmit(onUpdate)()}
                style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", minWidth: 140 }}>
                {isSubmitting ? (
                  <><span className="spinner" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} /> Updating…</>
                ) : "✓ Update RDS"}
              </button>
            ) : (
              <button type="button" className="btn btn-success"
                disabled={isSubmitting}
                onClick={() => handleSubmit(onSubmit)()}>
                {isSubmitting ? (
                  <><span className="spinner" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} /> Submitting…</>
                ) : "✓ Submit RDS"}
              </button>
            )}
          </div>
        </div>
      </form>

      {showSuccess && (
        <SuccessOverlay
          roomCode={submittedRoom.code}
          roomName={submittedRoom.name}
          onClose={() => {
            setShowSuccess(false); setCurrentIdx(0); reset({});
            setCompletedSections(new Set()); setRoomImage(null);
            setIsEditMode(false); setEditId(null);
            setAiStatus("idle"); setAiData(null); setAiReasons({});
            lastRoomRef.current = "";
            if (onEditDone) onEditDone();
          }}
        />
      )}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}><span>{t.msg}</span></div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes rds-spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}