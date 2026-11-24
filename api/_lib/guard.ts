/**
 * Shared hardening + instrumentation for the Node-runtime API functions.
 *
 * Lives under api/_lib/ so Vercel does NOT deploy it as a function
 * (underscore paths are skipped; the plan caps the function count).
 *
 *   export default guard('chat', { methods: ['POST'], rate: {limit: 30, windowMs: 60_000} },
 *     async (req, res, ctx) => { ... await upstream(ctx, url, init, 55_000) ... });
 *
 * What it does for every request:
 *   1. request id (x-vercel-id or a uuid) -> `x-request-id` header
 *   2. method check -> 405 + Allow
 *   3. Origin/Referer allowlist on non-GET -> 403 {error:'forbidden'}
 *   4. body size cap -> 413
 *   5. sliding-window rate limit per route + client IP -> 429 + Retry-After
 *   6. try/catch: a throw becomes 500 {error:'internal_error', requestId}; never err.message
 *   7. one structured JSON log line per request + Server-Timing header
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash, randomUUID } from 'node:crypto';

export interface GuardOptions {
  methods: string[];
  rate?: { limit: number; windowMs: number };
  maxBodyBytes?: number;
}

export interface GuardContext {
  route: string;
  id: string;
  ip: string;
  ipHash: string;
  originHost: string | null;
  start: number;
  /** Cumulative ms spent waiting on upstream fetches (to response headers). */
  upstreamMs?: number;
  /** Short machine-readable reason for a non-2xx outcome, added to the log line. */
  err?: string;
}

export type GuardedHandler = (
  req: VercelRequest,
  res: VercelResponse,
  ctx: GuardContext,
) => unknown | Promise<unknown>;

// ── Origin allowlist ────────────────────────────────────────────────────────

export function isAllowedOrigin(value: string | null | undefined, selfHost?: string): boolean {
  if (!value) return false;
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    return false;
  }
  const host = u.hostname.toLowerCase();
  if (u.protocol === 'http:') {
    return host === 'localhost' || host === '127.0.0.1';
  }
  if (u.protocol !== 'https:') return false;
  if (host === 'digitalcraftai.com' || host.endsWith('.digitalcraftai.com')) return true;
  if (host.endsWith('.vercel.app') && host.includes('digital-craft')) return true;
  // Same host as the deployment itself (e.g. an alias we did not list). A browser
  // cannot forge Origin, so this only ever matches pages served by this deployment.
  if (selfHost && u.host.toLowerCase() === selfHost.toLowerCase()) return true;
  return false;
}

// ── Rate limiting ──────────────────────────────────────────────────────────
//
// HONEST CAVEAT: this is an in-memory, PER-INSTANCE limiter. Vercel Fluid
// Compute reuses warm instances across many requests, so it does blunt bursts
// from a single client, but concurrent instances / cold starts each get their
// own counters, so it is NOT a hard global guarantee. The next step is a
// durable shared store (Upstash Redis / Vercel KV, e.g. @upstash/ratelimit).

const buckets = new Map<string, number[]>();
const MAX_KEYS = 10_000;

/**
 * Sliding-window check-and-take. Returns 0 if allowed (and records the hit),
 * otherwise the number of seconds until a slot frees up.
 */
export function takeToken(key: string, limit: number, windowMs: number, now = Date.now()): number {
  const cutoff = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000));
  }
  hits.push(now);
  buckets.delete(key); // re-insert so Map order ~ recency
  buckets.set(key, hits);
  if (buckets.size > MAX_KEYS) {
    // Drop the least recently touched keys.
    const excess = buckets.size - MAX_KEYS;
    let i = 0;
    for (const k of buckets.keys()) {
      if (i++ >= excess) break;
      buckets.delete(k);
    }
  }
  return 0;
}

/** Test hook. */
export function _resetRateLimits(): void {
  buckets.clear();
}

// ── Helpers ────────────────────────────────────────────────────────────────

function header(req: VercelRequest, name: string): string | undefined {
  const v = req.headers?.[name];
  return Array.isArray(v) ? v[0] : v;
}

export function clientIp(req: VercelRequest): string {
  const xff = header(req, 'x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return header(req, 'x-real-ip') || req.socket?.remoteAddress || 'unknown';
}

function hostOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

export function isTimeout(err: unknown): boolean {
  return err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
}

export function truncate(s: unknown, max: number): string | undefined {
  if (typeof s !== 'string') return undefined;
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/**
 * fetch with a hard timeout; records time-to-headers into ctx.upstreamMs.
 * The signal stays attached to the body, so for streams `timeoutMs` bounds the
 * whole transfer, not just the connect.
 */
export async function upstream(
  ctx: GuardContext,
  url: string,
  init: RequestInit = {},
  timeoutMs = 25_000,
): Promise<Response> {
  const t0 = Date.now();
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } finally {
    ctx.upstreamMs = (ctx.upstreamMs ?? 0) + (Date.now() - t0);
  }
}

// ── The wrapper ────────────────────────────────────────────────────────────

export function guard(route: string, opts: GuardOptions, handler: GuardedHandler) {
  const methods = opts.methods.map((m) => m.toUpperCase());

  return async function guarded(req: VercelRequest, res: VercelResponse): Promise<void> {
    const start = Date.now();
    const ip = clientIp(req);
    const originHeader = header(req, 'origin');
    const refererHeader = header(req, 'referer');
    const ctx: GuardContext = {
      route,
      id: header(req, 'x-vercel-id') || randomUUID(),
      ip,
      ipHash: createHash('sha256').update(ip).digest('hex').slice(0, 12),
      originHost: hostOf(originHeader) ?? hostOf(refererHeader),
      start,
    };

    res.setHeader('x-request-id', ctx.id);

    // Server-Timing must be set before headers flush. Node's implicit header
    // write (first res.write / res.end) goes through res.writeHead, so hooking
    // it covers res.json, res.send, res.end and the streaming path alike.
    const origWriteHead = res.writeHead;
    (res as unknown as { writeHead: (...a: unknown[]) => unknown }).writeHead = function (
      this: VercelResponse,
      ...args: unknown[]
    ) {
      if (!res.headersSent) {
        const parts = [`total;dur=${Date.now() - start}`];
        if (ctx.upstreamMs !== undefined) parts.push(`upstream;dur=${ctx.upstreamMs}`);
        try {
          res.setHeader('Server-Timing', parts.join(', '));
        } catch {
          /* headers already sent */
        }
      }
      return (origWriteHead as (...a: unknown[]) => unknown).apply(this, args);
    };

    let logged = false;
    const log = () => {
      if (logged) return;
      logged = true;
      const status = res.statusCode;
      const line: Record<string, unknown> = {
        t: 'api',
        route,
        id: ctx.id,
        method: req.method,
        status,
        ms: Date.now() - start,
        ip: ctx.ipHash,
        origin: ctx.originHost,
      };
      if (ctx.upstreamMs !== undefined) line.upstreamMs = ctx.upstreamMs;
      if (ctx.err) line.err = ctx.err;
      const out = JSON.stringify(line);
      if (status >= 500) console.error(out);
      else console.log(out);
    };
    res.once?.('finish', log);
    res.once?.('close', log);

    const deny = (status: number, body: Record<string, unknown>, reason: string) => {
      ctx.err = reason;
      res.status(status).json(body);
    };

    // 2. method
    const method = (req.method || 'GET').toUpperCase();
    if (!methods.includes(method)) {
      res.setHeader('Allow', methods.join(', '));
      return deny(405, { error: 'Method not allowed' }, 'method');
    }

    // 3. origin (non-GET only)
    if (method !== 'GET' && method !== 'HEAD') {
      const selfHost = header(req, 'x-forwarded-host') || header(req, 'host');
      const candidate = originHeader ?? refererHeader;
      if (!isAllowedOrigin(candidate, selfHost)) {
        return deny(403, { error: 'forbidden' }, 'origin');
      }
    }

    // 4. body size
    if (opts.maxBodyBytes && req.body !== undefined && req.body !== null) {
      let size = 0;
      try {
        size = typeof req.body === 'string' ? req.body.length : JSON.stringify(req.body).length;
      } catch {
        size = Infinity;
      }
      if (size > opts.maxBodyBytes) {
        return deny(413, { error: 'payload_too_large' }, 'body_size');
      }
    }

    // 5. rate limit
    if (opts.rate) {
      const retry = takeToken(`${route}|${ip}`, opts.rate.limit, opts.rate.windowMs);
      if (retry > 0) {
        res.setHeader('Retry-After', String(retry));
        return deny(
          429,
          { error: 'rate_limited', message: 'Too many requests. Please wait a moment and try again.', retryAfter: retry },
          'rate',
        );
      }
    }

    // 6. handler
    try {
      await handler(req, res, ctx);
    } catch (err) {
      ctx.err = err instanceof Error ? `${err.name}: ${err.message}`.slice(0, 300) : 'thrown';
      console.error(JSON.stringify({ t: 'api_error', route, id: ctx.id, err: ctx.err, stack: err instanceof Error ? err.stack?.split('\n').slice(0, 5).join(' | ') : undefined }));
      if (!res.headersSent) {
        res.status(500).json({ error: 'internal_error', requestId: ctx.id });
      } else {
        try {
          res.end();
        } catch {
          /* already closed */
        }
      }
    }
  };
}
