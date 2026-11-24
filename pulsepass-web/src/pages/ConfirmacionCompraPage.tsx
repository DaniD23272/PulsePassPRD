import { Link, useParams } from 'react-router'
import { useAuth } from '../features/auth/AuthContext'
import { formatearPrecio } from '../features/tickets/api'
import { useTicket } from '../features/tickets/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { leerCodigoRuta } from '../lib/parametrosRuta'

export default function ConfirmacionCompraPage() {
    const { ticketCode: ticketCodeParam } = useParams()
    const ticketCode = leerCodigoRuta(ticketCodeParam) ?? ''
    const { token } = useAuth()
    const ticket = useTicket(ticketCode, token ?? '')

    if (!ticketCode) return <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900" role="alert"><h1 className="font-titulo text-2xl font-bold">Compra no disponible</h1><p className="mt-2 text-slate-600 dark:text-slate-300">El código de ticket no es válido.</p><Link to={RUTAS.misTickets} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-marca-600 px-5 font-bold text-white">Ver mis tickets</Link></section>
    if (ticket.isLoading) return <p className="w-full py-12 text-center" role="status" aria-busy="true">Confirmando tu compra…</p>
    if (ticket.isError || !ticket.data) {
        const noDisponible = ticket.error instanceof ApiError && [403, 404].includes(ticket.error.status)
        return <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900" role="alert"><h1 className="font-titulo text-2xl font-bold">Compra no disponible</h1><p className="mt-2 text-slate-600 dark:text-slate-300">{noDisponible ? 'No pudimos encontrar un ticket asociado a tu cuenta.' : 'No pudimos confirmar el ticket.'}</p><Link to={RUTAS.misTickets} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-marca-600 px-5 font-bold text-white">Ver mis tickets</Link>{!noDisponible && <button type="button" className="ml-3 underline" onClick={() => void ticket.refetch()}>Reintentar</button>}</section>
    }

    return <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10 dark:border-slate-800 dark:bg-slate-900"><span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">✓</span><h1 className="mt-5 font-titulo text-3xl font-bold">¡Compra realizada con éxito!</h1><h2 className="mt-4 text-xl font-semibold">{ticket.data.eventName}</h2><p className="mt-2 text-slate-600 dark:text-slate-300">Ticket {ticket.data.ticketCode} · {ticket.data.type} · {formatearPrecio(ticket.data.price)}</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Estado: {ticket.data.status}</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link to={RUTAS.ticket(ticket.data.ticketCode)} className="inline-flex min-h-11 items-center justify-center rounded-full bg-marca-600 px-5 font-bold text-white hover:bg-marca-700">Ver mis tickets</Link><Link to={RUTAS.eventos} className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-5 font-semibold dark:border-slate-700">Seguir explorando</Link></div></section>
}
