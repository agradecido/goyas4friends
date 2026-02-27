'use client'

import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toggleVote, toggleSeen } from '@/app/actions'
import { useState, useEffect } from 'react'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'

// Categorías donde el personName se muestra debajo del título de película (son premios a personas)
const PERSON_CATEGORIES = [
  'mejor dirección',
  'mejor dirección novel',
  'mejor guion original',
  'mejor guion adaptado',
  'mejor música original',
  'mejor canción original',
  'mejor actor protagonista',
  'mejor actriz protagonista',
  'mejor actor de reparto',
  'mejor actriz de reparto',
  'mejor actor revelación',
  'mejor actriz revelación',
  'mejor dirección de producción',
  'mejor dirección de fotografía',
  'mejor montaje',
  'mejor dirección de arte',
  'mejor diseño de vestuario',
  'mejor maquillaje y peluquería',
  'mejor sonido',
  'mejores efectos especiales',
]

type MovieCardProps = {
  movie: any
  categoryId: string
  nominationId: string
  isVoted: boolean
  isSeen: boolean
  personName?: string
  categoryName?: string
}

export function MovieCard({ movie, categoryId, nominationId, isVoted, isSeen, personName, categoryName }: MovieCardProps) {
  // Usamos estado local para feedback instantáneo
  const [localVote, setLocalVote] = useState(isVoted)
  const [localSeen, setLocalSeen] = useState(isSeen)
  
  const [isVotePending, startVoteTransition] = useTransition()
  const [isSeenPending, startSeenTransition] = useTransition()

  // Sincronizar si el servidor manda datos nuevos (al recargar)
  useEffect(() => { setLocalVote(isVoted) }, [isVoted])
  useEffect(() => { setLocalSeen(isSeen) }, [isSeen])

  const handleVote = () => {
    // Cambio visual inmediato
    const newValue = !localVote
    setLocalVote(newValue)
    
    startVoteTransition(async () => {
      // Llamada al servidor en segundo plano
      await toggleVote(categoryId, nominationId)
    })
  }

  const handleSeen = (checked: boolean) => {
    setLocalSeen(checked)
    
    startSeenTransition(async () => {
      await toggleSeen(movie.id)
    })
  }

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${localVote ? 'border-2 border-yellow-500 bg-yellow-50/50' : 'hover:border-slate-300'}`}>
      <div className="flex items-center gap-3 p-3">
        {/* Thumbnail pequeño */}
        <div className="w-12 h-16 bg-slate-200 rounded shrink-0 overflow-hidden">
          {movie.imageUrl ? (
            <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-lg">🎬</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {personName && categoryName && PERSON_CATEGORIES.includes(categoryName.toLowerCase()) ? (
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
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Seen checkbox */}
          <div className="flex flex-col items-center">
            {isSeenPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <Checkbox 
                id={`seen-${movie.id}`} 
                checked={localSeen}
                onCheckedChange={handleSeen}
                className="h-5 w-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
            )}
            <label htmlFor={`seen-${movie.id}`} className="text-[10px] text-slate-400 cursor-pointer select-none mt-0.5">
              Vista
            </label>
          </div>

          {/* Vote button */}
          <Button 
            variant={localVote ? "default" : "outline"} 
            size="sm"
            disabled={isVotePending}
            className={`transition-all active:scale-95 text-xs px-3 h-8 ${localVote ? 'bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-sm' : 'text-slate-600'}`}
            onClick={handleVote}
          >
            {isVotePending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              localVote ? '🏆' : 'Votar'
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
