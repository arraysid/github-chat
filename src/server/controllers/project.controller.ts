import { createEndpoint } from "better-call";
import { eq } from "drizzle-orm";
import { db } from "../lib/database";
import { projects, usersToProjects } from "../lib/database/schema";
import { authMiddleware } from "../middlewares";

export const getAllProject = createEndpoint(
  "/api/projects",
  {
    method: "GET",
    use: [authMiddleware],
  },
  async (ctx) => {
    const userId = ctx.context.session.user.id;

    const data = await db
      .select({
        projects,
      })
      .from(usersToProjects)
      .innerJoin(projects, eq(usersToProjects.projectId, projects.id))
      .where(eq(usersToProjects.userId, userId));

    return {
      data: data.map((row) => row.projects),
    };
  },
);
