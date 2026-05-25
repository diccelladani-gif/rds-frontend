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
  "waste-management":                               "Waste streams, hazardous materials and disposal requirements",
};

// ─── Build field manifest + options lookup ───────────────────────────────────
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
        manifest.push({ name: f.name, label: f.label, type: "yesno", options: ["Yes", "No"] });
      } else if (f.type === "number") {
        manifest.push({ name: f.name, label: f.label, type: "number" });
      }
    }
  }
  return manifest;
}

const FIELDS_MANIFEST = buildFieldsManifest();

// Options lookup for post-response validation
const OPTIONS_LOOKUP = {};
FIELDS_MANIFEST.forEach(f => {
  if (f.options) OPTIONS_LOOKUP[f.name] = new Set(f.options);
});

// ─── Compact prompt builder — ~60% fewer tokens than pretty JSON ──────────────
// ─── System prompt — room knowledge base (doesn't consume output tokens) ─────
const SYSTEM_PROMPT = `You are an expert healthcare facility planner certified in HTM, HBN, ASHRAE 170, FGI Guidelines, NABH, and AERB standards, with deep knowledge of multispecialty hospital room design across AIIMS, Apollo, Medanta, Fortis, Manipal, Max, Kokilaben, Narayana Health, and international JCI-accredited hospitals.

ROOM TYPE RECOGNITION — always identify and apply correct clinical standards for:
Critical Care: ICU, GICU, MICU, SICU, CTICU, NICU, PICU, BICU, TICU, CCU, HDU, SDU, IMCU, Isolation ICU, Negative Pressure Room, Positive Pressure Room, BMT Room
Operating Theatres: OT, OR, Major OT, Minor OT, Emergency OT, Laminar Flow OT, Hybrid OT, Cath Lab, EP Lab, DSA Room, IR Suite, Endoscopy Suite, Colonoscopy, Bronchoscopy, Cystoscopy, ERCP, Day Procedure Room, Robotic Surgery Suite
Emergency: ED, A&E, Resus Bay, Trauma Bay, Triage Room, Emergency OT, Decontamination Room
Wards: General Ward, Male Ward, Female Ward, Paediatric Ward, Surgical Ward, Medical Ward, Orthopaedic Ward, Maternity Ward, Oncology Ward, Neurology Ward, Cardiology Ward, Urology Ward, Nephrology Ward, Psychiatry Ward, Geriatric Ward, Palliative Ward, Burns Ward, VIP Room, VVIP Suite, Private Room
Maternity: Labour Room (LR), NDR, LDRP, CS Room, LSCS Room, KMC Room, Milk Bank, Eclampsia Room
OPD: OPD, Consultation Room, Cardiology OPD, Neurology OPD, Ortho OPD, Oncology OPD, ENT OPD, Eye OPD, Dental OPD, PAC Room, Pre-Op Assessment
Treatment: Treatment Room, Procedure Room, Dialysis Room, Infusion Room, Chemo Day Care, Dressing Room, Injection Room, ECG Room, TMT Room, Spirometry, Audiometry
Imaging: X-Ray, CT, MRI, PET-CT, Mammography, Tomosynthesis, Ultrasound, Echo, Fluoroscopy, SPECT, Nuclear Medicine, Bone Densitometry (DEXA), Angiography Suite, Gamma Camera
Lab/Pathology: Lab, Haematology Lab, Biochemistry Lab, Microbiology Lab, Molecular Lab (PCR), Histopathology, Cytology, Blood Bank, BSL-2, BSL-3, Phlebotomy
Cardiology: Cath Lab, EP Lab, Echo Lab, TMT Room, Holter Room, Cardiac Rehab, CCU, CICU, CTICU, ECMO Room, Perfusion Room
Neuro: EEG Room, EMG Room, Video EEG, Neuro ICU, Neuro OT, Gamma Knife, CyberKnife, Neuro Rehab
Oncology: LINAC, Brachytherapy (HDR), CT Sim, Chemo Day Care, BMT, Proton Therapy, Radiation Vault
Ortho/Rehab: Plaster Room, Cast Room, Physio Room, OT (Occupational Therapy), Hydrotherapy, Gait Lab, Prosthetics Room
Ophthalmology: Eye OPD, Refraction Room, Slit Lamp, OCT, Fundus Camera, LASIK Room, Intravitreal Injection Room, Eye Bank
ENT: ENT OPD, Audiometry Booth, Tympanometry, Video Laryngoscopy, ENT OT
Urology/Nephrology: Urology OPD, Cystoscopy, Urodynamics, ESWL, Dialysis, Transplant OT
Gastro: Gastro OPD, Endoscopy, Colonoscopy, ERCP, Fibroscan Room
Maternity/Fertility: Gynaecology OPD, Colposcopy, IVF Lab, Embryo Transfer, Sperm Bank
Psychiatry: Psychiatry OPD, Psychotherapy, Group Therapy, Psych Ward, ECT Room, Seclusion Room
Paediatrics: Paediatric OPD, Paediatric Ward, NICU, PICU, KMC, Play Therapy Room
Dental: Dental OPD, Orthodontics, Oral Surgery, OPG Room, Dental Lab
Pharmacy/CSSD: Pharmacy, Aseptic Dispensing, TPN Room, Cytotoxic Room, CSSD, Autoclave Room
Blood Bank: Blood Bank, Component Lab, Apheresis, Cross-Matching
Mortuary: Mortuary, Autopsy Room, Cold Chamber, Embalming
Support: AHU Room, BMS Room, DG Set Room, UPS Room, Medical Gas Room, CSSD Store
Admin: Admin Office, MRD, Reception, Billing, Conference Room, Nurses Station

STRICT OUTPUT RULES:
- Respond ONLY with a single valid JSON object. No markdown fences, no explanation, no preamble.
- Format: {"r":{"fieldName":"value"},"w":{"fieldName":"one-line reason"}}
- Only include fields you are confident about for this specific room type.
- Values must be VERBATIM from the provided options list.
- For NUM fields: return a realistic integer.
- For Yes/No fields: return exactly "Yes" or "No".`;

// ─── User prompt — lean, just the room + fields ───────────────────────────
function buildCompactPrompt(roomName, department, category) {
  const lines = FIELDS_MANIFEST.map(f => {
    if (f.type === "number") return `${f.name}|NUM`;
    if (f.type === "yesno")  return `${f.name}|Yes,No`;
    return `${f.name}|${f.options.join(",")}`;
  }).join("\n");

  return `Room: ${roomName}${department ? ` | Dept: ${department}` : ""}${category ? ` | Cat: ${category}` : ""}

FIELDS (name|options — pick best match, verbatim):
${lines}`;
}

// ─── Robust JSON extractor — handles fences, truncation, preamble ─────────
function extractJSON(raw) {
  if (!raw) throw new Error("Empty response");

  // 1. Strip markdown fences
  let cleaned = raw
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/\s*```$/im, "")
    .trim();

  // 2. Try direct parse first
  try { return JSON.parse(cleaned); } catch (_) { /* fall through */ }

  // 3. Extract first complete {...} block via regex
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (_) { /* fall through */ }
  }

  // 4. Attempt to repair truncated JSON — close open structures
  const repaired = cleaned
    .replace(/,\s*$/, "")           // trailing comma
    .replace(/("[^"]*")\s*$/, '$1}') // unclosed string value
    .replace(/:\s*$/, ':""}');      // hanging colon
  // Ensure balanced braces
  const opens  = (repaired.match(/\{/g) || []).length;
  const closes = (repaired.match(/\}/g) || []).length;
  const fixed  = repaired + "}".repeat(Math.max(0, opens - closes));
  try { return JSON.parse(fixed); } catch (_) { /* fall through */ }

  throw new Error(`JSON parse failed. Raw: ${raw.slice(0, 200)}`);
}

// ─── Single API call — validate response against options ─────────────────────
async function fetchAiRecommendations(roomName, department, category) {
  if (!GROQ_API_KEY) return null;

  const userPrompt = buildCompactPrompt(roomName, department, category);

  const makeRequest = async (retrySimple = false) => {
    const resp = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: retrySimple
              ? `Room: ${roomName}. Return JSON {"r":{},"w":{}} with your best field suggestions.`
              : userPrompt
          }
        ],
        temperature: retrySimple ? 0.1 : 0.15,
        max_tokens:  4096,
        // Force JSON output mode if supported
        response_format: { type: "json_object" },
      },
      { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" } }
    );
    return resp.data.choices[0].message.content.trim();
  };

  let raw;
  try {
    raw = await makeRequest(false);
  } catch (err) {
    // If it's a 400 (json_object mode not supported), retry without it
    if (err?.response?.status === 400) {
      const resp = await axios.post(
        GROQ_URL,
        {
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user",   content: userPrompt }
          ],
          temperature: 0.15,
          max_tokens:  4096,
        },
        { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" } }
      );
      raw = resp.data.choices[0].message.content.trim();
    } else {
      throw err;
    }
  }

  let parsed;
  try {
    parsed = extractJSON(raw);
  } catch (jsonErr) {
    // One automatic retry with a simpler prompt
    console.warn("JSON parse failed on first attempt — retrying with simplified prompt:", jsonErr.message);
    try {
      raw    = await makeRequest(true);
      parsed = extractJSON(raw);
    } catch (retryErr) {
      throw new Error("AI returned unexpected format — please try again");
    }
  }

  const recs    = parsed.r || parsed.recommendations || {};
  const reasons = parsed.w || parsed.reasons || {};

  // Validate — drop any value not in the options list
  const validated    = {};
  const validReasons = {};
  Object.entries(recs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    const strVal = String(value).trim();
    if (OPTIONS_LOOKUP[key]) {
      if (OPTIONS_LOOKUP[key].has(strVal)) {
        validated[key]    = strVal;
        if (reasons[key]) validReasons[key] = reasons[key];
      }
      // silently drop hallucinated values
    } else {
      validated[key] = strVal;
      if (reasons[key]) validReasons[key] = reasons[key];
    }
  });

  return { recommendations: validated, reasons: validReasons };
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
function AiBanner({ status, count, onApply, onDismiss, roomName, errorMsg }) {
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
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#be123c" }}>
          AI suggestions unavailable for this room
        </div>
        {errorMsg && (
          <div style={{ fontSize: 11.5, color: "#e11d48", marginTop: 2, opacity: 0.85 }}>
            {errorMsg}
          </div>
        )}
      </div>
      <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "#be123c", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>×</button>
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
            — powered by Groq · Llama 3.3 70B
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

// ─── Layout helpers — defined OUTSIDE component to prevent remount on keystroke ──
const WIDGET_TYPES = new Set([
  "ssomatrix","isolatormatrix","gasmatrix","elvmatrix","accessorymatrix",
  "safetymatrix","constructionmatrix","sanitarygrid",
  "doorconfig","windowconfig","usergroups","computed"
]);

function groupFields(fields) {
  const groups = [];
  let inlineBuffer = [];
  fields.forEach((field) => {
    const isWidget = field.colSpan === 4 && WIDGET_TYPES.has(field.type);
    if (isWidget) {
      if (inlineBuffer.length > 0) { groups.push({ type: "grid", fields: inlineBuffer }); inlineBuffer = []; }
      groups.push({ type: "widget", field });
    } else {
      inlineBuffer.push(field);
    }
  });
  if (inlineBuffer.length > 0) groups.push({ type: "grid", fields: inlineBuffer });

  const merged = [];
  let i = 0;
  while (i < groups.length) {
    if (groups[i].type === "widget" && groups[i+1]?.type === "widget" &&
        groups[i].field.sideBySide && groups[i+1].field.sideBySide) {
      merged.push({ type: "widgetpair", fields: [groups[i].field, groups[i+1].field] });
      i += 2;
    } else {
      merged.push(groups[i]); i++;
    }
  }
  return merged;
}

// ─── SectionFields renderer ──────────────────────────────────────────────────
function SectionFields({ section, register, errors, setValue, watch, aiReasons, docFilledFields }) {

  const renderGroups = (fields) =>
    groupFields(fields).map((grp, gi) => {
      if (grp.type === "grid") return (
        <div key={gi} className="form-grid">
          {grp.fields.map(field => (
            <FieldRendererWithBadge key={field.name} field={field}
              register={register} errors={errors} setValue={setValue}
              watch={watch} aiReason={aiReasons?.[field.name]} isDocFilled={docFilledFields?.has(field.name)} />
          ))}
        </div>
      );
      if (grp.type === "widgetpair") return (
        <div key={gi} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {grp.fields.map(field => (
            <FieldRendererWithBadge key={field.name} field={field}
              register={register} errors={errors} setValue={setValue}
              watch={watch} aiReason={aiReasons?.[field.name]} isDocFilled={docFilledFields?.has(field.name)} />
          ))}
        </div>
      );
      return (
        <FieldRendererWithBadge key={grp.field.name} field={grp.field}
          register={register} errors={errors} setValue={setValue}
          watch={watch} aiReason={aiReasons?.[grp.field.name]} isDocFilled={docFilledFields?.has(grp.field.name)} />
      );
    });

  if (section.subsections) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {section.subsections.map((sub, si) => (
          <div key={si} style={{ marginTop: si === 0 ? 0 : 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: 3, height: 16, borderRadius: 2, background: section.color || "#6366f1", flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px" }}>{sub.title}</span>
              {sub.description && (
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>— {sub.description}</span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {renderGroups(sub.fields)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {renderGroups(section.fields || [])}
    </div>
  );
}

// ─── Wraps FieldRenderer with AI badge + tooltip ─────────────────────────────
// ─── Field indicator badge styles ────────────────────────────────────────────
const BADGE_KEYFRAMES = `
  @keyframes badgePop {
    0%   { transform: scale(0.5); opacity: 0; }
    70%  { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes badgeShimmer {
    0%   { background-position: -100% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes fieldGlow {
    0%,100% { box-shadow: 0 0 0 0 transparent; }
    50%      { box-shadow: 0 0 0 3px rgba(109,40,217,0.18); }
  }
  @keyframes docGlow {
    0%,100% { box-shadow: 0 0 0 0 transparent; }
    50%      { box-shadow: 0 0 0 3px rgba(6,182,212,0.18); }
  }
`;

function FieldRendererWithBadge({ field, register, errors, setValue, watch, aiReason, isDocFilled }) {
  const [showTip, setShowTip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prevAiReason   = useRef(null);
  const prevDocFilled  = useRef(false);

  // Trigger pop animation only when badge first appears
  useEffect(() => {
    if ((aiReason && !prevAiReason.current) || (isDocFilled && !prevDocFilled.current)) {
      setMounted(false);
      requestAnimationFrame(() => setMounted(true));
    }
    prevAiReason.current  = aiReason;
    prevDocFilled.current = isDocFilled;
  }, [aiReason, isDocFilled]);

  const hasBadge = aiReason || isDocFilled;

  return (
    <div style={{ position: "relative" }}>
      <style>{BADGE_KEYFRAMES}</style>
      <FieldRenderer
        field={field}
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
      />

      {/* ── AI Badge ── */}
      {aiReason && (
        <div style={{ position: "absolute", top: 2, right: 2, zIndex: 10 }}>
          <div
            onMouseEnter={() => setShowTip("ai")}
            onMouseLeave={() => setShowTip(false)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 8px", borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "1px solid rgba(167,139,250,0.5)",
              cursor: "help", fontSize: 10, fontWeight: 800, color: "#fff",
              userSelect: "none", letterSpacing: "0.3px",
              boxShadow: "0 2px 8px rgba(109,40,217,0.35)",
              animation: mounted ? "badgePop 0.35s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <span style={{ fontSize: 9, opacity: 0.9 }}>✦</span>
            AI
          </div>

          {/* AI Tooltip */}
          {showTip === "ai" && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)",
              background: "linear-gradient(145deg, #1e1b4b, #2e1065)",
              color: "#e0e7ff", borderRadius: 10, padding: "10px 13px",
              fontSize: 11.5, lineHeight: 1.55, width: 230,
              boxShadow: "0 8px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(167,139,250,0.2)",
              zIndex: 100, pointerEvents: "none",
              animation: "badgePop 0.2s ease both",
            }}>
              {/* Arrow */}
              <div style={{
                position: "absolute", right: 10, top: -5,
                width: 10, height: 10,
                background: "#1e1b4b",
                transform: "rotate(45deg)",
                borderTop: "1px solid rgba(167,139,250,0.2)",
                borderLeft: "1px solid rgba(167,139,250,0.2)",
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                <span style={{ fontSize: 12 }}>✦</span>
                <span style={{ fontWeight: 800, color: "#a5b4fc", fontSize: 11 }}>AI Suggested</span>
              </div>
              <div style={{ color: "#c7d2fe", fontSize: 11 }}>{aiReason}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Doc Badge ── */}
      {isDocFilled && !aiReason && (
        <div style={{ position: "absolute", top: 2, right: 2, zIndex: 10 }}>
          <div
            onMouseEnter={() => setShowTip("doc")}
            onMouseLeave={() => setShowTip(false)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 8px", borderRadius: 10,
              background: "linear-gradient(135deg, #0891b2, #0e7490)",
              border: "1px solid rgba(103,232,249,0.4)",
              cursor: "help", fontSize: 10, fontWeight: 800, color: "#fff",
              userSelect: "none", letterSpacing: "0.3px",
              boxShadow: "0 2px 8px rgba(6,182,212,0.3)",
              animation: mounted ? "badgePop 0.35s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <span style={{ fontSize: 10 }}>📄</span>
            Doc
          </div>

          {/* Doc Tooltip */}
          {showTip === "doc" && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)",
              background: "linear-gradient(145deg, #0c1a2e, #0f2744)",
              color: "#e0f2fe", borderRadius: 10, padding: "10px 13px",
              fontSize: 11.5, lineHeight: 1.55, width: 210,
              boxShadow: "0 8px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(103,232,249,0.2)",
              zIndex: 100, pointerEvents: "none",
              animation: "badgePop 0.2s ease both",
            }}>
              <div style={{
                position: "absolute", right: 10, top: -5,
                width: 10, height: 10,
                background: "#0c1a2e",
                transform: "rotate(45deg)",
                borderTop: "1px solid rgba(103,232,249,0.2)",
                borderLeft: "1px solid rgba(103,232,249,0.2)",
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                <span style={{ fontSize: 12 }}>📄</span>
                <span style={{ fontWeight: 800, color: "#67e8f9", fontSize: 11 }}>Extracted from Document</span>
              </div>
              <div style={{ color: "#a5f3fc", fontSize: 11 }}>
                This value was automatically extracted from your uploaded file.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Both badges (AI overrides doc) — show stacked indicator ── */}
      {isDocFilled && aiReason && (
        <div style={{
          position: "absolute", top: 2, right: isDocFilled && aiReason ? 44 : 2,
          zIndex: 9,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            padding: "3px 7px", borderRadius: 10,
            background: "linear-gradient(135deg, #0891b2, #0e7490)",
            border: "1px solid rgba(103,232,249,0.35)",
            fontSize: 10, fontWeight: 700, color: "#fff",
            opacity: 0.85,
            boxShadow: "0 2px 6px rgba(6,182,212,0.25)",
          }}>
            <span style={{ fontSize: 10 }}>📄</span>
          </div>
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
  const [aiOptIn,   setAiOptIn]   = useState(null);   // null = not chosen, true = yes, false = no
  const [aiStatus,  setAiStatus]  = useState("idle"); // idle | loading | ready | applied | error
  const [aiData,    setAiData]    = useState(null);   // { recommendations, reasons }
  const [aiReasons, setAiReasons] = useState({});     // active reasons shown on fields
  const [aiError,       setAiError]       = useState("");     // real error message
  const [docFilledFields, setDocFilledFields] = useState(new Set()); // doc-extracted field names
  const lastRoomRef = useRef("");                      // avoid duplicate calls

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

  // ── Trigger Groq when roomName changes — only if user opted in ────────────
  useEffect(() => {
    // Room cleared or too short — reset so next valid entry triggers fresh call
    if (!watchedRoomName || watchedRoomName.trim().length < 2) {
      if (lastRoomRef.current) {
        lastRoomRef.current = "";
        setAiStatus("idle");
        setAiData(null);
        setAiReasons({});
        setAiError("");
      }
      return;
    }
    if (isEditMode) return;
    if (!aiOptIn) return;   // ← guard: only run when user said Yes

    // Room name changed from previous — reset banner immediately
    if (watchedRoomName !== lastRoomRef.current) {
      setAiStatus("idle");
      setAiData(null);
      setAiReasons({});
      setAiError("");
    }

    // Already processed this exact name — skip
    if (watchedRoomName === lastRoomRef.current) return;

    const timer = setTimeout(async () => {
      lastRoomRef.current = watchedRoomName;
      setAiStatus("loading");
      setAiData(null);
      setAiReasons({});
      setAiError("");
      try {
        const result = await fetchAiRecommendations(
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
        const errData = err?.response?.data?.error || err?.response?.data || {};
        const errMsg  = errData.message || err.message || "Unknown error";
        const errCode = err?.response?.status || 0;
        console.error("Groq error:", errCode, errMsg, errData);
        // Distinguish between different error types for better UX
        if (errCode === 401) {
          setAiError("Invalid Groq API key — check Vercel environment variables");
        } else if (errCode === 429) {
          setAiError("Groq rate limit reached — please wait a moment and try again");
        } else if (errCode === 400) {
          setAiError(`Groq request error: ${errMsg.slice(0, 120)}`);
        } else if (errCode >= 500) {
          setAiError("Groq service temporarily unavailable — please try again");
        } else if (err.message?.includes("JSON")) {
          setAiError("AI returned unexpected format — please try again");
        } else {
          setAiError(`AI error: ${errMsg.slice(0, 120)}`);
        }
        setAiStatus("error");
      }
    }, 1200); // 1.2s debounce after user stops typing

    return () => clearTimeout(timer);
  }, [watchedRoomName, watchedDepartment, watchedCategory, isEditMode, aiOptIn]);

  // ── Apply all AI recommendations ───────────────────────────────────────────
  // Build a quick lookup: fieldName -> type
  const fieldTypeMap = {};
  for (const section of rdsSchema) {
    const allFields = section.subsections
      ? section.subsections.flatMap(s => s.fields)
      : (section.fields || []);
    for (const f of allFields) fieldTypeMap[f.name] = f.type;
  }

  const handleApplyAi = useCallback(() => {
    if (!aiData?.recommendations) return;
    const { recommendations, reasons } = aiData;
    let count = 0;
    Object.entries(recommendations).forEach(([fieldName, value]) => {
      if (value === undefined || value === null || value === "") return;
      let finalValue = value;
      // YesNo fields expect "Yes" or "No" with capital first letter
      if (fieldTypeMap[fieldName] === "yesno") {
        const v = String(value).toLowerCase();
        finalValue = v === "yes" ? "Yes" : v === "no" ? "No" : value;
      }
      setValue(fieldName, finalValue, { shouldDirty: true, shouldValidate: false });
      count++;
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
    // Track which fields were filled by document extraction
    setDocFilledFields(prev => new Set([...prev, ...Object.keys(fields)]));
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
    setAiError("");
    setAiOptIn(null);
    setDocFilledFields(new Set());
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

      {/* ── AI OPT-IN CARD — section 0, new form only ── */}
      {currentIdx === 0 && !isEditMode && aiOptIn === null && (
        <div style={{
          marginBottom: 20,
          background: "linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)",
          border: "1.5px solid #c4b5fd", borderRadius: 14,
          padding: "20px 22px",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11, flexShrink: 0,
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: "#3b0764", marginBottom: 3 }}>
                Would you like AI to suggest field values?
              </div>
              <div style={{ fontSize: 12.5, color: "#6d28d9", lineHeight: 1.6, marginBottom: 14 }}>
                Based on the room name and department you enter, our AI (Groq · Llama 3.3 70B) can
                intelligently pre-fill select fields, Yes/No options, and quantities — saving you time.
                You can review and override any suggestion freely.
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setAiOptIn(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700,
                    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    color: "#fff", border: "none", cursor: "pointer",
                    boxShadow: "0 3px 10px rgba(124,58,237,0.35)",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  ✦ Yes, enable AI suggestions
                </button>
                <button
                  type="button"
                  onClick={() => setAiOptIn(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                    background: "#fff", color: "#374151",
                    border: "1.5px solid #d1d5db", cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  No, I'll fill manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI OPTED-IN PILL — shows after user said Yes ── */}
      {currentIdx === 0 && !isEditMode && aiOptIn === true && aiStatus === "idle" && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px", marginBottom: 16,
          background: "#f5f3ff", border: "1.5px solid #c4b5fd", borderRadius: 10,
        }}>
          <span style={{ fontSize: 15 }}>✦</span>
          <span style={{ fontSize: 12.5, color: "#5b21b6", fontWeight: 500, flex: 1 }}>
            AI suggestions <strong>enabled</strong> — type a room name above and suggestions will appear automatically.
          </span>
          <button
            type="button"
            onClick={() => { setAiOptIn(false); setAiStatus("idle"); setAiData(null); setAiReasons({}); setDocFilledFields(new Set()); lastRoomRef.current = ""; }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: 18, lineHeight: 1, padding: 0 }}
          >×</button>
        </div>
      )}

      {/* ── AI OPTED-OUT PILL — shows after user said No ── */}
      {currentIdx === 0 && !isEditMode && aiOptIn === false && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px", marginBottom: 16,
          background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
        }}>
          <span style={{ fontSize: 14, color: "#94a3b8" }}>◌</span>
          <span style={{ fontSize: 12.5, color: "#64748b", flex: 1 }}>
            AI suggestions <strong>disabled</strong> for this session — fill all fields manually.
          </span>
          <button
            type="button"
            onClick={() => { setAiOptIn(null); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 11.5, textDecoration: "underline", padding: 0 }}
          >Change</button>
        </div>
      )}

      {/* ── AI SUGGESTION BANNER ── */}
      {aiOptIn === true && (
        <AiBanner
          status={aiStatus}
          count={aiCount}
          roomName={watchedRoomName}
          onApply={handleApplyAi}
          onDismiss={handleDismissAi}
          errorMsg={aiError}
        />
      )}

      {/* Upload zone — only on section 0 and not in edit mode */}
      {currentIdx === 0 && !isEditMode && <UploadZone onExtracted={handleExtracted} />}

      {/* STEPPER TRACK */}
      <div className="section-stepper">
        {rdsSchema.map((s, i) => (
          <div key={s.id}
            className={`stepper-dot ${completedSections.has(s.id) ? "done" : i === currentIdx ? "active" : "pending"}`}
            onClick={() => setCurrentIdx(i)}
            title={s.section}
          />
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
            docFilledFields={docFilledFields}
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
            setAiOptIn(null);
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