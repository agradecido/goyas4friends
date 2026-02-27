import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Categories where the nominee is a person (not a movie/production team)
export const PERSON_CATEGORIES = [
  'mejor dirección',
  'mejor dirección novel',
  'mejor guion original',
  'mejor guion adaptado',
  'mejor música original',
  'mejor canción original',
  'mejor actor protagonista',
  'mejor actriz protagonista',
  'mejor actor de reparto',
  'mejor actriz de reparto',
  'mejor actor revelación',
  'mejor actriz revelación',
  'mejor dirección de producción',
  'mejor dirección de fotografía',
  'mejor montaje',
  'mejor dirección de arte',
  'mejor diseño de vestuario',
  'mejor maquillaje y peluquería',
  'mejor sonido',
  'mejores efectos especiales',
]

export function isPersonCategory(categoryName: string): boolean {
  return PERSON_CATEGORIES.includes(categoryName.toLowerCase())
}
