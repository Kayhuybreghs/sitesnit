import {postgresUrl} from './database-postgres';
import {validNeonUrl} from './database-neon';
import { createDatabase, DatabaseUnavailableError, type QueryExecutor } from "./database-core";

type DatabaseEnvironment = { VERCEL?: string; DATABASE_URL?: string; POSTGRES_URL?: string; SITESNIT_LOCAL_SQLITE?: string };
export function databaseMode(env: DatabaseEnvironment): "neon" | "postgres" | "sqlite" | "unconfigured" {
  if (env.SITESNIT_LOCAL_SQLITE === "true") return env.VERCEL ? "unconfigured" : "sqlite";
  const url=postgresUrl(env);return url?(validNeonUrl(url)?"neon":"postgres"):"unconfigured";
}

let currentKey = "";
let currentExecutor: Promise<QueryExecutor> | undefined;

async function executor(): Promise<QueryExecutor> {
  if (typeof window !== "undefined") throw new DatabaseUnavailableError();
  const mode = databaseMode({ VERCEL: process.env.VERCEL, DATABASE_URL: process.env.DATABASE_URL, POSTGRES_URL:process.env.POSTGRES_URL, SITESNIT_LOCAL_SQLITE: process.env.SITESNIT_LOCAL_SQLITE });
  const url=postgresUrl(process.env);
  const key = mode === "neon"||mode === "postgres" ? mode+":" + url : mode;
  if (mode === "unconfigured") throw new DatabaseUnavailableError();
  if (!currentExecutor || currentKey !== key) {
    currentKey = key;
    currentExecutor = (async () => {
      if (mode === "neon") {
        const { createNeonExecutor } = await import("./database-neon");
        return createNeonExecutor(url!);
      }
      if(mode === "postgres")return (await import("./database-postgres")).createPostgresExecutor(url!);
      const [{ mkdir }, path, { openLocalDatabase }] = await Promise.all([
        import("node:fs/promises"), import("node:path"), import("./database-sqlite"),
      ]);
      // Fixed project-local path: no request/environment-controlled filesystem target.
      const directory = path.resolve(process.cwd(), ".sites-runtime", "storage");
      await mkdir(directory, { recursive: true });
      return openLocalDatabase(path.join(directory, "sitesnit.sqlite")).execute;
    })();
    currentExecutor.catch(() => { currentExecutor = undefined; });
  }
  return currentExecutor;
}

// Creating this facade never connects: public pages still render while production storage is unconfigured.
const database = createDatabase(async query => (await executor())(query));
export function getDatabase() { return database; }
