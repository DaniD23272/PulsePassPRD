export default function CargaInicial() {
    return (
        <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
            <p role="status" aria-live="polite" className="flex items-center gap-3">
                <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-marca-600 border-t-transparent" />
                Cargando PulsePass…
            </p>
        </main>
    )
}
