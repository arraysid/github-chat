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
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
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
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const commits = pgTable("commits", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid32()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  commitMessage: text("commit_message").notNull(),
  commitHash: text("commit_hash").notNull(),
  commitAuthorName: text("commit_author_name").notNull(),
  commitAuthorAvatar: text("commit_author_avatar").notNull(),
  commitDate: timestamp("commit_date", { withTimezone: true }).notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export * from "./auth-schema";
