import type { ReactNode } from 'react'
import type { CategoriaEvento } from '../features/eventos/api'

export default function IconoCategoria({ categoria, className = 'size-8' }: { categoria: CategoriaEvento; className?: string }) {
    const atributos = {
        'aria-hidden': true as const,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        className,
    }

    const iconos: Record<CategoriaEvento, ReactNode> = {
        MUSIC: <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>,
        SPORTS: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
        TECHNOLOGY: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
        EDUCATION: <><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11v5c3 3 9 3 12 0v-5M22 9v6" /></>,
        CULTURE: <><path d="M3 21h18M5 21V9m14 12V9M3 9h18L12 3 3 9Zm5 3v5m4-5v5m4-5v5" /></>,
        ENTERTAINMENT: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    }

    return <svg {...atributos}>{iconos[categoria]}</svg>
}
