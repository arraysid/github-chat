import { Hono } from "hono";
import { auth } from "./lib/auth";

export const api = new Hono().basePath("/api");

api.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

api.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});
