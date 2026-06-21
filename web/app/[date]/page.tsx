import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getEdition } from '@/lib/supabase'
import { EditionPage } from '@/components/EditionPage'

export const revalidate = 3600

interface Props {
  params: Promise<{ date: string }>
  searchParams: Promise<{ category?: string }>
}

export default async function DatePage({ params, searchParams }: Props) {
  const { date } = await params
  const { category } = await searchParams

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()

  const edition = await getEdition(date)
  if (!edition) notFound()

  return (
    <Suspense>
      <EditionPage date={date} categoryFilter={category} />
    </Suspense>
  )
}
