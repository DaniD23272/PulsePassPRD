import { Link, useParams } from 'react-router'
import { useSede } from '../features/sedes/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { leerCodigoRuta } from '../lib/parametrosRuta'

export default function DetalleSedePage() {
    const { code: codeParam } = useParams()
    const code = leerCodigoRuta(codeParam) ?? ''
    const sede = useSede(code)

    if (!code) return <section className="w-full py-12 text-center"><h1 className="font-titulo text-3xl font-bold">Sede no encontrada</h1><Link className="mt-4 inline-block text-marca-700 underline dark:text-indigo-300" to={RUTAS.sedes}>Volver a sedes</Link></section>
    if (sede.isLoading) return <p className="w-full py-12 text-center" role="status" aria-live="polite">Cargando sede…</p>
    if (sede.isError && sede.error instanceof ApiError && sede.error.status === 404) {
        return <section className="w-full py-12 text-center"><h1 className="font-titulo text-3xl font-bold">Sede no encontrada</h1><Link className="mt-4 inline-block text-marca-700 underline dark:text-indigo-300" to={RUTAS.sedes}>Volver a sedes</Link></section>
    }
    if (sede.isError || !sede.data) {
        return <section className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100" role="alert"><h1 className="font-titulo text-2xl font-bold">No pudimos cargar la sede</h1><button type="button" onClick={() => void sede.refetch()} className="mt-4 underline">Reintentar</button></section>
    }

    return (
        <section className="w-full">
            <Link to={RUTAS.sedes} className="text-sm font-semibold text-marca-700 hover:underline dark:text-indigo-300">← Sedes</Link>
            <article className="mx-auto mt-5 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-3"><h1 className="font-titulo text-2xl font-bold">{sede.data.name}</h1><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{sede.data.active ? 'Activa' : 'Inactiva'}</span></div>
                <dl className="mt-5 divide-y divide-slate-200 text-sm dark:divide-slate-800">
                    <div className="flex justify-between gap-4 py-3"><dt className="text-slate-600 dark:text-slate-300">Código</dt><dd className="font-medium">{sede.data.code}</dd></div>
                    <div className="flex justify-between gap-4 py-3"><dt className="text-slate-600 dark:text-slate-300">Ciudad</dt><dd className="font-medium">{sede.data.city}</dd></div>
                    <div className="flex justify-between gap-4 py-3"><dt className="text-slate-600 dark:text-slate-300">Capacidad</dt><dd className="font-medium">{sede.data.capacity.toLocaleString('es-CO')} personas</dd></div>
                    <div className="flex justify-between gap-4 py-3"><dt className="text-slate-600 dark:text-slate-300">Dirección</dt><dd className="text-right font-medium">{sede.data.address}</dd></div>
                </dl>
            </article>
        </section>
    )
}
