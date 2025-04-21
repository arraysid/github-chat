import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { appRouter } from "./_app";
import { auth } from "./lib/auth";
import { createTRPCContext } from "./trpc";

export const api = new Hono().basePath("/api");

api.on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw));

api.use(
  "/procedures/*",
  trpcServer({
    router: appRouter,
    endpoint: "/api/procedures",
    createContext: createTRPCContext,
  }),
);
