import { createClient } from '@supabase/supabase-js'
import type { ProcessedArticle } from '../process/summarize'

export async function writeToSupabase(
  articles: ProcessedArticle[],
  topSummary: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseKey)
  const today = new Date().toISOString().split('T')[0]

  // Upsert the daily edition row
  const { error: editionError } = await supabase
    .from('daily_editions')
    .upsert(
      {
        date: today,
        top_summary: topSummary,
        article_count: articles.length,
      },
      { onConflict: 'date' }
    )

  if (editionError) {
    throw new Error(`Failed to upsert daily edition: ${editionError.message}`)
  }

  // Delete existing articles for today to avoid duplicates on re-run
  const { error: deleteError } = await supabase
    .from('articles')
    .delete()
    .eq('edition_date', today)

  if (deleteError) {
    throw new Error(`Failed to delete existing articles: ${deleteError.message}`)
  }

  // Insert all articles in chunks of 50
  const CHUNK_SIZE = 50
  for (let i = 0; i < articles.length; i += CHUNK_SIZE) {
    const chunk = articles.slice(i, i + CHUNK_SIZE).map((a) => ({
      edition_date: today,
      title: a.title,
      source: a.source,
      url: a.url,
      category: a.category,
      summary: a.summary,
      original_snippet: a.snippet,
    }))

    const { error: insertError } = await supabase.from('articles').insert(chunk)
    if (insertError) {
      throw new Error(`Failed to insert articles: ${insertError.message}`)
    }
  }

  console.log(`[Supabase] Wrote ${articles.length} articles for ${today}`)
}
