'use client'

import { useState } from 'react'
import { MovieCard } from '@/components/MovieCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NavBar } from '@/components/NavBar'

type Props = {
  categories: any[]
  myVotes: any[]
  mySeen: any[]
  user: any
}

export function GoyasApp({ categories, myVotes, mySeen, user }: Props) {
  // Asegurarnos de que tenemos categorías
  const defaultCat = categories && categories.length > 0 ? categories[0].id : ''
  
  // Estado para la categoría seleccionada (por defecto la primera)
  const [activeCatId, setActiveCatId] = useState(defaultCat)

  // Encontrar la categoría activa actual
  const activeCategory = categories.find(c => c.id === activeCatId) || categories[0]

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar username={user.username} />

      <main className="max-w-4xl mx-auto p-3 pb-20 space-y-3">
        {/* SELECTOR DE CATEGORÍA (Sticky para que se quede arriba al hacer scroll) */}
        <div className="sticky top-[56px] z-40 bg-slate-50/95 backdrop-blur py-1.5 -mx-3 px-3 border-b border-slate-100 md:border-none md:static md:p-0 md:bg-transparent">
          <Select value={activeCatId} onValueChange={setActiveCatId}>
            <SelectTrigger className="w-full md:w-[400px] text-base font-medium shadow-sm bg-white">
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* LISTA DE PELÍCULAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeCategory?.nominations.map((nom: any) => {
            const isVoted = myVotes.some(v => v.nominationId === nom.id)
            const isSeen = mySeen.some(s => s.movieId === nom.movie.id)
            const categoryHasWinner = activeCategory.nominations.some((n: any) => n.isWinner)
            
            return (
              <MovieCard 
                key={nom.id}
                movie={nom.movie}
                categoryId={activeCategory.id}
                nominationId={nom.id}
                isVoted={isVoted}
                isSeen={isSeen}
                personName={nom.personName}
                categoryName={activeCategory.name}
                locked={categoryHasWinner}
                isWinner={nom.isWinner}
              />
            )
          })}
        </div>
        
        {/* Mensaje si no hay nada */}
        {(!activeCategory || activeCategory.nominations.length === 0) && (
          <div className="text-center py-10 text-slate-400">
            No hay nominados en esta categoría... ¿seguro que has cargado los datos? 🤔
          </div>
        )}
      </main>
    </div>
  )
}
