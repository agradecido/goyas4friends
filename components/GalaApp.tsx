'use client'

import { useState } from 'react'
import { GalaCard } from '@/components/GalaCard'
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
    user: any
}

export function GalaApp({ categories, user }: Props) {
    const defaultCat = categories && categories.length > 0 ? categories[0].id : ''
    const [activeCatId, setActiveCatId] = useState(defaultCat)
    const activeCategory = categories.find(c => c.id === activeCatId) || categories[0]

    // Count how many categories have a winner.
    const winnersCount = categories.filter(c =>
        c.nominations.some((n: any) => n.isWinner)
    ).length

    return (
        <div className="min-h-screen bg-slate-50">
            <NavBar username={user.username} />

            <main className="max-w-4xl mx-auto p-3 pb-20 space-y-3">
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">🏆 Noche de Gala</h1>
                    <p className="text-slate-500 text-sm">
                        Marca el ganador de cada categoría.{' '}
                        <span className="font-bold text-orange-600">{winnersCount}</span> de {categories.length} revelados.
                    </p>
                </div>

                {/* Category selector */}
                <div className="sticky top-[56px] z-40 bg-slate-50/95 backdrop-blur py-1.5 -mx-3 px-3 border-b border-slate-100 md:border-none md:static md:p-0 md:bg-transparent">
                    <Select value={activeCatId} onValueChange={setActiveCatId}>
                        <SelectTrigger className="w-full md:w-[400px] text-base font-medium shadow-sm bg-white">
                            <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat: any) => {
                                const hasWinner = cat.nominations.some((n: any) => n.isWinner)
                                return (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {hasWinner ? '✅ ' : ''}{cat.name}
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>

                {/* Nominations list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeCategory?.nominations.map((nom: any) => (
                        <GalaCard
                            key={nom.id}
                            movie={nom.movie}
                            nominationId={nom.id}
                            isWinner={nom.isWinner}
                            personName={nom.personName}
                            categoryName={activeCategory.name}
                        />
                    ))}
                </div>
            </main>
        </div>
    )
}
