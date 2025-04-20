import { eq } from "drizzle-orm";
import { db } from "../lib/database";
import { projects } from "../lib/database/schema";

export async function findOneGithubUrlByProjectId(projectId: string, tx = db) {
  const [data] = await tx
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return data.url;
}
