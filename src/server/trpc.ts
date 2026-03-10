import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { supabaseAdmin } from "@/lib/supabase/server";

export interface TRPCContext {
  tenantId: string | null;
  userId: string | null;
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
export { supabaseAdmin };
