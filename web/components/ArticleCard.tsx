import type { Article, Category } from '@/lib/supabase'

const BADGE: Record<Category, { label: string; color: string; bg: string }> = {
  ai_ml:   { label: 'AI & ML',  color: '#7B2FFF', bg: '#F3EEFF' },
  tech:    { label: 'Tech',     color: '#0099CC', bg: '#E6F6FB' },
  finance: { label: 'Finance',  color: '#CC2936', bg: '#FFF0F1' },
}

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${date} · ${time}`
}

export function ArticleCard({ article }: { article: Article }) {
  const badge = BADGE[article.category]

  return (
    <article
      className="bg-surface rounded-md flex flex-col shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 overflow-hidden"
      style={{ border: '1px solid #E2E5EB' }}
    >
      {/* Category color strip at the top */}
      <div className="h-[4px] w-full shrink-0" style={{ background: badge.color }} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Badge */}
        <div>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold uppercase tracking-[0.03em]"
            style={{ color: badge.color, background: badge.bg }}
          >
            {badge.label}
          </span>
        </div>

        {/* Headline — primary clickable element */}
        {article.url ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-bold text-[17px] text-primary leading-snug line-clamp-2 hover:text-accent transition-colors duration-150"
          >
            {article.title}
          </a>
        ) : (
          <h2 className="font-display font-bold text-[17px] text-primary leading-snug line-clamp-2">
            {article.title}
          </h2>
        )}

        {/* Summary */}
        {article.summary && (
          <p className="font-body text-[14px] text-body leading-relaxed line-clamp-3">
            {article.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div className="flex items-center font-mono text-[11px] text-muted min-w-0 gap-0">
            {article.source && (
              <>
                <span className="truncate max-w-[110px]">{article.source}</span>
                <span
                  className="inline-block w-[3px] h-[3px] rounded-full bg-border mx-1.5 shrink-0"
                  aria-hidden="true"
                />
              </>
            )}
            <time dateTime={article.created_at} className="shrink-0">
              {formatTimestamp(article.created_at)}
            </time>
          </div>

          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read original: ${article.title}`}
              className="font-body text-[12px] font-semibold text-accent hover:text-accent-hover transition-colors duration-150 shrink-0 ml-3"
            >
              Read &#x2192;
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
