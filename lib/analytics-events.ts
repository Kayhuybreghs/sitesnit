import { safeAnalyticsPage, type AnalyticsPage } from './consent';

export const TOOL_IDS = ['websitecheck', 'prijscheck', 'offertevergelijker', 'automatiseringsplan', 'ontwerp_website', 'seo_audit', 'snelheidstest'] as const;
export type ToolId = typeof TOOL_IDS[number];
export const ACTION_IDS = ['contact_open', 'prices_view', 'projects_view', 'tools_view', 'tool_open', 'discuss_result'] as const;
export type ActionId = typeof ACTION_IDS[number];
export type PublicAnalyticsEvent = { name: 'tool_start' | 'tool_complete'; tool_id: ToolId } |
  { name: 'cta_click'; action_id: ActionId; tool_id?: ToolId } |
  { name:'generate_lead'|'form_start'; form_id:'contact'|'tool_contact'; tool_id?:ToolId } |
  { name:'contact_intent'; channel:'email'|'phone'|'whatsapp' };
export const ANALYTICS_TOOL_PATHS: Record<string, ToolId> = {
  '/tools/snelheidstest':'snelheidstest',
  '/tools/website-check': 'websitecheck', '/tools/website-kosten-berekenen': 'prijscheck',
  '/tools/website-offerte-vergelijken': 'offertevergelijker', '/tools/automatiseringsplan': 'automatiseringsplan',
  '/tools/website-ontwerp-tool': 'ontwerp_website', '/tools/seo-audit':'seo_audit',
};
type Runtime = { expiresAt: number; href: () => string; publicPaths: readonly string[];
  send: (name: PublicAnalyticsEvent['name'], params: Record<string, string> & AnalyticsPage) => void };
let runtime: Runtime | null = null;

/** Installed only by the existing explicit-consent lifecycle. No queue or new storage. */
export function setPublicAnalyticsRuntime(next: Runtime | null) { runtime = next; }

export function analyticsEventPayload(value: unknown): { name: PublicAnalyticsEvent['name']; params: Record<string, string> } | null {
  if (!value || typeof value !== 'object') return null;
  const event = value as Record<string, unknown>;
  const tool = typeof event.tool_id === 'string' && TOOL_IDS.includes(event.tool_id as ToolId) ? event.tool_id as ToolId : null;
  if(event.name==='generate_lead'||event.name==='form_start'){
    if(!['contact','tool_contact'].includes(String(event.form_id)) || (event.tool_id!==undefined&&!tool)) return null;
    return {name:event.name,params:{form_id:String(event.form_id),...(tool?{tool_id:tool}:{})}};
  }
  if(event.name==='contact_intent') return ['email','phone','whatsapp'].includes(String(event.channel)) ? {name:'contact_intent',params:{channel:String(event.channel)}} : null;
  if (event.name === 'tool_start' || event.name === 'tool_complete') {
    return tool ? { name: event.name, params: { tool_id: tool } } : null;
  }
  if (event.name !== 'cta_click' || !ACTION_IDS.includes(event.action_id as ActionId)) return null;
  if (event.tool_id !== undefined && !tool) return null;
  return { name: 'cta_click', params: { action_id: event.action_id as ActionId, ...(tool ? {tool_id: tool} : {}) } };
}

export function trackPublicEvent(event: PublicAnalyticsEvent): boolean {
  try {
    if (!runtime || Date.now() >= runtime.expiresAt) return false;
    const payload = analyticsEventPayload(event);
    const href = runtime.href();
    const page = safeAnalyticsPage(href, runtime.publicPaths);
    if (!payload || !page) return false;
    runtime.send(payload.name, { ...payload.params, ...page });
    return true;
  } catch { return false; } // Analytics must never prevent use of a tool.
}

/** One start/completion per mounted run, not per render, answer change or back button. */
export function createToolEventTracker(tool_id: ToolId) {
  let started = false, completed = false;
  return {
    start() { if (!started) { started = true; trackPublicEvent({name:'tool_start', tool_id}); } },
    complete() { if (!completed) { completed = true; trackPublicEvent({name:'tool_complete', tool_id}); } },
    reset() { started = false; completed = false; },
  };
}

/** First meaningful form change only. Starting before consent is never replayed later. */
export function createFormEventTracker(form_id: 'contact'|'tool_contact') {
  let started = false;
  return { start(tool_id?: ToolId) {
    if (started) return;
    started = true;
    trackPublicEvent({ name: 'form_start', form_id, ...(tool_id ? {tool_id} : {}) });
  } };
}

/** Fixed destinations only. Text, queries, form content and external destinations never become parameters. */
export function publicCtaForLink(href: string, currentHref: string): PublicAnalyticsEvent | null {
  try {
    const current = new URL(currentHref), target = new URL(href, current);
    const channel = target.protocol==='mailto:'&&target.pathname.toLowerCase()==='contact@sitesnit.nl' ? 'email' :
      target.protocol==='tel:'&&target.pathname==='+31639430197' ? 'phone' :
      target.origin==='https://wa.me'&&target.pathname==='/31639430197' ? 'whatsapp' : null;
    if(channel) return {name:'contact_intent',channel};
    if (target.origin !== current.origin || !['http:', 'https:'].includes(target.protocol)) return null;
    const sourceTool = ANALYTICS_TOOL_PATHS[current.pathname];
    if (target.pathname === current.pathname && ['#ontwerp-bespreken', '#bespreken', '#audit-bespreken'].includes(target.hash)) {
      return sourceTool ? {name:'cta_click', action_id:'discuss_result', tool_id:sourceTool} : null;
    }
    if (target.pathname === current.pathname) return null;
    const tool = ANALYTICS_TOOL_PATHS[target.pathname];
    if (tool) return {name:'cta_click', action_id:'tool_open', tool_id:tool};
    const action = ({'/contact':'contact_open', '/kosten':'prices_view', '/projecten':'projects_view', '/tools':'tools_view'} as const)[target.pathname as '/contact'];
    return action ? {name:'cta_click', action_id:action, ...(sourceTool ? {tool_id:sourceTool} : {})} : null;
  } catch { return null; }
}
