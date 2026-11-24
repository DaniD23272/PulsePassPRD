import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useForm, type UseFormRegister } from 'react-hook-form'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import AvatarIniciales from '../components/AvatarIniciales'
import IconoCategoria from '../components/IconoCategoria'
import Modal from '../components/Modal'
import { clasesPanelCategoria } from '../components/eventoVisual'
import { useAuth } from '../features/auth/AuthContext'
import { obtenerEvento, type EstadoEvento } from '../features/eventos/api'
import { eventoAceptaCompras, rolPuedeComprarEntrada } from '../features/eventos/politicas'
import { useComprarTicket } from '../features/tickets/hooks'
import { TipoTicketSchema, type TipoTicket } from '../features/tickets/api'
import { useSede } from '../features/sedes/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { leerCodigoRuta } from '../lib/parametrosRuta'

const CLASE_ESTADO: Record<EstadoEvento, string> = {
    DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    PUBLISHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    SOLD_OUT: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    FINISHED: 'bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
}

const TIPOS_ENTRADA: TipoTicket[] = ['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT']
const CompraSchema = z.object({ type: TipoTicketSchema })
type FormularioCompra = z.infer<typeof CompraSchema>

function IconoFecha() {
    return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0"><rect x="2.5" y="4" width="15" height="13" rx="2" /><path d="M6 2.5v3M14 2.5v3M2.5 8h15" /></svg>
}

function IconoPersona() {
    return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0"><circle cx="10" cy="6" r="3" /><path d="M4 17c.4-3.2 2.5-5 6-5s5.6 1.8 6 5" /></svg>
}

function PanelCompra({
    autenticado,
    disponible,
    pendiente,
    error,
    register,
    onEnviar,
}: {
    autenticado: boolean
    disponible: boolean
    pendiente: boolean
    error?: string
    register: UseFormRegister<FormularioCompra>
    onEnviar: (evento: FormEvent<HTMLFormElement>) => void
}) {
    return <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
        <h2 className="font-titulo text-lg font-semibold">Entradas</h2>
        <form noValidate onSubmit={onEnviar} className="mt-3 space-y-3">
            <fieldset disabled={!disponible || pendiente}>
                <legend className="mb-2 text-sm text-slate-600 dark:text-slate-300">Tipo de entrada</legend>
                <div className="space-y-2">
                    {TIPOS_ENTRADA.map((ticketType) => <label key={ticketType} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-marca-500 has-checked:border-marca-600 has-checked:bg-marca-50 dark:border-slate-700 dark:has-checked:bg-slate-800">
                        <input type="radio" value={ticketType} {...register('type')} />
                        <span className="font-medium">{ticketType}</span>
                    </label>)}
                </div>
            </fieldset>
            {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
            <button type="submit" disabled={!disponible || pendiente} className="min-h-11 w-full rounded-lg bg-marca-600 px-4 font-semibold text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-not-allowed disabled:opacity-50">
                {pendiente ? 'Procesando…' : !autenticado ? 'Inicia sesión para comprar' : disponible ? 'Comprar entrada' : 'Compra no disponible'}
            </button>
            {autenticado && !disponible && <p className="text-sm text-slate-600 dark:text-slate-300">El evento no está disponible para comprar entradas.</p>}
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">El precio lo define el sistema al confirmar.</p>
        </form>
    </aside>
}

function formatearFechaEvento(fecha: string): { fecha: string; hora: string } {
    const valor = new Date(fecha)
    if (Number.isNaN(valor.getTime())) return { fecha, hora: '' }
    return {
        fecha: new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(valor),
        hora: new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(valor),
    }
}

export default function EventoDetallePage() {
    const { eventCode: eventCodeParam } = useParams()
    const eventCode = leerCodigoRuta(eventCodeParam) ?? ''
    const { usuario, token } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [confirmarCompra, setConfirmarCompra] = useState(false)
    const [tipoConfirmado, setTipoConfirmado] = useState<TipoTicket>('GENERAL')
    const evento = useQuery({ queryKey: ['evento', eventCode], queryFn: () => obtenerEvento(eventCode), enabled: Boolean(eventCode), staleTime: 30_000 })
    const sede = useSede(evento.data?.venueCode ?? '')
    const puedeComprar = rolPuedeComprarEntrada(usuario?.roles)
    const esOperador = usuario?.roles.some((rol) => rol === 'STAFF' || rol === 'ADMIN') ?? false
    const compra = useComprarTicket(usuario?.email ?? '', eventCode, token ?? '')
    const { register, handleSubmit, formState: { errors } } = useForm<FormularioCompra>({ resolver: zodResolver(CompraSchema), defaultValues: { type: 'GENERAL' } })

    const abrirConfirmacion = handleSubmit(({ type }) => {
        setTipoConfirmado(type)
        if (!usuario) {
            navigate(RUTAS.login, { state: { desde: `${location.pathname}${location.search}${location.hash}` } })
            return
        }
        setConfirmarCompra(true)
    })

    if (!eventCode) return <section className="w-full py-10" role="alert"><p className="text-sm font-bold uppercase tracking-widest text-marca-600 dark:text-indigo-300">PulsePass</p><h1 className="mt-2 font-titulo text-3xl font-bold">Evento no disponible</h1><p className="mt-3 text-slate-600 dark:text-slate-300">El código del evento no es válido.</p><Link to={RUTAS.eventos} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-marca-600 px-5 font-bold text-white">Volver a eventos</Link></section>
    if (evento.isLoading) return <div className="w-full animate-pulse space-y-5" aria-busy="true" aria-label="Cargando evento"><div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" /><div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" /></div>
    if (evento.isError || !evento.data) {
        const status = evento.error instanceof ApiError ? evento.error.status : 0
        const texto = status === 404 || status === 403 ? 'No encontramos el evento publicado que buscas.' : status === 0 ? 'No pudimos conectar con el servidor.' : 'No pudimos cargar el evento. Intenta nuevamente.'
        return <section className="w-full py-10" role="alert"><p className="text-sm font-bold uppercase tracking-widest text-marca-600 dark:text-indigo-300">PulsePass</p><h1 className="mt-2 font-titulo text-3xl font-bold">Evento no disponible</h1><p className="mt-3 text-slate-600 dark:text-slate-300">{texto}</p><button type="button" onClick={() => void evento.refetch()} className="mt-5 min-h-11 rounded-lg border border-slate-300 px-5 font-semibold dark:border-slate-700">Reintentar</button><Link to={RUTAS.eventos} className="ml-3 inline-flex min-h-11 items-center rounded-lg bg-marca-600 px-5 font-bold text-white">Volver a eventos</Link></section>
    }

    const item = evento.data
    const compraDisponible = eventoAceptaCompras(item.status)
    const fecha = formatearFechaEvento(item.eventDate)

    return <article className={`w-full ${compraDisponible && !esOperador ? 'pb-20 sm:pb-0' : ''}`}>
        <Link to={RUTAS.eventos} className="inline-flex min-h-10 items-center font-semibold text-marca-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-indigo-300">← Volver a la cartelera</Link>
        <div className="mt-3 grid items-start gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(17rem,0.95fr)]">
            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className={`grid h-28 place-items-center sm:h-36 ${clasesPanelCategoria(item.category)}`}><IconoCategoria categoria={item.category} className="size-12 sm:size-14" /></div>
                <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
                        <span className="text-marca-700 dark:text-indigo-300">{item.category}</span>
                        <span className={`rounded-full px-2.5 py-1 ${CLASE_ESTADO[item.status]}`}>{item.status}</span>
                    </div>
                    <h1 className="mt-2 font-titulo text-2xl font-bold tracking-tight sm:text-3xl">{item.name}</h1>
                    <p className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-300">{item.eventCode}</p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-2"><IconoFecha /><time dateTime={item.eventDate}>{fecha.hora ? `${fecha.fecha} · ${fecha.hora}` : fecha.fecha}</time></span>
                        <span className="inline-flex items-center gap-2"><IconoPersona />Edad mínima: {item.minimumAge ?? 0}</span>
                    </div>
                    {item.description && <p className="mt-4 max-w-prose whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{item.description}</p>}

                    <section aria-labelledby="artistas-evento" className="mt-5">
                        <h2 id="artistas-evento" className="font-titulo text-sm font-semibold">Artistas</h2>
                        {item.artists.length === 0 ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Aún no se han anunciado artistas.</p> : <ul className="mt-2 flex flex-wrap gap-3">{item.artists.map((artist, indice) => <li key={artist.id}><Link to={RUTAS.artista(artist.id)} className="inline-flex min-h-11 items-center gap-2 rounded-full pr-2 text-sm font-medium hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:text-indigo-300"><AvatarIniciales nombre={artist.stageName} indice={indice} tamano="compacto" /><span>{artist.stageName}</span></Link></li>)}</ul>}
                    </section>

                    <section aria-labelledby="sede-evento" className="mt-4">
                        <h2 id="sede-evento" className="font-titulo text-sm font-semibold">Sede</h2>
                        {sede.isLoading && <p role="status" className="mt-2 text-sm text-slate-600 dark:text-slate-300">Cargando sede…</p>}
                        {sede.isError && <p role="alert" className="mt-2 text-sm text-slate-600 dark:text-slate-300">No pudimos cargar los datos de la sede.</p>}
                        {sede.data && <Link to={RUTAS.sede(sede.data.code)} className="mt-2 flex min-h-14 items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-marca-500 dark:border-slate-700">
                            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 shrink-0 text-marca-700 dark:text-indigo-300"><path d="M3.5 8.5 10 3l6.5 5.5V17h-13V8.5Z" /><path d="M8 17v-5h4v5" /></svg>
                            <span className="min-w-0"><span className="block font-semibold">{sede.data.name}</span><span className="block text-xs text-slate-600 dark:text-slate-300">{sede.data.city} · Capacidad {sede.data.capacity}</span></span>
                        </Link>}
                    </section>
                </div>
            </div>

            {!esOperador && <PanelCompra
                autenticado={puedeComprar}
                disponible={compraDisponible}
                pendiente={compra.isPending}
                error={errors.type?.message}
                register={register}
                onEnviar={(event) => { void abrirConfirmacion(event) }}
            />}
        </div>

        {confirmarCompra && <Modal titulo="Confirmar compra" onCerrar={() => { compra.reset(); setConfirmarCompra(false) }}>
            <dl className="space-y-2 text-sm"><div><dt className="text-slate-500 dark:text-slate-400">Evento</dt><dd className="font-semibold">{item.name}</dd></div><div><dt className="text-slate-500 dark:text-slate-400">Tipo</dt><dd className="font-semibold">{tipoConfirmado}</dd></div><div><dt className="text-slate-500 dark:text-slate-400">Cuenta</dt><dd className="font-semibold">{usuario?.email}</dd></div></dl>
            {compra.isError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">{compra.error instanceof ApiError && [400, 409].includes(compra.error.status) ? compra.error.message : 'No pudimos registrar la compra. Intenta de nuevo.'}</p>}
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => { compra.reset(); setConfirmarCompra(false) }} className="min-h-11 rounded-lg border border-slate-300 px-4 dark:border-slate-700">Cancelar</button><button type="button" disabled={compra.isPending} onClick={() => compra.mutate(tipoConfirmado, { onSuccess: (ticket) => navigate(RUTAS.confirmacionCompra(ticket.ticketCode)) })} className="min-h-11 rounded-lg bg-marca-600 px-5 font-bold text-white disabled:opacity-60">{compra.isPending ? 'Procesando…' : 'Confirmar'}</button></div>
        </Modal>}
        {compraDisponible && !esOperador && <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95"><button type="button" onClick={() => void abrirConfirmacion()} className="min-h-11 w-full rounded-lg bg-marca-600 px-4 font-semibold text-white">{usuario ? 'Comprar entrada' : 'Inicia sesión para comprar'}</button></div>}
    </article>
}
