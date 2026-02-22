import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = await prisma.category.findMany({
    include: { nominations: true }
  })
  console.log(`Categorías encontradas: ${categories.length}`)
  if (categories.length > 0) {
      console.log('Ejemplo:', categories[0].name, '- Nominaciones:', categories[0].nominations.length)
  }
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
