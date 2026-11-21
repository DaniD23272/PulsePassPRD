import { useQuery } from '@tanstack/react-query'
import {
    obtenerEventosPublicados,
    type CategoriaEvento,
    type EstadoEvento,
} from '../features/eventos/api'
import { ApiError } from '../lib/http'

const nombresCategoria: Record<CategoriaEvento, string> = {
    MUSIC: 'Música',
    SPORTS: 'Deportes',
    TECHNOLOGY: 'Tecnología',
    EDUCATION: 'Educación',
    CULTURE: 'Cultura',
    ENTERTAINMENT: 'Entretenimiento',
}

const nombresEstado: Record<EstadoEvento, string> = {
    DRAFT: 'Borrador',
    PUBLISHED: 'Publicado',
    SOLD_OUT: 'Agotado',
    CANCELLED: 'Cancelado',
    FINISHED: 'Finalizado',
}

const clasesEstado: Record<EstadoEvento, string> = {
    DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    PUBLISHED:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    SOLD_OUT:
        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    FINISHED: 'bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
}

function formatearFecha(valor: string): string {
    const fecha = new Date(valor)

    if (Number.isNaN(fecha.getTime())) {
        return valor
    }

    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(fecha)
}

export default function EventosPage() {
    const {
        data: eventos = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['eventos', 'publicados'],
        queryFn: obtenerEventosPublicados,
        retry: false,
    })

    return (
        <section className="w-full">
            <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-widest text-marca-600">
                    Cartelera
                </p>
                <h1 className="mt-2 font-titulo text-3xl font-bold tracking-tight sm:text-4xl">
                    Eventos publicados
                </h1>
                <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
                    Explora los próximos eventos y encuentra tu siguiente plan.
                </p>
            </div>

            {isLoading && (
                <div
                    role="status"
                    aria-live="polite"
                    className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                    Cargando eventos…
                </div>
            )}

            {isError && (
                <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
                >
                    <p className="font-semibold">
                        {error instanceof ApiError && error.status < 500
                            ? error.message
                            : 'No pudimos cargar los eventos. Intenta de nuevo.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-4 min-h-11 rounded-full bg-red-700 px-5 py-2 text-sm font-bold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {!isLoading && !isError && eventos.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="font-titulo text-xl font-bold">Aún no hay eventos</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                        Cuando se publiquen eventos, aparecerán aquí.
                    </p>
                </div>
            )}

            {!isLoading && !isError && eventos.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {eventos.map((evento) => (
                        <article
                            key={evento.id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="bg-linear-to-r from-marca-600 to-acento-500 p-5 text-white">
                                <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                                    {nombresCategoria[evento.category]}
                                </p>
                                <p className="mt-5 font-mono text-sm">{evento.eventCode}</p>
                            </div>

                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="font-titulo text-lg font-bold">
                                        {evento.name}
                                    </h2>
                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${clasesEstado[evento.status]}`}
                                    >
                    {nombresEstado[evento.status]}
                  </span>
                                </div>

                                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                                    {formatearFecha(evento.eventDate)}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}