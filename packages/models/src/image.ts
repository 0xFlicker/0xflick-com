export function urlToShortUrl(url: string): [string, string] | null {
  const match = url.match(/^(.*)\/(.*)$/);
  if (!match) {
    return null;
  }
  const [, shortUrlSource, image] = match;
  return [shortUrlSource, image];
}
