import "server-only";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "./schema";

const DEFAULT_DB_PATH = "./data/dashboard.db";

function resolveDbPath(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return DEFAULT_DB_PATH;
  return url.startsWith("file:") ? url.slice("file:".length) : url;
}

function createConnection() {
  const path = resolveDbPath();
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

type DrizzleDb = ReturnType<typeof createConnection>;

declare global {
  var __dashboardDb: DrizzleDb | undefined;
}

export const db: DrizzleDb = globalThis.__dashboardDb ?? createConnection();
if (process.env.NODE_ENV !== "production") globalThis.__dashboardDb = db;

export { schema };
