import { initTRPC } from "@trpc/server";
import { getSessionUserFromHeader } from "@/lib/session";

export type AppContext = {
  user?: { id?: number; email: string; role: string; name?: string };
};

export const createContext = async (req?: Request): Promise<AppContext> => ({
  user: getSessionUserFromHeader(req?.headers.get("cookie") ?? null) ?? undefined,
});

const t = initTRPC.context<AppContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const user = opts.ctx.user;
  if (!user) throw new Error("Unauthorized");
  return opts.next({ ctx: { user } });
});

const officeRoles = new Set(["admin", "owner", "manager", "cashier", "storekeeper", "machine_operator"]);
const financeRoles = new Set(["admin", "owner", "cashier"]);
export const financeProcedure = t.procedure.use(async (opts) => {
  const user = opts.ctx.user;
  if (!user) throw new Error("Unauthorized");
  if (!financeRoles.has(user.role)) throw new Error("Finance/customer action is not allowed for this role");
  return opts.next({ ctx: { user } });
});
export const officeProcedure = t.procedure.use(async (opts) => {
  const user = opts.ctx.user;
  if (!user) throw new Error("Unauthorized");
  if (!officeRoles.has(user.role)) throw new Error("Office action is not allowed for this role");
  return opts.next({ ctx: { user } });
});
