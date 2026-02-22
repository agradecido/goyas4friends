import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando base de datos REAL...')

  // Leer JSON
  const rawData = await fs.readFile(path.join(process.cwd(), 'goyas_data.json'), 'utf-8')
  const goyasData = JSON.parse(rawData)

  // Limpieza total (¡Peligro! Borra votos)
  // Si ya teníais votos reales, coméntalo. Como es dev, borramos.
  await prisma.vote.deleteMany({})
  await prisma.seenMovie.deleteMany({})
  await prisma.nomination.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.movie.deleteMany({})

  for (const item of goyasData) {
    console.log(`📂 Creando categoría: ${item.category}`)
    
    const category = await prisma.category.create({
      data: { name: item.category }
    })

    for (const nom of item.nominations) {
        // Normalizar título (quitar espacios extra, mayúsculas raras...)
        const title = nom.movie.trim()
        
        // Buscar o crear película (para no duplicarlas si salen en varias categorías)
        let movie = await prisma.movie.findFirst({ where: { title } })
        
        if (!movie) {
            movie = await prisma.movie.create({
                data: {
                    title,
                    director: 'Ver ficha', // El scraper no sacó director fácil, lo dejamos genérico
                    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=random&size=500`
                }
            })
        }

        // Crear nominación (Evitando duplicados si hay varios nominados por la misma peli en la misma categoría)
        const nomExists = await prisma.nomination.findUnique({
            where: { movieId_categoryId: { movieId: movie.id, categoryId: category.id } }
        })

        if (!nomExists) {
            await prisma.nomination.create({
                data: {
                    movieId: movie.id,
                    categoryId: category.id
                }
            })
        }
    }
  }

  // Usuario admin (si no existe)
  const adminExists = await prisma.user.findUnique({ where: { username: 'javi' } })
  if (!adminExists) {
      await prisma.user.create({
        data: { username: 'javi', password: 'admin', name: 'Javi Admin' }
      })
  }

  console.log('✅ ¡Todo importado!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
