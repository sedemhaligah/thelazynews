import { getEdition, getArticles, getAllEditionDates } from '@/lib/supabase'
import type { Category } from '@/lib/supabase'
import { Header } from './Header'
import { DailySummary } from './DailySummary'
import { CategoryTabs } from './CategoryTabs'
import { ArticleCard } from './ArticleCard'

const VALID_CATEGORIES: Category[] = ['ai_ml', 'tech', 'economy', 'business', 'finance']
const CATEGORY_ORDER: Category[] = ['ai_ml', 'tech', 'economy', 'business', 'finance']

const SECTION_META: Record<Category, { label: string; subtitle: string }> = {
  ai_ml:    { label: 'AI & Machine Learning', subtitle: 'robots doing things, humans panicking' },
  tech:     { label: 'Tech & Software',       subtitle: 'your next app update is 3gb' },
  economy:  { label: 'Economy & Markets',     subtitle: 'numbers going places, nobody knows where' },
  business: { label: 'Business & Industry',   subtitle: 'suits making moves' },
  finance:  { label: 'Finance',               subtitle: 'money, stonks, and the occasional chaos' },
}

function isValidCategory(c?: string): c is Category {
  return VALID_CATEGORIES.includes(c as Category)
}

function SectionDivider({ label, subtitle }: { label: string; subtitle: string }) {
  return (
    <div className="mt-12 mb-5">
      <div className="flex items-center gap-4 mb-1">
        <h2 className="font-display font-bold text-[18px] text-primary whitespace-nowrap">
          {label}
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      <p className="font-mono text-[11px] text-muted uppercase tracking-widest">{subtitle}</p>
    </div>
  )
}

interface EditionPageProps {
  date: string
  categoryFilter?: string
}

export async function EditionPage({ date, categoryFilter }: EditionPageProps) {
  const [edition, articles, allDates] = await Promise.all([
    getEdition(date),
    getArticles(date),
    getAllEditionDates(),
  ])

  if (!edition) return null

  const currentIndex = allDates.indexOf(date)
  const prevDate = currentIndex < allDates.length - 1 ? allDates[currentIndex + 1] : null
  const nextDate = currentIndex > 0 ? allDates[currentIndex - 1] : null

  const activeCategory: Category | 'all' = isValidCategory(categoryFilter) ? categoryFilter : 'all'
  const filtered = activeCategory === 'all'
    ? articles
    : articles.filter((a) => a.category === activeCategory)

  return (
    <div className="min-h-screen bg-bg">
      <Header date={date} prevDate={prevDate} nextDate={nextDate} />
      <CategoryTabs active={activeCategory} />

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        {edition.top_summary && (
          <DailySummary
            summary={edition.top_summary}
            articleCount={edition.article_count ?? articles.length}
            date={date}
          />
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display font-bold text-[18px] text-primary mb-2">
              Nothing here yet.
            </p>
            <p className="font-mono text-[12px] text-muted">
              check back after the pipeline runs at 07:00 utc
            </p>
          </div>
        ) : activeCategory === 'all' ? (
          CATEGORY_ORDER.map((cat) => {
            const catArticles = articles.filter((a) => a.category === cat)
            if (catArticles.length === 0) return null
            const meta = SECTION_META[cat]
            return (
              <section key={cat}>
                <SectionDivider label={meta.label} subtitle={meta.subtitle} />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )
          })
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
