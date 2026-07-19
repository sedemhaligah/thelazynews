import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Category = 'ai_ml' | 'tech' | 'finance'

export interface DailyEdition {
  id: string
  date: string
  top_summary: string | null
  article_count: number | null
  created_at: string
}

export interface Article {
  id: string
  edition_date: string
  title: string
  source: string | null
  url: string | null
  category: Category
  summary: string | null
  original_snippet: string | null
  image_url: string | null
  created_at: string
}

export async function getEdition(date: string): Promise<DailyEdition | null> {
  const { data, error } = await supabase
    .from('daily_editions')
    .select('*')
    .eq('date', date)
    .single()

  if (error) return null
  return data as DailyEdition
}

export async function getArticles(date: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('edition_date', date)
    .order('category')

  if (error) return []
  return (data ?? []) as Article[]
}

export async function getLatestEditionDate(): Promise<string | null> {
  const { data, error } = await supabase
    .from('daily_editions')
    .select('date')
    .order('date', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return (data as { date: string }).date
}

export async function getAllEditionDates(): Promise<string[]> {
  const { data, error } = await supabase
    .from('daily_editions')
    .select('date')
    .order('date', { ascending: false })

  if (error || !data) return []
  return (data as { date: string }[]).map((r) => r.date)
}
