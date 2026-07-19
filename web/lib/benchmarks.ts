export interface BenchmarkModel {
  name: string
  provider: string
  mmlu: number      // % on MMLU (5-shot)
  humaneval: number // % on HumanEval (pass@1)
  math: number      // % on MATH
  tag?: 'best-overall' | 'best-coding' | 'open-source' | 'fastest'
}

// Last updated: July 2025
// Sources: Anthropic, OpenAI, Google, Meta model cards + LMSYS leaderboard
// Scores are reported/self-published by providers; methodology varies slightly.
export const BENCHMARKS: BenchmarkModel[] = [
  { name: 'o3',                provider: 'OpenAI',    mmlu: 92.3, humaneval: 96.7, math: 96.7, tag: 'best-overall' },
  { name: 'Claude Opus 4',     provider: 'Anthropic', mmlu: 91.0, humaneval: 96.0, math: 89.8 },
  { name: 'Claude Sonnet 4',   provider: 'Anthropic', mmlu: 89.2, humaneval: 93.7, math: 78.3, tag: 'best-coding' },
  { name: 'GPT-4o',            provider: 'OpenAI',    mmlu: 88.7, humaneval: 90.2, math: 76.6 },
  { name: 'Gemini 2.0 Flash',  provider: 'Google',    mmlu: 88.5, humaneval: 89.2, math: 82.6, tag: 'fastest' },
  { name: 'Llama 3.3 70B',     provider: 'Meta',      mmlu: 86.0, humaneval: 88.4, math: 77.0, tag: 'open-source' },
]

export const BENCHMARK_UPDATED = 'July 2025'
