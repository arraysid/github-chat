import { createRouter } from "better-call";
import { hello } from "./controller/hello.controller";

export const router = createRouter({
  hello,
});

export type APIRouter = typeof router;
