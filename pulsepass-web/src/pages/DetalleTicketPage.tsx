import { useState } from 'react'
import { Link, useParams } from 'react-router'
import Modal from '../components/Modal'
import AvisoExito from '../components/AvisoExito'
import { useAuth } from '../features/auth/AuthContext'
import { useCancelarTicket, useTicket } from '../features/tickets/hooks'
import { formatearPrecio } from '../features/tickets/api'
import { useUsuarioPorUsername } from '../features/usuarios/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { leerCodigoRuta } from '../lib/parametrosRuta'
import { ticketPuedeCancelarse } from '../features/tickets/politicas'

function fechaCompra(fecha: string): string {
    const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number)
    const fechaVisible = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(anio, mes - 1, dia))
    const hora = fecha.match(/T(\d{2}:\d{2})/)?.[1]
    return hora ? `${fechaVisible} ${hora}` : fechaVisible
}

export default function DetalleTicketPage() {
    const { ticketCode: ticketCodeParam } = useParams()
    const ticketCode = leerCodigoRuta(ticketCodeParam) ?? ''
    const { usuario, token } = useAuth()
    const ticket = useTicket(ticketCode, token ?? '')
    const perfil = useUsuarioPorUsername(usuario?.username, token)
    const cancelar = useCancelarTicket(usuario?.email ?? '')
    const [confirmar, setConfirmar] = useState(false)
    const [copiado, setCopiado] = useState(false)

    if (!ticketCode) return <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900" role="alert"><h1 className="font-titulo text-2xl font-bold">Ticket no disponible</h1><p className="mt-2 text-slate-600 dark:text-slate-300">El código de ticket no es válido.</p><Link to={RUTAS.misTickets} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-marca-600 px-5 font-semibold text-white">Volver a mis tickets</Link></section>
    if (ticket.isLoading) return <p className="w-full py-12 text-center" role="status" aria-busy="true">Cargando ticket…</p>
    if (ticket.isError || !ticket.data) {
        const noDisponible = ticket.error instanceof ApiError && [403, 404].includes(ticket.error.status)
        return <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900" role="alert"><h1 className="font-titulo text-2xl font-bold">Ticket no disponible</h1><p className="mt-2 text-slate-600 dark:text-slate-300">{noDisponible ? 'No pudimos encontrar un ticket disponible para tu cuenta.' : 'No pudimos cargar este ticket.'}</p><Link to={RUTAS.misTickets} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-marca-600 px-5 font-semibold text-white">Volver a mis tickets</Link>{!noDisponible && <button type="button" onClick={() => void ticket.refetch()} className="ml-3 underline">Reintentar</button>}</section>
    }

    const item = ticket.data
    const nombreTitular = perfil.data ? `${perfil.data.firstName} ${perfil.data.lastName}` : usuario?.username ?? item.userEmail

    return (
        <section className="w-full max-w-4xl">
            <Link to={RUTAS.misTickets} className="font-semibold text-marca-700 underline dark:text-indigo-300">← Mis tickets</Link>
            <article className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><p className="text-sm text-slate-600 dark:text-slate-300">{item.eventCode}</p><h1 className="mt-1 font-titulo text-2xl font-bold">{item.eventName}</h1></div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold dark:bg-slate-800">{item.status}</span>
                </div>
                <dl className="mt-7 grid gap-5 sm:grid-cols-2">
                    <div><dt className="text-sm text-slate-500 dark:text-slate-400">Código</dt><dd className="mt-1 flex flex-wrap items-center gap-3 font-mono font-bold"><span>{item.ticketCode}</span><button type="button" onClick={() => { void navigator.clipboard.writeText(item.ticketCode).then(() => setCopiado(true)).catch(() => setCopiado(false)) }} className="rounded-md border border-slate-300 px-3 py-1 text-xs font-sans font-semibold dark:border-slate-700">{copiado ? 'Copiado' : 'Copiar'}</button></dd></div>
                    <div><dt className="text-sm text-slate-500 dark:text-slate-400">Tipo</dt><dd className="mt-1 font-semibold">{item.type}</dd></div>
                    <div><dt className="text-sm text-slate-500 dark:text-slate-400">Precio</dt><dd className="mt-1 font-semibold">{formatearPrecio(item.price)}</dd></div>
                    <div><dt className="text-sm text-slate-500 dark:text-slate-400">Comprado el</dt><dd className="mt-1 font-semibold">{fechaCompra(item.purchaseDate)}</dd></div>
                    <div><dt className="text-sm text-slate-500 dark:text-slate-400">Titular</dt><dd className="mt-1 font-semibold">{nombreTitular}</dd></div>
                </dl>
                <p className="mt-7 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">Presenta este código en el ingreso.</p>
                {ticketPuedeCancelarse(item.status) && <button type="button" onClick={() => setConfirmar(true)} className="mt-5 min-h-11 rounded-full border border-red-600 px-5 font-semibold text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950">Cancelar ticket</button>}
                {cancelar.isSuccess && <AvisoExito className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">El ticket fue cancelado.</AvisoExito>}
            </article>
            {confirmar && <Modal titulo="Cancelar ticket" onCerrar={() => setConfirmar(false)}><p>¿Quieres cancelar la entrada para {item.eventName}? Esta acción se confirmará con el servidor.</p>{cancelar.isError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-100">{cancelar.error instanceof ApiError && cancelar.error.status === 409 ? cancelar.error.message : 'No pudimos cancelar el ticket. Intenta de nuevo.'}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => { cancelar.reset(); setConfirmar(false) }} className="min-h-11 rounded-full border border-slate-300 px-4 font-semibold dark:border-slate-700">Volver</button><button type="button" disabled={cancelar.isPending} onClick={() => cancelar.mutate({ ticketCode: item.ticketCode, token: token ?? '' }, { onSuccess: () => setConfirmar(false) })} className="min-h-11 rounded-full bg-red-600 px-5 font-bold text-white disabled:opacity-60">{cancelar.isPending ? 'Cancelando…' : 'Confirmar cancelación'}</button></div></Modal>}
        </section>
    )
}
