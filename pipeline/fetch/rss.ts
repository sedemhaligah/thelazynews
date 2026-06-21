import Parser from 'rss-parser'

export interface RawArticle {
  title: string
  url: string
  source: string
  snippet: string
  publishedAt: string
  feedCategory: string   // which feed bucket this came from — used as categorization hint
}

const RSS_SOURCES: Record<string, string[]> = {
  ai_ml: [
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://www.technologyreview.com/feed/',
    'https://jack-clark.net/feed/',
    'https://venturebeat.com/category/ai/feed/',
  ],
  tech: [
    'https://feeds.arstechnica.com/arstechnica/technology-lab',
    'https://www.theverge.com/rss/index.xml',
    'https://feeds.feedburner.com/TechCrunch',
  ],
  economy: [
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml',
  ],
  business: [
    'https://www.ft.com/?format=rss',
    'https://feeds.bbci.co.uk/news/business/rss.xml',
  ],
  finance: [
    'https://feeds.marketwatch.com/marketwatch/topstories/',
  ],
}

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TheLazyNewsBot/1.0)' },
})

async function fetchFeed(url: string, feedCategory: string): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(url)
    const sourceName = feed.title ?? new URL(url).hostname

    return feed.items.slice(0, 6).map((item) => ({
      title: item.title?.trim() ?? '',
      url: item.link ?? '',
      source: sourceName,
      snippet: (item.contentSnippet ?? item.summary ?? item.content ?? '').slice(0, 300),
      publishedAt: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
      feedCategory,
    }))
  } catch (err) {
    console.warn(`[RSS] Failed to fetch ${url}:`, (err as Error).message)
    return []
  }
}

export async function fetchAllRSSFeeds(): Promise<RawArticle[]> {
  const tasks: Promise<RawArticle[]>[] = []

  for (const [feedCategory, urls] of Object.entries(RSS_SOURCES)) {
    for (const url of urls) {
      tasks.push(fetchFeed(url, feedCategory))
    }
  }

  const results = await Promise.all(tasks)
  return results.flat()
}
