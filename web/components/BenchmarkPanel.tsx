import { BENCHMARKS, BENCHMARK_UPDATED } from '@/lib/benchmarks'

const TAG_LABEL: Record<string, string> = {
  'best-overall':  '👑 best overall',
  'best-coding':   '⚡ best coding',
  'open-source':   '🔓 open source',
  'fastest':       '🚀 fastest',
}

const PROVIDER_COLOR: Record<string, string> = {
  Anthropic: '#CC785C',
  OpenAI:    '#10A37F',
  Google:    '#4285F4',
  Meta:      '#0668E1',
}

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-[5px] bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: '#0052FF' }}
        />
      </div>
      <span className="font-mono text-[11px] text-body w-[36px] text-right">{value}%</span>
    </div>
  )
}

export function BenchmarkPanel() {
  return (
    <div className="mb-6 rounded-xl overflow-hidden" style={{ border: '1px solid #E2E5EB' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E2E5EB' }}>
        <div>
          <h2 className="font-display font-bold text-[15px] text-primary">AI Model Benchmarks</h2>
          <p className="font-mono text-[11px] text-muted mt-0.5">who's winning the robot olympics right now</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted">updated {BENCHMARK_UPDATED}</span>
          <a
            href="https://lmsys.org/blog/2023-05-03-arena/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-accent hover:underline"
          >
            full leaderboard →
          </a>
        </div>
      </div>

      {/* Scrollable table (overflows on mobile) */}
      <div className="overflow-x-auto">
        {/* Column headers */}
        <div
          className="grid px-5 py-2 font-mono text-[10px] text-muted uppercase tracking-widest"
          style={{ gridTemplateColumns: '1fr 80px 80px 80px', minWidth: '420px', borderBottom: '1px solid #E2E5EB', background: '#F8F9FB' }}
        >
          <span>Model</span>
          <span className="text-right pr-2">MMLU</span>
          <span className="text-right pr-2">HumanEval</span>
          <span className="text-right pr-2">MATH</span>
        </div>

        {/* Rows */}
        {BENCHMARKS.map((model, i) => {
          const providerColor = PROVIDER_COLOR[model.provider] ?? '#888'
          const isLast = i === BENCHMARKS.length - 1
          return (
            <div
              key={model.name}
              className="grid px-5 py-3 items-center hover:bg-[#F8F9FB] transition-colors duration-100"
              style={{
                gridTemplateColumns: '1fr 80px 80px 80px',
                minWidth: '420px',
                borderBottom: isLast ? 'none' : '1px solid #F0F2F5',
              }}
            >
              <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-[13px] text-primary">{model.name}</span>
                  {model.tag && (
                    <span className="font-mono text-[10px] text-muted">{TAG_LABEL[model.tag]}</span>
                  )}
                </div>
                <span className="font-mono text-[10px] font-semibold" style={{ color: providerColor }}>
                  {model.provider}
                </span>
              </div>
              <div className="pr-2"><ScoreBar value={model.mmlu} /></div>
              <div className="pr-2"><ScoreBar value={model.humaneval} /></div>
              <div className="pr-2"><ScoreBar value={model.math} /></div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 font-mono text-[10px] text-muted" style={{ borderTop: '1px solid #E2E5EB', background: '#F8F9FB' }}>
        MMLU = general knowledge · HumanEval = coding · MATH = reasoning · scores from provider model cards
      </div>
    </div>
  )
}
