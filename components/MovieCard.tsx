'use client'

import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toggleVote, toggleSeen } from '@/app/actions'
import { useState, useEffect } from 'react'
import { useTransition } from 'react'

type MovieCardProps = {
  movie: any
  categoryId: string
  nominationId: string
  isVoted: boolean
  isSeen: boolean
}

export function MovieCard({ movie, categoryId, nominationId, isVoted, isSeen }: MovieCardProps) {
  // Usamos estado local para feedback instantáneo
  const [localVote, setLocalVote] = useState(isVoted)
  const [localSeen, setLocalSeen] = useState(isSeen)
  
  const [isPending, startTransition] = useTransition()

  // Sincronizar si el servidor manda datos nuevos (al recargar)
  useEffect(() => { setLocalVote(isVoted) }, [isVoted])
  useEffect(() => { setLocalSeen(isSeen) }, [isSeen])

  const handleVote = () => {
    // Cambio visual inmediato
    const newValue = !localVote
    setLocalVote(newValue)
    
    startTransition(async () => {
      // Llamada al servidor en segundo plano
      await toggleVote(categoryId, nominationId)
    })
  }

  const handleSeen = (checked: boolean) => {
    setLocalSeen(checked)
    
    startTransition(async () => {
      await toggleSeen(movie.id)
    })
  }

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${localVote ? 'border-2 border-yellow-500 shadow-lg bg-yellow-50/50 scale-[1.02]' : 'hover:border-slate-300 hover:shadow-sm'}`}>
      {/* Checkbox "Vista" en la esquina */}
      <div className="absolute top-2 right-2 z-10">
        <div className="flex items-center space-x-2 bg-white/95 p-1.5 rounded-full shadow-sm border border-slate-100 backdrop-blur-sm">
          <Checkbox 
            id={`seen-${movie.id}`} 
            checked={localSeen}
            onCheckedChange={handleSeen}
            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
          />
          <label htmlFor={`seen-${movie.id}`} className="text-xs font-medium cursor-pointer select-none text-slate-600 pr-1">
            Vista
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row h-full">
        {/* Imagen */}
        <div className="w-full sm:w-32 h-48 sm:h-auto bg-slate-200 shrink-0 relative overflow-hidden">
           {movie.imageUrl ? (
             <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
           ) : (
             <div className="flex items-center justify-center h-full text-slate-400 text-4xl">🎬</div>
           )}
        </div>

        <div className="p-4 flex flex-col justify-between w-full">
          <div>
            <CardTitle className="text-lg mb-1 leading-tight">{movie.title}</CardTitle>
            <p className="text-sm text-slate-500 mb-2 font-medium">{movie.director}</p>
          </div>

          <div className="mt-4 pt-2">
            <Button 
              variant={localVote ? "default" : "outline"} 
              className={`w-full transition-all active:scale-95 ${localVote ? 'bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-md' : 'text-slate-600'}`}
              onClick={handleVote}
            >
              {localVote ? '🏆 GANADORA' : 'Votar esta'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
