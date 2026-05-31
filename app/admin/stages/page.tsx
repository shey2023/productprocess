import { getStages } from '@/lib/stages'
import StagesClient from './StagesClient'

export const dynamic = 'force-dynamic'

export default async function StagesPage() {
  const stages = await getStages()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ניהול שלבי ייצור</h1>
      <p className="text-sm text-gray-500 mb-6">
        גרור שלבים לשינוי הסדר. כל שינוי נשמר אוטומטית.
      </p>
      <StagesClient initialStages={stages} />
    </div>
  )
}
