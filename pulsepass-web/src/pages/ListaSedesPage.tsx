import { Link } from 'react-router'
import { useSedesActivas } from '../features/sedes/hooks'
import { RUTAS } from '../lib/rutas'

export default function ListaSedesPage() {
    const sedes = useSedesActivas()

    if (sedes.isLoading) return <p className="w-full py-12 text-center" role="status" aria-live="polite">Cargando sedes…</p>
    if (sedes.isError) {
        return <section className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100" role="alert"><h1 className="font-titulo text-2xl font-bold">No pudimos cargar las sedes</h1><button type="button" onClick={() => void sedes.refetch()} className="mt-4 min-h-11 rounded-lg bg-marca-600 px-5 font-bold text-white">Reintentar</button></section>
    }

    return (
        <section className="w-full">
            <header className="mb-8"><p className="text-sm font-bold uppercase tracking-widest text-marca-600 dark:text-indigo-300">PulsePass</p><h1 className="mt-2 font-titulo text-3xl font-bold">Sedes</h1></header>
            {(sedes.data ?? []).length === 0 ? <p role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">Aún no hay sedes activas.</p> : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(sedes.data ?? []).map((sede) => <li key={sede.code}><Link to={RUTAS.sede(sede.code)} className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"><span className="flex items-start justify-between gap-3"><span className="font-semibold text-slate-900 dark:text-white">{sede.name}</span><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Activa</span></span><span className="mt-3 block text-sm text-slate-600 dark:text-slate-300">{sede.city} · Cap. {sede.capacity.toLocaleString('es-CO')}</span></Link></li>)}
                </ul>
            )}
        </section>
    )
}
