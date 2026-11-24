import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import AvisoExito from '../components/AvisoExito'
import { useAuth } from '../features/auth/AuthContext'
import { formatearPrecio } from '../features/tickets/api'
import { obtenerTicket } from '../features/tickets/api'
import { useUsarTicket } from '../features/tickets/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { ticketPuedeValidarse } from '../features/tickets/politicas'

const BuscarTicketSchema = z.object({ ticketCode: z.string().trim().min(1, 'Ingresa el código de ticket.') })
const BuscarEventoSchema = z.object({ eventCode: z.string().trim().min(1, 'Escribe un código de evento.') })
type BuscarTicket = z.infer<typeof BuscarTicketSchema>
type BuscarEvento = z.infer<typeof BuscarEventoSchema>

export default function ValidacionIngresoPage() {
    const { token } = useAuth()
    const navigate = useNavigate()
    const [codigoBuscado, setCodigoBuscado] = useState('')
    const usarTicket = useUsarTicket()
    const buscar = useMutation({ mutationFn: (codigo: string) => obtenerTicket(codigo, token ?? '') })
    const { register, handleSubmit, reset, setFocus, formState: { errors, isSubmitting } } = useForm<BuscarTicket>({ resolver: zodResolver(BuscarTicketSchema), defaultValues: { ticketCode: '' } })
    const eventoForm = useForm<BuscarEvento>({ resolver: zodResolver(BuscarEventoSchema), defaultValues: { eventCode: '' } })

    useEffect(() => {
        if (usarTicket.isSuccess) setFocus('ticketCode')
    }, [usarTicket.isSuccess, setFocus])

    function enviar(datos: BuscarTicket) {
        setCodigoBuscado(datos.ticketCode)
        usarTicket.reset()
        buscar.mutate(datos.ticketCode)
    }

    const ticket = usarTicket.data ?? buscar.data
    const errorBuscar = buscar.error
    const textoError = errorBuscar instanceof ApiError && errorBuscar.status === 404
        ? 'Ticket no encontrado.'
        : errorBuscar instanceof ApiError && errorBuscar.status === 403
          ? 'Sin permisos para consultar este ticket.'
          : errorBuscar instanceof ApiError && errorBuscar.status === 401
            ? 'Tu sesión expiró. Inicia sesión de nuevo.'
            : 'No pudimos buscar el ticket. Intenta de nuevo.'

    return (
        <section className="w-full max-w-4xl">
            <header><p className="text-sm font-bold uppercase tracking-widest text-marca-600 dark:text-indigo-300">STAFF / ADMIN</p><h1 className="mt-2 font-titulo text-3xl font-bold">Validación de ingreso</h1><p className="mt-2 text-slate-600 dark:text-slate-300">Busca el código del ticket y registra el ingreso cuando la API confirme que está pagado.</p></header>
            <form noValidate onSubmit={handleSubmit(enviar)} className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row dark:border-slate-800 dark:bg-slate-900">
                <div className="min-w-0 flex-1"><label htmlFor="ticket-code" className="text-sm font-semibold">Código de ticket</label><input id="ticket-code" autoFocus autoComplete="off" {...register('ticketCode')} aria-invalid={Boolean(errors.ticketCode)} aria-describedby={errors.ticketCode ? 'ticket-code-error' : undefined} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-mono outline-none focus:border-marca-600 aria-invalid:border-red-600 dark:border-slate-700 dark:bg-slate-950" />{errors.ticketCode && <p id="ticket-code-error" className="mt-1 text-sm text-red-700 dark:text-red-300" role="alert">{errors.ticketCode.message}</p>}</div>
                <button type="submit" disabled={isSubmitting || buscar.isPending} className="mt-auto min-h-12 rounded-full bg-marca-600 px-6 font-bold text-white hover:bg-marca-700 disabled:opacity-60">{buscar.isPending ? 'Buscando…' : 'Buscar'}</button>
            </form>
            {buscar.isError && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950 dark:text-red-100" role="alert">{textoError}<button type="button" onClick={() => buscar.mutate(codigoBuscado)} className="ml-2 font-semibold underline">Reintentar</button></p>}
            {ticket && <article className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-titulo text-xl font-bold">{ticket.eventName}</h2><p className="mt-1 font-mono text-sm">{ticket.ticketCode}</p></div><span className={`rounded-full px-3 py-1 text-sm font-semibold ${ticket.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : ticket.status === 'USED' ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200' : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'}`}>{ticket.status}</span></div><p className="mt-4">{ticket.type} · Titular: {ticket.userEmail} · {formatearPrecio(ticket.price)}</p>{usarTicket.isError && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100" role="alert">{usarTicket.error instanceof ApiError && usarTicket.error.status === 409 ? usarTicket.error.message : 'No pudimos registrar el ingreso.'}</p>}{usarTicket.isSuccess && <AvisoExito className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">Ingreso registrado. El ticket quedó como USED.</AvisoExito>}{ticketPuedeValidarse(ticket.status) && <button type="button" disabled={usarTicket.isPending} onClick={() => usarTicket.mutate({ ticketCode: ticket.ticketCode, token: token ?? '' }, { onSuccess: () => { setCodigoBuscado(''); reset({ ticketCode: '' }) } })} className="mt-5 min-h-12 rounded-full bg-marca-600 px-6 font-bold text-white hover:bg-marca-700 disabled:opacity-60">{usarTicket.isPending ? 'Registrando ingreso…' : 'Marcar como usado'}</button>}</article>}
            <section id="tickets-pagados" className="mt-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-titulo text-xl font-semibold">Tickets pagados por evento</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Consulta la lista de entradas de un evento específico.</p><form noValidate onSubmit={eventoForm.handleSubmit(({ eventCode }) => navigate(RUTAS.staffTickets(eventCode)))} className="mt-4 flex flex-col gap-3 sm:flex-row"><div className="min-w-0 flex-1"><label htmlFor="staff-event-code" className="text-sm font-semibold">Código de evento</label><input id="staff-event-code" autoComplete="off" {...eventoForm.register('eventCode')} aria-invalid={Boolean(eventoForm.formState.errors.eventCode)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" />{eventoForm.formState.errors.eventCode && <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">{eventoForm.formState.errors.eventCode.message}</p>}</div><button type="submit" className="mt-auto min-h-11 rounded-full border border-slate-300 px-5 font-semibold dark:border-slate-700">Ir</button></form></section>
        </section>
    )
}
