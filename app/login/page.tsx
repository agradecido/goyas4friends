import { login } from '@/app/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function LoginPage() {
  const handleLogin = async (formData: FormData) => {
    'use server'
    await login(formData)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">🏆 Goya's 4 Friends</CardTitle>
          <CardDescription className="text-center">Entra para votar tu quiniela</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" name="username" placeholder="tu-nickname" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
            
            <div className="text-center text-sm pt-2">
              ¿Nuevo por aquí? <Link href="/register" className="text-blue-600 hover:underline">Regístrate</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
