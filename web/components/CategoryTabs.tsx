'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { Category } from '@/lib/supabase'

const TABS: { label: string; value: Category | 'all' }[] = [
  { label: 'All',      value: 'all'      },
  { label: 'AI & ML',  value: 'ai_ml'    },
  { label: 'Tech',     value: 'tech'     },
  { label: 'Economy',  value: 'economy'  },
  { label: 'Business', value: 'business' },
  { label: 'Finance',  value: 'finance'  },
]

interface CategoryTabsProps {
  active: Category | 'all'
}

export function CategoryTabs({ active }: CategoryTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleClick(value: Category | 'all') {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    router.push(`${pathname}?${params.toString()}` as never)
  }

  return (
    <div className="bg-bg border-b border-border sticky z-[99] tab-bar overflow-x-auto" style={{ top: '60px' }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex h-[44px] items-stretch">
          {TABS.map((tab) => {
            const isActive = tab.value === active
            return (
              <button
                key={tab.value}
                onClick={() => handleClick(tab.value)}
                className={[
                  'px-4 h-full font-body text-[12px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap',
                  'border-b-2 transition-colors duration-[150ms]',
                  isActive
                    ? 'text-accent border-accent'
                    : 'text-muted border-transparent hover:text-body',
                ].join(' ')}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
