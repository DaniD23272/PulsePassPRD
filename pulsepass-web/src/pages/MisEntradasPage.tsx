import { useState } from 'react'
import { Link } from 'react-router'
import Modal from '../components/Modal'
import AvisoExito from '../components/AvisoExito'
import { useAuth } from '../features/auth/AuthContext'
import { formatearPrecio, type EstadoTicket } from '../features/tickets/api'
import { useCancelarTicket, useMisTickets } from '../features/tickets/hooks'
import type { Ticket } from '../features/tickets/api'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { ticketPuedeCancelarse } from '../features/tickets/politicas'

type FiltroTicket = 'ALL' | 'PAID' | 'USED' | 'CANCELLED'
const FILTROS: ReadonlyArray<{ id: FiltroTicket; label: string }> = [
    { id: 'ALL', label: 'Todos' }, { id: 'PAID', label: 'Pagados' },
    { id: 'USED', label: 'Usados' }, { id: 'CANCELLED', label: 'Cancelados' },
]
const CLASES_ESTADO: Record<EstadoTicket, string> = {
    RESERVED: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    USED: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
}

function fechaCompra(fecha: string): string {
    const [year, month, day] = fecha.slice(0, 10).split('-').map(Number)
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(year, month - 1, day))
}

function TarjetaTicket({ ticket, onCancelar }: { ticket: Ticket; onCancelar: (ticket: Ticket) => void }) {
    return <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap items-start justify-between gap-3"><h2 className="font-titulo text-lg font-semibold">{ticket.eventName}</h2><span className={`rounded-full px-3 py-1 text-xs font-bold ${CLASES_ESTADO[ticket.status]}`}>{ticket.status}</span></div><p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{ticket.ticketCode} · {ticket.type} · {formatearPrecio(ticket.price)} · {fechaCompra(ticket.purchaseDate)}</p><div className="mt-4 flex flex-wrap gap-3"><Link to={RUTAS.ticket(ticket.ticketCode)} className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700">Ver detalle</Link>{ticketPuedeCancelarse(ticket.status) && <button type="button" onClick={() => onCancelar(ticket)} className="min-h-11 rounded-full border border-red-600 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950">Cancelar</button>}</div></li>
}

export default function MisEntradasPage() {
    const { usuario, token } = useAuth()
    const tickets = useMisTickets(usuario?.email ?? '', token ?? '')
    const cancelacion = useCancelarTicket(usuario?.email ?? '')
    const [filtro, setFiltro] = useState<FiltroTicket>('ALL')
    const [ticketAEliminar, setTicketAEliminar] = useState<Ticket | null>(null)
    const [cancelado, setCancelado] = useState(false)

    const listaFiltrada = (tickets.data ?? []).filter((ticket) => filtro === 'ALL' || ticket.status === filtro)

    return <section className="w-full">
        <header className="mb-6"><h1 className="font-titulo text-3xl font-bold tracking-tight sm:text-4xl">Mis tickets</h1></header>
        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar tickets por estado">{FILTROS.map((opcion) => <button key={opcion.id} type="button" aria-pressed={filtro === opcion.id} onClick={() => setFiltro(opcion.id)} className={`min-h-10 rounded-full px-4 text-sm font-semibold ${filtro === opcion.id ? 'bg-marca-600 text-white' : 'border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>{opcion.label}</button>)}</div>
        {tickets.isLoading && <div className="max-w-4xl space-y-4" aria-busy="true" aria-label="Cargando tickets">{[1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />)}</div>}
        {tickets.isError && <section role="alert" className="rounded-xl bg-red-50 p-5 text-red-900 dark:bg-red-950 dark:text-red-100"><p>{tickets.error instanceof ApiError && tickets.error.status < 500 ? tickets.error.message : 'No pudimos cargar tus tickets.'}</p><button type="button" className="mt-3 font-semibold underline" onClick={() => void tickets.refetch()}>Reintentar</button></section>}
        {!tickets.isLoading && !tickets.isError && tickets.data?.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900"><h2 className="font-titulo text-xl font-semibold">Aún no tienes tickets</h2><p className="mt-2 text-slate-600 dark:text-slate-300">Explora los eventos publicados para encontrar uno.</p><Link to={RUTAS.eventos} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-marca-600 px-5 font-bold text-white">Explorar eventos</Link></div>}
        {!tickets.isLoading && !tickets.isError && tickets.data && tickets.data.length > 0 && listaFiltrada.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-7 text-center dark:border-slate-700 dark:bg-slate-900">No tienes tickets con este estado.</p>}
        {!tickets.isLoading && !tickets.isError && listaFiltrada.length > 0 && <ul className="grid max-w-6xl list-none gap-4 p-0 lg:grid-cols-2">{listaFiltrada.map((ticket) => <TarjetaTicket key={ticket.ticketCode} ticket={ticket} onCancelar={(seleccionado) => { cancelacion.reset(); setCancelado(false); setTicketAEliminar(seleccionado) }} />)}</ul>}
        {cancelado && <AvisoExito className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">El ticket fue cancelado.</AvisoExito>}
        {ticketAEliminar && <Modal titulo="Cancelar ticket" onCerrar={() => { cancelacion.reset(); setTicketAEliminar(null) }}><p>¿Confirmas cancelar el ticket <strong>{ticketAEliminar.ticketCode}</strong> de {ticketAEliminar.eventName}?</p>{cancelacion.isError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">{cancelacion.error instanceof ApiError && cancelacion.error.status === 409 ? cancelacion.error.message : 'No pudimos cancelar el ticket.'}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => { cancelacion.reset(); setTicketAEliminar(null) }} className="min-h-11 rounded-full border border-slate-300 px-4 dark:border-slate-700">Volver</button><button type="button" disabled={cancelacion.isPending} onClick={() => cancelacion.mutate({ ticketCode: ticketAEliminar.ticketCode, token: token ?? '' }, { onSuccess: () => { setTicketAEliminar(null); setCancelado(true) } })} className="min-h-11 rounded-full bg-red-600 px-5 font-bold text-white disabled:opacity-60">{cancelacion.isPending ? 'Cancelando…' : 'Confirmar cancelación'}</button></div></Modal>}
    </section>
}
