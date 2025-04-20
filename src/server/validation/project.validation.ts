import { z } from "zod";

export const projectValidation = z.object({
  projectName: z
    .string({ required_error: "Project name is required" })
    .min(1, "Project name is required"),
  repositoryUrl: z
    .string({ required_error: "Project name is required" })
    .url("Please enter a valid GitHub repository URL"),
  githubToken: z.string().optional(),
});
