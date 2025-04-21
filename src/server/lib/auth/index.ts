import * as schema from "@/server/lib/database/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "../database";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  advanced: {
    cookies: {
      session_token: {
        name: "__sess_arraysid__",
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const [account] = await db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.userId, user.id));

      return {
        user: {
          ...user,
          github_access_token: account?.accessToken,
        },
        session,
      };
    }),
  ],
});
