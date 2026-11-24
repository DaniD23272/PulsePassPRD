import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { useAuth } from '../features/auth/AuthContext'
import AvisoExito from '../components/AvisoExito'
import { obtenerEvento } from '../features/eventos/api'
import { formatearPrecio } from '../features/tickets/api'
import { useTicketsPagadosPorEvento, useUsarTicket } from '../features/tickets/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { leerCodigoRuta } from '../lib/parametrosRuta'

const CodigoEventoSchema = z.object({ eventCode: z.string().trim().min(1, 'Escribe un código de evento.') })
type CodigoEventoForm = z.infer<typeof CodigoEventoSchema>

export default function TicketsPagadosEventoPage() {
    const { eventCode: eventCodeParam } = useParams()
    const eventCode = leerCodigoRuta(eventCodeParam) ?? ''
    const { token } = useAuth()
    const navigate = useNavigate()
    const evento = useQuery({ queryKey: ['evento', eventCode], queryFn: () => obtenerEvento(eventCode, token ?? ''), enabled: Boolean(eventCode && token), staleTime: 30_000 })
    const tickets = useTicketsPagadosPorEvento(eventCode, token ?? '')
    const marcarUsado = useUsarTicket()
    const { register, handleSubmit, formState: { errors } } = useForm<CodigoEventoForm>({ resolver: zodResolver(CodigoEventoSchema), defaultValues: { eventCode } })

    function buscarEvento(datos: CodigoEventoForm) { navigate(RUTAS.staffTickets(datos.eventCode)) }

    const noEncontrado = (error: unknown) => error instanceof ApiError && error.status === 404

    return (
        <section className="w-full">
            <header><p className="text-sm font-bold uppercase tracking-widest text-marca-600 dark:text-indigo-300">STAFF / ADMIN</p><h1 className="mt-2 font-titulo text-3xl font-bold">Tickets pagados{eventCode ? ` — ${eventCode}` : ''}</h1></header>
            <form noValidate onSubmit={handleSubmit(buscarEvento)} className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="min-w-0 flex-1"><label htmlFor="event-code-search" className="text-sm font-medium">Buscar evento por código</label><input id="event-code-search" autoComplete="off" {...register('eventCode')} aria-invalid={Boolean(errors.eventCode)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900" />{errors.eventCode && <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.eventCode.message}</p>}</div><button type="submit" className="mt-auto min-h-11 rounded-full border border-slate-300 px-5 font-semibold dark:border-slate-700">Ir</button></form>
            {!eventCode && <p className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-slate-600 dark:border-slate-700 dark:text-slate-300">Ingresa un código para consultar las entradas del evento.</p>}
            {eventCode && evento.isLoading && <p role="status" aria-busy="true" className="mt-5">Cargando evento…</p>}
            {eventCode && evento.isError && <section role="alert" className="mt-5 rounded-xl bg-red-50 p-5 text-red-900 dark:bg-red-950 dark:text-red-100"><p>{noEncontrado(evento.error) ? 'No encontramos ese evento.' : evento.error instanceof ApiError && evento.error.status === 403 ? 'No tienes permisos para consultar estas entradas.' : 'No pudimos cargar el evento.'}</p><button type="button" className="mt-2 underline" onClick={() => void evento.refetch()}>Reintentar</button></section>}
            {evento.data && <>
                {tickets.isLoading && <p role="status" aria-busy="true" className="mt-5">Cargando tickets pagados…</p>}
                {tickets.isError && <section role="alert" className="mt-5 rounded-xl bg-red-50 p-5 text-red-900 dark:bg-red-950 dark:text-red-100"><p>{tickets.error instanceof ApiError && tickets.error.status === 403 ? 'No tienes permisos para consultar estas entradas.' : 'No pudimos cargar los tickets pagados.'}</p><button type="button" className="mt-2 underline" onClick={() => void tickets.refetch()}>Reintentar</button></section>}
                {!tickets.isLoading && !tickets.isError && <p className="mt-5 font-semibold">Total: {tickets.data?.length ?? 0}</p>}
                {!tickets.isLoading && !tickets.isError && tickets.data?.length === 0 && <p className="mt-4 rounded-xl bg-slate-100 p-5 dark:bg-slate-900">No hay tickets pagados.</p>}
                {!!tickets.data?.length && <>
                    <div className="mt-4 hidden overflow-x-auto rounded-xl border border-slate-200 md:block dark:border-slate-800"><table className="w-full text-left text-sm"><caption className="sr-only">Tickets pagados del evento {eventCode}</caption><thead className="bg-slate-100 dark:bg-slate-800"><tr>{['Código', 'Tipo', 'Titular', 'Precio', 'Estado', 'Acción'].map((label) => <th scope="col" key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-800">{tickets.data.map((ticket) => <tr key={ticket.ticketCode}><th scope="row" className="px-4 py-3 font-mono">{ticket.ticketCode}</th><td className="px-4 py-3">{ticket.type}</td><td className="px-4 py-3">{ticket.userEmail}</td><td className="px-4 py-3">{formatearPrecio(ticket.price)}</td><td className="px-4 py-3">{ticket.status}</td><td className="px-4 py-3"><button type="button" disabled={marcarUsado.isPending} onClick={() => marcarUsado.mutate({ ticketCode: ticket.ticketCode, token: token ?? '' })} className="rounded-full bg-marca-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Usar</button></td></tr>)}</tbody></table></div>
                    <ul className="mt-4 grid gap-3 md:hidden">{tickets.data.map((ticket) => <li key={ticket.ticketCode} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="font-mono font-semibold">{ticket.ticketCode}</p><p className="mt-1">{ticket.type} · {formatearPrecio(ticket.price)}</p><p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-300">Titular: {ticket.userEmail}</p><button type="button" disabled={marcarUsado.isPending} onClick={() => marcarUsado.mutate({ ticketCode: ticket.ticketCode, token: token ?? '' })} className="mt-3 min-h-10 rounded-full bg-marca-600 px-4 font-semibold text-white disabled:opacity-50">Marcar como usado</button></li>)}</ul>
                </>}
                {marcarUsado.isError && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">{marcarUsado.error instanceof ApiError && marcarUsado.error.status === 409 ? marcarUsado.error.message : 'No pudimos actualizar el ticket.'}</p>}
                {marcarUsado.isSuccess && <AvisoExito className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">Ticket {marcarUsado.data.ticketCode} marcado como usado.</AvisoExito>}
            </>}
        </section>
    )
}
