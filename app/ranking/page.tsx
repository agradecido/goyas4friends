import { getGlobalStats } from '@/app/actions'
import { NavBar } from '@/components/NavBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'
import { isPersonCategory, isShortFilmCategory, shortFilmSearchUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function RankingPage() {
  const data = await getGlobalStats()

  if (!data?.user) {
    redirect('/login')
  }

  const { categories, totalUsers } = data

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar username={data.user.username} />

      <main className="max-w-3xl mx-auto p-4 pb-20 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">📊 Quiniela del Grupo</h1>
          <p className="text-slate-500">
            ¿Qué opinan tus amigos? (Total participantes: <span className="font-bold">{totalUsers}</span>)
          </p>
        </div>

        {categories.map((cat) => {
          // Calcular total de votos en esta categoría
          const totalVotesInCat = cat.nominations.reduce((acc, nom) => acc + nom.votes.length, 0)

          // Ordenar nominaciones por número de votos (de más a menos)
          const sortedNominations = [...cat.nominations]
            .sort((a, b) => b.votes.length - a.votes.length)
            .filter(n => n.votes.length > 0) // Solo mostrar los que tienen votos

          if (sortedNominations.length === 0) return null

          return (
            <Card key={cat.id} className="overflow-hidden">
              <CardHeader className="bg-slate-100/50 pb-3">
                <CardTitle className="text-lg font-bold text-slate-800">{cat.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-5">
                {sortedNominations.map((nom) => {
                  const percentage = totalVotesInCat > 0
                    ? Math.round((nom.votes.length / totalVotesInCat) * 100)
                    : 0

                  return (
                    <div key={nom.id} className="space-y-2">
                      {/* Título y porcentaje */}
                      <div className="flex justify-between items-end">
                        <div className="font-medium text-slate-900 text-sm md:text-base">
                          {nom.personName && isPersonCategory(cat.name) ? (
                            <>
                              {nom.personName}
                              <span className="text-xs text-slate-500 font-normal ml-1">({nom.movie.title})</span>
                            </>
                          ) : (
                            <>
                              {nom.movie.title}
                              {nom.personName && (
                                <span className="text-xs text-slate-500 font-normal ml-1">({nom.personName})</span>
                              )}
                            </>
                          )}
                          {isShortFilmCategory(cat.name) && (
                            <a
                              href={shortFilmSearchUrl(nom.movie.title)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline ml-2"
                            >
                              ▶ Ver
                            </a>
                          )}
                        </div>
                        <div className="text-sm font-bold text-slate-700">{percentage}%</div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {/* Avatares/Nombres de quien votó */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {nom.votes.map((vote) => (
                          <Badge key={vote.id} variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-600 hover:bg-slate-200">
                            {vote.user.username}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </main>
    </div>
  )
}
