import type { Article, Category } from '@/lib/supabase'

const BADGE: Record<Category, { label: string; color: string; bg: string }> = {
  ai_ml:   { label: 'AI & ML',  color: '#7B2FFF', bg: '#F3EEFF' },
  tech:    { label: 'Tech',     color: '#0099CC', bg: '#E6F6FB' },
  finance: { label: 'Finance',  color: '#CC2936', bg: '#FFF0F1' },
}

// Placeholder icon per category when no thumbnail
const PLACEHOLDER: Record<Category, string> = {
  ai_ml:   '🤖',
  tech:    '⚡',
  finance: '📈',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export function ArticleCard({ article }: { article: Article }) {
  const badge = BADGE[article.category] ?? BADGE.tech

  return (
    <article
      className="flex gap-3 bg-surface rounded-md overflow-hidden hover:shadow-sm transition-shadow duration-150"
      style={{ border: '1px solid #E2E5EB' }}
    >
      {/* Left color accent */}
      <div className="w-[3px] shrink-0 self-stretch" style={{ background: badge.color }} />

      {/* Thumbnail */}
      <div className="shrink-0 self-center my-3">
        {article.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image_url}
            alt=""
            className="w-[72px] h-[54px] object-cover rounded"
            loading="lazy"
          />
        ) : (
          <div
            className="w-[72px] h-[54px] rounded flex items-center justify-center text-[22px]"
            style={{ background: badge.bg }}
          >
            {PLACEHOLDER[article.category]}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center gap-1 py-3 pr-4 min-w-0 flex-1">
        {/* Badge + source row */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-[0.03em] shrink-0"
            style={{ color: badge.color, background: badge.bg }}
          >
            {badge.label}
          </span>
          {article.source && (
            <span className="font-mono text-[10px] text-muted truncate">{article.source}</span>
          )}
          <span className="font-mono text-[10px] text-muted shrink-0 ml-auto">
            {timeAgo(article.created_at)}
          </span>
        </div>

        {/* Headline */}
        {article.url ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-bold text-[14px] text-primary leading-snug line-clamp-1 hover:text-accent transition-colors duration-150"
          >
            {article.title}
          </a>
        ) : (
          <h2 className="font-display font-bold text-[14px] text-primary leading-snug line-clamp-1">
            {article.title}
          </h2>
        )}

        {/* Summary */}
        {article.summary && (
          <p className="font-body text-[12px] text-body leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        )}
      </div>

      {/* Read arrow */}
      {article.url && (
        <div className="flex items-center pr-4 shrink-0">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Read: ${article.title}`}
            className="font-mono text-[11px] text-muted hover:text-accent transition-colors duration-150"
          >
            →
          </a>
        </div>
      )}
    </article>
  )
}
