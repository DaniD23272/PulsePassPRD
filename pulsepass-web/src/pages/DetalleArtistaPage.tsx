import { Link, useParams } from 'react-router'
import AvatarIniciales from '../components/AvatarIniciales'
import EventoCard from '../components/EventoCard'
import { useArtista, useEventosDeArtista } from '../features/artistas/hooks'
import { ApiError } from '../lib/http'
import { leerIdRuta } from '../lib/parametrosRuta'
import { RUTAS } from '../lib/rutas'

export default function DetalleArtistaPage() {
    const { id: idParam } = useParams()
    const id = leerIdRuta(idParam)
    const artista = useArtista(id ?? 0, id !== undefined)
    const eventos = useEventosDeArtista(artista.data?.stageName)

    if (id === undefined || (artista.isError && artista.error instanceof ApiError && artista.error.status === 404)) {
        return <section className="w-full py-12 text-center"><h1 className="font-titulo text-3xl font-bold">Artista no encontrado</h1><Link className="mt-4 inline-block text-marca-700 underline dark:text-indigo-300" to={RUTAS.artistas}>Volver a artistas</Link></section>
    }
    if (artista.isLoading) return <p className="w-full py-12 text-center" role="status">Cargando artista…</p>
    if (artista.isError || !artista.data) return <section className="w-full rounded-2xl bg-red-50 p-6 text-red-900 dark:bg-red-950 dark:text-red-100" role="alert"><h1 className="font-titulo text-2xl font-bold">No pudimos cargar el artista</h1><button type="button" className="mt-3 underline" onClick={() => void artista.refetch()}>Reintentar</button></section>

    return (
        <section className="w-full">
            <Link to={RUTAS.artistas} className="text-sm font-semibold text-marca-700 hover:underline dark:text-indigo-300">← Artistas</Link>
            <article className="mt-5 flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
                <AvatarIniciales nombre={artista.data.stageName} tamano="grande" />
                <div>
                    <h1 className="font-titulo text-3xl font-bold">{artista.data.stageName}</h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Nombre artístico · {artista.data.genre}</p>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{artista.data.active ? 'Activo' : 'Inactivo'}</span>
                </div>
            </article>
            <section className="mt-8">
                <h2 className="font-titulo text-xl font-bold">Próximos eventos de {artista.data.stageName}</h2>
                {eventos.isLoading && <p className="mt-4" role="status">Cargando eventos…</p>}
                {eventos.isError && <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-900 dark:bg-red-950 dark:text-red-100" role="alert"><p>No pudimos cargar los eventos del artista.</p><button className="mt-2 underline" type="button" onClick={() => void eventos.refetch()}>Reintentar</button></div>}
                {!eventos.isLoading && !eventos.isError && eventos.data?.length === 0 && <p className="mt-4 text-slate-600 dark:text-slate-300">Sin eventos próximos.</p>}
                {eventos.data && eventos.data.length > 0 && <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{eventos.data.map((evento) => <li key={evento.eventCode}><EventoCard evento={evento} /></li>)}</ul>}
            </section>
        </section>
    )
}
