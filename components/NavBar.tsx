'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { logout } from '@/app/actions'

export function NavBar({ username }: { username: string }) {
  const pathname = usePathname()

  const links = [
    { href: '/', label: '🗳️ Votar' },
    { href: '/ranking', label: '📊 Ranking' },
    { href: '/my-votes', label: '📝 Mi Quiniela' },
    { href: '/movies', label: '🎬 Checklist' },
    { href: '/help', label: 'ℹ️ Ayuda' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 max-w-4xl items-center justify-between mx-auto px-4">
        
        {/* Título / Logo */}
        <div className="flex items-center gap-2 font-bold text-lg">
          <span className="text-xl">🐐</span> Goya's 2026
        </div>

        {/* Menú de Escritorio (Oculto en móvil) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`transition-colors hover:text-foreground/80 ${pathname === link.href ? 'text-foreground font-bold' : 'text-foreground/60'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Parte Derecha: Usuario + Menú Móvil */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-block text-xs text-muted-foreground mr-2">
            Hola, {username}
          </span>

          {/* Botón Hamburguesa */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="text-left">Menú</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-lg font-medium px-2 py-1 rounded-md transition-colors ${pathname === link.href ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="h-px bg-slate-200 my-2" />
                
                <div className="px-2 text-sm text-slate-500 mb-2">
                  Usuario: <span className="font-bold text-slate-900">{username}</span>
                </div>
                
                <form action={logout}>
                  <Button variant="destructive" className="w-full justify-start" size="sm">
                    Cerrar Sesión
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Botón Logout Escritorio */}
          <form action={logout} className="hidden md:block">
             <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">Salir</Button>
          </form>
        </div>
      </div>
    </header>
  )
}
