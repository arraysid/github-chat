import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid32 } from "../nanoid";
import { users } from "./auth-schema";

export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid32()),
  name: text("name").notNull(),
  url: text("url").notNull(),
  token: text("token"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }).defaultNow().notNull(),
});

export const usersToProjects = pgTable("user_to_project", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid32()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
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
