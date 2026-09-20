const TIMEOUT_MS = 5000;

const cache = new Map<string, Promise<string | undefined>>();

function extractOgImage(html: string, pageUrl: string): string | undefined {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      try {
        return new URL(match[1], pageUrl).toString();
      } catch {}
    }
  }
  return undefined;
}

async function scrape(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return undefined;
    if (!(res.headers.get('content-type') ?? '').includes('text/html')) return undefined;
    return extractOgImage(await res.text(), url);
  } catch {
    return undefined;
  }
}

export function fetchLinkPreviewImage(url: string): Promise<string | undefined> {
  if (!cache.has(url)) cache.set(url, scrape(url));
  return cache.get(url)!;
}
