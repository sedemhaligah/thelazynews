import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getLatestEditionDate } from '@/lib/supabase'
import { EditionPage } from '@/components/EditionPage'

export const revalidate = 3600 // revalidate at most every hour

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const date = await getLatestEditionDate()

  if (!date) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <p className="font-display font-bold text-[22px] text-primary mb-2">No briefings yet</p>
          <p className="font-body text-[15px] text-muted">
            The pipeline hasn&apos;t run yet. Check back after 07:00 UTC.
          </p>
        </div>
      </main>
    )
  }

  const { category } = await searchParams

  return (
    <Suspense>
      <EditionPage date={date} categoryFilter={category} />
    </Suspense>
  )
}
