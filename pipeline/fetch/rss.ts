import Parser from 'rss-parser'

export interface RawArticle {
  title: string
  url: string
  source: string
  snippet: string
  publishedAt: string
  feedCategory: string
  imageUrl: string | null
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
  finance: [
    'https://feeds.marketwatch.com/marketwatch/topstories/',
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml',
    'https://www.ft.com/?format=rss',
  ],
}

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TheLazyNewsBot/1.0)' },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
    ],
  },
})

function extractImage(item: Record<string, unknown>): string | null {
  // Try enclosure (standard RSS)
  const enc = item.enclosure as { url?: string; type?: string } | undefined
  if (enc?.url && enc.type?.startsWith('image')) return enc.url

  // Try media:thumbnail (used by BBC, TechCrunch, etc.)
  const thumb = item['media:thumbnail'] as { $?: { url?: string } } | undefined
  if (thumb?.$?.url) return thumb.$.url

  // Try media:content (used by The Verge, VentureBeat, etc.)
  const media = item['media:content'] as { $?: { url?: string; type?: string } } | undefined
  if (media?.$?.url && (!media.$?.type || media.$?.type?.startsWith('image'))) return media.$.url

  return null
}

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
      imageUrl: extractImage(item as Record<string, unknown>),
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
