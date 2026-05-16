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
    "Nurse Call System",
    "Code Blue System",
    "Intercom",
    "Telephone",
    "IP Phone",
    "SCV",
    "MATV / IPTV",
    "Fax / Printer",
    "LAN / Network Point",
    "Wireless Point",
    "Master Clock",
    "Physiological Monitors",
    "Other Bedside Terminals",
    "Other Healthcare Infra System"
  ];

  const LOCATIONS = ["WALL (W)", "BEDHEAD PANEL (BHP)", "MEDICAL PENDANT (MP)", "CEILING (C)"];

  const rawVal = watch?.(field.name) || "{}";
  let matrixData = {};
  try { 
    matrixData = JSON.parse(rawVal);
    if (!matrixData.selectedSystems) matrixData.selectedSystems = [];
    if (!matrixData.quantities) matrixData.quantities = {};
  } catch { 
    matrixData = { selectedSystems: [], quantities: {} };
  }

  const selectedSystems = matrixData.selectedSystems || [];
  const quantities = matrixData.quantities || {};

  const updateMatrix = (newSelected, newQuantities) => {
    const output = {
      selectedSystems: newSelected,
      quantities: newQuantities
    };
    setValue?.(field.name, JSON.stringify(output), { shouldDirty: true });
  };

  const toggleSystem = (system) => {
    let newSelected;
    if (selectedSystems.includes(system)) {
      newSelected = selectedSystems.filter(s => s !== system);
      const newQuantities = { ...quantities };
      delete newQuantities[system];
      updateMatrix(newSelected, newQuantities);
    } else {
      newSelected = [...selectedSystems, system];
      const newQuantities = { ...quantities };
      if (!newQuantities[system]) {
        newQuantities[system] = {
          "WALL (W)": 0,
          "BEDHEAD PANEL (BHP)": 0,
          "MEDICAL PENDANT (MP)": 0,
          "CEILING (C)": 0
        };
      }
      updateMatrix(newSelected, newQuantities);
    }
  };

  const updateQuantity = (system, location, value) => {
    const newQuantities = { ...quantities };
    if (!newQuantities[system]) {
      newQuantities[system] = {
        "WALL (W)": 0,
        "BEDHEAD PANEL (BHP)": 0,
        "MEDICAL PENDANT (MP)": 0,
        "CEILING (C)": 0
      };
    }
    newQuantities[system][location] = Math.max(0, parseInt(value) || 0);
    updateMatrix(selectedSystems, newQuantities);
  };

  const getTotalForSystem = (system) => {
    if (!quantities[system]) return 0;
    return Object.values(quantities[system]).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
  };

  const getGrandTotal = () => {
    let total = 0;
    selectedSystems.forEach(system => {
      total += getTotalForSystem(system);
    });
    return total;
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSystems = AVAILABLE_SYSTEMS.filter(system =>
    system.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ border: "1.5px solid #e8edf5", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      <input type="hidden" {...register(field.name)} />

      <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e8edf5" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: selectedSystems.length > 0 ? 10 : 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
            {field.label || "ELV Systems Configuration"}
          </span>
          {getGrandTotal() > 0 && (
            <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
              Total: {getGrandTotal()} points
            </span>
          )}
        </div>
        
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="🔍 Search systems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 12.5,
              outline: "none",
              transition: "all 0.15s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
      </div>

      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {filteredSystems.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: 12.5 }}>
            No systems match your search
          </div>
        )}
        
        {filteredSystems.map(system => {
          const isSelected = selectedSystems.includes(system);
          const totalQty = getTotalForSystem(system);
          
          return (
            <div key={system} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <div 
                style={{
                  padding: "12px 16px",
                  background: isSelected ? "#f0f9ff" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
                onClick={() => toggleSystem(system)}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "#fff";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ 
                      display: "inline-flex",
                      width: 18, height: 18,
                      borderRadius: 4,
                      border: `2px solid ${isSelected ? "#3b82f6" : "#cbd5e1"}`,
                      background: isSelected ? "#3b82f6" : "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: "bold"
                    }}>
                      {isSelected && "✓"}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: isSelected ? "#1e40af" : "#334155" }}>
                      {system}
                    </span>
                  </div>
                  {isSelected && totalQty > 0 && (
                    <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>
                      {totalQty} pts
                    </span>
                  )}
                </div>
              </div>

              {isSelected && (
                <div style={{ padding: "8px 16px 16px 44px", background: "#fafcff" }}>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(4, 1fr)", 
                    gap: 10,
                    background: "#fff",
                    border: "1px solid #e8edf5",
                    borderRadius: 10,
                    overflow: "hidden"
                  }}>
                    {LOCATIONS.map(location => {
                      const qty = quantities[system]?.[location] || 0;
                      return (
                        <div key={location} style={{ padding: "10px", textAlign: "center" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                            {location.replace(/[()]/g, '')}
                          </div>
                          <div className="qty-input-wrap" style={{ justifyContent: "center" }}>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => updateQuantity(system, location, qty - 1)}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              className="qty-input"
                              min="0"
                              value={qty}
                              onChange={(e) => updateQuantity(system, location, e.target.value)}
                              style={{ width: 50, textAlign: "center" }}
                            />
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => updateQuantity(system, location, qty + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedSystems.length > 0 && getGrandTotal() > 0 && (
        <div style={{ padding: "12px 16px", background: "#f0fdf4", borderTop: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", marginBottom: 8 }}>
            CONFIGURATION SUMMARY
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selectedSystems.map(system => {
              const total = getTotalForSystem(system);
              if (total === 0) return null;
              const details = LOCATIONS.map(loc => {
                const qty = quantities[system]?.[loc] || 0;
                return qty > 0 ? `${loc.replace(/[()]/g, '')}: ${qty}` : null;
              }).filter(Boolean).join(", ");
              return (
                <span key={system} style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: 20, padding: "4px 12px", fontSize: 11.5, fontWeight: 600 }}>
                  {system}: {details}
                </span>
              );
            })}
          </div>
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
    const next = { ...data, [key]: { enabled, qty: Math.max(0, qty) } };
    setValue?.(field.name, JSON.stringify(next), { shouldDirty: true });
  };

  const toggleEnabled = (key) => {
    const cur = data[key] || { enabled: false, qty: 0 };
    update(key, !cur.enabled, cur.enabled ? 0 : 1);
  };

  const setQty = (key, qty) => {
    const cur = data[key] || { enabled: true, qty: 0 };
    update(key, true, qty);
  };

  const selectedCount = accessories.filter(a => data[a.key]?.enabled).length;
  const totalQty = accessories.reduce((sum, a) => sum + (data[a.key]?.qty || 0), 0);

  return (
    <div style={{ border: "1.5px solid #e8edf5", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      <input type="hidden" {...register(field.name)} />

      {/* Header */}
      <div style={{ padding: "12px 16px", background: "linear-gradient(135deg,#f8fafc 0%,#f0f4ff 100%)", borderBottom: "1px solid #e8edf5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Select equipment and specify quantities</div>
          <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>Click a card to enable, then set quantity</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {selectedCount > 0 && (
            <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
              {selectedCount} item{selectedCount !== 1 ? "s" : ""}
            </span>
          )}
          {totalQty > 0 && (
            <span style={{ background: "#dcfce7", color: "#15803d", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
              {totalQty} total units
            </span>
          )}
        </div>
      </div>

      {/* Grid of accessory cards */}
      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {accessories.map(({ key, label, icon }) => {
          const item = data[key] || { enabled: false, qty: 0 };
          const active = item.enabled;
          return (
            <div
              key={key}
              style={{
                borderRadius: 10,
                border: `1.5px solid ${active ? "#6366f1" : "#e2e8f0"}`,
                background: active ? "#f5f3ff" : "#fafafa",
                overflow: "hidden",
                transition: "all 0.2s ease",
                boxShadow: active ? "0 2px 8px rgba(99,102,241,0.12)" : "none"
              }}
            >
              {/* Card header — click to toggle */}
              <div
                onClick={() => toggleEnabled(key)}
                style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                onMouseEnter={e => { if (!active) e.currentTarget.parentElement.style.background = "#f1f5f9"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.parentElement.style.background = "#fafafa"; }}
              >
                <span
                  style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: active ? "#6366f1" : "#e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, transition: "all 0.2s"
                  }}
                >
                  {active ? <span style={{ color: "#fff", fontSize: 14 }}>✓</span> : icon}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? "#4338ca" : "#475569", lineHeight: 1.3, flex: 1 }}>
                  {label}
                </span>
              </div>

              {/* Quantity row — visible only when active */}
              {active && (
                <div style={{ borderTop: "1px solid #e0e7ff", padding: "8px 12px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.3px" }}>QTY</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button type="button"
                      onClick={() => setQty(key, (item.qty || 0) - 1)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: "1.5px solid #c7d2fe", background: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                      −
                    </button>
                    <input
                      type="number" min="0"
                      value={item.qty || 0}
                      onChange={e => setQty(key, parseInt(e.target.value) || 0)}
                      style={{ width: 46, height: 26, textAlign: "center", border: "1.5px solid #c7d2fe", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "#4338ca", background: "#fff", outline: "none" }}
                      onFocus={e => e.target.style.borderColor = "#6366f1"}
                      onBlur={e => e.target.style.borderColor = "#c7d2fe"}
                    />
                    <button type="button"
                      onClick={() => setQty(key, (item.qty || 0) + 1)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: "1.5px solid #6366f1", background: "#6366f1", cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary bar */}
      {selectedCount > 0 && (
        <div style={{ padding: "10px 16px", background: "#f0fdf4", borderTop: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", marginBottom: 6 }}>SELECTED EQUIPMENT</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {accessories.filter(a => data[a.key]?.enabled).map(({ key, label }) => (
              <span key={key} style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: 20, padding: "3px 10px", fontSize: 11.5, fontWeight: 600 }}>
                {label} × {data[key]?.qty || 0}
              </span>
            ))}
          </div>
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

      {field.type === "number" && field.colSpan === 1 ? (
        <QtyInput field={field} register={register} setValue={setValue} watch={watch} />
      ) : field.type === "number" ? (
        <input
          type="number"
          className={`rds-input ${baseClass}`}
          placeholder={field.placeholder || "0"}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false,
            valueAsNumber: true
          })}
        />
      ) : null}

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

      {field.type === "gasmatrix" && (
        <GasMatrixInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "accessorymatrix" && (
        <AccessoryMatrixInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "elvmatrix" && (
        <ELVMatrixInput field={field} register={register} setValue={setValue} watch={watch} />
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