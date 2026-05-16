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
            type: "text",
            required: false,
            colSpan: 2,
            placeholder: "Auto-filled: <Project Code>_<Type>_<Dept Code>_<Category Code>_<Room Name>",
            hint: "Automatically generated from: Project Code _ Type _ Department Code _ Category Code _ Room Name"
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
    section: "Architectural and spatial-requirements",
    icon: "📐",
    color: "#06b6d4",
    fields: [
      { name: "netArea", label: "Net Area (m²)", type: "number", placeholder: "e.g. 35", required: true, colSpan: 2 },
      { name: "minimumDimensions", label: "Minimum Dimensions (L × W)", type: "text", placeholder: "e.g. 7m × 5m", required: false, colSpan: 2 },
      { name: "clearances", label: "Clearances", type: "text", placeholder: "Around equipment/bed", required: false, colSpan: 2 },
      { name: "ceilingHeight", label: "Ceiling Height (m)", type: "number", placeholder: "e.g. 3.0", required: false, colSpan: 2 },
      {
        name: "doorType", label: "Door Type", type: "select", required: false, colSpan: 2,
        options: ["Sliding", "Hinged (Single)", "Hinged (Double)", "Automatic Sliding", "Hermetic Sealed", "Fire-Rated", "Other"]
      },
      { name: "doorSize", label: "Door Size", type: "text", placeholder: "e.g. 1200 × 2100 mm", required: false, colSpan: 2 },
      {
        name: "accessibility", label: "Accessibility Compliance", type: "select", required: true, colSpan: 4,
        options: ["Full Barrier-Free Compliance", "Partial Compliance", "Standard", "Not Applicable"]
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
    section: "MEP & engineering-systems",
    icon: "⚡",
    color: "#f97316",
    subsections: [
      {
        title: "HVAC",
        fields: [
          { name: "airChangesACH", label: "Air Changes (ACH)", type: "number", placeholder: "e.g. 15", required: false, colSpan: 2 },
          {
            name: "pressure", label: "Pressure Regime", type: "select", required: false, colSpan: 2,
            options: ["Positive (+ve)", "Negative (-ve)", "Neutral", "Variable"]
          },
          { name: "temperature", label: "Temperature (°C)", type: "text", placeholder: "e.g. 20–24°C", required: false, colSpan: 2 },
          { name: "humidity", label: "Humidity (%RH)", type: "text", placeholder: "e.g. 45–60%", required: false, colSpan: 2 },
          {
            name: "filtration", label: "Filtration", type: "select", required: false, colSpan: 2,
            options: ["HEPA H14", "HEPA H13", "MERV-16", "MERV-13", "Standard", "ULPA", "Other"]
          },
          { name: "airflowDirection", label: "Airflow Direction", type: "text", placeholder: "e.g. Top supply, Low exhaust", required: false, colSpan: 2 },
          {
            name: "pandemicMode", label: "Pandemic Mode Capable", type: "yesno", required: false, colSpan: 4
          }
        ]
      },
      {
        title: "Electrical",
        fields: [
          { name: "powerLoad", label: "Power Load (kVA)", type: "number", placeholder: "e.g. 15", required: false, colSpan: 2 },
          { name: "normalPower", label: "Normal Power Supply", type: "text", placeholder: "e.g. 230V/50Hz", required: false, colSpan: 2 },
          { name: "emergencyPower", label: "Emergency Power", type: "text", placeholder: "e.g. Gen-set within 10s", required: false, colSpan: 2 },
          {
            name: "ups", label: "UPS Required", type: "yesno", required: false, colSpan: 2
          },
          { name: "numberOfSockets", label: "No. of Sockets", type: "number", placeholder: "e.g. 12", required: false, colSpan: 2 },
          { name: "specialOutlets", label: "Special Outlets", type: "text", placeholder: "e.g. IEC 60601 medical-grade", required: false, colSpan: 2 }
        ]
      },
      {
        title: "Medical Gases",
        fields: [
          { name: "oxygen", label: "Oxygen (O₂) — No. of Outlets", type: "number", placeholder: "e.g. 4", required: false, colSpan: 2 },
          { name: "medicalAir", label: "Medical Air — No. of Outlets", type: "number", placeholder: "e.g. 2", required: false, colSpan: 2 },
          { name: "vacuum", label: "Vacuum (AGSS) — No. of Outlets", type: "number", placeholder: "e.g. 2", required: false, colSpan: 2 },
          { name: "nitrousOxide", label: "Nitrous Oxide — No. of Outlets", type: "number", placeholder: "e.g. 1", required: false, colSpan: 2 }
        ]
      },
      {
        title: "Plumbing",
        fields: [
          { name: "handWash", label: "Hand Wash Basins", type: "number", placeholder: "No. of units", required: false, colSpan: 2 },
          { name: "wc", label: "WC / Toilet", type: "number", placeholder: "No. of units", required: false, colSpan: 2 },
          { name: "shower", label: "Shower", type: "number", placeholder: "No. of units", required: false, colSpan: 2 },
          { name: "plumbingSpecialSystems", label: "Special Plumbing Systems", type: "text", placeholder: "e.g. Sluice, Bedpan washer", required: false, colSpan: 2 }
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
    section: "Stakeholder experience",
    icon: "✨",
    color: "#0891b2",
    fields: [
      { name: "lightingQuality", label: "Lighting Quality", type: "textarea", placeholder: "Lux levels, CCT, controls", required: false, colSpan: 2 },
      { name: "acousticControl", label: "Acoustic Control", type: "text", placeholder: "dB target, STC rating", required: false, colSpan: 2 },
      { name: "privacy", label: "Privacy", type: "text", placeholder: "Visual & acoustic privacy measures", required: false, colSpan: 2 },
      { name: "patientComfort", label: "Patient Comfort", type: "textarea", placeholder: "Bedhead units, entertainment, wayfinding", required: false, colSpan: 2 },
      { name: "familyInteraction", label: "Family Interaction", type: "text", placeholder: "Visitor seating, consultation space", required: false, colSpan: 2 },
      { name: "visualEnvironment", label: "Visual Environment", type: "text", placeholder: "Views, artwork, wayfinding colours", required: false, colSpan: 2 }
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