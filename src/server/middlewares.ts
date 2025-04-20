import { createMiddleware } from "better-call";
import { auth } from "./lib/auth";
import { throwHttpError } from "./lib/http/errors";

export const authMiddleware = createMiddleware(async (ctx) => {
  if (!ctx.headers) {
    throwHttpError(ctx, "UNAUTHORIZED", "Not allowed to modify resources");
  }

  const session = await auth.api.getSession({
    headers: ctx.headers,
  });

  if (!session) {
    throwHttpError(ctx, "UNAUTHORIZED", "Not allowed to modify resources");
  }

  return {
    session,
  };
});
