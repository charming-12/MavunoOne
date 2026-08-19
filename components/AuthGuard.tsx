"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearStoredUser, isRoleAllowed, writeStoredUser } from "@/lib/auth";

export function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Array<string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const allowedRolesKey = allowedRoles.join("|");

  useEffect(() => {
    let cancelled = false;
    const verifyLiveSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { method: "GET", cache: "no-store", credentials: "include" });
        if (!response.ok) throw new Error("SESSION_EXPIRED");
        const payload = await response.json() as { user?: { id?: number; name?: string; email: string; role: string } };
        const currentUser = payload.user;
        if (!currentUser || !isRoleAllowed(currentUser.role, allowedRolesKey.split("|"))) {
          throw new Error("ROLE_NOT_ALLOWED");
        }
        if (!cancelled) {
          writeStoredUser(currentUser as Parameters<typeof writeStoredUser>[0]);
          setReady(true);
        }
      } catch {
        if (cancelled) return;
        clearStoredUser();
        setReady(false);
        router.replace("/login");
      }
    };
    void verifyLiveSession();
    return () => { cancelled = true; };
  }, [allowedRolesKey, pathname, router]);

  if (!ready) {
    return <div className="flex min-h-[240px] items-center justify-center bg-transparent"><p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">Inathibitisha session...</p></div>;
  }

  return <>{children}</>;
}
