import { createEndpoint } from "better-call";
import { eq } from "drizzle-orm";
import { db } from "../lib/database";
import { projects, usersToProjects } from "../lib/database/schema";
import { authMiddleware } from "../middlewares";
import { pollCommits } from "../services/github.service";
import { projectValidation } from "../validation/project.validation";

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

export const createProject = createEndpoint(
  "/api/projects",
  {
    method: "POST",
    use: [authMiddleware],
    body: projectValidation,
  },
  async (ctx) => {
    const userId = ctx.context.session.user.id;
    const { name, url, token } = ctx.body;

    const project = await db.transaction(async (tx) => {
      const [inseredProject] = await tx
        .insert(projects)
        .values({ name, url, token })
        .returning();

      await tx.insert(usersToProjects).values({
        userId,
        projectId: inseredProject.id,
      });

      return inseredProject;
    });

    await pollCommits(project.id);

    return { data: project };
  },
);
