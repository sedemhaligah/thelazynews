import Link from 'next/link'

interface HeaderProps {
  date: string
  prevDate?: string | null
  nextDate?: string | null
}

function formatLong(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatShort(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function Header({ date, prevDate, nextDate }: HeaderProps) {
  return (
    <header className="bg-surface border-b border-border sticky top-0 z-[100] shadow-xs">
      {/* Thin gradient accent bar at top */}
      <div
        className="h-[3px] w-full"
        style={{ background: 'linear-gradient(90deg, #7B2FFF 0%, #0052FF 30%, #0099CC 55%, #00875A 75%, #CC2936 100%)' }}
      />

      <div className="max-w-[1200px] mx-auto px-6 h-[57px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-[20px] text-primary tracking-tight hover:text-accent transition-colors duration-150">
              TheLazyNews
            </span>
            <span className="font-mono text-[11px] text-muted hidden md:block">
              staying informed without the suffering
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-5 font-mono text-[12px] text-muted">
          <span className="hidden sm:block">{formatLong(date)}</span>
          <div className="flex items-center gap-3">
            {prevDate && (
              <Link href={`/${prevDate}`} className="hover:text-accent transition-colors duration-150">
                &larr; {formatShort(prevDate)}
              </Link>
            )}
            {nextDate && (
              <Link href={`/${nextDate}`} className="hover:text-accent transition-colors duration-150">
                {formatShort(nextDate)} &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
