import { type APIRouter } from "@/server/router";
import { createClient } from "better-call/client";

export const apiClient = createClient<APIRouter>({
  baseURL: process.env.NEXT_PUBLIC_BASEURL!,
});
