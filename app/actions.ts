'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// --- AUTH ---

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (user && user.password === password) {
    // Next.js 15: cookies() es asíncrono
    const cookieStore = await cookies()
    cookieStore.set('auth_user', user.id, { httpOnly: true })

    if (!user.hasSeenHelp) {
      redirect('/help')
    } else {
      redirect('/')
    }
  } else {
    // TODO: Devolver error visual
    return { error: 'Usuario o contraseña incorrectos' }
  }
}

export async function register(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  // Comprobar si existe
  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return { error: 'Ese usuario ya existe. Prueba otro.' }
  }

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      username,
      password, // Sin hash, como pediste (simple)
      name: username // Usamos el mismo user como nombre por defecto
    }
  })

  // Auto-login al registrarse
  const cookieStore = await cookies()
  cookieStore.set('auth_user', user.id, { httpOnly: true })

  // Usuario nuevo -> Directo a ayuda
  redirect('/help')
}

export async function completeOnboarding() {
  const user = await getSession()
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { hasSeenHelp: true }
    })
  }
  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_user')
  redirect('/login')
}

export async function getSession() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('auth_user')?.value

  if (!userId) return null
  return await prisma.user.findUnique({ where: { id: userId } })
}

// --- DATA ---

// Orden personalizado de categorías
const CATEGORY_ORDER = [
  'Mejor película',
  'Mejor dirección',
  'Mejor dirección novel',
  'Mejor guion original',
  'Mejor guion adaptado',
  'Mejor música original',
  'Mejor canción original',
  'Mejor actor protagonista',
  'Mejor actriz protagonista',
  'Mejor actor de reparto',
  'Mejor actriz de reparto',
  'Mejor actor revelación',
  'Mejor actriz revelación',
  'Mejor dirección de producción',
  'Mejor dirección de fotografía',
  'Mejor montaje',
  'Mejor dirección de arte',
  'Mejor diseño de vestuario',
  'Mejor maquillaje y peluquería',
  'Mejor sonido',
  'Mejores efectos especiales',
  'Mejor película de animación',
  'Mejor película documental',
  'Mejor película iberoamericana',
  'Mejor película europea',
  'Mejor cortometraje de ficción',
  'Mejor cortometraje documental',
  'Mejor cortometraje de animación',
]

// Fetch categories and nominations (no cache - always fresh after deploy)
async function getStaticCategories() {
    const categories = await prisma.category.findMany({
      include: {
        nominations: {
          include: {
            movie: true
          }
        }
      },
    })
    // Sort by custom order
    return categories.sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a.name)
      const ib = CATEGORY_ORDER.indexOf(b.name)
      if (ia === -1 && ib === -1) return a.name.localeCompare(b.name)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
}

export async function getGoyasData() {
  const user = await getSession()
  if (!user) return null

  // Paralelizamos las consultas:
  // 1. Datos estáticos (cacheados)
  // 2. Votos del usuario
  // 3. Pelis vistas del usuario
  const [categories, myVotes, mySeen] = await Promise.all([
    getStaticCategories(),
    prisma.vote.findMany({ where: { userId: user.id } }),
    prisma.seenMovie.findMany({ where: { userId: user.id } })
  ])

  return { categories, myVotes, mySeen, user }
}

export async function getAllMoviesData() {
  const user = await getSession()
  if (!user) return null

  // Obtener todas las pelis con el conteo de nominaciones, ordenadas por más nominaciones primero
  const movies = await prisma.movie.findMany({
    include: {
      _count: {
        select: { nominations: true }
      }
    },
    orderBy: {
      nominations: { _count: 'desc' }
    }
  })

  const mySeen = await prisma.seenMovie.findMany({
    where: { userId: user.id }
  })

  return { movies, mySeen, user }
}

export async function getGlobalStats() {
  const user = await getSession()
  if (!user) return null

  // Obtener todas las categorías con sus nominaciones
  // (Aquí no usamos la caché simple porque necesitamos los votos de TODOS)
  const categories = await prisma.category.findMany({
    include: {
      nominations: {
        include: {
          movie: true,
          votes: {
            include: { user: true } // Incluimos quién votó
          }
        }
      }
    }
  })

  // Total de usuarios que han participado (para calcular %)
  const totalUsers = await prisma.user.count()

  return { categories, totalUsers, user }
}

// --- ACTIONS ---

export async function toggleVote(categoryId: string, nominationId: string) {
  const user = await getSession()
  if (!user) return

  // Optimistic update: No esperamos a leer el voto anterior si podemos evitarlo
  // Pero Prisma necesita saber si es update o create.
  // Usamos upsert o lógica directa.

  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_categoryId: {
        userId: user.id,
        categoryId
      }
    }
  })

  if (existingVote) {
    if (existingVote.nominationId === nominationId) {
      // Si es el mismo, lo quitamos
      await prisma.vote.delete({ where: { id: existingVote.id } })
    } else {
      // Si es otro, actualizamos
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { nominationId }
      })
    }
  } else {
    // Nuevo voto
    await prisma.vote.create({
      data: {
        userId: user.id,
        categoryId,
        nominationId
      }
    })
  }

  // Revalidar solo lo necesario
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/')
  revalidatePath('/my-votes')
}

export async function toggleSeen(movieId: string) {
  const user = await getSession()
  if (!user) return

  const existingSeen = await prisma.seenMovie.findUnique({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId
      }
    }
  })

  if (existingSeen) {
    await prisma.seenMovie.delete({ where: { id: existingSeen.id } })
  } else {
    await prisma.seenMovie.create({
      data: {
        userId: user.id,
        movieId
      }
    })
  }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/')
  revalidatePath('/movies')
}
