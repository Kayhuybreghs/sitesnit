import { runtime } from "../../../../lib/runtime";
import { retentionResponse } from "../../../../lib/retention";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  const { DB, CRON_SECRET } = runtime();
  return retentionResponse(request, DB, CRON_SECRET);
}
export const POST = GET;
