import { initTRPC } from "@trpc/server";

export type AppContext = {
  user?: { id?: number };
};

export const t = initTRPC.context<AppContext>().create();

// NOTE: Full NextAuth.js integration is still pending (see PROJECT_COMPLETE.md
// "Next Steps"). Login currently only stores a user in localStorage on the
// client, so there is no real server-side session yet. Until real auth is
// wired up, default every request to a system user (id: 1) so
// `protectedProcedure` doesn't reject every mutation (sales, SMS, payments,
// etc.) with "Unauthorized". Replace this with real session lookup once
// NextAuth (or another auth provider) is added.
export const createContext = async (): Promise<AppContext> => ({
  user: { id: 1 },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const user = opts.ctx.user;

  if (!user) {
    throw new Error("Unauthorized");
  }

  return opts.next({
    ctx: { user },
  });
});
