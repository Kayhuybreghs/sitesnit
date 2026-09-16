import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL ontbreekt; de migratie is niet gestart.");
const source = await readFile(new URL("../db/postgres/0001_sitesnit.sql", import.meta.url), "utf8");
const statements = source.split(/;\s*(?:\r?\n|$)/).map(sql => sql.trim()).filter(Boolean);
try {
  const sql = neon(url);
  await sql.transaction(statements.map(statement => sql.query(statement)), {
    fetchOptions: { cache: "no-store", signal: AbortSignal.timeout(30000) },
  });
  console.log("Sitesnit PostgreSQL-schema en retentie-indexen zijn gereed.");
} catch {
  throw new Error("De PostgreSQL-migratie is niet afgerond. Controleer de verbinding en databaserechten.");
}
