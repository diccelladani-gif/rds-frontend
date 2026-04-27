"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────────── */
type Role = "admin" | "reviewer" | "planner" | "viewer";

interface RoleOption {
  id: Role;
  icon: string;
  name: string;
  desc: string;
}

const ROLES: RoleOption[] = [
  { id: "admin",    icon: "⚙️", name: "Administrator", desc: "Full system access"     },
  { id: "reviewer", icon: "📋", name: "Reviewer",      desc: "Review & approve RDS"  },
  { id: "planner",  icon: "🏗️", name: "Planner",       desc: "Create & edit rooms"   },
  { id: "viewer",   icon: "👁️", name: "Viewer",        desc: "Read-only access"      },
];

/* ─── Demo credential store (replace with real API call) ─── */
const DEMO_USERS: Record<string, { pass: string; name: string; role: Role }> = {
  "admin@rds.med":    { pass: "admin123",  name: "Dr. A. Sharma", role: "admin"    },
  "reviewer@rds.med": { pass: "review123", name: "Dr. R. Patel",  role: "reviewer" },
  "demo":             { pass: "demo",      name: "Demo User",     role: "planner"  },
};

export default function LoginPage() {
  const router  = useRouter();
  const [email,    setEmail]    = useState("");
  const [pass,     setPass]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [role,     setRole]     = useState<Role>("admin");
  const [remember, setRemember] = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const [time,     setTime]     = useState("");
  const [successUser, setSuccessUser] = useState({ name: "", role: "" });

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!email || !pass) { setError("Please enter your credentials."); return; }
    setLoading(true);

    /* ── Replace the block below with your real API call ── */
    await new Promise(r => setTimeout(r, 1600));
    const user = DEMO_USERS[email.toLowerCase()];
    if (user && user.pass === pass) {
      /* Store session (replace with real auth token logic) */
      sessionStorage.setItem("rds_user", JSON.stringify({ name: user.name, role, email }));
      setSuccessUser({ name: user.name, role });
      setLoading(false);
      setSuccess(true);
      setTimeout(() => router.push("/"), 1800);
    } else {
      setLoading(false);
      setError("Invalid credentials. Try demo / demo for a quick look.");
    }
    /* ──────────────────────────────────────────────────── */
  };

  const roleLabel: Record<Role, string> = {
    admin: "Administrator", reviewer: "Reviewer",
    planner: "Facility Planner", viewer: "Viewer",
  };

  return (
    <>
      {/* ── Fonts ─────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Sora', sans-serif;
          background: #020b1a;
          min-height: 100vh;
          color: rgba(255,255,255,0.9);
        }

        /* ── Grid overlay ── */
        .login-root {
          min-height: 100vh;
          display: flex;
          position: relative;
          overflow: hidden;
        }
        .login-root::before {
          content: '';
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── Orbs ── */
        .orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .orb1 { width:600px;height:600px;background:radial-gradient(circle,#2563eb,transparent);top:-200px;left:-200px;opacity:0.18;animation:pulse1 8s ease-in-out infinite; }
        .orb2 { width:500px;height:500px;background:radial-gradient(circle,#06b6d4,transparent);bottom:-150px;right:-150px;opacity:0.15;animation:pulse2 10s ease-in-out infinite; }
        .orb3 { width:300px;height:300px;background:radial-gradient(circle,#7c3aed,transparent);top:45%;right:28%;opacity:0.10;animation:pulse3 7s ease-in-out infinite; }
        @keyframes pulse1{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}
        @keyframes pulse2{0%,100%{transform:scale(1);}50%{transform:scale(1.12);}}
        @keyframes pulse3{0%,100%{transform:scale(1);}50%{transform:scale(1.2);}}

        /* ── Left panel ── */
        .left-panel { flex:1;display:flex;flex-direction:column;justify-content:center;padding:80px 60px;position:relative;z-index:2; }

        .brand-badge {
          display:inline-flex;align-items:center;gap:10px;
          background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.3);
          border-radius:100px;padding:8px 18px;margin-bottom:48px;width:fit-content;
        }
        .brand-dot { width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 12px rgba(16,185,129,0.8);animation:blink 2s ease-in-out infinite; }
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.4;}}
        .brand-badge-text { font-size:12px;color:rgba(255,255,255,0.7);font-weight:600;letter-spacing:1.5px;text-transform:uppercase; }

        .hero-title { font-size:52px;font-weight:800;line-height:1.1;color:#fff;margin-bottom:20px;letter-spacing:-1.5px; }
        .hero-title em { font-style:normal;background:linear-gradient(135deg,#60a5fa,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .hero-sub { font-size:16px;color:rgba(255,255,255,0.55);line-height:1.7;max-width:440px;margin-bottom:56px; }

        .feature-list { display:flex;flex-direction:column;gap:16px; }
        .feature-item { display:flex;align-items:center;gap:14px; }
        .feature-icon { width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0; }
        .fi-blue   { background:rgba(37,99,235,0.2);border:1px solid rgba(37,99,235,0.3); }
        .fi-green  { background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.25); }
        .fi-purple { background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3); }
        .feature-text { font-size:13.5px;color:rgba(255,255,255,0.55); }
        .feature-text strong { color:rgba(255,255,255,0.9);display:block;font-size:14px;font-weight:600;margin-bottom:2px; }

        /* ── Panel divider ── */
        .panel-divider { position:relative;z-index:2;width:1px;background:rgba(255,255,255,0.08);margin:40px 0;flex-shrink:0;align-self:stretch; }
        .panel-divider::before { content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.13); }

        /* ── Right panel ── */
        .right-panel { width:520px;flex-shrink:0;display:flex;align-items:center;justify-content:center;padding:40px;position:relative;z-index:2; }

        .login-card {
          width:100%;
          background:rgba(255,255,255,0.035);
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.13);
          border-radius:24px;padding:44px 44px 40px;
          box-shadow:0 32px 80px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.07);
          animation:slideIn 0.6s cubic-bezier(0.23,1,0.32,1) both;
        }
        @keyframes slideIn{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}

        .card-logo { display:flex;align-items:center;gap:12px;margin-bottom:28px; }
        .logo-mark {
          width:44px;height:44px;border-radius:14px;
          background:linear-gradient(135deg,rgba(37,99,235,0.6),rgba(6,182,212,0.4));
          border:1px solid rgba(59,130,246,0.4);
          display:flex;align-items:center;justify-content:center;
          font-size:20px;font-weight:900;color:#93c5fd;
          box-shadow:0 8px 24px rgba(37,99,235,0.3);
        }
        .logo-text { font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.3px; }
        .logo-sub  { font-size:10.5px;font-weight:500;color:rgba(255,255,255,0.28);letter-spacing:1.2px;text-transform:uppercase;margin-top:1px; }

        .card-title { font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px;margin-bottom:6px; }
        .card-sub   { font-size:13.5px;color:rgba(255,255,255,0.55); }

        /* ── Form ── */
        .form-group { margin-bottom:20px; }
        .form-label {
          display:flex;align-items:center;gap:6px;
          font-size:11.5px;font-weight:700;color:rgba(255,255,255,0.55);
          letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;
        }
        .label-dot { width:4px;height:4px;border-radius:50%;background:#06b6d4;opacity:0.7; }

        .input-wrap { position:relative; }
        .input-icon { position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:15px;opacity:0.4;pointer-events:none; }
        .form-input {
          width:100%;height:50px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:13px;padding:0 16px 0 46px;
          font-size:14.5px;color:#fff;
          font-family:'Sora',sans-serif;
          outline:none;transition:all 0.2s;letter-spacing:0.2px;
        }
        .form-input::placeholder { color:rgba(255,255,255,0.25);font-size:14px; }
        .form-input:focus {
          border-color:rgba(37,99,235,0.6);
          background:rgba(37,99,235,0.08);
          box-shadow:0 0 0 3px rgba(37,99,235,0.12);
        }
        .pass-input { padding-right:46px; }
        .eye-btn {
          position:absolute;right:14px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;
          color:rgba(255,255,255,0.3);font-size:16px;padding:4px;transition:color 0.2s;
        }
        .eye-btn:hover { color:rgba(255,255,255,0.6); }

        /* ── Role selector ── */
        .role-label { margin-bottom:10px; }
        .role-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px; }
        .role-btn {
          padding:10px 12px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:11px;cursor:pointer;transition:all 0.2s;text-align:left;
        }
        .role-btn:hover { background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.13); }
        .role-btn.selected { background:rgba(37,99,235,0.15);border-color:rgba(37,99,235,0.5);box-shadow:0 0 0 2px rgba(37,99,235,0.12); }
        .role-icon { font-size:18px;margin-bottom:4px; }
        .role-name { font-size:12px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.3px; }
        .role-desc { font-size:10.5px;color:rgba(255,255,255,0.3);margin-top:1px; }

        /* ── Extras ── */
        .form-extras { display:flex;align-items:center;justify-content:space-between;margin-bottom:28px; }
        .remember-wrap { display:flex;align-items:center;gap:8px;cursor:pointer; }
        .custom-check {
          width:18px;height:18px;border-radius:6px;
          border:1.5px solid rgba(255,255,255,0.13);
          background:transparent;display:flex;align-items:center;justify-content:center;
          transition:all 0.2s;flex-shrink:0;font-size:10px;color:#fff;font-weight:700;
        }
        .custom-check.checked { background:#2563eb;border-color:#2563eb;box-shadow:0 0 12px rgba(37,99,235,0.4); }
        .remember-label { font-size:12.5px;color:rgba(255,255,255,0.55);font-weight:500; }
        .forgot-link { font-size:12.5px;color:#60a5fa;font-weight:600;cursor:pointer;text-decoration:none;transition:color 0.2s; }
        .forgot-link:hover { color:#93c5fd; }

        /* ── Submit button ── */
        .btn-login {
          width:100%;height:52px;
          background:linear-gradient(135deg,#2563eb,#1d4ed8);
          border:none;border-radius:14px;
          font-size:15px;font-weight:700;color:#fff;cursor:pointer;
          font-family:'Sora',sans-serif;letter-spacing:0.3px;
          position:relative;overflow:hidden;transition:all 0.25s;
          box-shadow:0 8px 24px rgba(37,99,235,0.35);
          display:flex;align-items:center;justify-content:center;gap:10px;
        }
        .btn-login:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 12px 32px rgba(37,99,235,0.5); }
        .btn-login:active:not(:disabled) { transform:translateY(0);box-shadow:0 4px 16px rgba(37,99,235,0.3); }
        .btn-login:disabled { opacity:0.8;cursor:not-allowed; }

        .spinner {
          width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);
          border-top-color:#fff;border-radius:50%;
          animation:spin 0.7s linear infinite;
        }
        @keyframes spin{to{transform:rotate(360deg);}}

        /* ── Error ── */
        .error-box {
          font-size:12px;color:#f87171;background:rgba(239,68,68,0.1);
          border:1px solid rgba(239,68,68,0.2);border-radius:8px;
          padding:10px 14px;margin-bottom:18px;
          display:flex;align-items:center;gap:8px;
          animation:slideIn 0.3s ease both;
        }

        /* ── Divider ── */
        .or-divider { display:flex;align-items:center;gap:12px;margin:24px 0; }
        .or-divider::before,.or-divider::after { content:'';flex:1;height:1px;background:rgba(255,255,255,0.08); }
        .or-divider span { font-size:11px;color:rgba(255,255,255,0.28);font-weight:600;letter-spacing:1px;text-transform:uppercase; }

        /* ── SSO ── */
        .sso-btn {
          width:100%;height:46px;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
          border-radius:12px;display:flex;align-items:center;justify-content:center;gap:10px;
          font-size:13.5px;color:rgba(255,255,255,0.55);font-weight:600;
          cursor:pointer;transition:all 0.2s;font-family:'Sora',sans-serif;
        }
        .sso-btn:hover { background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.13);color:rgba(255,255,255,0.85); }
        .sso-icon { width:20px;height:20px;border-radius:6px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:13px; }

        /* ── Security badges ── */
        .badge-row { display:flex;align-items:center;gap:6px;margin-top:16px;justify-content:center;flex-wrap:wrap; }
        .sec-badge {
          display:flex;align-items:center;gap:5px;
          background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
          border-radius:100px;padding:4px 10px;
        }
        .sec-badge span { font-size:10px;color:rgba(255,255,255,0.3);font-weight:600;letter-spacing:0.5px; }

        /* ── Success state ── */
        .success-state { text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px 0; }
        .success-icon {
          width:64px;height:64px;border-radius:50%;
          background:rgba(16,185,129,0.15);border:2px solid rgba(16,185,129,0.4);
          display:flex;align-items:center;justify-content:center;font-size:28px;
          box-shadow:0 0 40px rgba(16,185,129,0.2);
          animation:popIn 0.5s cubic-bezier(0.23,1,0.32,1) both;
        }
        @keyframes popIn{from{transform:scale(0.5);opacity:0;}to{transform:scale(1);opacity:1;}}
        .success-title { font-size:20px;font-weight:800;color:#fff; }
        .success-sub   { font-size:13px;color:rgba(255,255,255,0.55);font-family:'JetBrains Mono',monospace; }

        @media (max-width:900px){
          .left-panel { display:none; }
          .panel-divider { display:none; }
          .right-panel { width:100%;padding:24px; }
        }
      `}</style>

      <div className="login-root">
        {/* Background */}
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />

        {/* ── Left panel ──────────────────────────────── */}
        <aside className="left-panel">
          <div className="brand-badge">
            <div className="brand-dot" />
            <span className="brand-badge-text">System Online · {time}</span>
          </div>

          <h1 className="hero-title">
            Enterprise<br />
            <em>Facility</em><br />
            Management
          </h1>
          <p className="hero-sub">
            Streamline Room Data Sheet operations across your entire medical campus.
            Secure, structured, and built for scale.
          </p>

          <div className="feature-list">
            {[
              { icon:"🏥", cls:"fi-blue",   title:"Multi-Department RDS",  desc:"Centralized room data across all clinical departments" },
              { icon:"📊", cls:"fi-green",  title:"Excel & PDF Export",    desc:"Instant exports with role-based access controls" },
              { icon:"🔐", cls:"fi-purple", title:"Role-Based Security",   desc:"Admin, Reviewer, and Viewer permission tiers" },
            ].map(f => (
              <div key={f.title} className="feature-item">
                <div className={`feature-icon ${f.cls}`}>{f.icon}</div>
                <div className="feature-text">
                  <strong>{f.title}</strong>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="panel-divider" />

        {/* ── Right panel ─────────────────────────────── */}
        <div className="right-panel">
          <div className="login-card">

            {success ? (
              /* ── Success state ── */
              <div className="success-state">
                <div className="success-icon">✓</div>
                <div className="success-title">Access Granted</div>
                <div className="success-sub">
                  {successUser.name} · {roleLabel[successUser.role as Role]} — Redirecting…
                </div>
              </div>
            ) : (
              <>
                {/* Logo */}
                <div className="card-logo">
                  <div className="logo-mark">R</div>
                  <div>
                    <div className="logo-text">RDS System</div>
                    <div className="logo-sub">Medical College · Secure Portal</div>
                  </div>
                </div>
                <div className="card-title">Welcome back</div>
                <div className="card-sub" style={{ marginBottom: 32 }}>Sign in to access your workspace</div>

                {/* Error */}
                {error && (
                  <div className="error-box">
                    <span>⚠</span> {error}
                  </div>
                )}

                {/* Email */}
                <div className="form-group">
                  <div className="form-label"><div className="label-dot" /> Employee ID / Email</div>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="emp@medcollege.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <div className="form-label"><div className="label-dot" /> Password</div>
                  <div className="input-wrap">
                    <span className="input-icon">🔑</span>
                    <input
                      type={showPass ? "text" : "password"}
                      className="form-input pass-input"
                      placeholder="Enter your secure password"
                      value={pass}
                      onChange={e => setPass(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                    />
                    <button className="eye-btn" onClick={() => setShowPass(p => !p)} type="button">
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div className="form-label role-label"><div className="label-dot" /> Access Role</div>
                <div className="role-grid">
                  {ROLES.map(r => (
                    <div
                      key={r.id}
                      className={`role-btn${role === r.id ? " selected" : ""}`}
                      onClick={() => setRole(r.id)}
                    >
                      <div className="role-icon">{r.icon}</div>
                      <div className="role-name">{r.name}</div>
                      <div className="role-desc">{r.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Extras */}
                <div className="form-extras">
                  <div className="remember-wrap" onClick={() => setRemember(r => !r)}>
                    <div className={`custom-check${remember ? " checked" : ""}`}>{remember ? "✓" : ""}</div>
                    <span className="remember-label">Remember this device</span>
                  </div>
                  <a className="forgot-link" href="#">Forgot password?</a>
                </div>

                {/* Submit */}
                <button className="btn-login" onClick={handleLogin} disabled={loading}>
                  {loading && <div className="spinner" />}
                  {loading ? "Authenticating…" : "Sign In to RDS System"}
                </button>

                <div className="or-divider"><span>or continue with</span></div>

                <div className="sso-btn">
                  <div className="sso-icon">🏛️</div>
                  Sign in with Institutional SSO
                </div>

                <div className="badge-row">
                  {["🔒 256-bit TLS", "🛡️ SOC 2", "✓ HIPAA Ready"].map(b => (
                    <div key={b} className="sec-badge"><span>{b}</span></div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
