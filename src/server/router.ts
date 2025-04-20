import { createRouter } from "better-call";
import * as hello from "./controllers/hello.controller";
import * as projects from "./controllers/project.controller";

export const router = createRouter({
  ...hello,
  ...projects,
});

export type APIRouter = typeof router;
