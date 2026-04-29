/**
 * auth.ts — Lightweight auth utilities for the RDS system.
 *
 * Replace the mock implementations with real JWT / session logic
 * once you wire up a backend.
 */

export type Role = "admin" | "reviewer" | "planner" | "viewer";

export interface RDSUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatarInitial?: string;
}

/* ── Permissions map ─────────────────────────────────────────── */
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin:    ["view", "create", "edit", "delete", "export", "manage_users"],
  reviewer: ["view", "create", "edit", "export"],
  planner:  ["view", "create", "edit"],
  viewer:   ["view"],
};

export function hasPermission(user: RDSUser, action: string): boolean {
  return ROLE_PERMISSIONS[user.role]?.includes(action) ?? false;
}

/* ── Session helpers (sessionStorage — swap for HttpOnly cookie) ─ */
const SESSION_KEY = "rds_session";

export function saveSession(user: RDSUser): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): RDSUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as RDSUser) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/* ── API call stub ───────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function loginWithCredentials(
  email: string,
  password: string,
  role: Role
): Promise<{ user: RDSUser } | { error: string }> {
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body?.message ?? "Authentication failed." };
    }
    const data = await res.json();
    return { user: data.user as RDSUser };
  } catch {
    return { error: "Network error. Please check your connection." };
  }
}

export async function logoutUser(): Promise<void> {
  clearSession();
  try { await fetch(`${API}/auth/logout`, { method: "POST" }); } catch { /* silent */ }
}
