import { eq } from "drizzle-orm";
import { db } from "../lib/database";
import { projects, usersToProjects } from "../lib/database/schema";
import { findManyCommitByProjectId } from "../repositories/commit.repository";
import { pollCommits } from "../services/github.service";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createProjectInputValidation,
  createProjectOutputValidation,
  getAllCommitsInputValidation,
  getAllCommitsOutputValidation,
  getAllProjectOutputValidation,
} from "../validation/project.validation";

export const projectRouter = createTRPCRouter({
  getAll: protectedProcedure
    .output(getAllProjectOutputValidation)
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const data = await db
        .select({ projects })
        .from(usersToProjects)
        .innerJoin(projects, eq(usersToProjects.projectId, projects.id))
        .where(eq(usersToProjects.userId, userId));

      return data.map((row) => row.projects);
    }),

  create: protectedProcedure
    .input(createProjectInputValidation)
    .output(createProjectOutputValidation)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { name, url, token } = input;

      const data = await db.transaction(async (tx) => {
        const [insertedProject] = await tx
          .insert(projects)
          .values({ name, url, token })
          .returning();

        await tx.insert(usersToProjects).values({
          userId,
          projectId: insertedProject.id,
        });

        return insertedProject;
      });

      await pollCommits(data.id);

      return data;
    }),

  getAllCommits: protectedProcedure
    .input(getAllCommitsInputValidation)
    .output(getAllCommitsOutputValidation)
    .query(async ({ input }) => {
      const data = await findManyCommitByProjectId(input.projectId);
      return data;
    }),
});
