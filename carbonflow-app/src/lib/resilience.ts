// Patron de resiliencia obligatorio para toda llamada a API externa (PRD seccion 2.3):
// cache por clave, timeout, un reintento, y nunca una excepcion sin manejar.

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number = CACHE_TTL_MS): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

export interface ResilientCallOptions {
  cacheKey?: string;
  timeoutMs?: number;
  retries?: number;
  cacheTtlMs?: number;
}

export interface ResilientResult<T> {
  ok: boolean;
  data?: T;
  source: "live" | "cache" | "fallback";
  error?: string;
}

/**
 * Ejecuta fn() con cache, timeout y un reintento. Si todo falla, devuelve
 * ok:false con source:"fallback" en vez de lanzar una excepcion, para que la
 * UI siempre pueda mostrar un estado legible en lugar de una pantalla en blanco.
 */
export async function resilientCall<T>(
  fn: () => Promise<T>,
  opts: ResilientCallOptions = {}
): Promise<ResilientResult<T>> {
  const { cacheKey, timeoutMs = 7000, retries = 1, cacheTtlMs } = opts;

  if (cacheKey) {
    const cached = getCached<T>(cacheKey);
    if (cached !== undefined) {
      return { ok: true, data: cached, source: "cache" };
    }
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await withTimeout(fn(), timeoutMs);
      if (cacheKey) setCached(cacheKey, data, cacheTtlMs);
      return { ok: true, data, source: "live" };
    } catch (err) {
      lastError = err;
    }
  }

  return {
    ok: false,
    source: "fallback",
    error: lastError instanceof Error ? lastError.message : "error desconocido",
  };
}
