import axios from 'axios'
import type { RawArticle } from './rss'

interface FinnhubNewsItem {
  headline: string
  url: string
  source: string
  summary: string
  datetime: number
}

export async function fetchFinnhubNews(apiKey: string): Promise<RawArticle[]> {
  if (!apiKey) {
    console.warn('[Finnhub] No API key provided, skipping.')
    return []
  }

  try {
    const response = await axios.get<FinnhubNewsItem[]>(
      'https://finnhub.io/api/v1/news',
      {
        params: { category: 'general', token: apiKey },
        timeout: 10000,
      }
    )

    return response.data.slice(0, 8).map((item) => ({
      title: item.headline,
      url: item.url,
      source: item.source,
      snippet: item.summary?.slice(0, 300) ?? '',
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      feedCategory: 'finance',
    }))
  } catch (err) {
    console.warn('[Finnhub] Failed to fetch news:', (err as Error).message)
    return []
  }
}
