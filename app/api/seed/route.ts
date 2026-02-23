import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
    // Proteger con un token secreto
    const token = request.nextUrl.searchParams.get('token')
    if (token !== process.env.SEED_SECRET) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    try {
        console.log('🌱 Sembrando base de datos...')

        const rawData = await fs.readFile(path.join(process.cwd(), 'goyas_data.json'), 'utf-8')
        const goyasData = JSON.parse(rawData)

        let categoriesCreated = 0
        let moviesCreated = 0
        let nominationsCreated = 0

        for (const item of goyasData) {
            let category = await prisma.category.findFirst({ where: { name: item.category } })
            if (!category) {
                category = await prisma.category.create({ data: { name: item.category } })
                categoriesCreated++
            }

            for (const nom of item.nominations) {
                const title = nom.movie.trim()

                let movie = await prisma.movie.findFirst({ where: { title } })
                if (!movie) {
                    movie = await prisma.movie.create({
                        data: {
                            title,
                            director: 'Ver ficha',
                            imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=random&size=500`
                        }
                    })
                    moviesCreated++
                }

                const nomExists = await prisma.nomination.findUnique({
                    where: { movieId_categoryId: { movieId: movie.id, categoryId: category.id } }
                })

                if (!nomExists) {
                    await prisma.nomination.create({
                        data: { movieId: movie.id, categoryId: category.id }
                    })
                    nominationsCreated++
                }
            }
        }

        // Usuario admin por defecto
        const usersCount = await prisma.user.count()
        let adminCreated = false
        if (usersCount === 0) {
            await prisma.user.create({
                data: { username: 'admin', password: 'admin', name: 'Admin Inicial' }
            })
            adminCreated = true
        }

        return NextResponse.json({
            success: true,
            categoriesCreated,
            moviesCreated,
            nominationsCreated,
            adminCreated
        })
    } catch (error) {
        console.error('Error en seed:', error)
        return NextResponse.json({ error: 'Error ejecutando seed' }, { status: 500 })
    }
}
