import { z } from "zod";

export const getAllProjectOutputValidation = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
  }),
);

export const createProjectInputValidation = z.object({
  name: z
    .string({ required_error: "Project name is required" })
    .min(1, "Project name is required"),
  url: z
    .string({ required_error: "Project URL is required" })
    .regex(
      /^https:\/\/(www\.)?github\.com(\/.*)?$/,
      "Please enter a valid GitHub URL",
    ),
  token: z.string().optional(),
});

export const createProjectOutputValidation = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
});

export const getAllCommitsInputValidation = z.object({ projectId: z.string() });

export const getAllCommitsOutputValidation = z.array(
  z.object({
    id: z.string(),
    projectId: z.string(),
    commitMessage: z.string(),
    commitHash: z.string(),
    commitAuthorName: z.string(),
    commitAuthorAvatar: z.string(),
    commitDate: z.date(),
  }),
);
