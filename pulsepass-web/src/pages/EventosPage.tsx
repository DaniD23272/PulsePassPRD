import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { z } from 'zod'
import EventoCard from '../components/EventoCard'
import { useArtistasActivos, useArtistaPorNombre } from '../features/artistas/hooks'
import {
    CATEGORIAS_EVENTO,
    CategoriaEventoSchema,
    obtenerEventosPorArtista,
    obtenerEventosPublicados,
} from '../features/eventos/api'
import { ApiError } from '../lib/http'

const TextoFiltroSchema = z.string().trim().max(100).catch('')
const CategoriaFiltroSchema = z.union([CategoriaEventoSchema, z.literal('')])

export default function EventosPage() {
    const [params, setParams] = useSearchParams()
    const texto = TextoFiltroSchema.parse(params.get('q') ?? '')
    const categoriaParse = CategoriaFiltroSchema.safeParse(params.get('categoria') ?? '')
    const categoria = categoriaParse.success ? categoriaParse.data : ''
    const artista = TextoFiltroSchema.parse(params.get('artista') ?? '')
    const artistas = useArtistasActivos()
    const artistaResuelto = useArtistaPorNombre(artista || undefined)

    const eventos = useQuery({
        queryKey: artista
            ? ['eventos', 'artista', artista]
            : ['eventos', 'publicados'],
        queryFn: () => artista
            ? obtenerEventosPorArtista(artista)
            : obtenerEventosPublicados(),
        enabled: !artista || artistaResuelto.isSuccess,
        staleTime: 60_000,
    })

    const resultados = (eventos.data ?? []).filter((evento) => {
        const coincideTexto = !texto || `${evento.name} ${evento.eventCode}`.toLocaleLowerCase('es-CO').includes(texto.toLocaleLowerCase('es-CO'))
        const coincideCategoria = !categoria || evento.category === categoria
        return coincideTexto && coincideCategoria
    })

    function actualizarFiltro(clave: 'q' | 'categoria' | 'artista', valor: string) {
        setParams((actuales) => {
            const siguientes = new URLSearchParams(actuales)
            if (valor) siguientes.set(clave, valor)
            else siguientes.delete(clave)
            return siguientes
        }, { replace: true })
    }

    function limpiarFiltros() {
        setParams({}, { replace: true })
    }

    const cargando = artistas.isLoading || (Boolean(artista) && artistaResuelto.isLoading) || eventos.isLoading
    const errorArtista = Boolean(artista) && artistaResuelto.isError
    const errorEventos = !errorArtista && eventos.isError

    return (
        <section className="w-full">
            <header className="mb-6">
                <p className="text-sm font-bold uppercase tracking-widest text-marca-600 dark:text-indigo-300">PulsePass</p>
                <h1 className="mt-2 font-titulo text-3xl font-bold">Cartelera</h1>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.3fr)_minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_auto]">
                <div>
                    <label htmlFor="filtro-nombre" className="text-sm font-medium">Buscar por nombre</label>
                    <div className="relative mt-1">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
                        <input id="filtro-nombre" type="search" value={texto} onChange={(event) => actualizarFiltro('q', event.target.value)} placeholder="Buscar por nombre…" className="min-h-10 w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                    </div>
                </div>
                <div>
                    <label htmlFor="filtro-categoria" className="text-sm font-medium">Categoría</label>
                    <select id="filtro-categoria" value={categoria} onChange={(event) => actualizarFiltro('categoria', event.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                        <option value="">Todas</option>
                        {CATEGORIAS_EVENTO.map((valor) => <option key={valor} value={valor}>{valor}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="filtro-artista" className="text-sm font-medium">Artista</label>
                    <select id="filtro-artista" value={artista} onChange={(event) => actualizarFiltro('artista', event.target.value)} disabled={artistas.isLoading || artistas.isError} className="mt-1 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900">
                        <option value="">Todos</option>
                        {(artistas.data ?? []).map((item) => <option key={item.id} value={item.stageName}>{item.stageName}</option>)}
                    </select>
                </div>
                <div className="flex items-end">
                    <button type="button" onClick={limpiarFiltros} disabled={!texto && !categoria && !artista} className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800">Limpiar</button>
                </div>
            </div>

            {artistas.isError && <p className="mt-3 text-sm text-amber-800 dark:text-amber-200" role="status">No pudimos cargar la lista de artistas para el filtro.</p>}
            {!cargando && !errorArtista && !errorEventos && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300" aria-live="polite">{resultados.length} {resultados.length === 1 ? 'evento' : 'eventos'}</p>}

            {cargando && <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando eventos">{[1, 2, 3].map((skeleton) => <div key={skeleton} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="h-28 rounded-lg bg-slate-200 dark:bg-slate-800" /><div className="mt-4 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" /><div className="mt-3 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" /></div>)}</div>}

            {errorArtista && <section role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100"><p>{artistaResuelto.error instanceof ApiError && artistaResuelto.error.status === 404 ? 'No encontramos ese artista.' : 'No pudimos buscar al artista.'}</p><button type="button" className="mt-3 font-semibold underline" onClick={() => void artistaResuelto.refetch()}>Reintentar</button></section>}
            {errorEventos && <section role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100"><p>{eventos.error instanceof ApiError && eventos.error.status < 500 ? eventos.error.message : 'No pudimos cargar los eventos. Intenta de nuevo.'}</p><button type="button" className="mt-3 font-semibold underline" onClick={() => void eventos.refetch()}>Reintentar</button></section>}

            {!cargando && !errorArtista && !errorEventos && resultados.length === 0 && <div className="mt-5 rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900"><h2 className="font-titulo text-lg font-semibold">{texto || categoria || artista ? 'Sin resultados para tu búsqueda' : 'Aún no hay eventos publicados'}</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{texto || categoria || artista ? 'Cambia o limpia los filtros para ver más eventos.' : 'Cuando se publiquen eventos, aparecerán aquí.'}</p></div>}

            {!cargando && !errorArtista && !errorEventos && resultados.length > 0 && <ul className="mt-4 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">{resultados.map((evento) => <li key={evento.eventCode}><EventoCard evento={evento} /></li>)}</ul>}
        </section>
    )
}
