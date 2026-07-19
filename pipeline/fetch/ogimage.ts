import type { RawArticle } from './rss'

async function fetchOGImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TheLazyNewsBot/1.0)' },
    })
    clearTimeout(timer)

    // Only read first 10KB — og:image is always in <head>
    const reader = res.body?.getReader()
    if (!reader) return null
    let html = ''
    while (html.length < 10000) {
      const { done, value } = await reader.read()
      if (done) break
      html += new TextDecoder().decode(value)
    }
    reader.cancel()

    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)

    return match?.[1] ?? null
  } catch {
    return null
  }
}

export async function enrichWithOGImages(articles: RawArticle[]): Promise<RawArticle[]> {
  const results = await Promise.allSettled(
    articles.map(async (article) => {
      if (article.imageUrl) return article  // RSS already gave us one
      if (!article.url) return article
      const imageUrl = await fetchOGImage(article.url)
      return { ...article, imageUrl }
    })
  )

  return results.map((r, i) => (r.status === 'fulfilled' ? r.value : articles[i]))
}
