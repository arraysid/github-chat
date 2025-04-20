import { Hono } from "hono";

export const api = new Hono().basePath("/api");

api.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});
