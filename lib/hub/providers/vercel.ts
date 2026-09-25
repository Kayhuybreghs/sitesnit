import { accessToken, number, record, requestJson, result, text, type ProviderDependencies } from "./common";
export type Deployment = { id: string; status: string; createdAt: string; target: "production"; readyAt: string | null };
/** Deployment status is not uptime. Only allowlisted metadata leaves this adapter. */
export async function fetchVercelDeployments(config: { projectId: string; teamId?: string }, deps: ProviderDependencies) {
  const wrap = (data: Deployment[] | null, code?: Parameters<typeof result>[4]) => result("vercel", null, deps, data, code, "UTC", ["Deploymentstatus zegt niet of de website nu bereikbaar is."]);
  if (!/^[\w-]{1,128}$/.test(config.projectId) || (config.teamId && !/^[\w-]{1,128}$/.test(config.teamId))) return wrap(null, "invalid-config");
  const auth = await accessToken(deps);
  if (!auth.token) return wrap(null, auth.code);
  const query = new URLSearchParams({ projectId: config.projectId, target: "production", limit: "10" });
  if (config.teamId) query.set("teamId", config.teamId);
  const response = await requestJson(`https://api.vercel.com/v7/deployments?${query}`, auth.token, deps);
  if (response.code) return wrap(null, response.code);
  try {
    const payload = record(response.json);
    if (!Array.isArray(payload.deployments) || payload.deployments.length > 10) throw new Error("invalid-response");
    const data = payload.deployments.map((raw): Deployment => {
      const row = record(raw);
      if (row.target !== "production" || (row.projectId !== undefined && row.projectId !== config.projectId)) throw new Error("invalid-response");
      const status = text(row.state ?? row.readyState);
      if (!["BUILDING", "ERROR", "INITIALIZING", "QUEUED", "READY", "CANCELED"].includes(status)) throw new Error("invalid-response");
      return { id: text(row.uid ?? row.id), status, createdAt: new Date(number(row.created)).toISOString(), target: "production", readyAt: row.ready === undefined || row.ready === null ? null : new Date(number(row.ready)).toISOString() };
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return wrap(data.length ? data : null, data.length ? undefined : "no-data");
  } catch { return wrap(null, "invalid-response"); }
}
