import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { Context } from "hono";
import superjson from "superjson";
import { auth } from "./lib/auth";

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export const createTRPCContext = async (
  _: FetchCreateContextFnOptions,
  honoCtx: Context,
) => {
  return {
    honoCtx,
  };
};

const t = initTRPC.context<TRPCContext>().create({ transformer: superjson });

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: ctx.honoCtx.req.raw.headers,
  });

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not logged in.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session,
    },
  });
});
