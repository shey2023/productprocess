import { getStages } from '@/lib/stages'
import StagesClient from './StagesClient'

export const dynamic = 'force-dynamic'

export default async function StagesPage() {
  const stages = await getStages()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ניהול שלבים</h1>
      <StagesClient initialStages={stages} />
    </main>
  )
}
