export type AppUserRole =
  | "boss"
  | "owner"
  | "admin"
  | "manager"
  | "cashier"
  | "storekeeper"
  | "machine_operator"
  | "customer";

export type StoredUser = {
  id?: number;
  name?: string;
  email: string;
  role: AppUserRole;
};

export const DEFAULT_SUPER_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_MAVUNO_SUPER_ADMIN_EMAIL ?? "admin@mavunoone.co.tz";
export const DEFAULT_SUPER_ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_MAVUNO_SUPER_ADMIN_PASSWORD ?? "Admin@Mavuno2026!";
export const DEFAULT_BOSS_EMAIL =
  process.env.NEXT_PUBLIC_MAVUNO_BOSS_EMAIL ?? "boss@mavunoone.co.tz";
export const DEFAULT_BOSS_PASSWORD =
  process.env.NEXT_PUBLIC_MAVUNO_BOSS_PASSWORD ?? "Boss@Mavuno2026!";

const USER_STORAGE_KEY = "mavunoone-user";

export function writeStoredUser(user: StoredUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function readStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getRoleRedirectPath(role: AppUserRole | string) {
  if (role === "boss") return "/boss";
  if (role === "admin" || role === "owner") return "/office";
  if (role === "manager" || role === "cashier" || role === "storekeeper" || role === "machine_operator") return "/office";
  return "/shop";
}

export function isRoleAllowed(role: AppUserRole | string, allowedRoles: Array<AppUserRole | string>) {
  return allowedRoles.includes(role) || (role === "owner" && allowedRoles.includes("admin"));
}

