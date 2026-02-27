import crypto from 'crypto';

export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}

export function deduplicateItems<T extends { url: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const hash = hashUrl(item.url);
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });
}
