import { getEdition, getArticles, getAllEditionDates } from '@/lib/supabase'
import type { Category } from '@/lib/supabase'
import { Header } from './Header'
import { DailySummary } from './DailySummary'
import { CategoryTabs } from './CategoryTabs'
import { ArticleCard } from './ArticleCard'
import { BenchmarkPanel } from './BenchmarkPanel'

const VALID_CATEGORIES: Category[] = ['ai_ml', 'tech', 'finance']
const CATEGORY_ORDER: Category[] = ['ai_ml', 'tech', 'finance']

const SECTION_META: Record<Category, { label: string; subtitle: string }> = {
  ai_ml:   { label: 'AI & Machine Learning', subtitle: 'robots doing things, humans panicking' },
  tech:    { label: 'Tech & Software',       subtitle: 'your next app update is 3gb' },
  finance: { label: 'Finance & Markets',     subtitle: 'money, stonks, and the occasional chaos' },
}

function isValidCategory(c?: string): c is Category {
  return VALID_CATEGORIES.includes(c as Category)
}

function SectionDivider({ label, subtitle }: { label: string; subtitle: string }) {
  return (
    <div className="mt-8 mb-3">
      <div className="flex items-center gap-3 mb-0.5">
        <h2 className="font-display font-bold text-[15px] text-primary whitespace-nowrap">
          {label}
        </h2>
        <div className="flex-1 h-px bg-border" />
        <p className="font-mono text-[10px] text-muted uppercase tracking-widest whitespace-nowrap">{subtitle}</p>
      </div>
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

      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {edition.top_summary && (
          <DailySummary
            summary={edition.top_summary}
            articleCount={edition.article_count ?? articles.length}
            date={date}
          />
        )}

        <BenchmarkPanel />

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
                <div className="flex flex-col gap-2">
                  {catArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )
          })
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
