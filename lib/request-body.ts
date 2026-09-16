/** Limit bytes while reading, including chunked requests without Content-Length. */
export class RequestBodyError extends Error {
  constructor(message: string, public readonly status: 400 | 403 | 413) { super(message); this.name = 'RequestBodyError'; }
}
export async function readObjectBody(request: Request, max: number) {
  if (Number(request.headers.get('content-length') ?? 0) > max)
    throw new RequestBodyError('Je aanvraag is te groot.', 413);
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > max) {
          await reader.cancel();
          throw new RequestBodyError('Je aanvraag is te groot.', 413);
        }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new RequestBodyError('De aanvraag kon niet worden gelezen.', 400); }
}
