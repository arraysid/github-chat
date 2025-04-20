import { z } from "zod";

export const projectValidation = z.object({
  name: z
    .string({ required_error: "Project name is required" })
    .min(1, "Project name is required"),
  url: z
    .string({ required_error: "Project name is required" })
    .url("Please enter a valid GitHub repository URL"),
  token: z.string().optional(),
});
