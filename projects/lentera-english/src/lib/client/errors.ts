'use client';
// Sends browser errors to /api/errors (Rilis 9), so problems learners hit show
// up in /admin → Kesehatan. At most 5 reports per page, each message once, and
// noise that is not ours (extensions, offline, cross-origin scripts) is dropped.
const IGNORE = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i,
  /extension:\/\//i,
  /Failed to fetch|NetworkError|Load failed|network error|Tidak ada koneksi internet/i,
  /AbortError|The operation was aborted/i,
  /ChunkLoadError|Loading chunk \d+ failed/i,
];
const seen = new Set<string>();
let sent = 0;

export function reportClientError(message: string, stack?: string): void {
  const msg = (message || '').slice(0, 500);
  if (!msg || sent >= 5 || seen.has(msg) || IGNORE.some((re) => re.test(msg) || (stack ? re.test(stack) : false))) return;
  seen.add(msg);
  sent += 1;
  try {
    void fetch('/api/errors', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, stack: stack?.slice(0, 4000), path: location.pathname, release: process.env.NEXT_PUBLIC_RELEASE }),
    }).catch(() => {});
  } catch {
    /* never let reporting cause another error */
  }
}

let installed = false;
export function installErrorReporter(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (e) => {
    // Resource load failures (img/script) have no message; skip them.
    if (!e.message) return;
    reportClientError(e.message, e.error instanceof Error ? e.error.stack : undefined);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason as { message?: string; stack?: string; status?: number } | undefined;
    // API errors with a status are handled (and shown) by the page itself.
    if (r && typeof r.status === 'number') return;
    reportClientError(r?.message ?? String(e.reason), r?.stack);
  });
}
