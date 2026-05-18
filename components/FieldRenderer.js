"use client";
import { useState, useEffect } from "react";

// ─── USER GROUPS DATA ──────────────────────────────────────
const USER_GROUP_CATEGORIES = [
  { category:"Clinical Staff", icon:"👨‍⚕️", roles:["Doctor","Consultant","Surgeon","Resident Doctor","Intern Doctor","Nurse","Head Nurse","Nursing Assistant"] },
  { category:"Technical & Diagnostic", icon:"🧪", roles:["Lab Technician","Radiology Technician","Radiologist","Sonographer","ECG Technician","Dialysis Technician"] },
  { category:"Pharmacy & Clinical Support", icon:"💊", roles:["Pharmacist","Clinical Pharmacist"] },
  { category:"Engineering & Maintenance", icon:"🧰", roles:["Biomedical Engineer","Maintenance Staff","Electrician","Plumber","HVAC Technician"] },
  { category:"Support Staff", icon:"🧹", roles:["Housekeeping Staff","Ward Boy / Attendant","Patient Care Assistant","Laundry Staff"] },
  { category:"Safety & Security", icon:"🛡️", roles:["Security Staff","Fire Safety Officer"] },
  { category:"Administrative Staff", icon:"🧑‍💼", roles:["Admin Staff","Receptionist","Front Desk Executive","Medical Records Staff","Billing Staff"] },
  { category:"Medical College / Academic", icon:"🎓", roles:["Student","Intern","Professor","Associate Professor","Lecturer","Researcher"] },
  { category:"Patients & Visitors", icon:"🧑‍🤝‍🧑", roles:["Patient","Patient Attendant","Visitor"] },
];

// ─── USER GROUPS INPUT ─────────────────────────────────────
function UserGroupsInput({ field, register, setValue, watch }) {
  const rawVal = watch?.(field.name) || "[]";
  let selected = [];
  try { selected = JSON.parse(rawVal); } catch { selected = []; }

  const getQty = (role) => selected.find(s => s.role === role)?.qty || 0;

  const updateRole = (role, qty) => {
    let next;
    if (qty <= 0) next = selected.filter(s => s.role !== role);
    else {
      const ex = selected.find(s => s.role === role);
      next = ex ? selected.map(s => s.role === role ? { ...s, qty } : s) : [...selected, { role, qty }];
    }
    setValue?.(field.name, JSON.stringify(next), { shouldDirty: true });
  };

  const [openCats, setOpenCats] = useState(new Set([USER_GROUP_CATEGORIES[0].category]));
  const toggleCat = (cat) => setOpenCats(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });

  return (
    <div style={{ border:"1.5px solid #e8edf5", borderRadius:12, overflow:"hidden", background:"#fff" }}>
      <input type="hidden" {...register(field.name, {
        required: field.required ? `${field.label} is required` : false,
        validate: v => { try { return JSON.parse(v||"[]").length > 0 || "Select at least one user group"; } catch { return "Invalid value"; } }
      })} />

      <div style={{ padding:"10px 14px", background:"#f8fafc", borderBottom:"1px solid #e8edf5", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:12.5, fontWeight:600, color:"#374151" }}>Select roles and set quantities</span>
        {selected.length > 0 && (
          <span style={{ background:"#dbeafe", color:"#1d4ed8", fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:20 }}>
            {selected.length} role{selected.length !== 1 ? "s" : ""} selected
          </span>
        )}
      </div>

      <div style={{ maxHeight:420, overflowY:"auto" }}>
        {USER_GROUP_CATEGORIES.map(({ category, icon, roles }) => {
          const isOpen = openCats.has(category);
          const catCount = roles.filter(r => getQty(r) > 0).length;
          return (
            <div key={category} style={{ borderBottom:"1px solid #f1f5f9" }}>
              <button type="button" onClick={() => toggleCat(category)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}
                onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background="none"}
              >
                <span style={{ fontSize:16 }}>{icon}</span>
                <span style={{ flex:1, fontSize:12.5, fontWeight:700, color:"#374151" }}>{category}</span>
                {catCount > 0 && <span style={{ background:"#dcfce7", color:"#15803d", fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{catCount} selected</span>}
                <span style={{ fontSize:11, color:"#94a3b8", display:"inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}>▼</span>
              </button>

              {isOpen && (
                <div style={{ padding:"4px 14px 10px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px" }}>
                  {roles.map(role => {
                    const qty = getQty(role);
                    const active = qty > 0;
                    return (
                      <div key={role} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 10px", borderRadius:8, gap:8, background: active ? "#eff6ff" : "#f8fafc", border:`1px solid ${active ? "#bfdbfe" : "#e8edf5"}`, transition:"all 0.15s" }}>
                        <span style={{ fontSize:12, color: active ? "#1d4ed8" : "#374151", fontWeight: active ? 600 : 400, flex:1 }}>{role}</span>
                        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                          <button type="button" onClick={() => updateRole(role, qty - 1)}
                            style={{ width:22, height:22, borderRadius:5, border:"1px solid #e2e8f0", background: active ? "#dbeafe" : "#f1f5f9", cursor:"pointer", fontSize:14, color: active ? "#1d4ed8" : "#94a3b8", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                          <span style={{ minWidth:20, textAlign:"center", fontSize:12.5, fontWeight:700, color: active ? "#1d4ed8" : "#94a3b8" }}>{qty}</span>
                          <button type="button" onClick={() => updateRole(role, qty + 1)}
                            style={{ width:22, height:22, borderRadius:5, border:"1px solid #e2e8f0", background: active ? "#2563eb" : "#f1f5f9", cursor:"pointer", fontSize:14, color: active ? "#fff" : "#94a3b8", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div style={{ padding:"10px 14px", background:"#f0fdf4", borderTop:"1px solid #bbf7d0" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#15803d", marginBottom:5 }}>SELECTED ROLES</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {selected.map(({ role, qty }) => (
              <span key={role} style={{ background:"#dcfce7", color:"#15803d", border:"1px solid #86efac", borderRadius:20, padding:"3px 10px", fontSize:11.5, fontWeight:600 }}>
                {role} × {qty}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QTY COUNTER ──────────────────────────────────────────
function QtyInput({ field, register, setValue, watch }) {
  const val = parseInt(watch?.(field.name)) || 0;
  return (
    <div className="qty-input-wrap">
      <button type="button" className="qty-btn"
        onClick={() => setValue?.(field.name, Math.max(0, val - 1))}>−</button>
      <input
        type="number"
        className="qty-input"
        min={0}
        {...register(field.name, { valueAsNumber: true })}
        placeholder="0"
      />
      <button type="button" className="qty-btn"
        onClick={() => setValue?.(field.name, val + 1)}>+</button>
    </div>
  );
}

// ─── YES/NO TOGGLE WITH QUANTITY (PROFESSIONAL LAYOUT) ─────────────────────────────────────────
function YesNoInput({ field, register, setValue, watch }) {
  const val = watch?.(field.name);
  const quantityFieldName = field.quantityFieldName || `${field.name}Quantity`;
  const quantityVal = watch?.(quantityFieldName) || 0;
  
  const showQuantity = field.showQuantity === true;
  
  const handleYesNo = (newVal) => {
    setValue?.(field.name, newVal, { shouldDirty: true });
    if (newVal !== "Yes" && showQuantity) {
      setValue?.(quantityFieldName, 0, { shouldDirty: true });
    }
  };
  
  const updateQuantity = (newQty) => {
    const qty = Math.max(0, parseInt(newQty) || 0);
    setValue?.(quantityFieldName, qty, { shouldDirty: true });
  };
  
  return (
    <div style={{ width: "100%" }}>
      <input type="hidden" {...register(field.name)} />
      
      {/* Yes/No Buttons - Large & Premium */}
      <div style={{ display: "flex", gap: 12, marginBottom: showQuantity && val === "Yes" ? 16 : 0 }}>
        <button
          type="button"
          onClick={() => handleYesNo(val === "Yes" ? "" : "Yes")}
          style={{
            flex: 1,
            padding: "10px 20px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.3px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: `1.5px solid ${val === "Yes" ? "#22c55e" : "#e2e8f0"}`,
            background: val === "Yes" ? "#f0fdf4" : "#ffffff",
            color: val === "Yes" ? "#15803d" : "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
          onMouseEnter={(e) => {
            if (val !== "Yes") {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.background = "#f8fafc";
            }
          }}
          onMouseLeave={(e) => {
            if (val !== "Yes") {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "#ffffff";
            }
          }}
        >
          <span style={{ fontSize: 16 }}>✓</span>
          <span>Yes</span>
        </button>
        
        <button
          type="button"
          onClick={() => handleYesNo(val === "No" ? "" : "No")}
          style={{
            flex: 1,
            padding: "10px 20px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.3px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: `1.5px solid ${val === "No" ? "#ef4444" : "#e2e8f0"}`,
            background: val === "No" ? "#fef2f2" : "#ffffff",
            color: val === "No" ? "#dc2626" : "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
          onMouseEnter={(e) => {
            if (val !== "No") {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.background = "#f8fafc";
            }
          }}
          onMouseLeave={(e) => {
            if (val !== "No") {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "#ffffff";
            }
          }}
        >
          <span style={{ fontSize: 16 }}>✗</span>
          <span>No</span>
        </button>
      </div>
      
      {/* Quantity Section - Appears BELOW Yes/No when Yes is selected */}
      {showQuantity && val === "Yes" && (
        <div style={{
          background: "#f8fafc",
          borderRadius: 10,
          padding: "12px 16px",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#475569",
            letterSpacing: "0.3px"
          }}>
            📦 QUANTITY
          </span>
          
          <div className="qty-input-wrap" style={{ margin: 0 }}>
            <button
              type="button"
              className="qty-btn"
              onClick={() => updateQuantity(quantityVal - 1)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              −
            </button>
            
            <input
              type="number"
              className="qty-input"
              min="0"
              placeholder="0"
              value={quantityVal}
              onChange={(e) => updateQuantity(e.target.value)}
              style={{
                width: 80,
                height: 32,
                textAlign: "center",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#1e293b",
                background: "#ffffff",
                outline: "none",
                transition: "all 0.15s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
            
            <button
              type="button"
              className="qty-btn"
              onClick={() => updateQuantity(quantityVal + 1)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ELV MATRIX (Dynamic Location Quantities) ──────────────────────────────
function ELVMatrixInput({ field, register, setValue, watch }) {
  const AVAILABLE_SYSTEMS = [
    "Nurse Call System","Code Blue System","Intercom","Telephone","IP Phone","SCV",
    "MATV / IPTV","Fax / Printer","LAN / Network Point","Wireless Point",
    "Master Clock","Physiological Monitors","Other Bedside Terminals","Other Healthcare Infra System"
  ];
  const LOCATIONS = ["WALL (W)", "BEDHEAD PANEL (BHP)", "MEDICAL PENDANT (MP)", "CEILING (C)"];

  const rawVal = watch?.(field.name) || "{}";
  let matrixData = {};
  try {
    matrixData = JSON.parse(rawVal);
    if (!matrixData.selectedSystems) matrixData.selectedSystems = [];
    if (!matrixData.quantities) matrixData.quantities = {};
  } catch { matrixData = { selectedSystems: [], quantities: {} }; }

  const { selectedSystems = [], quantities = {} } = matrixData;

  const updateMatrix = (sel, qty) => {
    setValue?.(field.name, JSON.stringify({ selectedSystems: sel, quantities: qty }), { shouldDirty: true });
  };

  const toggleSystem = (sys) => {
    if (selectedSystems.includes(sys)) {
      const nq = { ...quantities }; delete nq[sys];
      updateMatrix(selectedSystems.filter(s => s !== sys), nq);
    } else {
      const nq = { ...quantities, [sys]: { "WALL (W)": 0, "BEDHEAD PANEL (BHP)": 0, "MEDICAL PENDANT (MP)": 0, "CEILING (C)": 0 } };
      updateMatrix([...selectedSystems, sys], nq);
    }
  };

  const updateQty = (sys, loc, val) => {
    const nq = { ...quantities, [sys]: { ...(quantities[sys] || {}), [loc]: Math.max(0, parseInt(val) || 0) } };
    updateMatrix(selectedSystems, nq);
  };

  const sysTotal = sys => quantities[sys] ? Object.values(quantities[sys]).reduce((s, v) => s + (parseInt(v) || 0), 0) : 0;
  const grandTotal = selectedSystems.reduce((s, sys) => s + sysTotal(sys), 0);

  const [search, setSearch] = useState("");
  const filtered = AVAILABLE_SYSTEMS.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
      <input type="hidden" {...register(field.name)} />

      {/* Header */}
      <div style={{ padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
        <input type="text" placeholder="🔍 Search systems..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 260, padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, outline: "none" }}
          onFocus={e => e.target.style.borderColor="#3b82f6"} onBlur={e => e.target.style.borderColor="#e2e8f0"} />
        {grandTotal > 0 && <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>Total: {grandTotal} pts</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr" }}>
        {/* Left: system selector — 2-column checkbox grid */}
        <div style={{ borderRight: "1px solid #e2e8f0", maxHeight: 380, overflowY: "auto" }}>
          <div style={{ padding: "6px 10px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Select Systems</span>
          </div>
          <div style={{ padding: "6px" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>No match</div>
            )}
            {filtered.map(sys => {
              const isSel = selectedSystems.includes(sys);
              const tot = sysTotal(sys);
              return (
                <div key={sys} onClick={() => toggleSystem(sys)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 7, cursor: "pointer", background: isSel ? "#eff6ff" : "transparent", marginBottom: 2, transition: "background 0.12s" }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background="#f8fafc"; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background="transparent"; }}
                >
                  <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${isSel ? "#3b82f6" : "#cbd5e1"}`, background: isSel ? "#3b82f6" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color: "#fff", fontWeight: "bold" }}>
                    {isSel && "✓"}
                  </span>
                  <span style={{ fontSize: 12, color: isSel ? "#1e40af" : "#334155", fontWeight: isSel ? 600 : 400, flex: 1, lineHeight: 1.3 }}>{sys}</span>
                  {isSel && tot > 0 && <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{tot}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: quantity grid for selected systems */}
        <div style={{ maxHeight: 380, overflowY: "auto" }}>
          {selectedSystems.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
              Select systems from the left panel to configure quantities
            </div>
          ) : (
            <div>
              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "140px repeat(4, 1fr)", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "0" }}>
                <div style={{ padding: "7px 10px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" }}>System</div>
                {LOCATIONS.map(loc => (
                  <div key={loc} style={{ padding: "7px 6px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.3px", textAlign: "center", borderLeft: "1px solid #e8edf5" }}>
                    {loc.replace(/[()]/g, '').trim()}
                  </div>
                ))}
              </div>
              {selectedSystems.map((sys, i) => (
                <div key={sys} style={{ display: "grid", gridTemplateColumns: "140px repeat(4, 1fr)", borderBottom: i < selectedSystems.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ padding: "8px 10px", fontSize: 11.5, fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", borderRight: "1px solid #f1f5f9" }}>{sys}</div>
                  {LOCATIONS.map(loc => {
                    const qty = quantities[sys]?.[loc] || 0;
                    return (
                      <div key={loc} style={{ padding: "6px 4px", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <button type="button" onClick={() => updateQty(sys, loc, qty - 1)}
                            style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid #e2e8f0", background: "#f8fafc", color: qty > 0 ? "#475569" : "#cbd5e1", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                          <input type="number" min="0" value={qty || ""} placeholder="0"
                            onChange={e => updateQty(sys, loc, e.target.value)}
                            style={{ width: 32, height: 24, textAlign: "center", border: `1.5px solid ${qty > 0 ? "#64748b" : "#e8edf5"}`, borderRadius: 5, fontSize: 12, fontWeight: qty > 0 ? 700 : 400, color: qty > 0 ? "#0f172a" : "#cbd5e1", background: "#fff", outline: "none" }} />
                          <button type="button" onClick={() => updateQty(sys, loc, qty + 1)}
                            style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid #cbd5e1", background: "#334155", color: "#fff", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {selectedSystems.length > 0 && grandTotal > 0 && (
        <div style={{ padding: "8px 14px", background: "#f0fdf4", borderTop: "1px solid #bbf7d0", display: "flex", flexWrap: "wrap", gap: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.5px", marginRight: 4 }}>Points:</span>
          {selectedSystems.filter(s => sysTotal(s) > 0).map(sys => (
            <span key={sys} style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: 4, padding: "2px 8px", fontSize: 10.5, fontWeight: 600 }}>
              {sys}: {sysTotal(sys)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── IT ACCESSORY MATRIX ───────────────────────────────────
function AccessoryMatrixInput({ field, register, setValue, watch }) {
  const accessories = field.accessories || [];
  const rawVal = watch?.(field.name) || "{}";
  let data = {};
  try { data = JSON.parse(rawVal); } catch { data = {}; }

  const update = (key, enabled, qty) => {
    setValue?.(field.name, JSON.stringify({ ...data, [key]: { enabled, qty: Math.max(0, qty) } }), { shouldDirty: true });
  };
  const toggle = (key) => {
    const cur = data[key] || { enabled: false, qty: 0 };
    update(key, !cur.enabled, cur.enabled ? 0 : 1);
  };
  const setQty = (key, qty) => update(key, true, qty);

  const selectedCount = accessories.filter(a => data[a.key]?.enabled).length;
  const totalQty = accessories.reduce((s, a) => s + (data[a.key]?.qty || 0), 0);

  // Split into two columns
  const half = Math.ceil(accessories.length / 2);
  const colA = accessories.slice(0, half);
  const colB = accessories.slice(half);

  const RowItem = ({ id, label, icon }) => {
    const item = data[id] || { enabled: false, qty: 0 };
    const active = item.enabled;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: "1px solid #f1f5f9", minHeight: 40 }}>
        <div onClick={() => toggle(id)}
          style={{ width: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", alignSelf: "stretch", borderRight: "1px solid #f1f5f9", background: active ? "#f5f3ff" : "#fafafa", transition: "background 0.15s", flexShrink: 0 }}>
          <span style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${active ? "#6366f1" : "#cbd5e1"}`, background: active ? "#6366f1" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700, transition: "all 0.15s" }}>
            {active && "✓"}
          </span>
        </div>
        <div onClick={() => toggle(id)} style={{ flex: 1, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: active ? "#faf9ff" : "#fff", transition: "background 0.15s" }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#4338ca" : "#475569" }}>{label}</span>
        </div>
        <div style={{ width: 100, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "0 8px", borderLeft: "1px solid #f1f5f9", background: active ? "#eef2ff" : "#f8fafc", alignSelf: "stretch", flexShrink: 0 }}>
          {active ? (
            <>
              <button type="button" onClick={() => setQty(id, (item.qty || 0) - 1)}
                style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid #c7d2fe", background: "#fff", cursor: "pointer", fontSize: 14, color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <input type="number" min="0" value={item.qty || 0} onChange={e => setQty(id, parseInt(e.target.value) || 0)}
                style={{ width: 34, height: 24, textAlign: "center", border: "1px solid #c7d2fe", borderRadius: 5, fontSize: 12, fontWeight: 700, color: "#4338ca", background: "#fff", outline: "none" }} />
              <button type="button" onClick={() => setQty(id, (item.qty || 0) + 1)}
                style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid #6366f1", background: "#6366f1", cursor: "pointer", fontSize: 14, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </>
          ) : (
            <span style={{ fontSize: 11, color: "#cbd5e1" }}>—</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
      <input type="hidden" {...register(field.name)} />

      {/* Header */}
      <div style={{ padding: "9px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px" }}>Equipment · Toggle to select, then set quantity</span>
        <div style={{ display: "flex", gap: 6 }}>
          {selectedCount > 0 && <span style={{ background: "#ede9fe", color: "#4338ca", fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>{selectedCount} selected</span>}
          {totalQty > 0 && <span style={{ background: "#dcfce7", color: "#15803d", fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>{totalQty} units</span>}
        </div>
      </div>

      {/* Two-column table */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ borderRight: "1px solid #e2e8f0" }}>
          {/* Sub-header */}
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ borderRight: "1px solid #f1f5f9" }} />
            <div style={{ padding: "5px 10px", fontSize: 9.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Equipment</div>
            <div style={{ padding: "5px 8px", fontSize: 9.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", borderLeft: "1px solid #f1f5f9" }}>Qty</div>
          </div>
          {colA.map(acc => <RowItem key={acc.key} id={acc.key} label={acc.label} icon={acc.icon} />)}
        </div>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ borderRight: "1px solid #f1f5f9" }} />
            <div style={{ padding: "5px 10px", fontSize: 9.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Equipment</div>
            <div style={{ padding: "5px 8px", fontSize: 9.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", borderLeft: "1px solid #f1f5f9" }}>Qty</div>
          </div>
          {colB.map(acc => <RowItem key={acc.key} id={acc.key} label={acc.label} icon={acc.icon} />)}
        </div>
      </div>

      {/* Summary */}
      {selectedCount > 0 && (
        <div style={{ padding: "7px 14px", background: "#f5f3ff", borderTop: "1px solid #e0e7ff", display: "flex", flexWrap: "wrap", gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.5px", marginRight: 4 }}>Selected:</span>
          {accessories.filter(a => data[a.key]?.enabled).map(({ key, label }) => (
            <span key={key} style={{ background: "#ede9fe", color: "#4338ca", border: "1px solid #c7d2fe", borderRadius: 4, padding: "2px 8px", fontSize: 10.5, fontWeight: 600 }}>
              {label} × {data[key]?.qty || 0}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── MEDICAL GAS MATRIX ────────────────────────────────────
const GAS_COLUMNS = [
  { key: "wall",    short: "Wall"    },
  { key: "pendant", short: "Pendant" },
  { key: "bhp",     short: "BHP"     },
  { key: "tapoff",  short: "Tap-off" },
  { key: "direct",  short: "Direct"  },
  { key: "height",  short: "Height", unit: "mm", isText: true },
];

// Muted, desaturated palette — colour only used for the symbol badge & row total
const GAS_MUTED = {
  vacuum:   { badge: "#92400e", bg: "#fef3c7" },
  oxygen:   { badge: "#1e3a8a", bg: "#dbeafe" },
  co2:      { badge: "#374151", bg: "#f3f4f6" },
  n2o:      { badge: "#4c1d95", bg: "#ede9fe" },
  medAir4:  { badge: "#064e3b", bg: "#d1fae5" },
  surgAir7: { badge: "#7c2d12", bg: "#ffedd5" },
  agss:     { badge: "#831843", bg: "#fce7f3" },
  compAir:  { badge: "#0c4a6e", bg: "#e0f2fe" },
  liqN2:    { badge: "#164e63", bg: "#cffafe" },
  png:      { badge: "#365314", bg: "#ecfccb" },
  lmo:      { badge: "#1e40af", bg: "#dbeafe" },
  oog:      { badge: "#3b0764", bg: "#f3e8ff" },
};

// ─── CONSTRUCTION MATRIX INPUT ─────────────────────────────
const CM_COLUMNS = [
  { key: "type",       label: "Type",        placeholder: "e.g. Gypsum board / Glazed / Concrete" },
  { key: "size",       label: "Size",        placeholder: "e.g. 150 mm thick / 1200 × 2100 mm" },
  { key: "acoustic",   label: "Acoustic",    placeholder: "e.g. STC 50 / NRC 0.85 / RT60 ≤ 0.6s" },
  { key: "thermal",    label: "Thermal",     placeholder: "e.g. U-value 0.3 W/m²K / insulated" },
  { key: "protection", label: "Protection",  placeholder: "e.g. Crash rail / Corner guard / Lead lining" },
  { key: "finish",     label: "Finish",      placeholder: "e.g. Vinyl wrap / Epoxy paint / Ceramic tile" },
  { key: "notes",      label: "Notes",       placeholder: "Any additional notes or requirements" },
];


// ─── SHARED CHIP-SELECT HELPER ──────────────────────────────
function ChipSelect({ options, selected = [], onChange, multi = true, accentColor = "#ec4899", accentBg = "#fdf2f8", accentBorder = "#f9a8d4" }) {
  const toggle = (opt) => {
    if (multi) {
      const next = selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt];
      onChange(next);
    } else {
      onChange(selected.includes(opt) ? [] : [opt]);
    }
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)} style={{
            padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: active ? 700 : 500,
            border: `1.5px solid ${active ? accentBorder : "#e2e8f0"}`,
            background: active ? accentBg : "#f8fafc",
            color: active ? accentColor : "#64748b",
            cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
            boxShadow: active ? `0 0 0 2px ${accentBorder}40` : "none"
          }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = accentBorder; e.currentTarget.style.color = accentColor; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; } }}
          >
            {active && <span style={{ marginRight: 4 }}>&#10003;</span>}{opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── DOOR CONFIGURATION INPUT ───────────────────────────────
const DOOR_CONFIG = [
  {
    group: "Type & Leaf",
    icon: "🚪",
    fields: [
      { key: "swingType",  label: "Swing Type",  multi: true,  options: ["Swing", "Slide", "Bi-Fold", "Others (e.g. Telescopic sliding+swing)"] },
      { key: "leafConfig", label: "Leaf Config", multi: false, options: ["Single Leaf", "Double Leaf"] },
    ]
  },
  {
    group: "Dimensions & Operation",
    icon: "📐",
    fields: [
      { key: "width",     label: "Door Width",  multi: false, options: ["0.75 m", "0.90 m", "1.0 m", "1.2 m", "1.5 m", "1.8 m"] },
      { key: "mechanism", label: "Mechanism",   multi: false, options: ["Manual", "Auto"] },
    ]
  },
  {
    group: "Material & Glazing",
    icon: "🧱",
    fields: [
      { key: "material",     label: "Door Material",  multi: false, options: ["Wooden", "Steel / Metal", "Glass", "Shielding Door (Lead Lined)", "Other"] },
      { key: "viewingPanel", label: "Viewing Panel",  multi: false, options: ["Vertical", "Square", "Central", "Half Panel", "Quarter Panel"] },
      { key: "entryway",     label: "Entryway",       multi: true,  options: ["Transom Window (on top of door)", "Sidelight"] },
    ]
  },
  {
    group: "Locking & Access Control",
    icon: "🔐",
    fields: [
      { key: "locks",       label: "Mechanical Locks",             multi: false, options: ["Keys Outside", "Keys Both Ways", "Keys Outside + Thumb Turn Inside", "Coin Turn Outside + Thumb Turn Inside"] },
      { key: "accessEntry", label: "Electronic Access — Entry",    multi: true,  options: ["Entry Card Reader", "Biometric Entry", "Intercom (Audio) at Entry", "Intercom (Video) at Entry"] },
      { key: "accessExit",  label: "Electronic Access — Exit",     multi: true,  options: ["Exit Card Reader", "Biometric Exit", "Intercom (Audio) at Exit with Release Button", "Intercom (Video) at Exit with Release Button", "Intercom (Audio) at Remote Location with Release Button", "Intercom (Video) at Remote Location with Release Button"] },
      { key: "accessEM",    label: "EM Lock & Interlocking",       multi: true,  options: ["EM Lock", "EM Lock with Relay (for Monitoring Status)", "Interlocking Relay with Other Room Doors", "Interlocking Relay with Machines"] },
    ]
  },
  {
    group: "Hardware & Finish",
    icon: "🔧",
    fields: [
      { key: "closer",     label: "Door Closer",     multi: false, options: ["Normal", "Hold-Open Type"] },
      { key: "stopper",    label: "Door Stopper",    multi: false, options: ["Normal Floor Mounted", "Normal Wall Mounted", "Magnetic Latch"] },
      { key: "handle",     label: "Door Handle",     multi: false, options: ["Pushbar", "Pushplate", "Handle + Deadbolt", "Pull Handle", "Lever Handle", "Knob Handle"] },
      { key: "protection", label: "Door Protection", multi: true,  options: ["Vinyl", "Steel"] },
    ]
  },
  {
    group: "Signage, Rating & Special",
    icon: "🏷️",
    fields: [
      { key: "signage",         label: "Signage on Door",  multi: true,  options: ["Room Name Required", "Room No. Required", "Entry for Authorized Personnel Only"] },
      { key: "fireRating",      label: "Fire Rating",      multi: false, options: ["0.5 Hr", "1 Hr", "1.5 Hr", "2 Hr"] },
      { key: "specialFeatures", label: "Special Features", multi: true,  options: ["Drop-Down Acoustic Seals (Acoustic Doors)", "Hermetically Sealed Door"] },
    ]
  },
];

function DoorConfigInput({ field, register, setValue, watch }) {
  const rawVal = watch?.(field.name) || "{}";
  let data = {};
  try { data = JSON.parse(rawVal); } catch { data = {}; }

  const update = (key, val) => {
    setValue?.(field.name, JSON.stringify({ ...data, [key]: val }), { shouldDirty: true });
  };

  const [openGroup, setOpenGroup] = useState(null);
  const groupHasData = (grp) => grp.fields.some(f => (data[f.key] || []).length > 0);
  const totalConfigured = DOOR_CONFIG.reduce((s, g) => s + g.fields.filter(f => (data[f.key]||[]).length > 0).length, 0);

  return (
    <div style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
      <input type="hidden" {...register(field.name)} />

      {/* 3-col group selector grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: "1px solid #e2e8f0" }}>
        {DOOR_CONFIG.map((grp, gi) => {
          const isOpen = openGroup === gi;
          const hasDat = groupHasData(grp);
          const cnt = grp.fields.filter(f => (data[f.key]||[]).length > 0).length;
          return (
            <div key={gi} onClick={() => setOpenGroup(isOpen ? null : gi)}
              style={{
                padding: "11px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                borderRight: gi % 3 !== 2 ? "1px solid #e2e8f0" : "none",
                borderBottom: gi < 3 ? "1px solid #e2e8f0" : "none",
                background: isOpen ? "#fdf2f8" : hasDat ? "#fffafa" : "#fff",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background="#fdf9fb"; }}
              onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background= isOpen ? "#fdf2f8" : hasDat ? "#fffafa" : "#fff"; }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{grp.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: isOpen || hasDat ? "#be185d" : "#334155", lineHeight: 1.2 }}>{grp.group}</div>
                {cnt > 0 && <div style={{ fontSize: 10, color: "#ec4899", marginTop: 1 }}>{cnt} set</div>}
              </div>
              <span style={{ fontSize: 12, color: "#f9a8d4", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>⌄</span>
            </div>
          );
        })}
      </div>

      {/* Expanded detail — full width, inline below grid */}
      {openGroup !== null && (
        <div style={{ borderBottom: "1px solid #fce7f3", background: "#fff" }}>
          <div style={{ padding: "10px 16px", background: "linear-gradient(135deg,#fdf2f8,#fce7f3)", borderBottom: "1px solid #fce7f3", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>{DOOR_CONFIG[openGroup].icon}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#be185d" }}>{DOOR_CONFIG[openGroup].group}</span>
          </div>
          {/* Fields in responsive 3-col grid */}
          <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px 20px" }}>
            {DOOR_CONFIG[openGroup].fields.map(f => (
              <div key={f.key}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#be185d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{f.label}</div>
                <ChipSelect options={f.options} selected={data[f.key]||[]} onChange={val => update(f.key, val)} multi={f.multi} accentColor="#be185d" accentBg="#fdf2f8" accentBorder="#f9a8d4" />
              </div>
            ))}
          </div>
          <div style={{ padding: "0 16px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#be185d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 }}>Other Requirements</div>
            <textarea rows={2} placeholder="Any additional requirements..."
              value={data.otherRequirements || ""} onChange={e => update("otherRequirements", e.target.value)}
              style={{ width: "100%", fontSize: 12, padding: "7px 10px", borderRadius: 7, border: "1.5px solid #fce7f3", background: "#fdf2f8", color: "#1e3a5f", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor="#f9a8d4"} onBlur={e => e.target.style.borderColor="#fce7f3"} />
          </div>
        </div>
      )}

      {/* Summary */}
      {totalConfigured > 0 && (
        <div style={{ padding: "8px 14px", background: "#fdf2f8", display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: "#be185d", textTransform: "uppercase", letterSpacing: "0.5px", marginRight: 4 }}>Spec:</span>
          {DOOR_CONFIG.flatMap(g => g.fields).map(f =>
            (data[f.key]||[]).map(v => (
              <span key={f.key+v} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#fce7f3", color: "#be185d", fontWeight: 600 }}>{v}</span>
            ))
          )}
        </div>
      )}
    </div>
  );
}


// ─── WINDOW CONFIGURATION INPUT ─────────────────────────────
function WindowConfigInput({ field, register, setValue, watch }) {
  const rawVal = watch?.(field.name) || "{}";
  let data = {};
  try { data = JSON.parse(rawVal); } catch { data = {}; }

  const update = (section, key, val) => {
    setValue?.(field.name, JSON.stringify({ ...data, [section]: { ...(data[section]||{}), [key]: val } }), { shouldDirty: true });
  };

  return (
    <div style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
      <input type="hidden" {...register(field.name)} />

      {/* Side-by-side: Window A + Window B each take 50% */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

        {/* Window A */}
        <div style={{ borderRight: "1px solid #e2e8f0" }}>
          <div style={{ padding: "10px 16px", background: "linear-gradient(135deg,#0e7490,#0891b2)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🪟</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Window (A)</div>
              <div style={{ fontSize: 10, color: "#cffafe" }}>On Exterior Wall</div>
            </div>
          </div>
          {/* Fields as horizontal rows */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Type row */}
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #f1f5f9", minHeight: 44 }}>
              <div style={{ width: 110, flexShrink: 0, padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#0e7490", textTransform: "uppercase", letterSpacing: "0.4px", borderRight: "1px solid #f1f5f9", alignSelf: "stretch", display: "flex", alignItems: "center" }}>Type</div>
              <div style={{ flex: 1, padding: "8px 12px", display: "flex", flexWrap: "wrap", gap: 5 }}>
                <ChipSelect options={["Fixed", "Openable"]} selected={data.windowA?.type||[]} onChange={v => update("windowA","type",v)} multi={false} accentColor="#0e7490" accentBg="#ecfeff" accentBorder="#a5f3fc" />
              </div>
            </div>
            {/* Size row */}
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #f1f5f9", minHeight: 44 }}>
              <div style={{ width: 110, flexShrink: 0, padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#0e7490", textTransform: "uppercase", letterSpacing: "0.4px", borderRight: "1px solid #f1f5f9", alignSelf: "stretch", display: "flex", alignItems: "center" }}>Size</div>
              <div style={{ flex: 1, padding: "8px 12px" }}>
                <input type="text" placeholder="e.g. 1200 x 900 mm" value={data.windowA?.size||""}
                  onChange={e => update("windowA","size",e.target.value)}
                  style={{ width: "100%", fontSize: 12, padding: "6px 9px", borderRadius: 7, border: "1.5px solid #a5f3fc", background: "#ecfeff", color: "#1e3a5f", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor="#0891b2"} onBlur={e => e.target.style.borderColor="#a5f3fc"} />
              </div>
            </div>
            {/* Provisions row */}
            <div style={{ display: "flex", alignItems: "flex-start", minHeight: 44 }}>
              <div style={{ width: 110, flexShrink: 0, padding: "10px 12px", fontSize: 10, fontWeight: 700, color: "#0e7490", textTransform: "uppercase", letterSpacing: "0.4px", borderRight: "1px solid #f1f5f9" }}>Provisions</div>
              <div style={{ flex: 1, padding: "9px 12px", display: "flex", flexWrap: "wrap", gap: 5 }}>
                <ChipSelect options={["Key Lock","Blinds (Normal)","Blinds (Blackout)","Curtain Track"]} selected={data.windowA?.provisions||[]} onChange={v => update("windowA","provisions",v)} multi={true} accentColor="#0e7490" accentBg="#ecfeff" accentBorder="#a5f3fc" />
              </div>
            </div>
          </div>
        </div>

        {/* Window B */}
        <div>
          <div style={{ padding: "10px 16px", background: "linear-gradient(135deg,#7e22ce,#9333ea)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Window (B)</div>
              <div style={{ fontSize: 10, color: "#e9d5ff" }}>Into Another Room</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Glass Type */}
            <div style={{ display: "flex", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", minHeight: 44 }}>
              <div style={{ width: 110, flexShrink: 0, padding: "10px 12px", fontSize: 10, fontWeight: 700, color: "#7e22ce", textTransform: "uppercase", letterSpacing: "0.4px", borderRight: "1px solid #f1f5f9" }}>Glass Type</div>
              <div style={{ flex: 1, padding: "9px 12px", display: "flex", flexWrap: "wrap", gap: 5 }}>
                <ChipSelect options={["Ordinary Two-Way","One-Way Mirror","Switchable Smart Glass","Lead Lined","Tinted"]} selected={data.windowB?.type||[]} onChange={v => update("windowB","type",v)} multi={false} accentColor="#7e22ce" accentBg="#faf5ff" accentBorder="#d8b4fe" />
              </div>
            </div>
            {/* Size */}
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #f1f5f9", minHeight: 44 }}>
              <div style={{ width: 110, flexShrink: 0, padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#7e22ce", textTransform: "uppercase", letterSpacing: "0.4px", borderRight: "1px solid #f1f5f9", alignSelf: "stretch", display: "flex", alignItems: "center" }}>Size</div>
              <div style={{ flex: 1, padding: "8px 12px", display: "flex", flexWrap: "wrap", gap: 5 }}>
                <ChipSelect options={["1000 x 800 mm","1200 x 800 mm","2400 x 1200 mm"]} selected={data.windowB?.size||[]} onChange={v => update("windowB","size",v)} multi={false} accentColor="#7e22ce" accentBg="#faf5ff" accentBorder="#d8b4fe" />
              </div>
            </div>
            {/* Special Note */}
            <div style={{ display: "flex", alignItems: "center", minHeight: 44 }}>
              <div style={{ width: 110, flexShrink: 0, padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#7e22ce", textTransform: "uppercase", letterSpacing: "0.4px", borderRight: "1px solid #f1f5f9", alignSelf: "stretch", display: "flex", alignItems: "center" }}>Special Note</div>
              <div style={{ flex: 1, padding: "8px 12px" }}>
                <input type="text" placeholder="e.g. No mullions along viewing length" value={data.windowB?.note||""}
                  onChange={e => update("windowB","note",e.target.value)}
                  style={{ width: "100%", fontSize: 12, padding: "6px 9px", borderRadius: 7, border: "1.5px solid #d8b4fe", background: "#faf5ff", color: "#1e3a5f", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor="#9333ea"} onBlur={e => e.target.style.borderColor="#d8b4fe"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── SANITARY FITTINGS GRID ─────────────────────────────────
const SANITARY_GROUPS = [
  {
    group: "Taps & Water Supply", icon: "🚿", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc",
    items: [
      { key: "tapMixer",      label: "Tap (Mixer)" },
      { key: "tapMedical",    label: "Tap (Medical Mixer)" },
      { key: "tapNormal",     label: "Tap (Normal)" },
      { key: "tapSensor",     label: "Tap (Sensor)" },
      { key: "bibTap",        label: "Bib Tap / Hose Union" },
      { key: "drinkingFount", label: "Drinking Fountain" },
    ]
  },
  {
    group: "Hand Hygiene Station", icon: "🧼", color: "#059669", bg: "#ecfdf5", border: "#6ee7b7",
    items: [
      { key: "handTowelManual",  label: "Hand Towel (Manual)" },
      { key: "handTowelPower",   label: "Hand Towel (Direct Power)" },
      { key: "handDryer",        label: "Hand Dryer (Direct Power)" },
      { key: "antisepticDisp",   label: "Antiseptic Dispenser" },
      { key: "soapManual",       label: "Soap Dispenser (Manual)" },
      { key: "soapBattery",      label: "Soap Dispenser (Battery)" },
      { key: "soapPower",        label: "Soap Dispenser (Direct Power)" },
    ]
  },
  {
    group: "Basins & Clinical Sinks", icon: "🪣", color: "#d97706", bg: "#fffbeb", border: "#fcd34d",
    items: [
      { key: "basinNormal",  label: "Wash Basin (Normal)" },
      { key: "basinMedical", label: "Wash Basin (Medical)" },
      { key: "basinDeep",    label: "Wash Basin (Medical) — Deep Sink" },
      { key: "hotSink",      label: "Hot Sink" },
      { key: "sluiceSink",   label: "Sluice Sink (Slop Hopper)" },
      { key: "scrubSink",    label: "Scrub Sink" },
      { key: "mopSink",      label: "Mop Sink" },
    ]
  },
  {
    group: "Sanitary & Waste", icon: "🚽", color: "#7c3aed", bg: "#faf5ff", border: "#c4b5fd",
    items: [
      { key: "shower",     label: "Shower Facility" },
      { key: "urinalBowl", label: "Urinal Bowl" },
      { key: "macerator",  label: "Macerator" },
    ]
  },
  {
    group: "Accessories", icon: "🧷", color: "#be185d", bg: "#fdf2f8", border: "#f9a8d4",
    items: [
      { key: "clothHanger", label: "Cloth Hanger" },
    ]
  },
];

function SanitaryGridInput({ field, register, setValue, watch }) {
  const rawVal = watch?.(field.name) || "{}";
  let data = {};
  try { data = JSON.parse(rawVal); } catch { data = {}; }

  const toggle = (key) => {
    const next = { ...data, [key]: !data[key] };
    setValue?.(field.name, JSON.stringify(next), { shouldDirty: true });
  };

  const totalSelected = Object.values(data).filter(Boolean).length;

  return (
    <div style={{ width: "100%" }}>
      <input type="hidden" {...register(field.name)} />
      {totalSelected > 0 && (
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: "#fdf2f8", color: "#be185d", border: "1px solid #f9a8d4" }}>
            {totalSelected} fitting{totalSelected !== 1 ? "s" : ""} selected
          </span>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SANITARY_GROUPS.map((grp) => (
          <div key={grp.group} style={{ border: `1.5px solid ${grp.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: grp.bg, borderBottom: `1px solid ${grp.border}` }}>
              <span style={{ fontSize: 17 }}>{grp.icon}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: grp.color }}>{grp.group}</span>
              <span style={{ fontSize: 10.5, color: grp.color, opacity: 0.7, marginLeft: "auto" }}>
                {grp.items.filter(it => data[it.key]).length}/{grp.items.length} selected
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", background: "#fff" }}>
              {grp.items.map((item) => {
                const active = !!data[item.key];
                return (
                  <div key={item.key} onClick={() => toggle(item.key)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    cursor: "pointer", borderRight: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9",
                    background: active ? grp.bg : "#fff", transition: "background 0.15s"
                  }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "#fff"; }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${active ? grp.color : "#cbd5e1"}`,
                      background: active ? grp.color : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s"
                    }}>
                      {active && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>&#10003;</span>}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? grp.color : "#475569", transition: "color 0.15s" }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>Click any fitting to toggle selection. All fields are optional.</div>
    </div>
  );
}

function ConstructionMatrixInput({ field, register, setValue, watch }) {
  const elements = field.elements || [];
  const rawVal = watch?.(field.name) || "{}";
  let data = {};
  try { data = JSON.parse(rawVal); } catch { data = {}; }

  const update = (elemKey, colKey, val) => {
    const next = { ...data, [elemKey]: { ...(data[elemKey] || {}), [colKey]: val } };
    setValue?.(field.name, JSON.stringify(next), { shouldDirty: true });
  };

  const [expandedRow, setExpandedRow] = useState(null);

  const hasData = (elemKey) => {
    const row = data[elemKey] || {};
    return CM_COLUMNS.some(c => row[c.key]?.trim());
  };

  return (
    <div style={{ width: "100%" }}>
      <input type="hidden" {...register(field.name)} />

      {/* Header strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "160px repeat(7, 1fr)",
        gap: 0,
        background: "linear-gradient(135deg, #0e7490 0%, #0891b2 100%)",
        borderRadius: "12px 12px 0 0",
        padding: "10px 14px",
        alignItems: "center"
      }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase" }}>Element</span>
        {CM_COLUMNS.map(col => (
          <span key={col.key} style={{ fontSize: 11, fontWeight: 700, color: "#cffafe", textAlign: "center", letterSpacing: "0.4px", textTransform: "uppercase" }}>
            {col.label}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ border: "1.5px solid #e0f2fe", borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden", background: "#fff" }}>
        {elements.map((elem, idx) => {
          const isExpanded = expandedRow === elem.key;
          const filled = hasData(elem.key);
          const rowBg = idx % 2 === 0 ? "#f0f9ff" : "#ffffff";

          return (
            <div key={elem.key} style={{ borderBottom: idx < elements.length - 1 ? "1px solid #e0f2fe" : "none" }}>

              {/* Collapsed summary row */}
              <div
                onClick={() => setExpandedRow(isExpanded ? null : elem.key)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px repeat(7, 1fr)",
                  gap: 0,
                  padding: "10px 14px",
                  background: isExpanded ? "#e0f9ff" : rowBg,
                  cursor: "pointer",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = "#e0f2fe"; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = rowBg; }}
              >
                {/* Element label */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{elem.icon}</span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0e7490" }}>{elem.label}</div>
                    {filled && !isExpanded && (
                      <div style={{ fontSize: 10, color: "#0891b2", fontWeight: 500, marginTop: 1 }}>● Specified</div>
                    )}
                  </div>
                </div>

                {/* Compact value previews */}
                {CM_COLUMNS.map(col => {
                  const val = data[elem.key]?.[col.key] || "";
                  return (
                    <div key={col.key} style={{ fontSize: 11, color: val ? "#1e3a5f" : "#cbd5e1", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 4px" }}>
                      {val ? (val.length > 14 ? val.slice(0, 12) + "…" : val) : "—"}
                    </div>
                  );
                })}
              </div>

              {/* Expanded edit panel */}
              {isExpanded && (
                <div style={{ background: "#f0f9ff", borderTop: "1px solid #bae6fd", padding: "16px 18px 18px" }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px 16px"
                  }}>
                    {CM_COLUMNS.map(col => (
                      <div key={col.key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#0e7490", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                          {col.label}
                        </label>
                        {col.key === "notes" ? (
                          <textarea
                            rows={2}
                            placeholder={col.placeholder}
                            value={data[elem.key]?.[col.key] || ""}
                            onChange={e => update(elem.key, col.key, e.target.value)}
                            style={{
                              fontSize: 12.5, padding: "8px 10px", borderRadius: 8, resize: "vertical",
                              border: "1.5px solid #bae6fd", background: "#fff", color: "#1e3a5f",
                              outline: "none", lineHeight: 1.5, fontFamily: "inherit",
                              transition: "border-color 0.15s"
                            }}
                            onFocus={e => e.target.style.borderColor = "#0891b2"}
                            onBlur={e => e.target.style.borderColor = "#bae6fd"}
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder={col.placeholder}
                            value={data[elem.key]?.[col.key] || ""}
                            onChange={e => update(elem.key, col.key, e.target.value)}
                            style={{
                              fontSize: 12.5, padding: "8px 10px", borderRadius: 8,
                              border: "1.5px solid #bae6fd", background: "#fff", color: "#1e3a5f",
                              outline: "none", fontFamily: "inherit",
                              transition: "border-color 0.15s"
                            }}
                            onFocus={e => e.target.style.borderColor = "#0891b2"}
                            onBlur={e => e.target.style.borderColor = "#bae6fd"}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Done button */}
                  <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => setExpandedRow(null)}
                      style={{
                        padding: "7px 22px", borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                        background: "#0891b2", color: "#fff", border: "none", cursor: "pointer",
                        letterSpacing: "0.3px", transition: "background 0.15s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#0e7490"}
                      onMouseLeave={e => e.currentTarget.style.background = "#0891b2"}
                    >
                      ✓ Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8", paddingLeft: 4 }}>
        Click any row to expand and fill in specifications. All fields are optional.
      </div>
    </div>
  );
}

// ─── SSO SOCKET OUTLET MATRIX ──────────────────────────────
const SSO_LOCATIONS = [
  { key: "wall",         label: "Wall",                 icon: "🧱" },
  { key: "floor",        label: "Floor",                icon: "⬜" },
  { key: "aboveCeiling", label: "Above Ceiling",        icon: "🏛️" },
  { key: "desk",         label: "Desk / Table / Bench", icon: "🪑" },
  { key: "bedHead",      label: "Bed Head Panel",       icon: "🛏️" },
  { key: "pendant",      label: "Medical Pendant",      icon: "💡" },
  { key: "other",        label: "Other",                icon: "📌" },
];
const SSO_SOURCES = [
  { key: "normal",    label: "Normal",    color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  { key: "emergency", label: "Emergency", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
  { key: "ups",       label: "UPS",       color: "#d97706", bg: "#fef3c7", border: "#fcd34d" },
];

function SSOMatrixInput({ field, register, setValue, watch }) {
  const rawVal = watch?.(field.name) || "{}";
  let data = {};
  try { data = JSON.parse(rawVal); } catch { data = {}; }

  const getVal = (locKey, srcKey) => data[locKey]?.[srcKey] ?? 0;

  const update = (locKey, srcKey, val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    const next = { ...data, [locKey]: { ...(data[locKey] || {}), [srcKey]: qty } };
    setValue?.(field.name, JSON.stringify(next), { shouldDirty: true });
  };

  const totalSockets = SSO_LOCATIONS.reduce((sum, loc) =>
    sum + SSO_SOURCES.reduce((s2, src) => s2 + getVal(loc.key, src.key), 0), 0);

  return (
    <div style={{ width: "100%" }}>
      <input type="hidden" {...register(field.name)} />

      {/* Summary badge */}
      {totalSockets > 0 && (
        <div style={{ marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SSO_SOURCES.map(src => {
            const srcTotal = SSO_LOCATIONS.reduce((s, loc) => s + getVal(loc.key, src.key), 0);
            if (!srcTotal) return null;
            return (
              <span key={src.key} style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: src.bg, color: src.color, border: `1px solid ${src.border}` }}>
                {src.label}: {srcTotal}
              </span>
            );
          })}
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>
            Total: {totalSockets} outlets
          </span>
        </div>
      )}

      {/* Table */}
      <div style={{ border: "1.5px solid #fed7aa", borderRadius: 12, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "160px repeat(3, 1fr)", background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", padding: "10px 14px", alignItems: "center", gap: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px" }}>Location</span>
          {SSO_SOURCES.map(src => (
            <span key={src.key} style={{ fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {src.label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {SSO_LOCATIONS.map((loc, idx) => {
          const rowTotal = SSO_SOURCES.reduce((s, src) => s + getVal(loc.key, src.key), 0);
          return (
            <div key={loc.key} style={{ display: "grid", gridTemplateColumns: "160px repeat(3, 1fr)", borderTop: idx > 0 ? "1px solid #fed7aa" : "none", background: idx % 2 === 0 ? "#fff7ed" : "#fff", alignItems: "center", padding: "10px 14px", gap: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>{loc.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#9a3412" }}>{loc.label}</div>
                  {rowTotal > 0 && <div style={{ fontSize: 10, color: "#f97316", fontWeight: 600 }}>{rowTotal} total</div>}
                </div>
              </div>
              {SSO_SOURCES.map(src => {
                const val = getVal(loc.key, src.key);
                return (
                  <div key={src.key} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <button type="button" onClick={() => update(loc.key, src.key, val - 1)}
                      style={{ width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${val > 0 ? src.border : "#e2e8f0"}`, background: val > 0 ? src.bg : "#f8fafc", color: val > 0 ? src.color : "#94a3b8", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>−</button>
                    <span style={{ width: 28, textAlign: "center", fontSize: 14, fontWeight: 700, color: val > 0 ? src.color : "#cbd5e1" }}>{val}</span>
                    <button type="button" onClick={() => update(loc.key, src.key, val + 1)}
                      style={{ width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${src.border}`, background: src.bg, color: src.color, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>+</button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>Set outlet quantities per location and power source type (Normal / Emergency / UPS).</div>
    </div>
  );
}

// ─── POWER ISOLATOR MATRIX ──────────────────────────────────
const ISOLATOR_LOCATIONS = ["Wall", "Above Ceiling", "Any Other (specify)"];
const ISOLATOR_SOURCES   = ["Normal Source", "Emergency Source", "UPS Source"];
const ISOLATOR_RATINGS   = ["20A TPN", "20A DP", "30A TPN", "30A DP", "40A TPN", "40A DP", "63A TPN"];
const ISOLATOR_RATING_COLORS = {
  "20A TPN": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "20A DP":  { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  "30A TPN": { bg: "#fef3c7", color: "#d97706", border: "#fcd34d" },
  "30A DP":  { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  "40A TPN": { bg: "#fdf4ff", color: "#9333ea", border: "#e9d5ff" },
  "40A DP":  { bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
  "63A TPN": { bg: "#f0fdfa", color: "#0f766e", border: "#99f6e4" },
};

function IsolatorMatrixInput({ field, register, setValue, watch }) {
  const rawVal = watch?.(field.name) || "[]";
  let rows = [];
  try { rows = JSON.parse(rawVal); } catch { rows = []; }

  const [otherNotes, setOtherNotes] = useState({});

  const addRow = () => {
    const next = [...rows, { id: Date.now(), location: "Wall", source: "Normal Source", rating: "20A TPN", qty: 1, note: "" }];
    setValue?.(field.name, JSON.stringify(next), { shouldDirty: true });
  };

  const updateRow = (id, key, val) => {
    const next = rows.map(r => r.id === id ? { ...r, [key]: val } : r);
    setValue?.(field.name, JSON.stringify(next), { shouldDirty: true });
  };

  const removeRow = (id) => {
    const next = rows.filter(r => r.id !== id);
    setValue?.(field.name, JSON.stringify(next), { shouldDirty: true });
  };

  return (
    <div style={{ width: "100%" }}>
      <input type="hidden" {...register(field.name)} />

      {rows.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", border: "2px dashed #e0f2fe", borderRadius: 12, background: "#f0f9ff", color: "#94a3b8" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>No isolators configured</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Click "Add Isolator" to define power isolator requirements</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px 32px", gap: 8, padding: "8px 12px", background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)", borderRadius: 10 }}>
            {["Location", "Source", "Rating", "Qty", ""].map((h, i) => (
              <span key={i} style={{ fontSize: 10.5, fontWeight: 700, color: i < 4 ? "#bfdbfe" : "transparent", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: i === 3 ? "center" : "left" }}>{h}</span>
            ))}
          </div>

          {rows.map((row, idx) => {
            const ratingStyle = ISOLATOR_RATING_COLORS[row.rating] || { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
            return (
              <div key={row.id} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px", background: idx % 2 === 0 ? "#f0f9ff" : "#fff", border: "1.5px solid #e0f2fe", borderRadius: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px 32px", gap: 8, alignItems: "center" }}>
                  {/* Location */}
                  <select value={row.location} onChange={e => updateRow(row.id, "location", e.target.value)}
                    style={{ fontSize: 12.5, padding: "7px 10px", borderRadius: 8, border: "1.5px solid #bae6fd", background: "#fff", color: "#1e3a5f", outline: "none", cursor: "pointer" }}>
                    {ISOLATOR_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>

                  {/* Source */}
                  <select value={row.source} onChange={e => updateRow(row.id, "source", e.target.value)}
                    style={{ fontSize: 12.5, padding: "7px 10px", borderRadius: 8, border: `1.5px solid ${row.source === "Normal Source" ? "#86efac" : row.source === "Emergency Source" ? "#fca5a5" : "#fcd34d"}`, background: row.source === "Normal Source" ? "#f0fdf4" : row.source === "Emergency Source" ? "#fff0f0" : "#fffbeb", color: "#1e3a5f", outline: "none", cursor: "pointer", fontWeight: 600 }}>
                    {ISOLATOR_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  {/* Rating */}
                  <select value={row.rating} onChange={e => updateRow(row.id, "rating", e.target.value)}
                    style={{ fontSize: 12.5, padding: "7px 10px", borderRadius: 8, border: `1.5px solid ${ratingStyle.border}`, background: ratingStyle.bg, color: ratingStyle.color, outline: "none", cursor: "pointer", fontWeight: 700 }}>
                    {ISOLATOR_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>

                  {/* Qty */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                    <button type="button" onClick={() => updateRow(row.id, "qty", Math.max(1, row.qty - 1))}
                      style={{ width: 26, height: 26, borderRadius: 6, border: "1.5px solid #bae6fd", background: "#f0f9ff", color: "#0891b2", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span style={{ width: 24, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#0e7490" }}>{row.qty}</span>
                    <button type="button" onClick={() => updateRow(row.id, "qty", row.qty + 1)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: "1.5px solid #bae6fd", background: "#e0f2fe", color: "#0891b2", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>

                  {/* Delete */}
                  <button type="button" onClick={() => removeRow(row.id)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #fecdd3", background: "#fff1f2", color: "#e11d48", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                {/* Conditional "Any Other" note */}
                {row.location === "Any Other (specify)" && (
                  <input type="text" placeholder="Describe location..." value={row.note || ""}
                    onChange={e => updateRow(row.id, "note", e.target.value)}
                    style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #bae6fd", background: "#fff", color: "#1e3a5f", outline: "none", fontFamily: "inherit" }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add button */}
      <button type="button" onClick={addRow}
        style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "1.5px dashed #93c5fd", background: "#eff6ff", color: "#2563eb", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; e.currentTarget.style.borderStyle = "solid"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderStyle = "dashed"; }}>
        <span style={{ fontSize: 16 }}>+</span> Add Isolator
      </button>

      {rows.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>
          {rows.length} isolator{rows.length !== 1 ? "s" : ""} configured — {rows.reduce((s, r) => s + r.qty, 0)} total units
        </div>
      )}
    </div>
  );
}

function GasMatrixInput({ field, register, setValue, watch }) {
  const gases = field.gases || [];
  const rawVal = watch?.(field.name) || "{}";
  let data = {};
  try { data = JSON.parse(rawVal); } catch { data = {}; }

  const update = (gasKey, colKey, value) => {
    const next = { ...data, [gasKey]: { ...(data[gasKey] || {}), [colKey]: value } };
    setValue?.(field.name, JSON.stringify(next), { shouldDirty: true });
  };

  const getVal = (gasKey, colKey) => data[gasKey]?.[colKey] ?? "";

  const getRowTotal = (gasKey) =>
    GAS_COLUMNS.filter(c => !c.isText)
      .reduce((sum, c) => sum + (parseInt(data[gasKey]?.[c.key]) || 0), 0);

  const isRowActive = (gasKey) =>
    GAS_COLUMNS.some(c => {
      const v = data[gasKey]?.[c.key];
      return c.isText ? (v && v.trim() !== "") : (parseInt(v) || 0) > 0;
    });

  const activeCount = gases.filter(g => isRowActive(g.key)).length;
  const grandTotal = gases.reduce((sum, g) => sum + getRowTotal(g.key), 0);

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
      <input type="hidden" {...register(field.name)} />

      {/* Header */}
      <div style={{ padding: "14px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.1px" }}>Medical Gas Point Schedule</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>Enter outlet quantities per location and mounting height for each gas service</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {activeCount > 0 && (
            <span style={{ background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: "1px solid #e2e8f0" }}>
              {activeCount} configured
            </span>
          )}
          {grandTotal > 0 && (
            <span style={{ background: "#f1f5f9", color: "#334155", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid #e2e8f0" }}>
              {grandTotal} pts total
            </span>
          )}
        </div>
      </div>

      {/* Column header row */}
      <div style={{ display: "grid", gridTemplateColumns: "210px repeat(5, 1fr) 120px 64px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ padding: "9px 14px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px" }}>Gas / Service</div>
        {GAS_COLUMNS.map(col => (
          <div key={col.key} style={{ padding: "9px 4px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", borderLeft: "1px solid #e8edf5" }}>
            {col.short}{col.unit ? <span style={{ fontWeight: 400, opacity: 0.7 }}> ({col.unit})</span> : ""}
          </div>
        ))}
        <div style={{ padding: "9px 4px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", borderLeft: "1px solid #e8edf5" }}>Pts</div>
      </div>

      {/* Gas rows */}
      <div>
        {gases.map((gas, i) => {
          const active = isRowActive(gas.key);
          const rowTotal = getRowTotal(gas.key);
          const muted = GAS_MUTED[gas.key] || { badge: "#334155", bg: "#f1f5f9" };
          return (
            <div key={gas.key} style={{
              display: "grid",
              gridTemplateColumns: "210px repeat(5, 1fr) 120px 64px",
              borderBottom: i < gases.length - 1 ? "1px solid #f1f5f9" : "none",
              background: active ? "#fafbfe" : "#fff",
              transition: "background 0.15s"
            }}>
              {/* Gas label */}
              <div style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: 9, borderRight: "1px solid #f1f5f9" }}>
                <span style={{
                  flexShrink: 0, minWidth: 36, height: 18, borderRadius: 3,
                  background: active ? muted.bg : "#f1f5f9",
                  color: active ? muted.badge : "#94a3b8",
                  border: `1px solid ${active ? muted.badge + "30" : "#e2e8f0"}`,
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.4px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s", paddingLeft: 3, paddingRight: 3
                }}>{gas.symbol}</span>
                <span style={{ fontSize: 11.5, fontWeight: active ? 600 : 400, color: active ? "#0f172a" : "#94a3b8", lineHeight: 1.35, transition: "all 0.15s" }}>
                  {gas.label}
                </span>
              </div>

              {/* Qty columns — uniform slate controls, no per-gas colour */}
              {GAS_COLUMNS.filter(c => !c.isText).map(col => {
                const v = parseInt(getVal(gas.key, col.key)) || 0;
                return (
                  <div key={col.key} style={{ padding: "7px 4px", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <button type="button"
                        onClick={() => update(gas.key, col.key, Math.max(0, v - 1))}
                        style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid #e2e8f0", background: "#f8fafc", color: v > 0 ? "#475569" : "#cbd5e1", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, transition: "all 0.15s", flexShrink: 0 }}>−</button>
                      <input type="number" min="0"
                        value={v || ""}
                        placeholder="—"
                        onChange={e => update(gas.key, col.key, e.target.value)}
                        style={{ width: 34, height: 26, textAlign: "center", border: `1.5px solid ${v > 0 ? "#64748b" : "#e8edf5"}`, borderRadius: 5, fontSize: 12, fontWeight: v > 0 ? 700 : 400, color: v > 0 ? "#0f172a" : "#cbd5e1", background: v > 0 ? "#f8fafc" : "#fff", outline: "none", transition: "all 0.15s" }}
                        onFocus={e => { e.target.style.borderColor = "#64748b"; e.target.style.boxShadow = "0 0 0 3px rgba(100,116,139,0.12)"; }}
                        onBlur={e => { e.target.style.borderColor = v > 0 ? "#64748b" : "#e8edf5"; e.target.style.boxShadow = "none"; }}
                      />
                      <button type="button"
                        onClick={() => update(gas.key, col.key, v + 1)}
                        style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid #cbd5e1", background: "#334155", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, transition: "all 0.15s", flexShrink: 0 }}>+</button>
                    </div>
                  </div>
                );
              })}

              {/* Mounting height */}
              <div style={{ padding: "7px 6px", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #f1f5f9" }}>
                <input type="text"
                  value={getVal(gas.key, "height")}
                  placeholder="—"
                  onChange={e => update(gas.key, "height", e.target.value)}
                  style={{ width: "100%", height: 26, padding: "0 6px", border: "1.5px solid #e8edf5", borderRadius: 5, fontSize: 11.5, color: "#334155", background: "#fff", outline: "none", transition: "all 0.15s", textAlign: "center" }}
                  onFocus={e => { e.target.style.borderColor = "#64748b"; e.target.style.boxShadow = "0 0 0 3px rgba(100,116,139,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#e8edf5"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {/* Row total — only here do we use the gas accent */}
              <div style={{ padding: "7px 4px", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #f1f5f9" }}>
                {rowTotal > 0 ? (
                  <span style={{
                    minWidth: 32, height: 22, borderRadius: 4,
                    background: muted.bg, color: muted.badge,
                    border: `1px solid ${muted.badge}25`,
                    fontSize: 11.5, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    paddingLeft: 6, paddingRight: 6,
                    transition: "all 0.2s"
                  }}>{rowTotal}</span>
                ) : (
                  <span style={{ color: "#e2e8f0", fontSize: 12 }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      {activeCount > 0 && (
        <div style={{ padding: "11px 16px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 7 }}>Configured Services</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {gases.filter(g => isRowActive(g.key)).map(g => {
              const muted = GAS_MUTED[g.key] || { badge: "#334155", bg: "#f1f5f9" };
              const total = getRowTotal(g.key);
              const ht = getVal(g.key, "height");
              return (
                <span key={g.key} style={{ background: muted.bg, border: `1px solid ${muted.badge}25`, borderRadius: 5, padding: "3px 9px", fontSize: 11, fontWeight: 600, color: muted.badge, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontWeight: 800 }}>{g.symbol}</span>
                  {total > 0 && <span style={{ fontWeight: 400, opacity: 0.8 }}>· {total} pts</span>}
                  {ht && <span style={{ fontWeight: 400, opacity: 0.7 }}>@ {ht}mm</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPUTED / AUTO-FILL FIELD ────────────────────────────
function ComputedInput({ field, register, setValue, watch }) {
  const formulaFields = field.formula || [];
  const separator     = field.separator || "_";

  // Watch every source field so React re-renders on any change
  const watched = formulaFields.map(f => watch?.(f) || "");

  // Build computed value — only include tokens that have a non-empty value
  const computed = watched
    .map(v => (v || "").toString().trim())
    .filter(Boolean)
    .join(separator);

  // Keep the hidden form field in sync
  useEffect(() => {
    setValue?.(field.name, computed, { shouldDirty: true });
  }, [computed]); // eslint-disable-line react-hooks/exhaustive-deps

  const isEmpty    = computed === "";
  const partCount  = watched.filter(v => (v || "").toString().trim() !== "").length;
  const totalParts = formulaFields.length;
  const isComplete = partCount === totalParts;

  const stripColor = isEmpty ? "#e2e8f0" : isComplete ? "#22c55e" : "#f59e0b";

  return (
    <div>
      {/* Hidden registered field so react-hook-form tracks the value */}
      <input type="hidden" {...register(field.name)} />

      <div
        style={{
          position:     "relative",
          borderRadius: 10,
          border:       `1.5px solid ${isComplete ? "#86efac" : isEmpty ? "#e2e8f0" : "#fde68a"}`,
          background:   isComplete ? "#f0fdf4" : isEmpty ? "#f8fafc" : "#fffbeb",
          overflow:     "hidden",
          transition:   "all 0.25s ease",
        }}
      >
        {/* Progress strip — top edge */}
        <div
          style={{
            height:     3,
            background: `linear-gradient(to right, ${stripColor} ${(partCount / totalParts) * 100}%, #e2e8f0 ${(partCount / totalParts) * 100}%)`,
            transition: "all 0.3s ease",
          }}
        />

        <div style={{ padding: "12px 14px" }}>
          {/* Formula token pills row */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {formulaFields.map((fName, i) => {
              const val      = (watched[i] || "").toString().trim();
              const hasValue = val !== "";
              return (
                <span key={fName} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{
                      display:      "inline-flex",
                      alignItems:   "center",
                      gap:          4,
                      padding:      "3px 9px",
                      borderRadius: 20,
                      fontSize:     11,
                      fontWeight:   700,
                      border:       `1px solid ${hasValue ? "#86efac" : "#e2e8f0"}`,
                      background:   hasValue ? "#dcfce7" : "#f1f5f9",
                      color:        hasValue ? "#15803d" : "#94a3b8",
                      transition:   "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: 9 }}>{hasValue ? "✓" : "○"}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: "#64748b", marginRight: 2 }}>
                      {field.formulaLabels?.[i] || fName}
                    </span>
                    {hasValue && (
                      <span style={{ fontWeight: 700, color: "#15803d" }}>{val}</span>
                    )}
                  </span>

                  {/* Separator between tokens */}
                  {i < formulaFields.length - 1 && (
                    <span
                      style={{
                        fontSize:   13,
                        fontWeight: 700,
                        color:      hasValue && (watched[i + 1] || "").trim() !== "" ? "#22c55e" : "#cbd5e1",
                        userSelect: "none",
                        transition: "color 0.2s",
                      }}
                    >
                      {separator}
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          {/* Generated code display box */}
          <div
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        10,
              padding:    "10px 12px",
              borderRadius: 8,
              background: isComplete ? "#ffffff" : "#f8fafc",
              border:     `1px solid ${isComplete ? "#bbf7d0" : "#e2e8f0"}`,
              minHeight:  40,
              transition: "all 0.25s",
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>{isComplete ? "🔑" : "⏳"}</span>

            {computed ? (
              <span
                style={{
                  fontFamily:    "'Courier New', Courier, monospace",
                  fontSize:      13.5,
                  fontWeight:    700,
                  color:         "#0f172a",
                  letterSpacing: "0.5px",
                  flex:          1,
                  wordBreak:     "break-all",
                }}
              >
                {computed}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", flex: 1 }}>
                Fill in the fields above to generate the Room Code
              </span>
            )}

            {/* Copy button */}
            {computed && (
              <button
                type="button"
                title="Copy Room Code"
                onClick={() => navigator.clipboard?.writeText(computed)}
                style={{
                  flexShrink:   0,
                  padding:      "4px 10px",
                  borderRadius: 6,
                  border:       "1px solid #e2e8f0",
                  background:   "#f8fafc",
                  cursor:       "pointer",
                  fontSize:     11,
                  fontWeight:   600,
                  color:        "#475569",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          4,
                  transition:   "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                onMouseDown={e => {
                  const btn = e.currentTarget;
                  btn.textContent = "✓ Copied";
                  setTimeout(() => { if (btn) btn.textContent = "⎘ Copy"; }, 1500);
                }}
              >
                ⎘ Copy
              </button>
            )}
          </div>

          {/* Progress hint */}
          {!isComplete && (
            <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
              <span>{partCount}/{totalParts} fields filled</span>
              {partCount > 0 && <span style={{ color: "#cbd5e1" }}>·</span>}
              {partCount > 0 && <span>Complete all fields to generate the full code</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SAFETY MATRIX ─────────────────────────────────────────
function SafetyMatrixInput({ field, register, setValue, watch }) {
  const rows = field.rows || [];
  const rawVal = watch?.(field.name) || "{}";
  let data = {};
  try { data = JSON.parse(rawVal); } catch { data = {}; }

  const set = (rowKey, val) => {
    setValue?.(field.name, JSON.stringify({ ...data, [rowKey]: val }), { shouldDirty: true });
  };

  const configuredCount = rows.filter(r => data[r.key] && data[r.key] !== "").length;

  // Split rows into 2 columns
  const half = Math.ceil(rows.length / 2);
  const colA = rows.slice(0, half);
  const colB = rows.slice(half);

  const MatrixRow = ({ row }) => {
    const selected = data[row.key] || "";
    const isSet = selected !== "";
    return (
      <div style={{ display: "flex", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", minHeight: 40 }}>
        {/* Label */}
        <div style={{ width: 130, flexShrink: 0, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6, borderRight: "1px solid #f1f5f9", alignSelf: "stretch", background: isSet ? "#fffafa" : "#fafafa" }}>
          <span style={{ fontSize: 13, flexShrink: 0 }}>{row.icon}</span>
          <span style={{ fontSize: 11, fontWeight: isSet ? 600 : 400, color: isSet ? "#0f172a" : "#64748b", lineHeight: 1.25 }}>{row.label}</span>
        </div>
        {/* Options */}
        <div style={{ flex: 1, padding: "7px 10px", display: "flex", flexWrap: "wrap", gap: 4, background: "#fff" }}>
          {row.options.map(opt => {
            const isSel = selected === opt;
            const isNA = opt.startsWith("Not ") || opt === "Open Access";
            return (
              <button key={opt} type="button" onClick={() => set(row.key, isSel ? "" : opt)}
                style={{
                  padding: "3px 9px", borderRadius: 5, fontSize: 10.5, fontWeight: isSel ? 700 : 400,
                  cursor: "pointer", transition: "all 0.12s", whiteSpace: "nowrap",
                  border: isSel ? "1.5px solid #991b1b" : "1px solid #e2e8f0",
                  background: isSel ? "#fee2e2" : "#f8fafc",
                  color: isSel ? "#7f1d1d" : isNA ? "#94a3b8" : "#475569",
                }}
                onMouseEnter={e => { if (!isSel) { e.currentTarget.style.background="#f1f5f9"; e.currentTarget.style.borderColor="#cbd5e1"; e.currentTarget.style.color="#1e293b"; }}}
                onMouseLeave={e => { if (!isSel) { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color=isNA?"#94a3b8":"#475569"; }}}
              >
                {isSel && <span style={{ marginRight: 3, fontSize: 9 }}>✓</span>}{opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
      <input type="hidden" {...register(field.name)} />

      <div style={{ padding: "8px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px" }}>Parameter · Specification</span>
        {configuredCount > 0 && (
          <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, border: "1px solid #fecaca" }}>
            {configuredCount}/{rows.length} set
          </span>
        )}
      </div>

      {/* 2-column layout — each half has its own rows */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ borderRight: "1px solid #e2e8f0" }}>
          {colA.map(row => <MatrixRow key={row.key} row={row} />)}
        </div>
        <div>
          {colB.map(row => <MatrixRow key={row.key} row={row} />)}
        </div>
      </div>

      {configuredCount > 0 && (
        <div style={{ padding: "7px 14px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginRight: 4 }}>Set:</span>
          {rows.filter(r => data[r.key] && data[r.key] !== "").map(r => (
            <span key={r.key} style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 4, padding: "2px 8px", fontSize: 10.5, fontWeight: 600, color: "#991b1b" }}>
              {r.icon} {r.label}: <span style={{ fontWeight: 400 }}>{data[r.key]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── MAIN RENDERER ─────────────────────────────────────────
export default function FieldRenderer({ field, register, errors, setValue, watch }) {
  const err = errors?.[field.name];
  const baseClass = err ? "error" : "";

  return (
    <div className={`field-group col-${field.colSpan || 2}`}>
      {/* Only show label if field is NOT hidden */}
      {field.type !== "hidden" && (
      <label className="field-label">
        {field.label}
        {field.required && <span className="required-star">*</span>}
      </label>
    )}

      {field.type === "text" && (
        <input
          className={`rds-input ${baseClass}`}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false
          })}
        />
      )}

      {field.type === "number" && (
        <input
          type="number"
          className={`rds-input ${baseClass}`}
          placeholder={field.placeholder || "0"}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false,
            valueAsNumber: true
          })}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          className={`rds-textarea ${baseClass}`}
          placeholder={field.placeholder || `Describe ${field.label.toLowerCase()}`}
          rows={3}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false
          })}
        />
      )}

      {field.type === "select" && (
        <select
          className={`rds-select ${baseClass}`}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false
          })}>
          <option value="">— Select {field.label} —</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.type === "usergroups" && (
        <UserGroupsInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "yesno" && (
        <YesNoInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "safetymatrix" && (
        <SafetyMatrixInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "gasmatrix" && (
        <GasMatrixInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "accessorymatrix" && (
        <AccessoryMatrixInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "elvmatrix" && (
        <ELVMatrixInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "constructionmatrix" && (
        <ConstructionMatrixInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "ssomatrix" && (
        <SSOMatrixInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "isolatormatrix" && (
        <IsolatorMatrixInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "doorconfig" && (
        <DoorConfigInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "windowconfig" && (
        <WindowConfigInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "sanitarygrid" && (
        <SanitaryGridInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "computed" && (
        <ComputedInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "hidden" && (
        <input type="hidden" {...register(field.name)} />
      )}

      {field.type === "date" && (
        <input
          type="date"
          className={`rds-input ${baseClass}`}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false
          })}
        />
      )}

      {err && (
        <span className="field-error">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4h2v5H7V4zm0 6h2v2H7v-2z"/>
          </svg>
          {err.message}
        </span>
      )}

      {field.hint && !err && (
        <span className="field-hint">{field.hint}</span>
      )}
    </div>
  );
}