interface DailySummaryProps {
  summary: string
  articleCount: number
  date: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function DailySummary({ summary, articleCount, date }: DailySummaryProps) {
  return (
    <div
      className="rounded-xl mb-6 px-5 py-6 sm:px-10 sm:py-8"
      style={{ background: 'linear-gradient(135deg, #0D0F14 0%, #1A1F2E 100%)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-1 rounded-sm"
          style={{ color: '#0052FF', background: 'rgba(0,82,255,0.15)', border: '1px solid rgba(0,82,255,0.3)' }}
        >
          tldr
        </span>
        <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {formatDate(date)} &middot; {articleCount} takes
        </span>
      </div>

      <div className="pl-4 sm:pl-5" style={{ borderLeft: '3px solid #0052FF' }}>
        <p
          className="font-display font-semibold text-white text-[14px] sm:text-[18px] line-clamp-3 sm:line-clamp-none"
          style={{ lineHeight: '1.6' }}
        >
          {summary}
        </p>
      </div>
    </div>
  )
}
