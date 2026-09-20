const HANDLE = 'rost.am';
const ENDPOINT = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${HANDLE}`;

export interface BlueskyPost {
  url: string;
  text: string;
  date: Date;
  thumb?: string;
}

interface BlueskyEmbedView {
  $type?: string;
  images?: { thumb: string }[];
  external?: { thumb?: string };
}

let cached: Promise<BlueskyPost[]> | null = null;

function extractThumb(embed: BlueskyEmbedView | undefined): string | undefined {
  if (!embed) return undefined;
  if (embed.$type === 'app.bsky.embed.images#view') return embed.images?.[0]?.thumb;
  if (embed.$type === 'app.bsky.embed.external#view') return embed.external?.thumb;
  return undefined;
}

async function fetchFeed(limit: number): Promise<BlueskyPost[]> {
  try {
    const res = await fetch(`${ENDPOINT}&limit=${limit}`);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      feed: {
        post: { uri: string; record: { text: string; createdAt: string }; embed?: BlueskyEmbedView };
        reason?: unknown;
      }[];
    };
    return data.feed
      .filter((item) => !item.reason)
      .map((item) => {
        const rkey = item.post.uri.split('/').pop();
        return {
          url: `https://bsky.app/profile/${HANDLE}/post/${rkey}`,
          text: item.post.record.text,
          date: new Date(item.post.record.createdAt),
          thumb: extractThumb(item.post.embed),
        };
      });
  } catch {
    return [];
  }
}

export function fetchLatestBlueskyPosts(limit = 6): Promise<BlueskyPost[]> {
  if (!cached) cached = fetchFeed(limit);
  return cached;
}
