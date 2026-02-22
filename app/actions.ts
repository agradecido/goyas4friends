'use server'

import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

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

export async function getGoyasData() {
  const user = await getSession()
  if (!user) return null

  const categories = await prisma.category.findMany({
    include: {
      nominations: {
        include: {
          movie: true
        }
      }
    }
  })

  const myVotes = await prisma.vote.findMany({
    where: { userId: user.id }
  })

  const mySeen = await prisma.seenMovie.findMany({
    where: { userId: user.id }
  })

  return { categories, myVotes, mySeen, user }
}

export async function getAllMoviesData() {
  const user = await getSession()
  if (!user) return null

  // Obtener todas las pelis ordenadas por título
  const movies = await prisma.movie.findMany({
    orderBy: { title: 'asc' }
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

  // Buscar si ya votó en esta categoría
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_categoryId: {
        userId: user.id,
        categoryId
      }
    }
  })

  if (existingVote) {
    // Si vota lo mismo, quitamos el voto (toggle off)
    if (existingVote.nominationId === nominationId) {
      await prisma.vote.delete({ where: { id: existingVote.id } })
    } else {
      // Si cambia de voto, actualizamos
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { nominationId }
      })
    }
  } else {
    // Voto nuevo
    await prisma.vote.create({
      data: {
        userId: user.id,
        categoryId,
        nominationId
      }
    })
  }
  
  // Forzar recarga de la página para actualizar visualmente el voto único
  // (Así se desmarcan las otras opciones)
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/')
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
}
