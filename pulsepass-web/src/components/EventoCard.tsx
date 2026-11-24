import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { obtenerEvento, type EventoResumen, type EstadoEvento } from '../features/eventos/api'
import { useSede } from '../features/sedes/hooks'
import { RUTAS } from '../lib/rutas'
import { formatearFechaEvento } from '../lib/formato'
import { clasesPanelCategoria } from './eventoVisual'
import IconoCategoria from './IconoCategoria'

const clasesEstado: Record<EstadoEvento, string> = {
    DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    PUBLISHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    SOLD_OUT: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
    CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    FINISHED: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
}

export default function EventoCard({ evento }: { evento: EventoResumen }) {
    const detalle = useQuery({
        queryKey: ['evento', evento.eventCode],
        queryFn: () => obtenerEvento(evento.eventCode),
        staleTime: 30_000,
    })
    const sede = useSede(detalle.data?.venueCode ?? '')

    return (
        <Link to={RUTAS.evento(evento.eventCode)} className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900">
            <div className={`grid h-28 place-items-center ${clasesPanelCategoria(evento.category)}`}>
                <IconoCategoria categoria={evento.category} className="size-8" />
            </div>
            <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">{evento.category}</p>
                <h2 className="mt-1 font-titulo text-base font-semibold text-slate-900 group-hover:text-marca-700 dark:text-white dark:group-hover:text-indigo-300">{evento.name}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{formatearFechaEvento(evento.eventDate)}</p>
                {sede.data && <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"><svg aria-hidden="true" viewBox="0 0 20 20" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 18s6-5.4 6-10A6 6 0 1 0 4 8c0 4.6 6 10 6 10Z" /><circle cx="10" cy="8" r="2" /></svg>{sede.data.city}</p>}
                <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${clasesEstado[evento.status]}`}>{evento.status}</span>
            </div>
        </Link>
    )
}
