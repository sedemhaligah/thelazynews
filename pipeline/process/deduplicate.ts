import type { RawArticle } from '../fetch/rss'

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)
}

export function deduplicateByTitle(articles: RawArticle[]): RawArticle[] {
  const seen = new Set<string>()
  const result: RawArticle[] = []

  for (const article of articles) {
    if (!article.title || !article.url) continue
    const key = normalizeTitle(article.title)
    if (!seen.has(key)) {
      seen.add(key)
      result.push(article)
    }
  }

  return result
}

// Take up to `limitPerCategory` articles from each feed bucket.
// Gives balanced sector coverage and keeps total around 40.
export function trimPerCategory(articles: RawArticle[], limitPerCategory: number): RawArticle[] {
  const buckets: Record<string, RawArticle[]> = {}

  for (const article of articles) {
    const cat = article.feedCategory
    if (!buckets[cat]) buckets[cat] = []
    if (buckets[cat].length < limitPerCategory) {
      buckets[cat].push(article)
    }
  }

  return Object.values(buckets).flat()
}
