import { getGalaData } from '@/app/actions'
import { GalaApp } from '@/components/GalaApp'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function GalaPage() {
    const data = await getGalaData()

    if (!data?.user) {
        redirect('/login')
    }

    return <GalaApp categories={data.categories} user={data.user} />
}
