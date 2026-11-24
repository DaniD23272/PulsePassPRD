import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { obtenerEvento } from '../features/eventos/api'
import { useAuth } from '../features/auth/AuthContext'
import { leerEventosCreados } from '../features/eventos/eventosSesion'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

const BuscarEventoSchema = z.object({ eventCode: z.string().trim().min(1, 'Escribe un código de evento.') })
type BuscarEventoForm = z.infer<typeof BuscarEventoSchema>

export default function AdminEventosPage() {
    const { token } = useAuth()
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors } } = useForm<BuscarEventoForm>({ resolver: zodResolver(BuscarEventoSchema), defaultValues: { eventCode: '' } })
    const buscar = useMutation({ mutationFn: (codigo: string) => obtenerEvento(codigo, token ?? '') })
    const creados = leerEventosCreados()

    function abrirEvento(datos: BuscarEventoForm) {
        buscar.mutate(datos.eventCode, { onSuccess: (evento) => navigate(RUTAS.adminEvento(evento.eventCode)) })
    }

    return (
        <section className="mx-auto w-full max-w-2xl">
            <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-marca-600 dark:text-indigo-300">Administración</p><h1 className="mt-2 font-titulo text-3xl font-bold">Administración de eventos</h1></div><Link to={RUTAS.adminNuevoEvento} className="inline-flex min-h-11 items-center rounded-full bg-marca-600 px-5 font-bold text-white hover:bg-marca-700">+ Nuevo evento</Link></header>
            <form noValidate onSubmit={handleSubmit(abrirEvento)} className="mt-7"><label htmlFor="admin-event-code" className="text-sm font-semibold">Buscar evento por código</label><div className="mt-2 flex flex-col gap-3 sm:flex-row"><div className="min-w-0 flex-1"><input id="admin-event-code" autoComplete="off" {...register('eventCode')} aria-invalid={Boolean(errors.eventCode)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" placeholder="CMF-2026" />{errors.eventCode && <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.eventCode.message}</p>}</div><button type="submit" disabled={buscar.isPending} className="min-h-11 rounded-full border border-slate-300 px-5 font-semibold disabled:opacity-60 dark:border-slate-700">{buscar.isPending ? 'Buscando…' : 'Abrir'}</button></div>{buscar.isError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">{buscar.error instanceof ApiError && buscar.error.status === 404 ? 'No encontramos un evento con ese código.' : buscar.error instanceof ApiError && buscar.error.status === 403 ? 'No tienes permisos para consultar el evento.' : 'No pudimos buscar el evento.'}</p>}</form>
            <section className="mt-8" aria-labelledby="eventos-sesion-heading"><h2 id="eventos-sesion-heading" className="font-titulo text-xl font-semibold">Creados en esta sesión</h2>{creados.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-slate-600 dark:border-slate-700 dark:text-slate-300">Todavía no creaste eventos en esta sesión.</p> : <ul className="mt-4 space-y-3">{creados.map((evento) => <li key={evento.eventCode} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"><p className="min-w-0 flex-1 text-sm"><span className="font-mono text-xs font-semibold">{evento.eventCode}</span><span aria-hidden="true"> · </span>{evento.name}</p><div className="flex items-center gap-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold dark:bg-slate-800">{evento.status}</span><Link to={RUTAS.adminEvento(evento.eventCode)} className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700">Gestionar</Link></div></li>)}</ul>}</section>
            <aside className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-100"><span aria-hidden="true">↗ </span>Nota: la API no ofrece un listado completo de eventos (GAP-01).</aside>
        </section>
    )
}
