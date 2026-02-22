import { getGoyasData } from '@/app/actions'
import { GoyasApp } from '@/components/GoyasApp'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic' // Para asegurar que no cachea los datos del usuario

export default async function Home() {
  const data = await getGoyasData()

  // Si no hay usuario, mandar al login
  if (!data?.user) {
    redirect('/login')
  }

  return <GoyasApp {...data} />
}
