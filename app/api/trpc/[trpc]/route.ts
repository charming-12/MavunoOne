import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers";
import { createContext } from "@/server/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createContext(),
    onError({ error, path }) {
      console.error(`❌ tRPC failed on ${path ?? "<unknown>"}:`, error);
    },
  });

export { handler as GET, handler as POST };
