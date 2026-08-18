import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers";
import { createContext } from "@/server/trpc";
import { refreshSessionToken, getSessionTokenFromHeader } from "@/lib/session";

const handler = async (req: Request) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createContext(req),
    onError({ error, path }) {
      console.error(`❌ tRPC failed on ${path ?? "<unknown>"}:`, error);
    },
  });
  const refreshedToken = refreshSessionToken(getSessionTokenFromHeader(req.headers.get("cookie")));
  if (refreshedToken) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    response.headers.append("Set-Cookie", `mavunoone-user=${encodeURIComponent(refreshedToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 8}${secure}`);
  }
  return response;
};

export { handler as GET, handler as POST };
