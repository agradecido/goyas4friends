'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { toggleSeen } from '@/app/actions'
import { useState, useTransition } from 'react'

export function MovieChecklist({ movies, mySeen }: { movies: any[], mySeen: any[] }) {
  return (
    <div className="space-y-2">
      {movies.map(movie => (
        <CheckItem 
          key={movie.id} 
          movie={movie} 
          initialSeen={mySeen.some(s => s.movieId === movie.id)} 
        />
      ))}
    </div>
  )
}

function CheckItem({ movie, initialSeen }: { movie: any, initialSeen: boolean }) {
  const [seen, setSeen] = useState(initialSeen)
  const [isPending, startTransition] = useTransition()

  const handleChange = (checked: boolean) => {
    setSeen(checked)
    startTransition(async () => {
      await toggleSeen(movie.id)
    })
  }

  return (
    <Card className={`flex items-center p-3 transition-colors ${seen ? 'bg-green-50 border-green-200 opacity-80' : 'bg-white hover:border-slate-300'}`}>
      <Checkbox 
        id={movie.id} 
        checked={seen} 
        onCheckedChange={handleChange}
        className="h-5 w-5 mr-4 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
      />
      <label htmlFor={movie.id} className={`flex-1 cursor-pointer select-none ${seen ? 'line-through text-slate-500' : 'text-slate-900 font-medium'}`}>
        {movie.title}
        <span className="block text-xs text-slate-400 font-normal no-underline">
          {movie._count?.nominations > 0 && <span>{movie._count.nominations} nominaciones</span>}
          {movie._count?.nominations > 0 && movie.director && <span> · </span>}
          {movie.director && <span>{movie.director}</span>}
        </span>
      </label>
    </Card>
  )
}
