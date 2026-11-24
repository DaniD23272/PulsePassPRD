import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import AvatarIniciales from '../components/AvatarIniciales'
import EventoCard from '../components/EventoCard'
import { obtenerEventosPublicados } from '../features/eventos/api'
import { useAuth } from '../features/auth/AuthContext'
import { useArtistasActivos } from '../features/artistas/hooks'
import { RUTAS } from '../lib/rutas'

function SkeletonEvento() {
    return <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-hidden="true"><div className="h-28 animate-pulse bg-slate-200 dark:bg-slate-800" /><div className="space-y-3 p-4"><div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" /><div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" /><div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" /></div></div>
}

export default function InicioPage() {
    const { usuario } = useAuth()
    const eventos = useQuery({
        queryKey: ['eventos', 'publicados'],
        queryFn: obtenerEventosPublicados,
        staleTime: 60_000,
    })
    const artistas = useArtistasActivos()

    return (
        <div className="w-full space-y-8 sm:space-y-10">
            <section className="rounded-2xl bg-linear-to-r from-marca-600 to-acento-500 px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12">
                <div className="max-w-2xl">
                    <h1 className="font-titulo text-3xl font-bold leading-tight sm:text-4xl">Descubre los mejores eventos</h1>
                    <p className="mt-3 text-sm text-white/90 sm:text-base">Música, cultura, deporte y tecnología en un solo lugar.</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link to={RUTAS.eventos} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2 text-sm font-semibold text-marca-700 hover:bg-indigo-50 focus-visible:outline-white">Ver cartelera</Link>
                        {!usuario && <Link to={RUTAS.registro} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-white">Crear cuenta</Link>}
                    </div>
                </div>
            </section>

            <section aria-labelledby="eventos-proximos-heading">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 id="eventos-proximos-heading" className="font-titulo text-xl font-bold">Próximos eventos</h2>
                    <Link to={RUTAS.eventos} className="shrink-0 text-sm font-medium text-marca-700 hover:underline dark:text-indigo-300">Ver todos <span aria-hidden="true">→</span></Link>
                </div>
                {eventos.isLoading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-busy="true" aria-label="Cargando eventos"><SkeletonEvento /><SkeletonEvento /><SkeletonEvento /></div>}
                {eventos.isError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100" role="alert"><p>No pudimos cargar los eventos.</p><button type="button" className="mt-2 font-semibold underline" onClick={() => void eventos.refetch()}>Reintentar</button></div>}
                {!eventos.isLoading && !eventos.isError && eventos.data?.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900"><p className="font-semibold">Aún no hay eventos publicados</p><Link to={RUTAS.artistas} className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Ver artistas</Link></div>}
                {!eventos.isLoading && !eventos.isError && Boolean(eventos.data?.length) && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(eventos.data ?? []).slice(0, 3).map((evento) => <EventoCard key={evento.eventCode} evento={evento} />)}</div>}
            </section>

            <section aria-labelledby="artistas-destacados-heading">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 id="artistas-destacados-heading" className="font-titulo text-xl font-bold">Artistas destacados</h2>
                    <Link to={RUTAS.artistas} className="shrink-0 text-sm font-medium text-marca-700 hover:underline dark:text-indigo-300">Ver todos <span aria-hidden="true">→</span></Link>
                </div>
                {artistas.isLoading && <div className="flex flex-wrap gap-4" role="status" aria-live="polite"><span className="sr-only">Cargando artistas…</span><div className="h-12 w-36 animate-pulse rounded-full bg-slate-200" /><div className="h-12 w-36 animate-pulse rounded-full bg-slate-200" /><div className="h-12 w-36 animate-pulse rounded-full bg-slate-200" /></div>}
                {artistas.isError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100" role="alert"><p>No pudimos cargar los artistas.</p><button type="button" className="mt-2 font-semibold underline" onClick={() => void artistas.refetch()}>Reintentar</button></div>}
                {!artistas.isLoading && !artistas.isError && artistas.data?.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Aún no hay artistas activos.</p>}
                {!artistas.isLoading && !artistas.isError && Boolean(artistas.data?.length) && <ul className="flex flex-wrap gap-x-6 gap-y-3">{(artistas.data ?? []).slice(0, 6).map((artista, indice) => <li key={artista.id}><Link to={RUTAS.artista(artista.id)} className="inline-flex min-h-12 items-center gap-3 rounded-full pr-3 font-semibold hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:text-indigo-300"><AvatarIniciales nombre={artista.stageName} indice={indice} tamano="compacto" />{artista.stageName}</Link></li>)}</ul>}
            </section>
        </div>
    )
}
