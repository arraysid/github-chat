import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!);

export type Db = typeof db;
export type Tx = Parameters<Db["transaction"]>[0] extends (tx: infer T) => any
  ? T
  : never;
