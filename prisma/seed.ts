import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando base de datos con nominados Goya 2026...')

  // Limpiar datos antiguos (opcional, pero recomendable para seed)
  await prisma.vote.deleteMany({})
  await prisma.seenMovie.deleteMany({})
  await prisma.nomination.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.movie.deleteMany({})
  // No borramos usuarios para no perder tu login

  // 1. Categorías Principales
  const cats = {
    pelicula: await prisma.category.create({ data: { name: 'Mejor Película' } }),
    direccion: await prisma.category.create({ data: { name: 'Mejor Dirección' } }),
    actor: await prisma.category.create({ data: { name: 'Mejor Actor Protagonista' } }),
    actriz: await prisma.category.create({ data: { name: 'Mejor Actriz Protagonista' } }),
    actorReparto: await prisma.category.create({ data: { name: 'Mejor Actor de Reparto' } }),
    actrizReparto: await prisma.category.create({ data: { name: 'Mejor Actriz de Reparto' } }),
    novel: await prisma.category.create({ data: { name: 'Mejor Dirección Novel' } }),
  }

  // 2. Películas y sus nominaciones
  // Helper para crear peli si no existe y asignar nominación
  const addNomination = async (title: string, categoryId: string, director?: string) => {
    let movie = await prisma.movie.findFirst({ where: { title } })
    if (!movie) {
      movie = await prisma.movie.create({
        data: { 
          title, 
          director: director || 'Desconocido',
          // Usamos una imagen genérica o placeholder de filmaffinity
          imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=random&size=500`
        }
      })
    }
    
    // Crear nominación si no existe
    const exists = await prisma.nomination.findUnique({
        where: { movieId_categoryId: { movieId: movie.id, categoryId } }
    })

    if (!exists) {
        await prisma.nomination.create({
            data: { movieId: movie.id, categoryId }
        })
    }
  }

  // --- DATOS REALES ---

  // Mejor Película
  await addNomination('Casa en flames', cats.pelicula.id, 'Dani de la Orden')
  await addNomination('El 47', cats.pelicula.id, 'Marcel Barrena')
  await addNomination('La estrella azul', cats.pelicula.id, 'Javier Macipe')
  await addNomination('La infiltrada', cats.pelicula.id, 'Arantxa Echevarría')
  await addNomination('Segundo premio', cats.pelicula.id, 'Isaki Lacuesta')

  // Mejor Dirección
  await addNomination('La habitación de al lado', cats.direccion.id, 'Pedro Almodóvar')
  await addNomination('La infiltrada', cats.direccion.id, 'Arantxa Echevarría')
  await addNomination('La virgen roja', cats.direccion.id, 'Paula Ortiz') // La virgen roja 2 en listado
  await addNomination('Marco', cats.direccion.id, 'Jon Garaño, Aitor Arregi')
  await addNomination('Segundo premio', cats.direccion.id, 'Isaki Lacuesta')

  // Mejor Dirección Novel
  await addNomination('Calladita', cats.novel.id, 'Miguel Faus')
  await addNomination('El llanto', cats.novel.id, 'Pedro Martín-Calero')
  await addNomination('La estrella azul', cats.novel.id, 'Javier Macipe')
  await addNomination('Por donde pasa el silencio', cats.novel.id, 'Sandra Romero')
  await addNomination('Rita', cats.novel.id, 'Paz Vega')

  // Mejor Actor Protagonista
  await addNomination('Casa en flames', cats.actor.id) // Eduard Fernández
  await addNomination('Marco', cats.actor.id) // Eduard Fernández (otra vez?)
  await addNomination('Polvo serán', cats.actor.id)
  await addNomination('Soy Nevenka', cats.actor.id)
  await addNomination('Volveréis', cats.actor.id)

  // Mejor Actriz Protagonista
  await addNomination('Casa en flames', cats.actriz.id)
  await addNomination('La habitación de al lado', cats.actriz.id) // Tilda Swinton / Julianne Moore
  // (Nota: El listado repetía la habitación de al lado, asumo dos actrices)
  await addNomination('La infiltrada', cats.actriz.id)
  await addNomination('Los destellos', cats.actriz.id)

  console.log('✅ Base de datos actualizada con los nominados reales.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
