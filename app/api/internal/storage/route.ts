import { runtime } from "../../../../lib/runtime";
import { storageResponse } from "../../../../lib/retention";

export const dynamic = "force-dynamic";
export const maxDuration = 30;
export async function GET(request: Request) {
  const { DB, CRON_SECRET } = runtime();
  return storageResponse(request, DB, CRON_SECRET);
}
