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
      try {
        console.log("Polling commits...");
        const [_, commits] = await Promise.allSettled([
          pollCommits(input.projectId),
          findManyCommitByProjectId(input.projectId),
        ]).then((results) => {
          const pollResult = results[0];
          const commitResult = results[1];

          if (pollResult.status === "rejected") {
            console.error("Error polling commits:", pollResult.reason);
          }

          if (commitResult.status === "fulfilled") {
            return [
              pollResult.status === "rejected" ? pollResult.reason : null,
              commitResult.value,
            ];
          } else {
            throw new Error("Failed to fetch commits.");
          }
        });

        console.log("Polling commits completed successfully.");
        return commits;
      } catch (error) {
        console.error("Error fetching commits:", error);
        throw new Error("Failed to fetch commits.");
      }
    }),
});
