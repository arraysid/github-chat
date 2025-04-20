import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const projects = pgTable("projects", {
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

export const usersRelations = relations(users, ({ many }) => ({
  userToProjects: many(usersToProjects),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  userToProjects: many(usersToProjects),
}));

export const usersToProjectsRelations = relations(
  usersToProjects,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToProjects.userId],
      references: [users.id],
    }),
    project: one(projects, {
      fields: [usersToProjects.projectId],
      references: [projects.id],
    }),
  }),
);

export * from "./auth-schema";
