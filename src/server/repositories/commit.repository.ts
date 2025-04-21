import { eq } from "drizzle-orm";
import { Db, db, Tx } from "../lib/database";
import { commits } from "../lib/database/schema";

export async function findManyCommitByProjectId(
  projectId: string,
  txOrDb: Db | Tx = db,
) {
  const data = await txOrDb
    .select()
    .from(commits)
    .where(eq(commits.projectId, projectId));

  return data;
}
