import { getAllMoviesData } from '@/app/actions'
import { NavBar } from '@/components/NavBar'
import { MovieChecklist } from '@/components/MovieChecklist'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MoviesPage() {
  const data = await getAllMoviesData()

  if (!data?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar username={data.user.username} />
      
      <main className="max-w-2xl mx-auto p-4 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Checklist de Cine 🎬</h1>
          <p className="text-slate-500 text-sm">Marca las películas que ya has visto para llevar la cuenta.</p>
        </div>

        <MovieChecklist movies={data.movies} mySeen={data.mySeen} />
      </main>
    </div>
  )
}
