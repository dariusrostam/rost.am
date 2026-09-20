const PATTERNS = [/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([\w-]{11})/];

export function youtubeThumbnail(url: string): string | undefined {
  for (const pattern of PATTERNS) {
    const match = url.match(pattern);
    if (match) return `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return undefined;
}
