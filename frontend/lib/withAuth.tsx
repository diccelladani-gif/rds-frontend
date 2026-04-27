"use client";
/**
 * withAuth.tsx — Wrap any page component with this HOC to require authentication.
 *
 * Usage:
 *   export default withAuth(MyPage);
 *
 * Or with role restriction:
 *   export default withAuth(AdminPage, ["admin"]);
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, type Role, type RDSUser } from "./auth";

export function withAuth<P extends object>(
  Component: React.ComponentType<P & { currentUser: RDSUser }>,
  allowedRoles?: Role[]
) {
  return function AuthGuard(props: P) {
    const router = useRouter();
    const [user, setUser] = useState<RDSUser | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const session = getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      if (allowedRoles && !allowedRoles.includes(session.role)) {
        router.replace("/unauthorized");
        return;
      }
      setUser(session);
      setChecking(false);
    }, [router]);

    if (checking) {
      return (
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"center",
          minHeight:"100vh",background:"#020b1a",
          fontFamily:"'Sora',sans-serif",
        }}>
          <div style={{ textAlign:"center" }}>
            <div style={{
              width:40,height:40,border:"2px solid rgba(255,255,255,0.1)",
              borderTopColor:"#2563eb",borderRadius:"50%",
              animation:"spin 0.7s linear infinite",margin:"0 auto 16px",
            }} />
            <p style={{ color:"rgba(255,255,255,0.4)",fontSize:13 }}>Verifying access…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
          </div>
        </div>
      );
    }

    return <Component {...props} currentUser={user!} />;
  };
}
