import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/", "/shop", "/shop/account", "/shop/cart", "/shop/order"];

function getUserFromCookie(request: NextRequest) {
  const cookie = request.cookies.get("mavunoone-user");
  if (!cookie?.value) return null;

  try {
    return JSON.parse(cookie.value) as { role?: string };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = getUserFromCookie(request);

  if (pathname.startsWith("/boss")) {
    if (!user || (user.role !== "boss" && user.role !== "admin")) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/office")) {
    if (!user || !["admin", "manager", "cashier", "storekeeper", "machine_operator"].includes(user.role || "")) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/shop") && !publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/boss/:path*", "/office/:path*", "/shop/:path*", "/login"],
};
