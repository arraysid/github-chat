import { db } from "../lib/database";
import { findManyCommitByProjectId } from "../repositories/commit.repository";
import {
  findAllProjectsByUserId,
  insertOneProject,
} from "../repositories/project.repository";
import { indexGithubRepo, pollCommits } from "../services/github.service";
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
      const data = await findAllProjectsByUserId(userId);
      return data;
    }),

  create: protectedProcedure
    .input(createProjectInputValidation)
    .output(createProjectOutputValidation)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userGithubAccessToken = ctx.session.user.github_access_token;
      const { name, url, token } = input;

      const project = await db.transaction(async (tx) => {
        return await insertOneProject({ name, url, token, userId }, tx);
      });

      await indexGithubRepo(
        project.id,
        url,
        token || userGithubAccessToken || "",
      );
      await pollCommits(project.id);

      return project;
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
