import { Link } from 'react-router'
import AvatarIniciales from '../components/AvatarIniciales'
import { useArtistasActivos } from '../features/artistas/hooks'
import { RUTAS } from '../lib/rutas'

export default function ListaArtistasPage() {
    const artistas = useArtistasActivos()

    if (artistas.isLoading) return <p className="w-full py-12 text-center" role="status" aria-live="polite">Cargando artistas…</p>
    if (artistas.isError) {
        return (
            <section className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100" role="alert">
                <h1 className="font-titulo text-2xl font-bold">No pudimos cargar los artistas</h1>
                <button type="button" onClick={() => void artistas.refetch()} className="mt-4 min-h-11 rounded-lg bg-marca-600 px-5 font-bold text-white">Reintentar</button>
            </section>
        )
    }

    return (
        <section className="w-full">
            <header className="mb-8">
                <p className="text-sm font-bold uppercase tracking-widest text-marca-600 dark:text-indigo-300">PulsePass</p>
                <h1 className="mt-2 font-titulo text-3xl font-bold">Artistas</h1>
            </header>
            {(artistas.data ?? []).length === 0 ? (
                <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900" role="status">Aún no hay artistas activos.</p>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(artistas.data ?? []).map((artista, indice) => (
                        <li key={artista.id}>
                            <Link to={RUTAS.artista(artista.id)} className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900">
                                <AvatarIniciales nombre={artista.stageName} indice={indice} />
                                <span>
                                    <span className="block font-semibold text-slate-900 dark:text-white">{artista.stageName}</span>
                                    <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">{artista.genre}</span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
