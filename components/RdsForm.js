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
function buildCompactPrompt(roomName, department, category) {
  // Format: "fieldName|opt1,opt2,opt3" for select; "fieldName|YN" for yesno; "fieldName|N" for number
  const lines = FIELDS_MANIFEST.map(f => {
    if (f.type === "number") return `${f.name}(${f.label})|NUM`;
    if (f.type === "yesno")  return `${f.name}(${f.label})|Yes,No`;
    return `${f.name}(${f.label})|${f.options.join(",")}`;
  }).join("\n");

  return `You are an expert healthcare facility planner certified in HTM, HBN, ASHRAE 170, FGI Guidelines, NABH, and AERB standards. You have deep knowledge of multispecialty hospital room design across facilities like AIIMS, Apollo, Medanta, Fortis, Manipal, Max, Kokilaben, Narayana Health, and international JCI-accredited hospitals.

Configure a Room Data Sheet for: ${roomName}${department ? ` | Dept: ${department}` : ""}${category ? ` | Category: ${category}` : ""}

────────────────────────────────────────────────
ROOM TYPE RECOGNITION — ABBREVIATIONS & ALIASES
────────────────────────────────────────────────
Recognise ALL of the following room names, abbreviations, and aliases and apply the correct clinical standards:

CRITICAL CARE & HIGH DEPENDENCY:
ICU, GICU (General ICU), MICU (Medical ICU), SICU (Surgical ICU), CTICU (Cardiothoracic ICU), NICU (Neonatal ICU), PICU (Paediatric ICU), BICU (Burns ICU), TICU (Trauma ICU), CCU (Cardiac Care Unit / Coronary Care Unit), HDU (High Dependency Unit), SDU (Step-Down Unit), IMC (Intermediate Care), IMCU, Isolation ICU, Negative Pressure Room, Positive Pressure Room, Bone Marrow Transplant Room (BMT), Oncology Isolation Room, Reverse Isolation Room

OPERATING THEATRES & PROCEDURAL SUITES:
OT, OR (Operating Room/Theatre), Major OT, Minor OT, Emergency OT, Day Surgery OT, Laminar Flow OT, Hybrid OT, Cath Lab (Cardiac Catheterisation Laboratory), EP Lab (Electrophysiology Lab), Hybrid Cath Lab, DSA Room (Digital Subtraction Angiography), Interventional Radiology Suite (IR Suite), Endoscopy Suite, Colonoscopy Room, Bronchoscopy Room, Cystoscopy Room, ERCP Room, Day Procedure Room, Pain Management Suite, Laser Room, Lithotripsy Room (ESWL), Robotic Surgery Suite, Neuro Interventional Suite

EMERGENCY & TRAUMA:
Emergency Department (ED / A&E), Resuscitation Bay (Resus), Trauma Bay, Triage Room, Emergency Observation Room, Emergency Treatment Bay, Plaster Room, Suture Room, ENT Emergency Room, Ophthalmology Emergency Room, Paediatric Emergency Room, Psychiatric Emergency Room, Ambulance Bay, Decontamination Room

INPATIENT WARDS:
General Ward, Male Ward, Female Ward, Paediatric Ward, Surgical Ward, Medical Ward, Orthopaedic Ward, Gynaecology Ward, Maternity Ward (Antenatal/Postnatal), Oncology Ward, Neurology Ward, Cardiology Ward, Urology Ward, Nephrology Ward, Haematology Ward, Gastroenterology Ward, Pulmonology Ward, Endocrinology Ward, Dermatology Ward, Psychiatry Ward, Geriatric Ward, Palliative Care Ward, Rehabilitation Ward, Burns Ward, ENT Ward, Ophthalmology Ward, Plastic Surgery Ward, Bariatric Ward, Transplant Ward, Private Room, Suite Room, Deluxe Room, VIP Room, VVIP Suite, Side Room, Infectious Disease Ward, Barrier Nursing Room

LABOUR, DELIVERY & MATERNITY:
Labour Room (LR), Normal Delivery Room (NDR), LDRP Room (Labour Delivery Recovery Postpartum), Caesarean Section Room (CS / LSCS Room), Operating Delivery Suite, Eclampsia Room, High-Risk Obstetric Room, Kangaroo Mother Care Room (KMC), Lactation Room, Neonatal Resuscitation Room, Milk Bank, Postnatal Ward, Antenatal Assessment Room

OUTPATIENT & CONSULTATION:
OPD Consultation Room, General Physician Room, Specialist Consultation Room, Cardiology OPD, Neurology OPD, Orthopaedic OPD, Oncology OPD, Urology OPD, Nephrology OPD, Gastroenterology OPD, Pulmonology OPD, Endocrinology OPD, Haematology OPD, Rheumatology OPD, Psychiatry OPD, Paediatric OPD, Gynaecology OPD, ENT OPD, Ophthalmology OPD, Dermatology OPD, Dental OPD, Plastic Surgery OPD, Bariatric OPD, Pain Clinic Room, Palliative Care OPD, Pre-Anaesthesia Check Room (PAC), Pre-Operative Assessment Room, Post-Operative Review Room, Allied Health Consultation Room, Dietetics Room, Social Worker Room, Counselling Room

TREATMENT & PROCEDURE ROOMS:
Treatment Room, Procedure Room, Dressing Room, Injection Room, Infusion Room (IV Therapy / Chemotherapy Day Care), Blood Transfusion Room, Dialysis Station, Haemodialysis Room, Peritoneal Dialysis Room, Plasmapheresis Room, Cardiac Rehabilitation Room, Pulmonary Rehabilitation Room, Wound Care Room, Hydrotherapy Room, ECG Room, Stress Test Room (Treadmill / TMT), Holter Monitoring Room, Spirometry Room, Audiometry Room, Audiometry Booth, Visual Field Room, Tonometry Room, Minor Procedure Room, Colposcopy Room, Endometrial Biopsy Room, Biopsy Room, Bone Marrow Biopsy Room, Lumbar Puncture Room, Intravitreal Injection Room, Phototherapy Room, PUVA Room, Vaccination Room, Travel Medicine Room, Family Planning Room, Pre-Natal Counselling Room, Neonatal Follow-Up Room

DIAGNOSTIC IMAGING & RADIOLOGY:
X-Ray Room, Digital X-Ray Room (DR Room), Fluoroscopy Room, C-Arm Room, OPG Room (Dental Panoramic X-Ray), Mammography Room, Tomosynthesis Room, Ultrasound Room, Doppler Room, Echo Room (Echocardiography), CT Scan Room (CT Suite), MRI Room (MRI Suite), PET-CT Room (PET Suite), SPECT Room, SPECT-CT Room, Nuclear Medicine Scan Room, Bone Densitometry Room (DEXA), Angiography Suite, MR Angiography Room, Gamma Camera Room, Thyroid Uptake Room, Hot Lab (Nuclear Medicine), Cold Lab, Reporting Room, Film Library / PACS Room, Interventional MRI Room, Intraoperative CT Room, MRI Control Room, CT Control Room, X-Ray Control Area, Radiographer Work Area

LABORATORY & PATHOLOGY:
Clinical Laboratory (General Lab), Haematology Lab, Biochemistry Lab, Clinical Pathology Lab, Microbiology Lab, Serology Lab, Immunology Lab, Molecular Diagnostics Lab (PCR Lab), Histopathology Lab, Cytology Lab, Cytogenetics Lab, Genetics Lab, Blood Bank, Component Separation Room, Blood Issue Room, Blood Storage Room, Bone Marrow Processing Lab, Stem Cell Lab, Flow Cytometry Lab, Point-of-Care Testing (POCT) Room, Specimen Collection Room, Phlebotomy Room, Urine Collection Room, Sample Reception, Centrifuge Room, Media Preparation Room, BSL-2 Lab, BSL-3 Lab, Lab Autoclave Room, Lab Wash Room

CARDIOLOGY & CARDIAC SURGERY:
Cardiac Catheterisation Lab (Cath Lab), EP Lab, Hybrid Cath Lab, Echocardiography Room (Echo Lab), Exercise Stress Test Room (TMT), Holter / Ambulatory Monitoring Room, Cardiac Rehab Gym, Cardiac ICU (CICU / CCU), CTICU, Pacemaker Clinic Room, Cardiac OPD, LVAD Room, ECMO Room, Perfusion Room, Heart Lung Machine Store, Cardiology Procedure Room

NEUROSCIENCES:
Neurology OPD, Neurosurgery OPD, Neurophysiology Lab, EEG Room, EMG/NCV Room, Evoked Potentials Room, Video EEG Monitoring Room, Neuro ICU (NICU), Neuro HDU, Neuro OT, Stereotactic Radiosurgery Suite (Gamma Knife / CyberKnife), Neuro Interventional Suite, Deep Brain Stimulation Suite, Intraoperative Monitoring Room, Neuro Rehabilitation Room, Cognitive Assessment Room

ONCOLOGY & RADIOTHERAPY:
Oncology OPD, Medical Oncology Room, Surgical Oncology OPD, Radiation Oncology OPD, Chemotherapy Day Care (Day Oncology Unit), Bone Marrow Transplant Unit (BMT), Haematopoietic Stem Cell Transplant Room, LINAC Room (Linear Accelerator), Brachytherapy Room (High Dose Rate — HDR), Simulation Room (CT Sim), Mould Room, Treatment Planning Room, Radiation Therapy Vault, Cobalt Therapy Room, Proton Therapy Room, Radiation Oncology ICU, Tumour Board Room, Palliative Care Room, Cancer Counselling Room

ORTHOPAEDICS & REHABILITATION:
Orthopaedic OPD, Plaster Room, Fracture Clinic Room, Cast Room, Splinting Room, Arthroscopy Room, Bone Bank, Orthopaedic OT, Physiotherapy Room, Occupational Therapy Room, Speech Therapy Room, Hydrotherapy Pool Room, Gait Analysis Room, Prosthetics & Orthotics Room, Rehabilitation Gym, Exercise Therapy Room, Cognitive Rehabilitation Room, Spinal Cord Injury Rehabilitation Room, Stroke Rehabilitation Room

OPHTHALMOLOGY:
Ophthalmology OPD, Refraction Room, Slit Lamp Room, Visual Field Room (Perimetry), OCT Room, Fundus Photography Room, Fluorescein Angiography Room, ERG Room, Orthoptics Room, Contact Lens Room, Low Vision Room, Glaucoma Assessment Room, Retina Clinic Room, Cornea Clinic Room, Ophthalmic OT (Eye OT), Laser Room (LASIK / YAG / Argon Laser), Intravitreal Injection Room, Eye Bank

ENT (EAR NOSE THROAT):
ENT OPD, Audiometry Room, Audiometry Booth (Sound-Proof Booth), Tympanometry Room, OAE Room, ABR Room, Video Laryngoscopy Room, Nasal Endoscopy Room, ENT Procedure Room, Voice Lab, Balance Lab (Vestibulometry / VNG Room), Hearing Aid Room, ENT OT, Microscopy Room

UROLOGY & NEPHROLOGY:
Urology OPD, Uroflowmetry Room, Cystoscopy Room, Urodynamics Room, ESWL Room (Lithotripsy), Dialysis Room (Haemodialysis Station), Peritoneal Dialysis Room, Kidney Transplant OT, Nephrology OPD, Renal Biopsy Room, Transplant Clinic Room

GASTROENTEROLOGY & HEPATOLOGY:
Gastroenterology OPD, Endoscopy Suite, Colonoscopy Room, ERCP Room, Capsule Endoscopy Room, Manometry Room, pH-Metry Room, Liver Biopsy Room, Hepatology OPD, Liver Transplant Clinic, Fibroscan Room

OBSTETRICS, GYNAECOLOGY & FERTILITY:
Gynaecology OPD, Antenatal OPD, Postnatal Clinic, Colposcopy Room, Hysteroscopy Room, Fertility Clinic Room, IVF Lab (Embryology Lab), Semen Analysis Room, Sperm Bank, IUI Room, Egg Retrieval Room, Embryo Transfer Room, Genetic Counselling Room, Foetal Medicine Room, Foetal Echo Room

PSYCHIATRY & MENTAL HEALTH:
Psychiatry OPD, Consultation Room, Psychotherapy Room, Group Therapy Room, Psychiatric Ward (Open), Psychiatric Ward (Closed / Secure), De-escalation Room, Seclusion Room, ECT Room (Electroconvulsive Therapy), Psychology Assessment Room, Neuropsychology Lab, Drug De-addiction Room, Geriatric Psychiatry Room, Child Psychiatry Room, Family Therapy Room

PAEDIATRICS & NEONATOLOGY:
Paediatric OPD, Paediatric Ward, NICU Level I / II / III, PICU, Neonatal Resuscitation Room, KMC Room (Kangaroo Mother Care), Paediatric HDU, Paediatric OT, Developmental Paediatrics Room, Child Development Centre, Play Therapy Room, School Room (Long Stay Paediatric), Paediatric Oncology Room, Paediatric Dialysis Room, Vaccination Room, Adolescent Health Room

DENTAL & MAXILLOFACIAL:
Dental OPD, General Dentistry Room, Orthodontics Room, Periodontics Room, Endodontics Room, Oral Surgery Room, Oral Medicine Room, Prosthodontics Room, Paediatric Dentistry Room, OPG Room, Dental Sterilisation Room, Maxillofacial OT, Dental Lab

PHARMACY & STERILE SERVICES:
Main Pharmacy (Retail / OPD Pharmacy), Inpatient Pharmacy, Emergency Pharmacy (24hr), Satellite Pharmacy, Clinical Pharmacy Room, Pharmacist Counselling Room, Aseptic Dispensing Room, Total Parenteral Nutrition Room (TPN Room), Cytotoxic Reconstitution Room (Chemo Preparation Room), Pharmacy Clean Room, Pharmacy Cold Store, Investigational Drug Store, Narcotic / Controlled Drug Store, CSSD (Central Sterile Supply Department), Decontamination Room (CSSD), Washer-Disinfector Room, Packing Room (CSSD), Autoclave Room (CSSD), Sterile Store (CSSD), Instrument Repair Room

BLOOD BANK & TRANSFUSION:
Blood Bank, Donor Collection Room, Blood Component Lab, Blood Issue Room, Blood Storage Room, Apheresis Room, Irradiation Room, Blood Bank Lab, Cross-Matching Room, Transfusion Reaction Room

DIETETICS & NUTRITION:
Dietetics OPD Room, Clinical Nutrition Assessment Room, Dietary Counselling Room, Metabolic Kitchen, Patient Diet Kitchen, Staff Canteen Kitchen, Hospital Kitchen, Pantry (Ward-Level), Nourishment Bay

MORTUARY & FORENSICS:
Mortuary, Body Storage Room, Post-Mortem Room (Autopsy Room), Forensic Autopsy Room, Embalming Room, Histology Lab (Mortuary), Viewing Room (Family Viewing), Coffin Store, Mortuary Cold Chamber, Forensic Office

STERILISATION & INFECTION CONTROL:
CSSD (Central Sterile Services Department), Theatre Sterile Supply Unit (TSSU), Endoscope Reprocessing Room, Washer-Disinfector Room, Autoclave Room, Decontamination Sink Area, Clean Utility Room, Dirty Utility Room (Sluice Room), Soiled Linen Hold Room, Clean Linen Store, Isolation Anteroom / Airlock, Hand Wash Bay

SUPPORT, LOGISTICS & SUPPLY CHAIN:
CSSD Store, Medical Consumable Store, Drug Store (Central Medical Store), Equipment Store, Linen Store, Housekeeping Store, Biomedical Engineering Workshop, EBME Lab, Biomedical Store, Estates / Maintenance Workshop, Medical Gas Manifold Room, Medical Gas Cylinder Store, Liquid Oxygen Tank Room, Electrical Sub-Station Room, UPS Room, Generator Room (DG Set Room), HVAC Plant Room, AHU Room (Air Handling Unit), Chiller Plant Room, BMS Control Room (Building Management System), Fire Control Room, CCTV Control Room, IT Server Room (Data Centre), Telephone Exchange (EPABX Room)

ADMINISTRATION & MANAGEMENT:
Hospital Director Room, CEO Room, CMO Room, CNO Room, Administration Office, Medical Records Department (MRD), Medical Records Room, Health Information Management Room, Front Desk / Reception, Registration Counter, Billing Counter, Insurance Desk, Discharge Lounge, Enquiry / Information Desk, Help Desk, Patient Relations Office, Quality Department Office, Infection Control Office, Hospital Infection Control Room, Bio-Medical Waste Store, Hazardous Material Store, Legal / Compliance Office, HR Department, Training Room, Lecture Hall, Conference Room, Board Room, Medical Library, Research Office, Ethics Committee Room

STAFF & WELFARE AREAS:
Doctors Change Room (Male/Female), Nurses Change Room (Male/Female), Staff Locker Room, Doctor Rest Room / On-Call Room, Nurse Rest Room, Night Duty Room, Staff Toilet, Staff Pantry, Staff Canteen, Duty Room, Nurses Station, Ward Sister Room, Charge Nurse Room, Staff Prayer Room, Staff Lounge

PATIENT SUPPORT & AMENITY:
Patient Waiting Area, Family Waiting Room, Patient Lounge, Relative Waiting Room, Consultation Waiting Bay, Patient Toilet / Bathroom, Patient Accessible Toilet, Ambulatory Patient Bay, Discharge Lounge, Patient Education Room, Prayer Room / Multi-Faith Room, Patient Library, Retail / Pharmacy Kiosk, Cafeteria / Coffee Shop, ATM Area, Florist / Gift Shop, Children Play Area, Teen Zone, Volunteer Room

────────────────────────────────────────────────
INSTRUCTIONS
────────────────────────────────────────────────
Each line below is: fieldName(label)|option1,option2,...
Pick the BEST option for this room type. Only include fields you are confident about.
For NUM fields: return a realistic number.
For Yes,No fields: return exactly "Yes" or "No".
For other fields: return exactly one of the listed options (verbatim).

FIELDS:
${lines}

Respond ONLY with compact JSON (no markdown, no explanation):
{"r":{"fieldName":"value"},"w":{"fieldName":"why"}}`;
}

// ─── Single API call — validate response against options ─────────────────────
async function fetchAiRecommendations(roomName, department, category) {
  if (!GROQ_API_KEY) return null;

  const prompt = buildCompactPrompt(roomName, department, category);

  const resp = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.15,
      max_tokens: 2500,
    },
    { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" } }
  );

  const raw     = resp.data.choices[0].message.content.trim();
  const cleaned = raw.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/\s*```$/m, "");
  const parsed  = JSON.parse(cleaned);

  // Support both {r,w} compact and {recommendations,reasons} verbose formats
  const recs    = parsed.r || parsed.recommendations || {};
  const reasons = parsed.w || parsed.reasons || {};

  // Validate — drop any value not in the options list (hallucination guard)
  const validated = {};
  const validReasons = {};
  Object.entries(recs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (OPTIONS_LOOKUP[key]) {
      if (OPTIONS_LOOKUP[key].has(String(value))) {
        validated[key] = value;
        if (reasons[key]) validReasons[key] = reasons[key];
      }
      // silently drop hallucinated option values
    } else {
      validated[key] = value;
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
function SectionFields({ section, register, errors, setValue, watch, aiReasons }) {

  const renderGroups = (fields) =>
    groupFields(fields).map((grp, gi) => {
      if (grp.type === "grid") return (
        <div key={gi} className="form-grid">
          {grp.fields.map(field => (
            <FieldRendererWithBadge key={field.name} field={field}
              register={register} errors={errors} setValue={setValue}
              watch={watch} aiReason={aiReasons?.[field.name]} />
          ))}
        </div>
      );
      if (grp.type === "widgetpair") return (
        <div key={gi} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {grp.fields.map(field => (
            <FieldRendererWithBadge key={field.name} field={field}
              register={register} errors={errors} setValue={setValue}
              watch={watch} aiReason={aiReasons?.[field.name]} />
          ))}
        </div>
      );
      return (
        <FieldRendererWithBadge key={grp.field.name} field={grp.field}
          register={register} errors={errors} setValue={setValue}
          watch={watch} aiReason={aiReasons?.[grp.field.name]} />
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
  const [aiOptIn,   setAiOptIn]   = useState(null);   // null = not chosen, true = yes, false = no
  const [aiStatus,  setAiStatus]  = useState("idle"); // idle | loading | ready | applied | error
  const [aiData,    setAiData]    = useState(null);   // { recommendations, reasons }
  const [aiReasons, setAiReasons] = useState({});     // active reasons shown on fields
  const [aiError,   setAiError]   = useState("");     // real error message
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
            onClick={() => { setAiOptIn(false); setAiStatus("idle"); setAiData(null); setAiReasons({}); lastRoomRef.current = ""; }}
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