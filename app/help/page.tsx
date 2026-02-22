import { completeOnboarding } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
      <Card className="max-w-lg w-full shadow-xl border-orange-100">
        <CardHeader className="text-center pb-2">
          <div className="text-4xl mb-2">🐐</div>
          <CardTitle className="text-2xl font-bold text-slate-900">Bienvenido a la Quiniela</CardTitle>
          <p className="text-slate-500">¿Cómo funciona esto?</p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex gap-4 items-start">
            <div className="bg-yellow-100 p-2 rounded-lg text-2xl shrink-0">🗳️</div>
            <div>
              <h3 className="font-bold text-slate-900">Votar (La Quiniela)</h3>
              <p className="text-sm text-slate-600">Elige quién crees que va a ganar el Goya. Solo puedes votar uno por categoría. ¡A ver quién acierta más!</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-green-100 p-2 rounded-lg text-2xl shrink-0">🎬</div>
            <div>
              <h3 className="font-bold text-slate-900">Checklist de Películas</h3>
              <p className="text-sm text-slate-600">Una lista simple para marcar las pelis que ya has visto. No afecta a la votación, es solo para llevar tu cuenta personal.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 p-2 rounded-lg text-2xl shrink-0">📝</div>
            <div>
              <h3 className="font-bold text-slate-900">Mi Quiniela</h3>
              <p className="text-sm text-slate-600">El resumen de todo lo que has votado, para que lo revises antes de la gala.</p>
            </div>
          </div>

          <div className="pt-4">
            <form action={completeOnboarding}>
              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-lg py-6">
                ¡Entendido, vamos allá! 🚀
              </Button>
            </form>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
