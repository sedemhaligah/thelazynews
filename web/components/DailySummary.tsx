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
      className="rounded-lg mb-10 px-10 py-8 md:px-12 md:py-10"
      style={{ background: 'linear-gradient(135deg, #0D0F14 0%, #1A1F2E 100%)' }}
    >
      <div className="flex items-center gap-3 mb-5">
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

      <div className="pl-5 max-w-[700px]" style={{ borderLeft: '3px solid #0052FF' }}>
        <p
          className="font-display font-semibold text-white"
          style={{ fontSize: '19px', lineHeight: '1.65' }}
        >
          {summary}
        </p>
      </div>
    </div>
  )
}
