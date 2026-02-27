import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Sembrando base de datos REAL (Modo Seguro)...')

    // Leer JSON
    const rawData = await fs.readFile(path.join(process.cwd(), 'goyas_data.json'), 'utf-8')
    const goyasData = JSON.parse(rawData)

    // ⚠️ IMPORTANTE: No borramos datos para no perder votos en producción
    // await prisma.vote.deleteMany({}) 

    for (const item of goyasData) {
        // console.log(`📂 Verificando categoría: ${item.category}`)

        // Buscar o crear categoría
        let category = await prisma.category.findFirst({ where: { name: item.category } })
        if (!category) {
            category = await prisma.category.create({ data: { name: item.category } })
        }

        for (const nom of item.nominations) {
            // Normalizar título
            const title = nom.movie.trim()

            // Buscar o crear película
            let movie = await prisma.movie.findFirst({ where: { title } })

            if (!movie) {
                movie = await prisma.movie.create({
                    data: {
                        title,
                        director: 'Ver ficha',
                        imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=random&size=500`
                    }
                })
            }

            // Crear nominación si no existe, o actualizar personName
            const nomExists = await prisma.nomination.findUnique({
                where: { movieId_categoryId: { movieId: movie.id, categoryId: category.id } }
            })

            const personName = nom.person?.trim() || null

            if (!nomExists) {
                await prisma.nomination.create({
                    data: {
                        movieId: movie.id,
                        categoryId: category.id,
                        personName
                    }
                })
            } else if (personName && nomExists.personName !== personName) {
                // Actualizar personName si cambió
                await prisma.nomination.update({
                    where: { id: nomExists.id },
                    data: { personName }
                })
            }
        }
    }

    // Usuario admin por defecto (solo si no existe ninguno)
    const usersCount = await prisma.user.count()
    if (usersCount === 0) {
        await prisma.user.create({
            data: { username: 'admin', password: 'admin', name: 'Admin Inicial' }
        })
        console.log('👤 Usuario admin creado.')
    }

    console.log('✅ ¡Datos sincronizados sin borrar votos!')
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
