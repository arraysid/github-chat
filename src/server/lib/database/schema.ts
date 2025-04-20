import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const projects = pgTable("project", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  githubUrl: text("github_url").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const usersToProjects = pgTable("user_to_project", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export * from "./auth-schema";
