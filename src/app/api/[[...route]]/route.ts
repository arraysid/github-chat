import { api } from "@/server";
import { handle } from "hono/vercel";

export const runtime = "nodejs";

export const GET = handle(api);
export const PUT = handle(api);
export const POST = handle(api);
export const DELETE = handle(api);
