export type SqlValue = string | number | boolean | null;
export type QuerySpec = { text: string; values: SqlValue[] };
export type QueryResult = { rows: Record<string, unknown>[]; changes: number };
export type QueryExecutor = (query: QuerySpec) => Promise<QueryResult>;
export type AppResult<T> = { success: true; results: T[]; meta: { changes: number } };
export interface AppStatement {
  bind(...values: unknown[]): AppStatement;
  run<T = Record<string, unknown>>(): Promise<AppResult<T>>;
  all<T = Record<string, unknown>>(): Promise<AppResult<T>>;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
}
export interface AppDatabase { prepare(sql: string): AppStatement }

export class DatabaseUnavailableError extends Error {
  constructor() { super("De databaseverbinding is tijdelijk niet beschikbaar."); this.name = "DatabaseUnavailableError"; }
}

/** Convert only anonymous value placeholders, never occurrences in SQL strings/comments. */
export function postgresQuery(sql: string, values: readonly unknown[]): QuerySpec {
  let text = "";
  let placeholders = 0;
  let index = 0;
  while (index < sql.length) {
    const char = sql[index];
    if (char === "'" || char === '"') {
      const quote = char;
      const escape = quote === "'" && /(?:^|[^A-Za-z0-9_])E$/i.test(sql.slice(0, index));
      const start = index++;
      let closed = false;
      while (index < sql.length) {
        if (escape && sql[index] === "\\") { index += 2; continue; }
        if (sql[index] === quote) {
          if (sql[index + 1] === quote) { index += 2; continue; }
          index++; closed = true; break;
        }
        index++;
      }
      if (!closed) throw new Error("Unclosed SQL quote.");
      text += sql.slice(start, index);
      continue;
    }
    if (sql.startsWith("--", index)) {
      const end = sql.indexOf("\n", index);
      text += sql.slice(index, end < 0 ? sql.length : end);
      index = end < 0 ? sql.length : end;
      continue;
    }
    if (sql.startsWith("/*", index)) {
      const start = index;
      index += 2;
      let depth = 1;
      while (index < sql.length && depth) {
        if (sql.startsWith("/*", index)) { depth++; index += 2; }
        else if (sql.startsWith("*/", index)) { depth--; index += 2; }
        else index++;
      }
      if (depth) throw new Error("Unclosed SQL comment.");
      text += sql.slice(start, index);
      continue;
    }
    if (char === "$") {
      const tag = sql.slice(index).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)?.[0];
      if (tag) {
        const end = sql.indexOf(tag, index + tag.length);
        if (end < 0) throw new Error("Unclosed SQL dollar quote.");
        text += sql.slice(index, end + tag.length);
        index = end + tag.length;
        continue;
      }
      if (/^\$\d/.test(sql.slice(index))) throw new Error("Use anonymous SQL placeholders consistently.");
    }
    if (char === "`") throw new Error("Use standard SQL identifier quotes.");
    if (char === "?") {
      if (/[|&\d]/.test(sql[index + 1] || " ")) throw new Error("Unsupported SQL placeholder or operator.");
      text += `$${++placeholders}`;
    } else text += char;
    index++;
  }
  if (placeholders !== values.length) throw new Error("SQL parameter count does not match placeholders.");
  const bound = values.map(value => {
    if (value === null || typeof value === "string" || typeof value === "boolean") return value;
    if (typeof value === "number" && Number.isFinite(value) && (!Number.isInteger(value) || Number.isSafeInteger(value))) return value;
    throw new Error("Unsupported SQL parameter type.");
  });
  return { text, values: bound };
}

/** Prepared statements are immutable; calling bind twice never changes a pending operation. */
export function createDatabase(execute: QueryExecutor): AppDatabase {
  function statement(sql: string, values: readonly unknown[] = []): AppStatement {
    const perform = () => execute(postgresQuery(sql, values));
    const all = async <T,>(): Promise<AppResult<T>> => {
      const result = await perform();
      return { success: true, results: result.rows as T[], meta: { changes: result.changes } };
    };
    return {
      bind: (...nextValues) => statement(sql, nextValues),
      run: all,
      all,
      first: async <T,>(column?: string) => {
        const row = (await perform()).rows[0];
        return (row ? (column === undefined ? row : row[column] ?? null) : null) as T | null;
      },
    };
  }
  return { prepare: sql => statement(sql) };
}
