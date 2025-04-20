import { Hono } from "hono";
import { auth } from "./lib/auth";
import { router } from "./router";

export const api = new Hono().basePath("/api");

api.on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw));

api.on(["POST", "GET", "PUT", "DELETE"], "/*", (c) =>
  router.handler(c.req.raw),
);
