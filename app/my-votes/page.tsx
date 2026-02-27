import { getGoyasData } from '@/app/actions'
import { NavBar } from '@/components/NavBar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { isPersonCategory } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function MyVotesPage() {
  const data = await getGoyasData()

  if (!data?.user) {
    redirect('/login')
  }

  const { categories, myVotes } = data

  // Mapeamos votos para mostrar info completa
  const votingSummary = categories.map(cat => {
    const vote = myVotes.find(v => v.categoryId === cat.id)
    if (!vote) return null

    // Buscar la nominación votada
    const nomination = cat.nominations.find((n: any) => n.id === vote.nominationId)
    return {
      category: cat.name,
      movie: nomination?.movie.title,
      personName: nomination?.personName,
      image: nomination?.movie.imageUrl
    }
  }).filter(Boolean) // Quitar nulos (categorías sin voto)

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar username={data.user.username} />
      
      <main className="max-w-2xl mx-auto p-4 pb-20">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Mi Quiniela 📝</h1>
            <p className="text-slate-500 text-sm">Has votado en <span className="font-bold text-orange-600">{votingSummary.length}</span> de {categories.length} categorías.</p>
          </div>
        </div>

        {votingSummary.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400 mb-4">Aún no te has mojado...</p>
            <Link href="/">
              <Button>Ir a Votar</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {votingSummary.map((item: any) => (
              <Card key={item.category} className="flex overflow-hidden">
                <div className="w-20 bg-slate-200 shrink-0 relative">
                   {item.image ? (
                     <img src={item.image} alt={item.movie} className="w-full h-full object-cover" />
                   ) : (
                     <div className="flex items-center justify-center h-full text-slate-400 text-xl">🎬</div>
                   )}
                </div>
                <div className="p-3 flex-1">
                  <div className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">{item.category}</div>
                  <div className="font-bold text-slate-900 text-lg leading-none mb-1">
                    {item.personName && isPersonCategory(item.category) ? item.personName : item.movie}
                  </div>
                  {item.personName && isPersonCategory(item.category) ? (
                    <div className="text-sm text-slate-500">{item.movie}</div>
                  ) : item.personName ? (
                    <div className="text-sm text-slate-500">{item.personName}</div>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
