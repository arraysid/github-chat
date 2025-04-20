import { eq } from "drizzle-orm";
import { db } from "../lib/database";
import { commits } from "../lib/database/schema";

export async function findManyCommitByProjectId(projectId: string, tx = db) {
  const data = await tx
    .select()
    .from(commits)
    .where(eq(commits.projectId, projectId));

  return data;
}
