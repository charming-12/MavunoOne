"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearStoredUser, getRoleRedirectPath, isRoleAllowed, readStoredUser } from "@/lib/auth";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentUser = readStoredUser();

      if (!currentUser) {
        clearStoredUser();
        router.replace("/login");
        setReady(false);
        return;
      }

      if (!isRoleAllowed(currentUser.role, allowedRoles)) {
        const redirectPath = getRoleRedirectPath(currentUser.role);
        if (pathname !== redirectPath) {
          router.replace(redirectPath);
        }
        setReady(false);
        return;
      }

      setReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [allowedRoles, pathname, router]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
