import { useEffect, useId, useRef, type ReactNode } from 'react'

export default function Modal({
    titulo,
    onCerrar,
    children,
}: {
    titulo: string
    onCerrar: () => void
    children: ReactNode
}) {
    const id = useId()
    const panel = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
        panel.current?.focus()

        function teclado(evento: KeyboardEvent) {
            if (evento.key === 'Escape') {
                evento.preventDefault()
                onCerrar()
            }
            if (evento.key !== 'Tab' || !panel.current) return
            const focos = panel.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            )
            const primero = focos.item(0)
            const ultimo = focos.item(focos.length - 1)
            if (evento.shiftKey && document.activeElement === primero) {
                evento.preventDefault()
                ultimo?.focus()
            } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault()
                primero?.focus()
            }
        }

        document.addEventListener('keydown', teclado)
        return () => {
            document.removeEventListener('keydown', teclado)
            anterior?.focus()
        }
    }, [onCerrar])

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onCerrar() }}>
            <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl outline-none dark:border-slate-700 dark:bg-slate-900">
                <h2 id={`${id}-title`} className="font-titulo text-xl font-bold">{titulo}</h2>
                <div className="mt-4">{children}</div>
            </section>
        </div>
    )
}
