import { z } from "zod";

export const projectValidation = z.object({
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
