import { useEffect, useState, type ReactNode } from 'react'

export default function AvisoExito({ children, className = '' }: { children: ReactNode; className?: string }) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const temporizador = window.setTimeout(() => setVisible(false), 4_000)
        return () => window.clearTimeout(temporizador)
    }, [])

    if (!visible) return null

    return <p role="status" aria-live="polite" className={className}>{children}</p>
}
