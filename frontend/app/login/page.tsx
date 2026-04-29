"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [pass,     setPass]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const [time,     setTime]     = useState("");
  const [successUser, setSuccessUser] = useState({ name: "" });
  const [focused,  setFocused]  = useState<string|null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("rds_user");
    if (raw) router.replace("/");
  }, [router]);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!email || !pass) { setError("Please enter your Employee ID and password."); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials."); setLoading(false); return; }
      sessionStorage.setItem("rds_user", JSON.stringify({ name: data.user.name, role: data.user.role, email: data.user.email }));
      setSuccessUser({ name: data.user.name });
      setLoading(false);
      setSuccess(true);
      setTimeout(() => router.push("/"), 1800);
    } catch {
      setError("Cannot reach server. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Sora',sans-serif;background:#020b1a;min-height:100vh;color:rgba(255,255,255,0.9);}

        .login-root{min-height:100vh;display:flex;position:relative;overflow:hidden;}
        .login-root::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
          background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);
          background-size:72px 72px;}

        .orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0;}
        .orb1{width:700px;height:700px;background:radial-gradient(circle,#2563eb,transparent);top:-250px;left:-250px;opacity:0.14;animation:pulse1 9s ease-in-out infinite;}
        .orb2{width:600px;height:600px;background:radial-gradient(circle,#06b6d4,transparent);bottom:-200px;right:-200px;opacity:0.12;animation:pulse2 11s ease-in-out infinite;}
        .orb3{width:400px;height:400px;background:radial-gradient(circle,#7c3aed,transparent);top:40%;right:30%;opacity:0.08;animation:pulse3 7s ease-in-out infinite;}
        .orb4{width:300px;height:300px;background:radial-gradient(circle,#0891b2,transparent);top:60%;left:20%;opacity:0.07;animation:pulse1 13s ease-in-out infinite;}

        @keyframes pulse1{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}
        @keyframes pulse2{0%,100%{transform:scale(1);}50%{transform:scale(1.12);}}
        @keyframes pulse3{0%,100%{transform:scale(1);}50%{transform:scale(1.2);}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.4;}}
        @keyframes slideIn{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:none;}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes popIn{from{transform:scale(0.4);opacity:0;}to{transform:scale(1);opacity:1;}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}

        /* Left panel */
        .left-panel{flex:1;display:flex;flex-direction:column;justify-content:center;padding:80px 64px;position:relative;z-index:2;}

        .brand-badge{display:inline-flex;align-items:center;gap:10px;background:rgba(37,99,235,0.12);border:1px solid rgba(37,99,235,0.25);border-radius:100px;padding:9px 20px;margin-bottom:52px;width:fit-content;backdrop-filter:blur(8px);}
        .brand-dot{width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 14px rgba(16,185,129,0.9);animation:blink 2s ease-in-out infinite;}
        .brand-badge-text{font-size:11.5px;color:rgba(255,255,255,0.65);font-weight:700;letter-spacing:2px;text-transform:uppercase;}

        .hero-title{font-size:58px;font-weight:900;line-height:1.05;color:#fff;margin-bottom:22px;letter-spacing:-2px;}
        .hero-title em{font-style:normal;background:linear-gradient(135deg,#60a5fa 0%,#06b6d4 50%,#818cf8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200% auto;animation:shimmer 4s linear infinite;}
        .hero-sub{font-size:15.5px;color:rgba(255,255,255,0.45);line-height:1.75;max-width:420px;margin-bottom:60px;font-weight:400;}

        .feature-list{display:flex;flex-direction:column;gap:20px;}
        .feature-item{display:flex;align-items:center;gap:16px;padding:16px 20px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:16px;transition:all 0.3s;cursor:default;}
        .feature-item:hover{background:rgba(255,255,255,0.045);border-color:rgba(255,255,255,0.1);transform:translateX(4px);}
        .feature-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
        .fi-blue{background:rgba(37,99,235,0.2);border:1px solid rgba(37,99,235,0.3);}
        .fi-green{background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.25);}
        .fi-purple{background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3);}
        .fi-cyan{background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.25);}
        .feature-text{font-size:13.5px;color:rgba(255,255,255,0.45);}
        .feature-text strong{color:rgba(255,255,255,0.88);display:block;font-size:14px;font-weight:700;margin-bottom:2px;}

        .left-footer{margin-top:56px;padding-top:28px;border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:12px;}
        .lf-text{font-size:11px;color:rgba(255,255,255,0.2);font-weight:500;letter-spacing:0.5px;}

        /* Divider */
        .panel-divider{position:relative;z-index:2;width:1px;background:linear-gradient(to bottom,transparent,rgba(255,255,255,0.08) 20%,rgba(255,255,255,0.08) 80%,transparent);margin:40px 0;flex-shrink:0;align-self:stretch;}

        /* Right panel */
        .right-panel{width:540px;flex-shrink:0;display:flex;align-items:center;justify-content:center;padding:40px;position:relative;z-index:2;}

        .login-card{width:100%;background:rgba(255,255,255,0.03);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.1);border-radius:28px;padding:48px;box-shadow:0 40px 100px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.08);animation:slideIn 0.65s cubic-bezier(0.23,1,0.32,1) both;}

        .card-logo{display:flex;align-items:center;gap:14px;margin-bottom:32px;}
        .logo-mark{width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,rgba(37,99,235,0.7),rgba(6,182,212,0.5));border:1px solid rgba(59,130,246,0.4);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;box-shadow:0 8px 28px rgba(37,99,235,0.35),inset 0 1px 0 rgba(255,255,255,0.2);}
        .logo-text{font-size:19px;font-weight:800;color:#fff;letter-spacing:-0.4px;}
        .logo-sub{font-size:11.5px;color:rgba(255,255,255,0.35);font-weight:500;margin-top:2px;letter-spacing:0.3px;}

        .card-title{font-size:26px;font-weight:800;color:#fff;margin-bottom:6px;letter-spacing:-0.5px;}
        .card-sub{font-size:13.5px;color:rgba(255,255,255,0.4);}

        .divider-line{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);margin:28px 0;}

        .error-box{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:13px 16px;margin-bottom:20px;display:flex;align-items:center;gap:10px;font-size:13px;color:#fca5a5;animation:fadeIn 0.3s ease;}

        .form-group{margin-bottom:20px;}
        .form-label{font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
        .label-dot{width:5px;height:5px;border-radius:50%;background:#3b82f6;}

        .input-wrap{position:relative;display:flex;align-items:center;}
        .input-icon{position:absolute;left:14px;font-size:15px;pointer-events:none;z-index:1;opacity:0.5;}
        .form-input{width:100%;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:14px;padding:14px 16px 14px 44px;font-size:14px;color:#fff;font-family:'Sora',sans-serif;outline:none;transition:all 0.25s;}
        .form-input::placeholder{color:rgba(255,255,255,0.2);}
        .form-input.focused{background:rgba(59,130,246,0.08);border-color:rgba(59,130,246,0.5);box-shadow:0 0 0 3px rgba(59,130,246,0.1);}
        .form-input.error-field{border-color:rgba(239,68,68,0.5);background:rgba(239,68,68,0.05);}
        .pass-input{padding-right:48px;}
        .eye-btn{position:absolute;right:14px;background:none;border:none;cursor:pointer;font-size:15px;opacity:0.5;transition:opacity 0.2s;padding:4px;}
        .eye-btn:hover{opacity:0.9;}

        .form-extras{display:flex;align-items:center;justify-content:space-between;margin:6px 0 28px;}
        .remember-wrap{display:flex;align-items:center;gap:9px;cursor:pointer;user-select:none;}
        .custom-check{width:18px;height:18px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;color:#10b981;font-weight:700;transition:all 0.2s;flex-shrink:0;}
        .custom-check.checked{background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.5);}
        .remember-label{font-size:12.5px;color:rgba(255,255,255,0.45);font-weight:500;}
        .forgot-link{font-size:12.5px;color:#60a5fa;text-decoration:none;font-weight:600;opacity:0.8;transition:opacity 0.2s;}
        .forgot-link:hover{opacity:1;}

        .btn-login{width:100%;padding:15px;border-radius:14px;font-size:15px;font-weight:700;font-family:'Sora',sans-serif;background:linear-gradient(135deg,#2563eb 0%,#0891b2 100%);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 10px 32px rgba(37,99,235,0.4),inset 0 1px 0 rgba(255,255,255,0.15);transition:all 0.25s;letter-spacing:0.2px;position:relative;overflow:hidden;}
        .btn-login::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.1),transparent);opacity:0;transition:opacity 0.25s;}
        .btn-login:hover:not(:disabled)::before{opacity:1;}
        .btn-login:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 14px 40px rgba(37,99,235,0.5);}
        .btn-login:active:not(:disabled){transform:translateY(0);}
        .btn-login:disabled{opacity:0.7;cursor:wait;}
        .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;flex-shrink:0;}

        .badge-row{display:flex;gap:8px;justify-content:center;margin-top:24px;flex-wrap:wrap;}
        .sec-badge{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:100px;padding:5px 12px;}
        .sec-badge span{font-size:10px;color:rgba(255,255,255,0.25);font-weight:600;letter-spacing:0.3px;}

        .success-state{text-align:center;display:flex;flex-direction:column;align-items:center;gap:18px;padding:24px 0;}
        .success-icon{width:72px;height:72px;border-radius:50%;background:rgba(16,185,129,0.12);border:2px solid rgba(16,185,129,0.4);display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 0 50px rgba(16,185,129,0.25);animation:popIn 0.5s cubic-bezier(0.23,1,0.32,1) both;}
        .success-title{font-size:22px;font-weight:800;color:#fff;}
        .success-sub{font-size:13px;color:rgba(255,255,255,0.45);font-family:'JetBrains Mono',monospace;}

        @media(max-width:900px){.left-panel,.panel-divider{display:none;}.right-panel{width:100%;padding:20px;}}
      `}</style>

      <div className="login-root">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
        <div className="orb orb4" />

        {/* ── Left panel ── */}
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
              { icon:"🏥", cls:"fi-blue",   title:"Multi-Department RDS",       desc:"Centralized room data across all clinical departments" },
              { icon:"🤖", cls:"fi-cyan",   title:"AI-Powered Auto-Fill",       desc:"Extract fields instantly from Word & Excel documents" },
              { icon:"📊", cls:"fi-green",  title:"Excel & PDF Export",         desc:"One-click exports saved to cloud storage automatically" },
              { icon:"🔐", cls:"fi-purple", title:"Employee-Verified Access",   desc:"Secure login verified against your payroll database" },
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
          <div className="left-footer">
            <div className="lf-text">© 2026 Medical College · RDS System v4.0 · All rights reserved</div>
          </div>
        </aside>

        <div className="panel-divider" />

        {/* ── Right panel ── */}
        <div className="right-panel">
          <div className="login-card">

            {success ? (
              <div className="success-state">
                <div className="success-icon">✓</div>
                <div className="success-title">Access Granted</div>
                <div className="success-sub">{successUser.name} — Redirecting to dashboard…</div>
              </div>
            ) : (
              <>
                <div className="card-logo">
                  <div className="logo-mark">R</div>
                  <div>
                    <div className="logo-text">RDS System</div>
                    <div className="logo-sub">Medical College · Secure Portal</div>
                  </div>
                </div>

                <div className="card-title">Welcome back</div>
                <div className="card-sub">Sign in with your employee credentials</div>

                <div className="divider-line" />

                {error && <div className="error-box"><span>⚠</span> {error}</div>}

                {/* Employee ID */}
                <div className="form-group">
                  <div className="form-label"><div className="label-dot" /> Employee ID</div>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      className={`form-input${focused === "email" ? " focused" : ""}${error && !email ? " error-field" : ""}`}
                      placeholder="Enter your employee ID"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
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
                      className={`form-input pass-input${focused === "pass" ? " focused" : ""}${error && !pass ? " error-field" : ""}`}
                      placeholder="Enter your secure password"
                      value={pass}
                      onChange={e => { setPass(e.target.value); setError(""); }}
                      onFocus={() => setFocused("pass")}
                      onBlur={() => setFocused(null)}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                    />
                    <button className="eye-btn" onClick={() => setShowPass(p => !p)} type="button">
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div className="form-extras">
                  <div className="remember-wrap" onClick={() => {}}>
                    <div className="custom-check checked">✓</div>
                    <span className="remember-label">Keep me signed in</span>
                  </div>
                  <a className="forgot-link" href="#">Forgot password?</a>
                </div>

                <button className="btn-login" onClick={handleLogin} disabled={loading}>
                  {loading && <div className="spinner" />}
                  {loading ? "Authenticating…" : "Sign In to RDS System →"}
                </button>

                <div className="badge-row">
                  {["🔒 256-bit TLS", "🛡️ SOC 2", "✓ HIPAA Ready", "☁️ Cloud Secured"].map(b => (
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
