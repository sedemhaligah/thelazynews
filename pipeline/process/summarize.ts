import Groq from 'groq-sdk'
import type { RawArticle } from '../fetch/rss'

export type Category = 'ai_ml' | 'tech' | 'finance'

export interface ProcessedArticle {
  title: string
  url: string
  source: string
  snippet: string
  summary: string
  category: Category
  publishedAt: string
  imageUrl: string | null
}

const VALID_CATEGORIES: Category[] = ['ai_ml', 'tech', 'finance']

function isValidCategory(c: string): c is Category {
  return VALID_CATEGORIES.includes(c as Category)
}

async function summarizeArticle(
  groq: Groq,
  article: RawArticle
): Promise<{ summary: string; category: Category }> {
  const snippet = article.snippet.slice(0, 250)

  const prompt = `You write for TheLazyNews — news for people who want to stay sharp without suffering through boring corporate speak.

Summarize this article in 2-3 punchy sentences. Smart but casual. Like a clever friend texting you what happened. Active voice, specific details, light wit if the story calls for it. No jargon, no "it is worth noting", no passive voice.

Feed section hint: ${article.feedCategory} — strongly prefer this as the category. Use "finance" for markets, rates, inflation, economy, business, and money moves.

Title: ${article.title}
Snippet: ${snippet}

Return JSON only: {"summary":"your summary","category":"ai_ml|tech|finance"}`

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 150,
  })

  const text = response.choices[0]?.message?.content?.trim() ?? ''

  try {
    const parsed = JSON.parse(text)
    const category = isValidCategory(parsed.category) ? parsed.category : (article.feedCategory as Category) ?? 'tech'
    return { summary: parsed.summary ?? '', category }
  } catch {
    // Fallback: use the feed category so miscategorization doesn't cascade
    const fallback = VALID_CATEGORIES.includes(article.feedCategory as Category) ? (article.feedCategory as Category) : 'tech'
    return { summary: text.slice(0, 300), category: fallback }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function summarizeAndCategorize(
  articles: RawArticle[],
  apiKey: string
): Promise<ProcessedArticle[]> {
  const groq = new Groq({ apiKey })
  const results: ProcessedArticle[] = []

  // Free tier: 6000 TPM. Each article ~300 tokens → max 20/min safely.
  // 3500ms between requests = ~17/min, safely within limit.
  const DELAY_MS = 3500

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    process.stdout.write(`[Groq] ${i + 1}/${articles.length} "${article.title.slice(0, 55)}"... `)

    try {
      const { summary, category } = await summarizeArticle(groq, article)
      results.push({
        title: article.title,
        url: article.url,
        source: article.source,
        snippet: article.snippet,
        summary,
        category,
        publishedAt: article.publishedAt,
        imageUrl: article.imageUrl ?? null,
      })
      console.log('ok')
    } catch (err) {
      console.log('failed:', (err as Error).message.slice(0, 80))
    }

    if (i < articles.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  return results
}

export async function generateDailySummary(
  articles: ProcessedArticle[],
  apiKey: string
): Promise<string> {
  const groq = new Groq({ apiKey })

  const articleSummaries = articles
    .slice(0, 20)
    .map((a) => `[${a.category}] ${a.title}: ${a.summary}`)
    .join('\n')

  const prompt = `You are the editor of TheLazyNews. Your readers are smart, busy, and have zero patience for boring.

Write 1 punchy paragraph (4-5 sentences) covering what happened today across AI, tech, and finance. Sound like a brilliant friend giving you the download over coffee — specific, a little witty, no fluff or filler.

Today's stories:
${articleSummaries}

Return only the paragraph. No title, no bullet points, no preamble.`

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 200,
    })

    return response.choices[0]?.message?.content?.trim() ?? ''
  } catch (err) {
    console.warn('[Groq] Failed to generate daily summary:', (err as Error).message)
    return ''
  }
}
