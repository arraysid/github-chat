import { projectRouter } from "./controllers/project.controller";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  projects: projectRouter,
});

export type AppRouter = typeof appRouter;
