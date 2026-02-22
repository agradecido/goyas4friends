import { register } from '@/app/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function RegisterPage() {
  const handleRegister = async (formData: FormData) => {
    'use server'
    await register(formData)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-sm border-orange-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-orange-600">📝 Registro Goya's</CardTitle>
          <CardDescription className="text-center">
            Crea tu usuario para votar.<br/>
            <span className="text-xs text-red-500 font-medium">⚠️ Si olvidas la contraseña, tendrás que crear otro usuario (no hay recuperación).</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" name="username" placeholder="Tu nombre o mote" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" placeholder="Algo sencillo" required />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Crear cuenta</Button>
            
            <div className="text-center text-sm pt-2">
              ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 hover:underline">Entra aquí</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
