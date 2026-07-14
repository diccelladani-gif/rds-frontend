"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import RdsForm     from "../components/RdsForm";
import RecordsPage from "../components/RecordsPage";
import AmbientBackground from "../components/AmbientBackground";   // 👈 ADDED
import MedicalAmbient from "../components/MedicalAmbient";
import { rdsSchema } from "../schema";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type View = "form" | "records" | "search";
interface RDSUser { name: string; role: string; email: string; }
interface EditRecord { id: string; data: Record<string, any>; }

// ── Cinematic helpers ─────────────────────────────────────────────
function addRipple(e: React.MouseEvent<HTMLButtonElement>) {
  const btn  = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.4;
  const x    = e.clientX - rect.left - size / 2;
  const y    = e.clientY - rect.top  - size / 2;
  const el   = document.createElement("span");
  el.className = "btn-ripple";
  el.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  btn.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

// ── Animated counter hook ─────────────────────────────────────────
function useCountUp(target: number, duration: number = 900, delay: number = 0) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const fromRef  = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const diff  = target - from;
    if (diff === 0) return;
    let started = false;
    const delayTimer = setTimeout(() => {
      started = true;
      const animate = (ts: number) => {
        if (startRef.current === null) startRef.current = ts;
        const elapsed = ts - startRef.current;
        const t = Math.min(elapsed / duration, 1);
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setDisplay(Math.round(from + diff * eased));
        if (t < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          fromRef.current  = target;
          startRef.current = null;
        }
      };
      frameRef.current = requestAnimationFrame(animate);
    }, delay);
    return () => {
      clearTimeout(delayTimer);
      if (!started) return;
      cancelAnimationFrame(frameRef.current);
      startRef.current = null;
    };
  }, [target, duration, delay]);
  return display;
}

// ── Animated stat card ────────────────────────────────────────────
function AnimatedStat({
  icon, label, value, color, ac, index
}: {
  icon: string; label: string; value: number | string;
  color: string; ac: string; index: number;
}) {
  const isPercent = typeof value === "string" && value.endsWith("%");
  const numericTarget = isPercent
    ? parseInt(value as string, 10)
    : typeof value === "number" ? value : 0;
  const counted = useCountUp(numericTarget, 1000, index * 120);
  const display = isPercent ? `${counted}%` : counted;
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color }}>{icon}</div>
      <div className="stat-body">
        <strong
          className="stat-number"
          style={{ color: ac }}
          data-value={numericTarget}
        >
          {display}
        </strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function Page() {
  const router = useRouter();
  const [currentUser,    setCurrentUser]    = useState<RDSUser | null>(null);
  const [activeSection,  setActiveSection]  = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [sidebarJump,    setSidebarJump]    = useState<{idx:number,ts:number}|null>(null);
  const [view,           setView]           = useState<View>("form");
  const [time,           setTime]           = useState("");
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [editRecord,     setEditRecord]     = useState<EditRecord | null>(null);

  const prevSectionRef    = useRef(0);
  const sectionWrapperRef = useRef<HTMLDivElement>(null);
  const cursorOrbRef      = useRef<HTMLDivElement>(null);
  const labelKey          = useRef(0);

  const progress = Math.round((completedCount / rdsSchema.length) * 100);

  // ── Auth check ────────────────────────────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem("rds_user");
    if (!raw) { router.replace("/login"); return; }
    try { setCurrentUser(JSON.parse(raw)); }
    catch { router.replace("/login"); }
  }, [router]);

  // ── Live clock ────────────────────────────────────────
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  // ── Cursor orb ───────────────────────────────────────
  useEffect(() => {
    const orb = cursorOrbRef.current;
    if (!orb) return;
    const onMove = (e: MouseEvent) => {
      orb.style.left = `${e.clientX}px`;
      orb.style.top  = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // ── Card reveal — Intersection Observer ─────────────
  useEffect(() => {
    let rafId: number;
    let timerId: ReturnType<typeof setTimeout>;
    const setupObserver = () => {
      const cards = document.querySelectorAll<HTMLElement>(".rds-card");
      if (cards.length === 0) {
        timerId = setTimeout(setupObserver, 120);
        return;
      }
      cards.forEach((card, i) => {
        card.style.setProperty("--stagger-delay", `${i * 55}ms`);
      });
      const obs = new IntersectionObserver(
        (entries) => entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("card-visible");
            obs.unobserve(entry.target);
          }
        }),
        { threshold: 0.01, rootMargin: "120px 0px 120px 0px" }
      );
      cards.forEach(card => obs.observe(card));
      timerId = setTimeout(() => {
        document.querySelectorAll<HTMLElement>(".rds-card:not(.card-visible)")
          .forEach(card => card.classList.add("card-visible"));
      }, 800);
      return () => obs.disconnect();
    };
    rafId = requestAnimationFrame(() => {
      timerId = setTimeout(setupObserver, 80);
    });
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [activeSection, view]);

  // ── Section slide direction animation ────────────────
  const animateSectionTransition = useCallback((nextIdx: number) => {
    const wrapper = sectionWrapperRef.current;
    if (!wrapper) return;
    const goingForward = nextIdx > prevSectionRef.current;
    const exitClass   = goingForward ? "section-exit-next"  : "section-exit-prev";
    const enterClass  = goingForward ? "section-enter-next" : "section-enter-prev";
    wrapper.classList.add(exitClass);
    setTimeout(() => {
      wrapper.classList.remove(exitClass);
      wrapper.classList.add(enterClass);
      setTimeout(() => wrapper.classList.remove(enterClass), 560);
    }, 340);
    prevSectionRef.current = nextIdx;
  }, []);

  // ── Handle section change from RdsForm ───────────────
  const handleSectionChange = useCallback((val: {current:number, completed:number}) => {
    if (val.current !== activeSection) {
      animateSectionTransition(val.current);
      labelKey.current++;
    }
    setActiveSection(val.current);
    setCompletedCount(val.completed);
  }, [activeSection, animateSectionTransition]);

  const handleLogout = () => {
    sessionStorage.removeItem("rds_user");
    router.replace("/login");
  };

  // ── Edit handler ─────────────────────────────────────
  const handleEdit = (record: EditRecord) => {
    setEditRecord(record);
    setView("form");
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  if (!currentUser) return null;

  const avatarInitial = currentUser.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      {/* Ambient aurora canvas — behind everything */}
      <AmbientBackground />                                        {/* 👈 ADDED */}
      <MedicalAmbient />

      {/* Ambient cursor orb */}
      <div ref={cursorOrbRef} className="cursor-orb" />
      {/* Floating ambient particles */}
      <div className="ambient-particle" />
      <div className="ambient-particle" />
      <div className="ambient-particle" />
      <div className="ambient-particle" />
      <div className="ambient-particle" />

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside className="sidebar" style={{ transform: sidebarOpen ? "none" : "translateX(-100%)", transition:"transform 0.3s cubic-bezier(0.23,1,0.32,1)" }}>
        <div className="sidebar-dot-grid" />
        <div className="sidebar-edge-glow" />
        <div className="sidebar-veil" />
        <div className="sidebar-logo-area">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div className="sidebar-brand">
              RDS System
              <span>Medical Infra </span>
            </div>
            <div
              className="online-dot"
              style={{
                width:8, height:8, borderRadius:"50%", flexShrink:0,
                background:"linear-gradient(135deg,#6366f1,#22d3ee)",
                boxShadow:"0 0 10px rgba(99,102,241,0.8), 0 0 20px rgba(34,211,238,0.4)"
              }}
              title="System online"
            />
          </div>
          <div style={{ marginTop:18, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:11,
              background:"linear-gradient(135deg,rgba(99,102,241,0.55),rgba(34,211,238,0.30))",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:15, fontWeight:800, color:"#c7d2fe",
              border:"1px solid rgba(99,102,241,0.35)",
              boxShadow:"0 4px 16px rgba(99,102,241,0.35), 0 0 8px rgba(34,211,238,0.15)",
            }}>{avatarInitial}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.88)", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.30)", marginTop:1, textTransform:"capitalize", letterSpacing:"0.3px" }}>
                {currentUser.role} · {time}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.25)", fontSize:14, padding:4, flexShrink:0, transition:"all 0.2s" }}
              onMouseOver={e => { e.currentTarget.style.color = "rgba(199,210,254,0.85)"; e.currentTarget.style.filter = "drop-shadow(0 0 6px rgba(99,102,241,0.6))"; }}
              onMouseOut={e  => { e.currentTarget.style.color = "rgba(255,255,255,0.25)";  e.currentTarget.style.filter = "none"; }}
            >⏻</button>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-group-label">Form Sections</div>
          {rdsSchema.map((section, idx) => {
            const isActive = view === "form" && idx === activeSection;
            const isDone   = view === "form" && idx < activeSection;
            return (
              <div key={section.id}
                className={`nav-item ${isActive ? "active" : ""} ${isDone ? "completed" : ""}`}
                onClick={() => {
                  animateSectionTransition(idx);
                  setView("form");
                  setSidebarJump({ idx, ts: Date.now() });
                }}
              >
                <div className="nav-icon">{section.icon}</div>
                <span className="nav-label">{section.section}</span>
                <div className="nav-status">
                  {isDone ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : isActive ? (
                    <div style={{ width:5, height:5, background:"#93c5fd", borderRadius:"50%" }} />
                  ) : (
                    <span style={{ fontSize:9 }}>{idx+1}</span>
                  )}
                </div>
              </div>
            );
          })}
          <div className="nav-group-label" style={{ marginTop:12 }}>Records & Export</div>
          {([
            { icon:"📋", label:"All Room Sheets",    id:"records" },
            { icon:"🔍", label:"Search & Filter",    id:"search"  },
            { icon:"📊", label:"Export Excel (All)", id:"excel"   },
            { icon:"📄", label:"Export PDF (All)",   id:"pdf"     },
          ] as { icon:string; label:string; id:string }[]).map(item => (
            <div key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => {
                if (item.id === "excel") window.open(`${API}/export/excel`, "_blank");
                else if (item.id === "pdf") window.open(`${API}/export/pdf`, "_blank");
                else setView(item.id as View);
              }}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-progress-area">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:9, color:"rgba(255,255,255,0.28)", fontWeight:700, letterSpacing:2, textTransform:"uppercase", fontFamily:"'Sora',sans-serif" }}>
              Form Completion
            </span>
            <span style={{
              fontSize:13, fontWeight:800, fontFamily:"'Sora',sans-serif",
              background: progress === 100
                ? "linear-gradient(90deg,#34d399,#22d3ee)"
                : "linear-gradient(90deg,#a5b4fc,#22d3ee)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              backgroundClip:"text",
              filter:`drop-shadow(0 0 8px ${progress === 100 ? "rgba(52,211,153,0.6)" : "rgba(99,102,241,0.5)"})`,
            }}>
              {progress}%
            </span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width:`${progress}%` }} />
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.22)", marginTop:9, fontFamily:"'Sora',sans-serif", letterSpacing:"0.2px" }}>
            {completedCount} of {rdsSchema.length} sections reviewed
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────── */}
      <div className="main-wrapper">
        <header className="topbar">
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ width:36, height:36, borderRadius:10, border:"1.5px solid #e0e7ef", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="#5b6a81" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="topbar-left">
              <h1>
                {view === "form"
                  ? (editRecord ? "Edit Room Data Sheet" : "Room Data Sheet Dashboard")
                  : "All Room Records"}
              </h1>
              <p key={labelKey.current} className="topbar-section-label">
                {view === "form"
                  ? editRecord
                    ? `Editing: ${editRecord.data?.roomCode || ""} — ${editRecord.data?.roomName || ""}`
                    : `Section ${activeSection + 1} of ${rdsSchema.length} — ${rdsSchema[activeSection]?.section}`
                  : "Browse, download and manage submitted room data sheets"}
              </p>
            </div>
          </div>
          <div className="topbar-actions">
            {view === "form" && !editRecord && (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", background:"#fff", border:"1.5px solid #e0e7ef", borderRadius:12 }}>
                  <svg width="18" height="18" viewBox="0 0 36 36" style={{ transform:"rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e0e7ef" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="3"
                      strokeDasharray={`${progress * 0.942} 94.2`} strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize:12, color:"#64748b", fontWeight:600, fontFamily:"'Sora',sans-serif" }}>{progress}% done</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px", background:"#fff", border:"1.5px solid #e0e7ef", borderRadius:10 }}>
                  <div className="draft-dot" />
                  <span style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>Draft</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => window.open(`${API}/export/excel`, "_blank")}>📊 Excel</button>
                <button className="btn btn-ghost btn-sm" onClick={() => window.open(`${API}/export/pdf`, "_blank")}>📄 PDF</button>
              </>
            )}
            {view === "form" && editRecord && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditRecord(null); setView("records"); }}>
                ← Back to Records
              </button>
            )}
            {(view === "records" || view === "search") && (
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => { addRipple(e); setEditRecord(null); setView("form"); }}
              >
                + New RDS
              </button>
            )}
          </div>
        </header>
        <main className="page-content">
          {view === "form" && !editRecord && (
            <div className="stats-strip">
              {[
                { icon:"📋", label:"Total Sections",    value: rdsSchema.length,                 color:"#eff6ff", ac:"#2563eb" },
                { icon:"✅", label:"Completed",          value: completedCount,                    color:"#f0fdf4", ac:"#10b981" },
                { icon:"⏳", label:"Remaining",          value: rdsSchema.length - completedCount, color:"#fefce8", ac:"#f59e0b" },
                { icon:"📊", label:"Progress",           value: `${progress}%`,                   color:"#fdf4ff", ac:"#7c3aed" },
              ].map((stat, i) => (
                <AnimatedStat key={stat.label} {...stat} index={i} />
              ))}
            </div>
          )}
          <div ref={sectionWrapperRef}>
            {view === "form" && (
              <RdsForm
                onSectionChange={handleSectionChange}
                jumpToSection={sidebarJump}
                editRecord={editRecord}
                onEditDone={() => {
                  setEditRecord(null);
                  setView("records");
                }}
              />
            )}
          </div>
          {(view === "records" || view === "search") && (
            <RecordsPage
              onBack={() => { setEditRecord(null); setView("form"); }}
              onEdit={handleEdit}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Page;