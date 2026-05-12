import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const url = process.env.DATABASE_URL ?? "file:./data/dashboard.db";
const path = url.startsWith("file:") ? url.slice("file:".length) : url;
mkdirSync(dirname(path), { recursive: true });

const sqlite = new Database(path);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: "./src/lib/db/migrations" });
console.log(`Migrated database at ${path}`);
sqlite.close();
