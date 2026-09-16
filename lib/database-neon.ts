import { DatabaseUnavailableError, type QueryExecutor } from "./database-core";

type NeonOptions = { fullResults: true; fetchOptions: { cache: "no-store"; signal: AbortSignal } };
type NeonClient = { query(text: string, values: unknown[], options: NeonOptions): PromiseLike<unknown> };
type NeonFactory = (url: string, options: { fullResults: true }) => NeonClient;

export function validNeonUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ["postgres:", "postgresql:"].includes(url.protocol) &&
      Boolean(url.username && url.password && url.pathname.length > 1) &&
      /\.(neon\.tech|neon\.com)$/.test(url.hostname) && !url.hash;
  } catch { return false; }
}

/** Factory injection is used only in offline tests. Production always uses the official Neon HTTP driver. */
export async function createNeonExecutor(databaseUrl: string, factory?: NeonFactory): Promise<QueryExecutor> {
  if (!validNeonUrl(databaseUrl)) throw new DatabaseUnavailableError();
  const makeClient = factory ?? (await import("@neondatabase/serverless")).neon;
  const client = makeClient(databaseUrl, { fullResults: true });
  return async ({ text, values }) => {
    try {
      const result = await client.query(text, values, {
        fullResults: true,
        fetchOptions: { cache: "no-store", signal: AbortSignal.timeout(10000) },
      }) as { rows?: unknown; rowCount?: unknown; fields?: { name: string; dataTypeID: number }[] };
      if (!result || !Array.isArray(result.rows) || typeof result.rowCount !== "number") throw new DatabaseUnavailableError();
      const integer64Fields = result.fields?.filter(field => field.dataTypeID === 20).map(field => field.name) ?? [];
      const rows = result.rows.map((row: unknown) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) throw new DatabaseUnavailableError();
        const normalized = { ...row } as Record<string, unknown>;
        for (const field of integer64Fields) {
          const value = normalized[field];
          if (typeof value === "string" && /^-?\d+$/.test(value) && Number.isSafeInteger(Number(value))) normalized[field] = Number(value);
        }
        return normalized;
      });
      return { rows, changes: result.rowCount };
    } catch {
      // Provider errors can contain SQL, parameters and connection details. Do not pass them to app responses/logs.
      throw new DatabaseUnavailableError();
    }
  };
}
