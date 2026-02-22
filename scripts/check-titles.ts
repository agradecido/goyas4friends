import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const movies = await prisma.movie.findMany({ take: 5 })
  console.log('--- PELÍCULAS EN LA BASE DE DATOS ---')
  movies.forEach(m => console.log(`🎬 ${m.title}`))
  console.log('-------------------------------------')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
