import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/", "/shop", "/shop/account", "/shop/cart", "/shop/order"];

/**
 * Security headers to add to all responses
 */
const SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking attacks
  "X-Frame-Options": "SAMEORIGIN",
  // Enable browser XSS protection
  "X-Content-Type-Options": "nosniff",
  // Prevent MIME type sniffing
  "X-XSS-Protection": "1; mode=block",
  // Control how referrer info is shared
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Control which features can be used in the browser
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

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

  let response: NextResponse;

  if (pathname.startsWith("/boss")) {
    if (!user || (user.role !== "boss" && user.role !== "admin")) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    response = NextResponse.next();
  } else if (pathname.startsWith("/office")) {
    if (!user || !["admin", "manager", "cashier", "storekeeper", "machine_operator"].includes(user.role || "")) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    response = NextResponse.next();
  } else if (pathname.startsWith("/shop") && !publicRoutes.includes(pathname)) {
    response = NextResponse.next();
  } else {
    response = NextResponse.next();
  }

  // Add security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add CSP header (Content Security Policy)
  const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: ["/boss/:path*", "/office/:path*", "/shop/:path*", "/login"],
};
