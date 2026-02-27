import { getScoreboardData } from '@/app/actions'
import { NavBar } from '@/components/NavBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ScoreboardPage() {
    const data = await getScoreboardData()

    if (!data?.user) {
        redirect('/login')
    }

    const { scoreboard, totalCategories, winnersRevealed } = data

    return (
        <div className="min-h-screen bg-slate-50">
            <NavBar username={data.user.username} />

            <main className="max-w-2xl mx-auto p-4 pb-20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">🎯 Marcador</h1>
                    <p className="text-slate-500">
                        Premios revelados: <span className="font-bold text-orange-600">{winnersRevealed}</span> de {totalCategories}
                    </p>
                </div>

                {winnersRevealed === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-4xl mb-3">🎭</p>
                        <p className="text-slate-400">
                            Aún no se ha revelado ningún ganador.<br />
                            ¡Vuelve cuando empiece la gala!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {scoreboard.map((entry, index) => {
                            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
                            const percentage = winnersRevealed > 0
                                ? Math.round((entry.hits / winnersRevealed) * 100)
                                : 0

                            return (
                                <Card key={entry.username} className={`overflow-hidden ${index === 0 && entry.hits > 0 ? 'border-2 border-yellow-400 bg-yellow-50/30' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-slate-400 w-6 text-center">
                                                    {medal || `${index + 1}`}
                                                </span>
                                                <span className="font-bold text-slate-900 text-lg">
                                                    {entry.username}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-orange-600">{entry.hits}</span>
                                                <span className="text-sm text-slate-400 ml-1">/ {winnersRevealed}</span>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${index === 0 && entry.hits > 0 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between mt-1">
                                            <span className="text-[11px] text-slate-400">
                                                {entry.totalVotes} categorías votadas
                                            </span>
                                            <span className="text-[11px] font-medium text-slate-500">
                                                {percentage}% aciertos
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
