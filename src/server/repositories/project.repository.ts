import { eq } from "drizzle-orm";
import { z } from "zod";
import { Db, db, Tx } from "../lib/database";
import { projects, usersToProjects } from "../lib/database/schema";
import { createProjectInputValidation } from "../validation/project.validation";

export async function findAllProjectsByUserId(
  userId: string,
  txOrDb: Db | Tx = db,
) {
  const data = await txOrDb
    .select({ projects })
    .from(usersToProjects)
    .innerJoin(projects, eq(usersToProjects.projectId, projects.id))
    .where(eq(usersToProjects.userId, userId));
  return data.map((row) => row.projects);
}

export async function findOneGithubUrlByProjectId(
  projectId: string,
  txOrDb: Db | Tx = db,
) {
  const [data] = await txOrDb
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return data.url;
}

export async function insertOneProject(
  values: z.infer<typeof createProjectInputValidation> & { userId: string },
  txOrDb: Db | Tx = db,
) {
  const [insertedProject] = await txOrDb
    .insert(projects)
    .values(values)
    .returning();
  await txOrDb.insert(usersToProjects).values({
    userId: values.userId,
    projectId: insertedProject.id,
  });
  return insertedProject;
}
