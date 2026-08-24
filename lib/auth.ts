export type AppUserRole =
  | "admin"
  | "boss"
  | "owner"
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
  jobTitle?: string | null;
  canPublishCatalog?: boolean;
};

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
  if (["manager", "cashier", "storekeeper", "machine_operator"].includes(role)) return "/office";
  return "/shop";
}

export function isRoleAllowed(role: AppUserRole | string, allowedRoles: Array<AppUserRole | string>) {
  return allowedRoles.includes(role) || (role === "owner" && allowedRoles.includes("admin"));
}
