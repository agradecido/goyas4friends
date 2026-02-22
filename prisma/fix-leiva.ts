import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Corrigiendo datos de Leiva...')

  // 1. Buscar la categoría "Mejor Canción Original"
  // (Ojo: el nombre exacto puede variar por tildes/mayúsculas, busco aproximado)
  const category = await prisma.category.findFirst({
    where: { name: { contains: 'Canción' } }
  })

  if (!category) {
    console.error('❌ No encuentro la categoría de canción')
    return
  }

  // 2. Crear la película documental si no existe
  let movie = await prisma.movie.findFirst({ 
    where: { title: 'Hasta que me quede sin voz' } 
  })

  if (!movie) {
    movie = await prisma.movie.create({
      data: {
        title: 'Hasta que me quede sin voz',
        director: 'Leiva / Documental',
        imageUrl: 'https://ui-avatars.com/api/?name=Leiva&background=000&color=fff' // Placeholder negro rockero
      }
    })
  }

  // 3. Crear la nominación
  // Primero borramos si había alguna errónea de Leiva o duplicada
  // (Opcional, pero por limpieza)
  
  const exists = await prisma.nomination.findUnique({
    where: { movieId_categoryId: { movieId: movie.id, categoryId: category.id } }
  })

  if (!exists) {
    await prisma.nomination.create({
      data: {
        movieId: movie.id,
        categoryId: category.id
      }
    })
    console.log('✅ Nominación de Leiva añadida.')
  } else {
    console.log('ℹ️ La nominación ya existía.')
  }
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
