import type { Article, Category } from '@/lib/supabase'

const BADGE: Record<Category, { label: string; color: string; bg: string }> = {
  ai_ml:   { label: 'AI & ML',  color: '#7B2FFF', bg: '#F3EEFF' },
  tech:    { label: 'Tech',     color: '#0099CC', bg: '#E6F6FB' },
  finance: { label: 'Finance',  color: '#CC2936', bg: '#FFF0F1' },
}

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
  return `${Math.floor(h / 24)}d ago`
}

export function ArticleCard({ article }: { article: Article }) {
  const badge = BADGE[article.category] ?? BADGE.tech
  const hasImage = !!article.image_url

  return (
    <article
      className="bg-surface rounded-xl overflow-hidden transition-shadow duration-150 hover:shadow-md"
      style={{ border: '1px solid #E2E5EB' }}
    >
      {/* ── Mobile: hero image at top ── */}
      {hasImage && (
        <div className="sm:hidden relative w-full h-44 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image_url!}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Category strip over image */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px]"
            style={{ background: badge.color }}
          />
        </div>
      )}

      {/* ── Mobile: no image — color bar + emoji ── */}
      {!hasImage && (
        <div className="sm:hidden h-[3px] w-full" style={{ background: badge.color }} />
      )}

      {/* ── Desktop: horizontal row ── */}
      <div className="flex items-center gap-0">
        {/* Accent bar (desktop) */}
        <div className="hidden sm:block w-[3px] shrink-0 self-stretch" style={{ background: badge.color }} />

        {/* Thumbnail (desktop) */}
        <div className="hidden sm:flex shrink-0 items-center ml-3 my-3">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image_url!}
              alt=""
              className="w-[80px] h-[60px] object-cover rounded-lg"
              loading="lazy"
            />
          ) : (
            <div
              className="w-[80px] h-[60px] rounded-lg flex items-center justify-center text-[24px]"
              style={{ background: badge.bg }}
            >
              {PLACEHOLDER[article.category]}
            </div>
          )}
        </div>

        {/* Content (shared mobile + desktop) */}
        <div className="flex flex-col gap-1.5 p-4 sm:py-3 sm:px-4 min-w-0 flex-1">
          {/* Badge + source + time */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0"
              style={{ color: badge.color, background: badge.bg }}
            >
              {badge.label}
            </span>
            {article.source && (
              <span className="font-mono text-[11px] text-muted truncate">{article.source}</span>
            )}
            <span className="font-mono text-[11px] text-muted shrink-0 ml-auto">
              {timeAgo(article.created_at)}
            </span>
          </div>

          {/* Headline */}
          {article.url ? (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display font-bold text-[16px] sm:text-[14px] text-primary leading-snug line-clamp-2 sm:line-clamp-1 hover:text-accent transition-colors duration-150"
            >
              {article.title}
            </a>
          ) : (
            <h2 className="font-display font-bold text-[16px] sm:text-[14px] text-primary leading-snug line-clamp-2 sm:line-clamp-1">
              {article.title}
            </h2>
          )}

          {/* Summary */}
          {article.summary && (
            <p className="font-body text-[13px] sm:text-[12px] text-body leading-relaxed line-clamp-2">
              {article.summary}
            </p>
          )}

          {/* Mobile: Read link */}
          {article.url && (
            <div className="flex sm:hidden justify-end mt-1">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[12px] font-semibold text-accent"
              >
                Read full story →
              </a>
            </div>
          )}
        </div>

        {/* Desktop: arrow */}
        {article.url && (
          <div className="hidden sm:flex items-center pr-4 shrink-0">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read: ${article.title}`}
              className="font-mono text-[13px] text-muted hover:text-accent transition-colors duration-150"
            >
              →
            </a>
          </div>
        )}
      </div>
    </article>
  )
}
