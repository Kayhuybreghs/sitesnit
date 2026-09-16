import { DatabaseSync } from "node:sqlite";
import { createDatabase, type QueryExecutor } from "./database-core";
import { sqliteSchema } from "./database-schema";

/** Only for a deliberately enabled local Node preview; never a Vercel storage fallback. */
export function openLocalDatabase(filename: string) {
  if (process.env.VERCEL) throw new Error("Local SQLite is disabled on Vercel.");
  const connection = new DatabaseSync(filename);
  connection.exec("PRAGMA busy_timeout = 5000;");
  if (filename !== ":memory:") connection.exec("PRAGMA journal_mode = WAL;");
  connection.exec(sqliteSchema);
  const execute: QueryExecutor = async ({ text, values }) => {
    const before = connection.prepare("SELECT total_changes() AS n").get() as { n: number };
    // SQLite also accepts numbered $1 placeholders. Bind them by name so repeats remain reliable.
    const bindings = Object.fromEntries(values.map((value, index) => [`$${index + 1}`, typeof value === "boolean" ? Number(value) : value]));
    const rows = connection.prepare(text).all(bindings).map(row => ({ ...row }));
    const after = connection.prepare("SELECT total_changes() AS n").get() as { n: number };
    return { rows, changes: after.n - before.n };
  };
  return { database: createDatabase(execute), execute, close: () => connection.close() };
}
