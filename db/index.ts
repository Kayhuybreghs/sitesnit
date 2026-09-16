// The application uses parameterized queries through its Node/Neon adapter.
// db/schema.ts and old D1 migrations describe the legacy database only.
export { getDatabase as getDb } from '../lib/database';
