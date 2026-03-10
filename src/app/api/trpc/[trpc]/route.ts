import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { TRPCContext } from "@/server/trpc";

async function createContext(req: Request): Promise<TRPCContext> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { tenantId: null, userId: null };
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);

  if (!user) {
    return { tenantId: null, userId: null };
  }

  // Buscar tenant_id do profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    tenantId: profile?.tenant_id ?? null,
  };
}

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
  });

export { handler as GET, handler as POST };
