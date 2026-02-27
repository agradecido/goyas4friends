'use client'

import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toggleWinner } from '@/app/actions'
import { useTransition } from 'react'
import { Loader2, Trophy } from 'lucide-react'
import { isPersonCategory, isShortFilmCategory, shortFilmSearchUrl } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

type GalaCardProps = {
    movie: any
    nominationId: string
    isWinner: boolean
    personName?: string
    categoryName?: string
}

export function GalaCard({ movie, nominationId, isWinner, personName, categoryName }: GalaCardProps) {
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        startTransition(async () => {
            await toggleWinner(nominationId)
        })
    }

    return (
        <Card className={`overflow-hidden transition-all duration-200 ${isWinner ? 'border-2 border-yellow-500 bg-yellow-50/50 ring-2 ring-yellow-300' : 'hover:border-slate-300'}`}>
            <div className="flex items-center gap-3 p-3">
                {/* Thumbnail */}
                <div className="w-12 h-16 bg-slate-200 rounded shrink-0 overflow-hidden">
                    {movie.imageUrl ? (
                        <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-lg">🎬</div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    {personName && categoryName && isPersonCategory(categoryName) ? (
                        <>
                            <CardTitle className="text-sm font-semibold leading-tight truncate">{personName}</CardTitle>
                            <p className="text-xs text-slate-500 truncate">{movie.title}</p>
                        </>
                    ) : (
                        <>
                            <CardTitle className="text-sm font-semibold leading-tight truncate">{movie.title}</CardTitle>
                            {personName && <p className="text-xs text-slate-500 truncate">{personName}</p>}
                        </>
                    )}
                    {categoryName && isShortFilmCategory(categoryName) && (
                        <a
                            href={shortFilmSearchUrl(movie.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline mt-0.5"
                        >
                            <ExternalLink className="h-3 w-3" />
                            Ver online
                        </a>
                    )}
                </div>

                {/* Winner toggle */}
                <div className="shrink-0">
                    <Button
                        variant={isWinner ? "default" : "outline"}
                        size="sm"
                        disabled={isPending}
                        className={`transition-all active:scale-95 text-xs px-3 h-8 ${isWinner ? 'bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-sm' : 'text-slate-600'}`}
                        onClick={handleToggle}
                    >
                        {isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isWinner ? (
                            <Trophy className="h-4 w-4" />
                        ) : (
                            '🏆'
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    )
}
