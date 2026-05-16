export const rdsSchema = [
  {
    id: "Room identity and General Information",
    section: "Room Identity & General Information",
    icon: "🏥",
    color: "#0ea5e9",
    subsections: [

      // ─── 1. PROJECT & ROOM IDENTIFICATION ─────────────────────────
      {
        title: "Project & Room Identification",
        description: "Core project references and room identifiers used across all drawings, schedules, and planning documents",
        fields: [
          {
            name: "projectName",
            label: "Project Name",
            type: "text",
            required: true,
            colSpan: 4,
            placeholder: "e.g. Apollo Hospital — Phase III Expansion"
          },
          {
            name: "projectCode",
            label: "Project Code",
            type: "select",
            required: true,
            colSpan: 2,
            options: ["AMD1", "MUM1", "DEL1", "CHE1"]
          },
          {
            name: "type",
            label: "Type",
            type: "select",
            required: true,
            colSpan: 2,
            options: ["TH", "CH", "MC", "SH"]
          },
          {
            name: "department",
            label: "Department",
            type: "text",
            required: true,
            colSpan: 2,
            placeholder: "e.g. Critical Care"
          },
          {
            name: "departmentCode",
            label: "Department Code",
            type: "text",
            required: true,
            colSpan: 2,
            placeholder: "e.g. CC"
          },
          {
            name: "category",
            label: "Category",
            type: "text",
            required: false,
            colSpan: 2,
            placeholder: "e.g. ICU"
          },
          {
            name: "categoryCode",
            label: "Category Code",
            type: "text",
            required: false,
            colSpan: 2,
            placeholder: "e.g. ICU"
          },
          {
            name: "roomName",
            label: "Room Name",
            type: "text",
            required: true,
            colSpan: 2,
            placeholder: "e.g. ICU Bay — Bed 04"
          },
          {
            name: "roomCode",
            label: "Room Code",
            type: "computed",
            required: false,
            colSpan: 4,
            formula: ["projectCode", "type", "departmentCode", "categoryCode", "roomName"],
            formulaLabels: ["Project Code", "Type", "Dept Code", "Category Code", "Room Name"],
            separator: "_",
            hint: "Auto-generated from: Project Code _ Type _ Department Code _ Category Code _ Room Name"
          }
        ]
      },

      // ─── 2. CLINICAL CLASSIFICATION ───────────────────────────────
      {
        title: "Clinical Classification",
        description: "Defines the room's care criticality, infection risk grading, and isolation requirements",
        fields: [
          {
            name: "criticalityLevel",
            label: "Criticality Level",
            type: "select",
            required: true,
            colSpan: 2,
            options: [
              "Critical",
              "High",
              "Medium",
              "Low",
              "Ancillary"
            ]
          },
          {
            name: "infectionRiskCategory",
            label: "Infection Risk Category",
            type: "select",
            required: true,
            colSpan: 2,
            options: [
              "Very High",
              "High",
              "Medium",
              "Low",
              "Minimal"
            ]
          },
          {
            name: "isolationType",
            label: "Isolation Type",
            type: "select",
            required: false,
            colSpan: 4,
            options: [
              "None",
              "Contact",
              "Droplet",
              "Airborne",
              "Protective (Reverse)",
              "Combined",
              "Strict Isolation"
            ]
          }
        ]
      }

    ]
  },
  {
    id: "Architectural and spatial-requirements",
    section: "Architectural & Spatial Requirements",
    icon: "📐",
    color: "#06b6d4",
    subsections: [

      // ─── 1. SPATIAL REQUIREMENTS ───────────────────────────────────
      {
        title: "Spatial Requirements",
        description: "Core dimensional and access parameters that define the physical envelope and compliance baseline of the room",
        fields: [
          {
            name: "netArea",
            label: "Net Area (m²)",
            type: "number",
            placeholder: "e.g. 35",
            required: true,
            colSpan: 2
          },
          {
            name: "minimumDimension",
            label: "Minimum Dimension (L × W)",
            type: "text",
            placeholder: "e.g. 7.0 m × 5.0 m",
            required: false,
            colSpan: 2
          },
          {
            name: "clearance",
            label: "Clearance",
            type: "text",
            placeholder: "e.g. 1200 mm clear around bed head & sides, 900 mm at foot",
            required: false,
            colSpan: 4
          },
          {
            name: "floorToSoffitHeight",
            label: "Floor to Soffit Height (m)",
            type: "text",
            placeholder: "e.g. 3.6 m",
            required: false,
            colSpan: 2
          },
          {
            name: "floorToCeilingHeight",
            label: "Floor to Ceiling Height (m)",
            type: "text",
            placeholder: "e.g. 3.0 m",
            required: false,
            colSpan: 2
          },
          {
            name: "doorType",
            label: "Door Type",
            type: "select",
            required: false,
            colSpan: 2,
            options: [
              "Sliding",
              "Hinged (Single)",
              "Hinged (Double)",
              "Automatic Sliding",
              "Hermetic Sealed",
              "Fire Rated",
              "Others"
            ]
          },
          {
            name: "doorSize",
            label: "Door Size (W × H)",
            type: "text",
            placeholder: "e.g. 1200 × 2100 mm",
            required: false,
            colSpan: 2
          },
          {
            name: "accessibilityCompliance",
            label: "Accessibility Compliance",
            type: "select",
            required: false,
            colSpan: 4,
            options: [
              "Full Barrier-Free Compliance",
              "Partial Compliance",
              "Standard",
              "Not Applicable"
            ]
          }
        ]
      },

      // ─── 2. SPECIAL CONSTRUCTION ───────────────────────────────────
      {
        title: "Special Construction",
        description: "Structural and technical provisions beyond standard construction — indicate Yes / No for each requirement",
        fields: [
          {
            name: "hazardousStorage",
            label: "Hazardous Storage",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "radiationShielding",
            label: "Radiation Shielding",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "vibrationIsolation",
            label: "Vibration Isolation",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "magneticShielding",
            label: "Magnetic Shielding",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "soundInsulation",
            label: "Sound Insulation",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "rfShielding",
            label: "RF Shielding",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equipmentMountingSupport",
            label: "Equipment Mounting Support in Ceiling / Unistrut",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "structuralFloorDrop",
            label: "Structural Floor Drop for Extra Screed / Equipment Casing / Conduiting",
            type: "text",
            placeholder: "State intended structural floor drop in mm — e.g. 150 mm",
            required: false,
            colSpan: 2
          },
          {
            name: "otherSpecialNeeds",
            label: "Other Special Needs",
            type: "textarea",
            placeholder: "Describe any additional structural, civil or specialist construction requirements not listed above",
            required: false,
            colSpan: 4
          }
        ]
      },

      // ─── 3. CONSTRUCTION DETAILS ───────────────────────────────────
      {
        title: "Construction Details",
        description: "Detailed specification matrix for every building element — define Type, Size, Acoustic, Thermal, Protection, Finish and any additional notes for each surface",
        fields: [
          {
            name: "constructionMatrix",
            label: "Construction Element Schedule",
            type: "constructionmatrix",
            required: false,
            colSpan: 4,
            elements: [
              { key: "acoustics",   label: "Acoustics",     icon: "🔊" },
              { key: "wall1",       label: "Wall 1",         icon: "🧱" },
              { key: "wall2",       label: "Wall 2",         icon: "🧱" },
              { key: "wall3",       label: "Wall 3",         icon: "🧱" },
              { key: "wall4",       label: "Wall 4",         icon: "🧱" },
              { key: "ceiling",     label: "Ceiling",        icon: "🏛️" },
              { key: "floor",       label: "Floor",          icon: "⬜" },
              { key: "skirting",    label: "Skirting",       icon: "📏" },
              { key: "visionPanel", label: "Vision Panel",   icon: "🪟" }
            ]
          }
        ]
      }

    ]
  },
  {
    id: "Interior finishes and Aesthetics",
    section: "Interior finishes and Aesthetics",
    icon: "🎨",
    color: "#ec4899",
    fields: [
      { name: "floor", label: "Floor", type: "text", placeholder: "Material & specification", required: false, colSpan: 2 },
      { name: "skirting", label: "Skirting", type: "text", placeholder: "Type & height", required: false, colSpan: 2 },
      { name: "walls", label: "Walls", type: "text", placeholder: "Material & specification", required: false, colSpan: 2 },
      { name: "ceiling", label: "Ceiling", type: "text", placeholder: "Material & specification", required: false, colSpan: 2 },
      { name: "wallProtection", label: "Wall Protection", type: "text", placeholder: "Crash rails, corner guards etc.", required: false, colSpan: 2 },
      { name: "specialFinishes", label: "Special Finishes", type: "textarea", placeholder: "Anti-microbial, lead lining, etc.", required: false, colSpan: 2 }
    ]
  },
  {
    id: "Clinical functionality and workflow",
    section: "Clinical functionality and workflow",
    icon: "⚙️",
    color: "#8b5cf6",
    subsections: [
      {
        title: "Functionality & Workflow",
        fields: [
          { name: "roomFunction", label: "Room Function", type: "textarea", required: true, colSpan: 4 },
          { name: "keyActivities", label: "Key Activities", type: "textarea", required: true, colSpan: 4 },
          { name: "userGroups", label: "User Groups", type: "usergroups", required: true, colSpan: 4 },
          { name: "operationalScenarios", label: "Operational Scenarios", type: "textarea", required: false, colSpan: 2 }
        ]
      },
      {
        title: "Functional Zones",
        fields: [
          { name: "patientZone", label: "Patient Zone", type: "textarea", required: false, colSpan: 4 },
          { name: "staffZone", label: "Staff Zone", type: "textarea", required: false, colSpan: 4 },
          { name: "equipmentZone", label: "Equipment Zone", type: "textarea", required: false, colSpan: 4 },
          { name: "cleanZone", label: "Clean Zone", type: "textarea", required: false, colSpan: 2 },
          { name: "dirtyZone", label: "Dirty Zone", type: "textarea", required: false, colSpan: 2 }
        ]
      },
      {
        title: "Circulation",
        fields: [
          { name: "patientFlow", label: "Patient Flow", type: "textarea", required: false, colSpan: 4 },
          { name: "staffFlow", label: "Staff Flow", type: "textarea", required: false, colSpan: 2 },
          { name: "materialFlow", label: "Material Flow", type: "textarea", required: false, colSpan: 2 }
        ]
      },
      {
        title: "Access Control",
        fields: [
          { name: "entryPoints", label: "Entry Points", type: "textarea", required: false, colSpan: 2 },
          { name: "restrictedZones", label: "Restricted Zones", type: "textarea", required: false, colSpan: 2 }
        ]
      },
      {
        title: "Medical Gases & Piped Services",
        description: "Configure outlet locations, quantities and mounting heights for each piped medical gas",
        fields: [
          {
            name: "medicalGasMatrix",
            label: "Medical Gas Point Schedule",
            type: "gasmatrix",
            required: false,
            colSpan: 4,
            gases: [
              { key: "vacuum",   label: "Vacuum",                                    symbol: "VAC",  color: "#fbbf24" },
              { key: "oxygen",   label: "Oxygen (O₂)",                          symbol: "O₂",  color: "#3b82f6" },
              { key: "co2",      label: "Carbon Dioxide (CO₂)",                 symbol: "CO₂", color: "#6b7280" },
              { key: "n2o",      label: "Nitrous Oxide (N₂O)",                  symbol: "N₂O", color: "#8b5cf6" },
              { key: "medAir4",  label: "Medical Air (4 bar)",                       symbol: "MA4",  color: "#10b981" },
              { key: "surgAir7", label: "Surgical Air (7 bar)",                      symbol: "SA7",  color: "#f97316" },
              { key: "agss",     label: "AGSS (Anaesthetic Gas Scavenging System)",  symbol: "AGSS", color: "#ec4899" },
              { key: "compAir",  label: "Compressed Air",                            symbol: "CA",   color: "#0ea5e9" },
              { key: "liqN2",    label: "Liquid Nitrogen",                           symbol: "LN₂", color: "#06b6d4" },
              { key: "png",      label: "PNG",                                       symbol: "PNG",  color: "#84cc16" },
              { key: "lmo",      label: "Liquid Medical Oxygen (LMO Plant Room)",    symbol: "LMO",  color: "#2563eb" },
              { key: "oog",      label: "Oxygen Onsite Generation (OOG Plant Room)", symbol: "OOG",  color: "#7c3aed" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "capacity-operations",
    section: "Capacity & Operations",
    icon: "📊",
    color: "#10b981",
    fields: [
      { name: "patientCapacity", label: "Patient Capacity", type: "number", placeholder: "No. of beds / users", required: true, colSpan: 2 },
      { name: "staffRequirement", label: "Staff Requirement", type: "number", placeholder: "Per shift", required: true, colSpan: 2 },
      { name: "peakLoad", label: "Peak Load", type: "number", placeholder: "Max occupancy", required: false, colSpan: 2 },
      { name: "throughput", label: "Throughput", type: "text", placeholder: "Patients/day (if applicable)", required: false, colSpan: 2 },
      { name: "averageStayTime", label: "Average Stay Time(min)", type: "text", placeholder: "Per patient", required: false, colSpan: 2 },
      { name: "surgeCapacity", label: "Surge Capacity", type: "text", placeholder: "Expandability logic", required: false, colSpan: 2 },
      {
        name: "operationalHours", label: "Operational Hours", type: "select", required: true, colSpan: 4,
        options: ["24×7", "Scheduled (Day only)", "Scheduled (Day & Evening)", "On-call", "As Required"]
      }
    ]
  },
  {
    id: "adjacency-matrix",
    section: "Adjacency Matrix",
    icon: "🔗",
    color: "#ef4444",
    fields: [
      { name: "mustBeAdjacent", label: "Must be Adjacent — Rooms", type: "textarea", placeholder: "e.g. Sterile Store, Scrub Area", required: false, colSpan: 4 },
      { name: "shouldBeAdjacent", label: "Should be Adjacent — Rooms", type: "textarea", placeholder: "e.g. Recovery, Anaesthesia Room", required: false, colSpan: 4 },
      { name: "avoidAdjacency", label: "Avoid Adjacency — Rooms", type: "textarea", placeholder: "e.g. Dirty Utility, Waiting Area", required: false, colSpan: 4 }
    ]
  },
  {
    id: "MEP & engineering-systems",
    section: "MEP & Engineering Services",
    icon: "⚡",
    color: "#f97316",
    subsections: [

      // ─── 1. HVAC ──────────────────────────────────────────────────
      {
        title: "HVAC",
        description: "Air quality, environmental control, ventilation modes and pandemic-resilience parameters for this room",
        fields: [
          {
            name: "airChangesACH",
            label: "Air Changes per Hour (ACH)",
            type: "number",
            placeholder: "e.g. 15",
            required: false,
            colSpan: 2
          },
          {
            name: "pressure",
            label: "Pressure Regime",
            type: "select",
            required: false,
            colSpan: 2,
            options: ["Positive (+ve)", "Negative (-ve)", "Neutral", "Variable"]
          },
          {
            name: "temperature",
            label: "Temperature (°C)",
            type: "text",
            placeholder: "e.g. 20–24°C",
            required: false,
            colSpan: 2
          },
          {
            name: "humidity",
            label: "Humidity (%RH)",
            type: "text",
            placeholder: "e.g. 45–60%",
            required: false,
            colSpan: 2
          },
          {
            name: "filtration",
            label: "Filtration Grade",
            type: "select",
            required: false,
            colSpan: 2,
            options: ["HEPA H14", "HEPA H13", "MERV-16", "MERV-13", "Standard", "ULPA", "Others"]
          },
          {
            name: "providedFanInRoom",
            label: "Provided Fan in Room",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "airflowDirection",
            label: "Specific Airflow Direction Required",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "naturalVentilation",
            label: "Natural Ventilation",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "mechanicalVentilation",
            label: "Mechanical Ventilation",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "smokeExtraction",
            label: "Extraction / Smoke Extraction",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "pandemicMode",
            label: "Pandemic Mode Capable",
            type: "yesno",
            required: false,
            colSpan: 2
          }
        ]
      },

      // ─── 2. ELECTRICAL ────────────────────────────────────────────
      {
        title: "Electrical",
        description: "Power supply classification, socket outlet schedule by location & source, and power isolator requirements",
        fields: [
          {
            name: "powerLoad",
            label: "Power Load (kVA)",
            type: "number",
            placeholder: "e.g. 15",
            required: false,
            colSpan: 2
          },
          {
            name: "normalPower",
            label: "Normal Power Supply",
            type: "text",
            placeholder: "e.g. 230V / 50Hz, 3-phase",
            required: false,
            colSpan: 2
          },
          {
            name: "emergencyPower",
            label: "Emergency Power",
            type: "text",
            placeholder: "e.g. Gen-set auto-changeover within 10s",
            required: false,
            colSpan: 2
          },
          {
            name: "ups",
            label: "UPS Required",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "numberOfSockets",
            label: "No. of Sockets",
            type: "number",
            placeholder: "e.g. 12",
            required: false,
            colSpan: 2
          },
          {
            name: "specialOutlets",
            label: "Special Outlets",
            type: "text",
            placeholder: "e.g. IEC 60601 medical-grade, 5-pin 16A",
            required: false,
            colSpan: 2
          },
          {
            name: "ssoMatrix",
            label: "6/16A Switch Socket Outlets (SSO) — by Location & Source",
            type: "ssomatrix",
            required: false,
            colSpan: 4
          },
          {
            name: "isolatorMatrix",
            label: "Power Isolators — Location, Source & Rating Schedule",
            type: "isolatormatrix",
            required: false,
            colSpan: 4
          }
        ]
      },

      // ─── 3. EQUIPMENT RELATED PROVISION ──────────────────────────
      {
        title: "Equipment Related Provision",
        description: "Infrastructure and engineering provisions required to support clinical equipment performance, safety, connectivity, and compliance",
        fields: [
          {
            name: "equip_dedicatedCircuit",
            label: "Requires dedicated circuit to prevent overload",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equip_upsBackup",
            label: "Needs UPS backup for uninterrupted operation",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equip_vibrationIsolation",
            label: "Requires vibration isolation for stable operation",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equip_bmsInterface",
            label: "Needs BMS interface (e.g. freezer, refrigerator)",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equip_isolatedGrounding",
            label: "Requires isolated grounding to minimise electrical interference",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equip_humidityControl",
            label: "Needs additional humidity control for optimal performance",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equip_remoteMonitoring",
            label: "Requires remote monitoring — status, asset wellness, cloud/web connectivity",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equip_voltageStabilizer",
            label: "Needs voltage stabilizer to address sensitivity to fluctuations",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equip_antiStaticFlooring",
            label: "Must comply with anti-static flooring requirements",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equip_fireRatedEnclosure",
            label: "Requires fire-rated enclosure or protection measures",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equip_fireAlarmInterface",
            label: "Needs interface with Fire Alarm (e.g. kitchen exhaust hood, fume hood)",
            type: "yesno",
            required: false,
            colSpan: 2
          },
          {
            name: "equip_gasDetection",
            label: "Must be interfaced with gas detection system (fume hoods, chemical storage)",
            type: "yesno",
            required: false,
            colSpan: 2
          }
        ]
      },

      // ─── 4. MEDICAL GASES ─────────────────────────────────────────
      {
        title: "Medical Gases",
        description: "Piped medical gas outlet counts as required for this room",
        fields: [
          {
            name: "oxygen",
            label: "Oxygen (O₂) — No. of Outlets",
            type: "number",
            placeholder: "e.g. 4",
            required: false,
            colSpan: 2
          },
          {
            name: "medicalAir",
            label: "Medical Air — No. of Outlets",
            type: "number",
            placeholder: "e.g. 2",
            required: false,
            colSpan: 2
          },
          {
            name: "vacuum",
            label: "Vacuum / AGSS — No. of Outlets",
            type: "number",
            placeholder: "e.g. 2",
            required: false,
            colSpan: 2
          },
          {
            name: "nitrousOxide",
            label: "Nitrous Oxide (N₂O) — No. of Outlets",
            type: "number",
            placeholder: "e.g. 1",
            required: false,
            colSpan: 2
          }
        ]
      },

      // ─── 5. PLUMBING ──────────────────────────────────────────────
      {
        title: "Plumbing",
        description: "Sanitary fixture counts and any specialist plumbing systems required",
        fields: [
          {
            name: "handWash",
            label: "Hand Wash Basins",
            type: "number",
            placeholder: "No. of units",
            required: false,
            colSpan: 2
          },
          {
            name: "wc",
            label: "WC / Toilet",
            type: "number",
            placeholder: "No. of units",
            required: false,
            colSpan: 2
          },
          {
            name: "shower",
            label: "Shower",
            type: "number",
            placeholder: "No. of units",
            required: false,
            colSpan: 2
          },
          {
            name: "plumbingSpecialSystems",
            label: "Special Plumbing Systems",
            type: "text",
            placeholder: "e.g. Sluice, Bedpan washer, Scrub sink",
            required: false,
            colSpan: 2
          }
        ]
      }

    ]
  },
  {
  id: "digital-smart-systems",
  section: "Digital & Smart Systems",
  icon: "💻",
  color: "#6366f1",
  subsections: [
    {
      title: "Core Clinical Systems",
      fields: [
        { name: "hisEmr", label: "HIS / EMR Integration", type: "text", placeholder: "System name & integration type", required: false, colSpan: 2 },
        { name: "pacs", label: "PACS", type: "text", placeholder: "Imaging system details", required: false, colSpan: 2 },
        { name: "lis", label: "LIS (Laboratory)", type: "text", placeholder: "Lab information system", required: false, colSpan: 2 },
        { name: "rtls", label: "RTLS (Real-time Location)", type: "text", placeholder: "Asset/patient tracking", required: false, colSpan: 2 },
        { name: "cctv", label: "CCTV / Surveillance", type: "yesno", required: false, colSpan: 2 },
        { name: "iotSensors", label: "IoT Sensors", type: "text", placeholder: "Environmental, occupancy, etc.", required: false, colSpan: 2 },
        { name: "aiAnalytics", label: "AI / Analytics", type: "text", placeholder: "Clinical decision support, etc.", required: false, colSpan: 2 }
      ]
    },
    {
      title: "Extra Low Voltage (ELV) Points",
      description: "Select systems and configure quantities per location",
      fields: [
        { 
          name: "elvMatrix", 
          label: "ELV Systems Configuration", 
          type: "elvmatrix", 
          required: false, 
          colSpan: 4 
        }
      ]
    },
    {
      title: "IT & Digital Accessories",
      description: "Enterprise digital equipment and peripherals requirement",
      fields: [
        {
          name: "itAccessories",
          label: "IT & Digital Accessories",
          type: "accessorymatrix",
          required: false,
          colSpan: 4,
          accessories: [
            { key: "monitorSystem",         label: "Monitor System",               icon: "🖥️" },
            { key: "printer",               label: "Printer",                      icon: "🖨️" },
            { key: "vitalEquipment",        label: "Vital Automated Equipment",    icon: "📡" },
            { key: "barcodePrinter",        label: "Barcode Printer",              icon: "📠" },
            { key: "laptop",               label: "Laptop / Workstation",          icon: "💻" },
            { key: "kiosk",                label: "Kiosk",                         icon: "🏧" },
            { key: "multiFunctionPrinter", label: "Multifunctional Printer (MFP)", icon: "🖨️" },
            { key: "scanner",              label: "2D / 3D Scanner",               icon: "📷" },
            { key: "highSpeedPrinter",     label: "High-Speed Printer",            icon: "⚡" },
            { key: "queueManagement",      label: "Queue Management System",       icon: "🎟️" },
            { key: "tv",                   label: "Display / TV",                  icon: "📺" },
            { key: "networkSwitch",        label: "Network Switch / IT Hub",       icon: "🔀" },
            { key: "lanHub",               label: "LAN Distribution Hub",          icon: "🌐" },
          ]
        }
      ]
    }
  ]
},
  {
    id: "safety-infection-control",
    section: "Safety & Infection Control",
    icon: "🛡️",
    color: "#dc2626",
    subsections: [

      // ─── 1. CORE SAFETY PARAMETERS ────────────────────────────────
      {
        title: "Core Safety Parameters",
        description: "Fundamental safety classification and containment requirements for this room",
        fields: [
          {
            name: "pressureRegime", label: "Pressure Regime", type: "select", required: false, colSpan: 2,
            options: ["Positive", "Negative", "Neutral", "Variable", "Not Applicable"]
          },
          {
            name: "isolationLevel", label: "Isolation Level", type: "select", required: false, colSpan: 2,
            options: ["Level-1 Standard", "Level-2 Enhanced", "Level-3 Strict", "Level-4 Maximum"]
          },
          {
            name: "radiationProtection", label: "Radiation Protection", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Lead Lining Required", "Lead Glass Window", "Controlled Zone", "Supervised Zone"]
          },
          {
            name: "biohazardHandling", label: "Biohazard Handling", type: "select", required: false, colSpan: 2,
            options: ["Not Applicable", "BSL-1", "BSL-2", "BSL-3", "BSL-4"]
          }
        ]
      },

      // ─── 2. INFECTION CONTROL & HYGIENE ───────────────────────────
      {
        title: "Infection Control & Hygiene",
        description: "Hand hygiene provisions, air quality, disinfection systems and waste management",
        fields: [
          {
            name: "handHygieneProvision", label: "Hand Hygiene Provision", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Alcohol-Based Hand Rub (ABHR) Dispenser Only", "Clinical Handwash Basin (HWB)", "ABHR + HWB", "Surgical Scrub Trough"]
          },
          {
            name: "hepaFiltration", label: "HEPA Filtration", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Terminal HEPA (H13)", "Terminal HEPA (H14)", "Laminar Airflow + HEPA", "Recirculating HEPA Unit"]
          },
          {
            name: "airChangesACHInfection", label: "Air Changes per Hour (ACH)", type: "select", required: false, colSpan: 2,
            options: ["Standard (6 ACH)", "Enhanced (12 ACH)", "High (15 ACH)", "Ultra-High (20+ ACH — OT/BMT)", "As per ASHRAE 170"]
          },
          {
            name: "temperatureHumidityControl", label: "Temperature & Humidity Control", type: "select", required: false, colSpan: 2,
            options: ["General Comfort (22–26°C)", "Controlled (20–24°C, 30–60% RH)", "Precision (18–22°C, 45–55% RH)", "Ultra-Precision (OT/Cath Lab Specific)", "Cold Storage Specific"]
          },
          {
            name: "uvDisinfection", label: "UV-C / Room Disinfection", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Portable UV-C Device Provision", "Fixed Ceiling-Mounted UV-C", "Hydrogen Peroxide Vapour (HPV) Ready", "UV-C + HPV Combined"]
          },
          {
            name: "anteRoom", label: "Ante-Room / Airlock", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Single-Door Anteroom", "Double-Door Airlock (Positive)", "Double-Door Airlock (Negative)", "Pass-Through with Interlock"]
          },
          {
            name: "sharpsDisposal", label: "Sharps Disposal", type: "select", required: false, colSpan: 2,
            options: ["Not Applicable", "Wall-Mounted Sharps Container", "Bench-Mounted Sharps Container", "Enclosed Sharps Management System", "Needle Destruction Device"]
          },
          {
            name: "bmwWasteSegregation", label: "BMW / Clinical Waste Segregation", type: "select", required: false, colSpan: 2,
            options: ["Not Applicable", "General Waste Only", "2-Bin (General + Infectious)", "4-Bin (as per BMW Rules 2016)", "Full BMW Station (Colour-Coded 4+)"]
          },
          {
            name: "fumigationProvision", label: "Fumigation / Terminal Cleaning Provision", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Standard Terminal Clean", "Fogging / Misting Provision", "HPV Decontamination Ready", "Sealed Room for Gaseous Decontamination"]
          }
        ]
      },

      // ─── 3. PLUMBING SAFETY FIXTURES ──────────────────────────────
      {
        title: "Plumbing Safety Fixtures",
        description: "Specialized clinical fixtures for safe water handling, hand hygiene and emergency decontamination",
        fields: [
          {
            name: "eyeWash", label: "Eye Wash", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Plumbed (Fixed Wall/Counter-Mounted)", "Portable (Squeeze Bottle/Gravity-Fed)", "Plumbed + Tepid Water (ANSI Z358.1 Compliant)"]
          },
          {
            name: "emergencyShower", label: "Emergency Shower (E-Shower)", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Standard Drench Shower", "Tepid Water Drench Shower", "Barrier-Free / ADA-Compliant Shower"]
          },
          {
            name: "integratedEyeWashShower", label: "Integrated Eye Wash & E-Shower", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Standard Combination Unit", "Recessed/Flush-Mounted Combination", "Barrier-Free Combination with Tepid Water"]
          },
          {
            name: "kneeOperatedFixtures", label: "Knee-Operated Fixtures", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Required — Clinical Wash Basins", "Required — Scrub Sinks (OT/Procedure Areas)"]
          },
          {
            name: "footOperatedFixtures", label: "Foot-Operated Fixtures", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Foot-Operated Waste Bins (Clinical/BMW)", "Foot-Operated Soap/Sanitizer Dispensers", "Foot-Operated Wash Basin Taps"]
          },
          {
            name: "wristBladeFaucets", label: "Wrist Blade Faucets", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Standard — Clinical Handwash Areas", "Surgical — OT/Procedure/Scrub Stations"]
          },
          {
            name: "sprayHose", label: "Spray Hose", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Pre-Rinse Spray (Dirty Utility/CSSD)", "Utility Spray (Sluice/Bedpan Wash)", "Laboratory Spray Hose"]
          },
          {
            name: "elbowFaucets", label: "Elbow-Operated Faucets", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Standard Clinical Areas", "Surgical Scrub Stations", "CSSD / Decontamination Areas"]
          }
        ]
      },

      // ─── 4. FIRE & LIFE SAFETY ────────────────────────────────────
      {
        title: "Fire & Life Safety",
        description: "Fire suppression, detection, compartmentation and emergency evacuation provisions",
        fields: [
          {
            name: "fireSafetyProvision", label: "Fire Safety Provision", type: "select", required: false, colSpan: 2,
            options: ["Not Applicable", "Basic (Portable Extinguishers Only)", "Standard (Extinguishers + Manual Call Points)", "Enhanced (Sprinklers + Detection + Alarm)", "Critical (Clean Agent + Redundant Suppression)"]
          },
          {
            name: "emergencySystems", label: "Emergency Systems", type: "select", required: false, colSpan: 2,
            options: ["Not Applicable", "Emergency Lighting Only", "Emergency Lighting + Power Backup (UPS/DG)", "Full Backup (UPS + DG + Auto-Changeover)", "Critical Redundancy (Dual UPS + DG + Island Mode)"]
          },
          {
            name: "conventionalSprinkler", label: "Conventional Sprinkler System", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Wet Pipe System", "Dry Pipe System", "Deluge System"]
          },
          {
            name: "fireDetectionAlarm", label: "Pre-Action, Smoke Detector & Fire Alarm", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Conventional (Point-Type Smoke/Heat)", "Addressable (Intelligent Detection)", "Aspirating / VESDA (Early Warning)"]
          },
          {
            name: "raisedFloorDetection", label: "Fire Detection for Raised Floor Space", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Under-Floor Point-Type Smoke Detector", "VESDA (Very Early Smoke Detection Apparatus)", "Linear Heat Detection Cable"]
          },
          {
            name: "cleanGasSystem", label: "FM-200 or Other Clean Gas System", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "FM-200 (HFC-227ea)", "Novec 1230 (FK-5-1-12)", "Inergen / Argonite (Inert Gas)"]
          },
          {
            name: "smokeCompartmentation", label: "Smoke Compartmentation", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "1-Hour Fire-Rated Barrier", "2-Hour Fire-Rated Barrier", "Smoke-Tight with Auto-Closing Doors"]
          },
          {
            name: "fireRatedDoors", label: "Fire-Rated Doors", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "30-Min Fire-Rated (FD30)", "60-Min Fire-Rated (FD60)", "120-Min Fire-Rated (FD120)"]
          },
          {
            name: "evacuationAids", label: "Emergency Evacuation Aids", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Evacuation Chair", "Evacuation Mattress/Sled", "Horizontal Refuge Area"]
          },
          {
            name: "gasLeakDetection", label: "Gas Leak Detection", type: "select", required: false, colSpan: 2,
            options: ["Not Applicable", "Medical Gas Area Alarm", "Anaesthetic Gas Scavenging (AGSS)", "Toxic / Combustible Gas Detector"]
          },
          {
            name: "fireDampers", label: "Fire Dampers / Smoke Dampers", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Fire Damper Only", "Smoke Damper Only", "Combined Fire + Smoke Damper"]
          }
        ]
      },

      // ─── 5. ELECTRICAL & EQUIPMENT SAFETY ────────────────────────
      {
        title: "Electrical & Equipment Safety",
        description: "Anti-static, electromagnetic shielding and electrical safety classifications",
        fields: [
          {
            name: "antiStaticFlooring", label: "Anti-Static / ESD Flooring", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Anti-Static Vinyl", "Conductive Flooring (OT)", "ESD-Rated Flooring (MRI/Electronics)"]
          },
          {
            name: "emiShielding", label: "Electromagnetic Shielding (EMI/RFI)", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Basic Shielding", "RF Cage (MRI Suite)", "Full Faraday Cage"]
          },
          {
            name: "electricalSafetyClass", label: "Electrical Safety Classification", type: "select", required: false, colSpan: 2,
            options: ["General (No Patient Contact)", "Body-Protected (CF)", "Cardiac-Protected (CF)", "Wet Location Rated"]
          }
        ]
      },

      // ─── 6. PHYSICAL SAFETY & SECURITY ───────────────────────────
      {
        title: "Physical Safety & Security",
        description: "Anti-ligature, fall prevention, nurse call, access control and surveillance provisions",
        fields: [
          {
            name: "antiLigature", label: "Anti-Ligature Provisions", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Partial (Fittings Only)", "Full (Fittings + Fixtures + Furniture)", "Forensic-Grade Anti-Ligature"]
          },
          {
            name: "slipResistance", label: "Slip Resistance / Fall Prevention", type: "select", required: false, colSpan: 2,
            options: ["Standard (R9)", "Enhanced (R10)", "High-Grip Wet Area (R11–R12)", "Anti-Fatigue + Slip-Resistant"]
          },
          {
            name: "nurseCallSystem", label: "Nurse / Emergency Call System", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Standard Call Bell", "Call + Code Blue Pull Cord", "Integrated Call + RTLS + Duress"]
          },
          {
            name: "panicAlarm", label: "Panic / Duress Alarm", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Fixed Panic Button", "Wearable Duress Alarm", "Integrated with Security Command"]
          },
          {
            name: "cctvMonitoring", label: "CCTV / Security Monitoring", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "Fixed Camera", "PTZ Camera", "Integrated with Access Control"]
          },
          {
            name: "accessControl", label: "Access Control", type: "select", required: false, colSpan: 2,
            options: ["Open Access", "Swipe/RFID Card", "Biometric", "Interlock / Mantrap"]
          },
          {
            name: "seismicSafety", label: "Seismic Safety Provision", type: "select", required: false, colSpan: 2,
            options: ["Not Applicable", "Zone-II (Low)", "Zone-III (Moderate)", "Zone-IV/V (High/Very High)"]
          },
          {
            name: "ppeStorage", label: "PPE Storage Provision", type: "select", required: false, colSpan: 2,
            options: ["Not Required", "PPE Wall-Mounted Dispenser", "Dedicated PPE Donning/Doffing Area", "Full Gowning Room with Mirror & Signage"]
          },
          {
            name: "spillContainment", label: "Spill Containment", type: "select", required: false, colSpan: 2,
            options: ["Not Applicable", "Spill Kit Available", "Bunded / Contained Area", "Chemical-Resistant Sealed Floor with Drain"]
          }
        ]
      },

      // ─── 7. CHEMICAL & HAZARDOUS MATERIAL SAFETY ──────────────────
      {
        title: "Chemical & Hazardous Material Safety",
        description: "COSHH compliance, cryogenic handling and cytotoxic drug preparation provisions",
        fields: [
          {
            name: "chemicalSafetyCOSHH", label: "Chemical Safety (COSHH)", type: "select", required: false, colSpan: 2,
            options: ["Not Applicable", "Basic (MSDS + Ventilation)", "Fume Cupboard Required", "LEV (Local Exhaust Ventilation) + Chemical Store"]
          },
          {
            name: "cryogenicSafety", label: "Cryogenic Safety", type: "select", required: false, colSpan: 2,
            options: ["Not Applicable", "LN₂ Handling Area", "Oxygen Depletion Alarm Required", "Cryogenic Store with Ventilation + Alarm"]
          },
          {
            name: "cytotoxicHandling", label: "Cytotoxic Drug Handling", type: "select", required: false, colSpan: 2,
            options: ["Not Applicable", "Class II BSC Required", "Closed-System Transfer Device (CSTD)", "Dedicated Cytotoxic Preparation Suite"]
          }
        ]
      },

      // ─── 8. ADDITIONAL NOTES ──────────────────────────────────────
      {
        title: "Additional Safety Notes",
        description: "Any supplementary safety requirements, special compliance notes or site-specific considerations",
        fields: [
          { name: "safetyAdditionalNotes", label: "Additional Safety Requirements / Special Notes", type: "textarea", placeholder: "Document any site-specific safety conditions, regulatory compliance notes, special authority requirements, or other safety provisions not covered above.", required: false, colSpan: 4 }
        ]
      }

    ]
  },
  {
    id: "Stakeholder experience",
    section: "Stakeholder Experience",
    icon: "✨",
    color: "#0891b2",
    subsections: [

      // ─── 1. SENSORY COMFORT ────────────────────────────────────────
      {
        title: "Sensory Comfort",
        description: "Lighting, acoustic performance, and thermal & odour conditions that directly shape the sensory experience of patients, families, and clinical staff",
        fields: [
          {
            name: "lightingQuality",
            label: "Lighting Quality",
            type: "select",
            required: false,
            colSpan: 2,
            options: [
              "General Ambient — 100–200 lux (Corridors / Waiting / Admin)",
              "Standard Clinical — 300–500 lux (Wards / Consultation)",
              "Enhanced Clinical — 500–1,000 lux (Treatment / Procedure Rooms)",
              "Surgical / High-Precision — 10,000–100,000 lux (OT / Examination)",
              "Adjustable / Circadian — Tunable White (2,700K–6,500K)",
              "Natural Daylight Optimised (Glare-Controlled Glazing)",
              "Emergency / Night Mode Lighting Only"
            ]
          },
          {
            name: "lightingNotes",
            label: "Lighting Specification Notes",
            type: "textarea",
            required: false,
            colSpan: 2,
            placeholder: "e.g. Dimmer controls at bedhead, tunable CCT 3,000–5,000K, anti-glare diffusers, emergency backup circuits, UGR < 19"
          },
          {
            name: "acousticControl",
            label: "Acoustic Control",
            type: "select",
            required: false,
            colSpan: 2,
            options: [
              "Standard — ≤45 dB(A) (General Ward / Administrative)",
              "Enhanced — ≤40 dB(A) (Consultation / Outpatient)",
              "Clinical Quiet — ≤35 dB(A) (ICU / HDU / NICU)",
              "Critical Quiet — ≤30 dB(A) (Sleep Recovery / Neonatal)",
              "High-Performance Acoustic Isolation — STC ≥ 55",
              "Acoustic Dampening + Reverberation Control (RT60 ≤ 0.6s)",
              "Not Specified"
            ]
          },
          {
            name: "acousticNotes",
            label: "Acoustic Specification Notes",
            type: "textarea",
            required: false,
            colSpan: 2,
            placeholder: "e.g. Acoustic ceiling tiles (NRC ≥ 0.85), wall-mounted absorbers, STC-55 partition walls, sealed penetrations, anti-vibration mounts on MEP services"
          },
          {
            name: "thermalOdorControl",
            label: "Thermal & Odour Control",
            type: "select",
            required: false,
            colSpan: 2,
            options: [
              "General Comfort — 22–26°C, Natural / Mixed Ventilation",
              "Controlled Clinical — 20–24°C, Mechanical Ventilation",
              "Precision Controlled — 18–22°C, HVAC with Humidity Control (30–60% RH)",
              "Patient-Controlled Individual Climate Unit (FCU / Cassette)",
              "Odour Control — Dedicated Negative Pressure Exhaust",
              "Carbon-Activated Air Filtration (VOC & Odour Removal)",
              "Full Precision HVAC + Odour Extraction + Patient Climate Control"
            ]
          },
          {
            name: "thermalOdorNotes",
            label: "Thermal & Odour Notes",
            type: "textarea",
            required: false,
            colSpan: 2,
            placeholder: "e.g. Individual FCU at each bed, continuous exhaust to prevent cross-contamination, carbon filter on exhaust for cytotoxic / procedure rooms, set-point 22°C ± 1°C"
          }
        ]
      },

      // ─── 2. PATIENT & FAMILY EXPERIENCE ───────────────────────────
      {
        title: "Patient & Family Experience",
        description: "Privacy provisions, patient comfort amenities, and family interaction facilities that support a patient-centred and healing-focused environment",
        fields: [
          {
            name: "privacy",
            label: "Privacy",
            type: "select",
            required: false,
            colSpan: 2,
            options: [
              "None — Open Bay / Shared Space (No Screening)",
              "Curtain Screening Only",
              "Partial Partition — Screens / Glazed Panels",
              "Full Visual Privacy — Solid Walls with Glazed Vision Panel & Blinds",
              "Full Visual + Acoustic Privacy — Solid Walls + Acoustic Treatment",
              "Single-Patient Room — Complete Privacy (Visual + Acoustic)",
              "Ensuite Toilet / Bathroom — Full Patient Privacy Suite"
            ]
          },
          {
            name: "patientComfort",
            label: "Patient Comfort",
            type: "select",
            required: false,
            colSpan: 2,
            options: [
              "Basic — Bed, Overbed Table, Call Bell",
              "Standard — Bed + Bedhead Unit + Nurse Call + Reading Light",
              "Enhanced — Bedhead Unit + Individual Lighting + USB Charging + Storage",
              "Advanced — Entertainment Screen + Patient Portal + Climate Control + Storage",
              "Premium — Full Bedhead Services + Smart Controls + Entertainment + Privacy Curtain",
              "Suite-Grade — Hotel-Standard Furniture + Smart Room + Entertainment System"
            ]
          },
          {
            name: "patientComfortNotes",
            label: "Patient Comfort Notes",
            type: "textarea",
            required: false,
            colSpan: 4,
            placeholder: "e.g. Bedhead unit with nurse call, USB-A & USB-C charging, reading light, overbed table, wardrobe, patient entertainment tablet on articulating arm, wayfinding signage at room entry"
          },
          {
            name: "familyInteraction",
            label: "Family Interaction",
            type: "select",
            required: false,
            colSpan: 2,
            options: [
              "Not Applicable — No Visitor Access",
              "Bedside Visitor Chair Only",
              "Bedside Seating + Fold-Out Bed (Overnight Stay Provision)",
              "Family Lounge / Waiting Area (Shared, Adjacent to Ward)",
              "Dedicated Consultation / Family Meeting Room",
              "Family Participation Zone — Hands-On Care Area",
              "Full Family Accommodation Suite (Long Stay / NICU / Paediatric)"
            ]
          },
          {
            name: "familyInteractionNotes",
            label: "Family Interaction Notes",
            type: "textarea",
            required: false,
            colSpan: 2,
            placeholder: "e.g. Fold-out sleeper chair at bedside, shared family lounge at corridor end, dedicated consultation room shared between 4 bays, access to pantry and shower room"
          }
        ]
      },

      // ─── 3. VISUAL & HEALING ENVIRONMENT ──────────────────────────
      {
        title: "Visual & Healing Environment",
        description: "Biophilic design, restorative visual cues, artwork, wayfinding, and spatial strategies that support psychological wellbeing and recovery",
        fields: [
          {
            name: "visualEnvironment",
            label: "Visual Environment",
            type: "select",
            required: false,
            colSpan: 2,
            options: [
              "Standard Clinical — Neutral Palette, Functional Only",
              "Positive Distraction — Curated Artwork + Feature Colour",
              "Healing Environment — Warm Tones + Nature-Inspired Palette",
              "Wayfinding Colour Coding — Departmental Zone Identity",
              "Paediatric — Playful Colours, Character Themes & Murals",
              "High-End / Hotel-Grade Ambience — Premium Finishes & Artwork",
              "Not Specified"
            ]
          },
          {
            name: "visualEnvironmentNotes",
            label: "Visual Environment Notes",
            type: "textarea",
            required: false,
            colSpan: 2,
            placeholder: "e.g. External courtyard view, wall-mounted artwork programme (local artists), warm white walls RAL 9010, departmental teal wayfinding band, anti-glare window film"
          },
          {
            name: "biophiliaHealingEnvironment",
            label: "Biophilia & Healing Environment",
            type: "select",
            required: false,
            colSpan: 2,
            options: [
              "Not Applicable — No Biophilic Elements Required",
              "Views to Nature — External Garden, Courtyard or Sky",
              "Indoor Plants — Potted or Planter Arrangements",
              "Living Wall — Vertical Green Feature",
              "Natural Materials — Timber Accents, Stone Features",
              "Nature-Inspired Artwork & Photographic Murals",
              "Circadian / Biodynamic Lighting (Human-Centric Lighting)",
              "Full Biophilic Design Package — Views + Plants + Materials + Biodynamic Light"
            ]
          },
          {
            name: "biophiliaHealingNotes",
            label: "Biophilia & Healing Notes",
            type: "textarea",
            required: false,
            colSpan: 2,
            placeholder: "e.g. Glazed wall facing internal healing garden, photographic nature murals in corridor, timber-laminate bedhead panel, human-centric tunable lighting matched to circadian rhythm"
          }
        ]
      },

      // ─── 4. TECHNOLOGY & HYGIENE EXPERIENCE ───────────────────────
      {
        title: "Technology & Hygiene Experience",
        description: "Patient-facing smart technology, infotainment, digital wayfinding, and the visible infection control measures that build confidence and trust",
        fields: [
          {
            name: "technologyInfotainment",
            label: "Technology & Infotainment",
            type: "select",
            required: false,
            colSpan: 2,
            options: [
              "Not Required",
              "Bedside Entertainment Screen — TV / Streaming",
              "Patient Education & Information System",
              "Digital Wayfinding Display (Corridor / Room Entry)",
              "Interactive Patient Portal — Bedside Tablet / Screen",
              "Smart Room Automation — Lighting, Climate & Blinds Control",
              "Full Smart Room + Entertainment + Interactive Patient Portal"
            ]
          },
          {
            name: "technologyInfotainmentNotes",
            label: "Technology & Infotainment Notes",
            type: "textarea",
            required: false,
            colSpan: 2,
            placeholder: "e.g. 24\" bedside touchscreen with streaming, HIS-integrated patient portal, voice-activated lighting and blind control, digital room ID display at entry, multilingual interface"
          },
          {
            name: "infectionControlHygiene",
            label: "Infection Control & Hygiene",
            type: "select",
            required: false,
            colSpan: 2,
            options: [
              "Standard — ABHR Dispenser at Entry (Staff & Visitor Accessible)",
              "Enhanced — ABHR at Entry + Bedside + Toilet",
              "Contactless Experience — Sensor Taps, Auto Doors, Touchless Dispensers",
              "Visible Hygiene Stations — Prominently Positioned ABHR + Signage",
              "Antimicrobial Surface Materials (Copper, Silver-Ion Finishes)",
              "Full Hygiene-by-Design — Contactless + Antimicrobial + Seamless Surfaces + Signage"
            ]
          },
          {
            name: "infectionControlHygieneNotes",
            label: "Infection Control & Hygiene Notes",
            type: "textarea",
            required: false,
            colSpan: 2,
            placeholder: "e.g. ABHR wall dispenser at room entry visible to all, sensor-operated hand basin tap, seamless coving at floor/wall junction, antimicrobial paint on high-touch surfaces, hand hygiene compliance signage"
          }
        ]
      }

    ]
  },
  {
    id: "fittings-fixtures-and-equipment",
    section: "Fittings, Fixtures & Equipment",
    icon: "🧰",
    color: "#7c3aed",
    subsections: [
      {
        title: "Fittings & Furniture (FF)",
        fields: [
          { name: "airFlowmeter", label: "Air Flowmeter", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "oxygenFlowmeter", label: "Oxygen Flowmeter", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "suctionAdapterLowFlow", label: "Suction Adapter: Low Flow", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "suctionBottle", label: "Suction Bottle", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "oxygenFlowmeterLowFlow", label: "Oxygen Flowmeter: Low Flow", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "trolleyProcedure", label: "Trolley: Procedure", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "blenderAirOxygen", label: "Blender: Air & Oxygen, Low Flow", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "stoolAdjustableMobile", label: "Stool: Adjustable, Mobile", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "curtainTrackSystem", label: "Curtain Track System", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "ivHook", label: "IV Hook", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "additionalFF", label: "Additional FF Items", type: "textarea", placeholder: "List any additional items", required: false, colSpan: 4 }
        ]
      },
      {
        title: "Fixtures, Equipment & Services (FE)",
        fields: [
          { name: "infusionPumpSyringe", label: "Infusion Pump: Syringe", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "examinationLight", label: "Light: Examination, Single, Ceiling Mounted", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "physiologicMonitor", label: "Monitor: Physiologic, Critical Care / Neonatal", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "infantIncubator", label: "Incubator: Infant", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "phototherapyLamp", label: "Lamp: Phototherapy, Neonatal", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "supplyUnitCeiling", label: "Supply Unit: Ceiling, Double Arm", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "infusionPumpEnteral", label: "Infusion Pump: Enteral Feeding", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "infusionPumpSingleChannel", label: "Infusion Pump: Single Channel", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "ventilatorNeonatal", label: "Ventilator: Neonatal / Paediatric", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
          { name: "additionalFE", label: "Additional FE Items", type: "textarea", placeholder: "List any additional items", required: false, colSpan: 4 }
        ]
      }
    ]
  }
];