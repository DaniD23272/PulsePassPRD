import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import Modal from '../components/Modal'
import AvisoExito from '../components/AvisoExito'
import { useArtistasActivos } from '../features/artistas/hooks'
import { asociarArtista, obtenerEvento, publicarEvento, type Evento } from '../features/eventos/api'
import { agregarEventoCreado } from '../features/eventos/eventosSesion'
import { useAuth } from '../features/auth/AuthContext'
import { ApiError } from '../lib/http'
import { artistasNoAsociados, eventoPermiteAsociarArtistas } from '../features/eventos/politicas'
import { RUTAS } from '../lib/rutas'
import { formatearFechaEvento } from '../lib/formato'
import { leerCodigoRuta } from '../lib/parametrosRuta'
import AvatarIniciales from '../components/AvatarIniciales'

const ArtistaFormSchema = z.object({ artistId: z.string().min(1, 'Selecciona un artista activo.') })
type ArtistaForm = z.infer<typeof ArtistaFormSchema>

export default function AdminGestionEventoPage() {
    const { eventCode: eventCodeParam } = useParams()
    const eventCode = leerCodigoRuta(eventCodeParam) ?? ''
    const { token } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [confirmarPublicacion, setConfirmarPublicacion] = useState(false)
    const evento = useQuery({ queryKey: ['evento', eventCode], queryFn: () => obtenerEvento(eventCode, token ?? ''), enabled: Boolean(eventCode && token), staleTime: 30_000 })
    const artistas = useArtistasActivos(Boolean(eventCode))
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ArtistaForm>({ resolver: zodResolver(ArtistaFormSchema), defaultValues: { artistId: '' } })

    useEffect(() => {
        if (evento.error instanceof ApiError && evento.error.status === 403) navigate(RUTAS.sinPermisos, { replace: true })
    }, [evento.error, navigate])

    const actualizarCache = (actualizado: Evento) => {
        queryClient.setQueryData(['evento', eventCode], actualizado)
        agregarEventoCreado(actualizado)
    }

    const asociar = useMutation({
        mutationFn: (artistId: number) => asociarArtista(eventCode, artistId, token ?? ''),
        onSuccess: async (actualizado) => {
            actualizarCache(actualizado)
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['evento', eventCode] }),
                queryClient.invalidateQueries({ queryKey: ['eventos', 'artista'] }),
            ])
            reset({ artistId: '' })
        },
    })
    const publicar = useMutation({
        mutationFn: () => publicarEvento(eventCode, token ?? ''),
        onSuccess: async (actualizado) => {
            actualizarCache(actualizado)
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['evento', eventCode] }),
                queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
            ])
            setConfirmarPublicacion(false)
        },
    })

    if (!eventCode) return <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900" role="alert"><h1 className="font-titulo text-2xl font-bold">No pudimos abrir el evento</h1><p className="mt-2">El código del evento no es válido.</p><Link to={RUTAS.adminEventos} className="mt-4 inline-flex underline">Administración</Link></section>
    if (evento.isLoading) return <p className="w-full py-12 text-center" role="status" aria-busy="true">Cargando evento…</p>
    if (evento.isError || !evento.data) return <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900" role="alert"><h1 className="font-titulo text-2xl font-bold">No pudimos abrir el evento</h1><p className="mt-2">{evento.error instanceof ApiError && evento.error.status === 404 ? 'No encontramos un evento con ese código.' : 'Revisa el código e intenta de nuevo.'}</p><button type="button" className="mt-4 underline" onClick={() => void evento.refetch()}>Reintentar</button><Link to={RUTAS.adminEventos} className="ml-4 underline">Administración</Link></section>

    const item = evento.data
    const disponibles = artistasNoAsociados(artistas.data ?? [], item.artists)
    const errorMutacion = asociar.isError ? asociar.error : publicar.isError ? publicar.error : null

    return <section className="mx-auto w-full max-w-xl"><div className="mb-4"><Link to={RUTAS.adminEventos} className="font-semibold text-marca-700 underline dark:text-indigo-300">← Eventos</Link></div>
        <header className="mb-4"><div className="flex flex-wrap items-start justify-between gap-3"><h1 className="font-titulo text-2xl font-bold">{item.name}</h1><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-800">{item.status}</span></div><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.eventCode} · {item.category} · {formatearFechaEvento(item.eventDate, true)} · Min. {item.minimumAge ?? 0} · {item.venueName}</p>{item.description && <p className="mt-2 text-sm">{item.description}</p>}</header>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><section><h2 className="font-titulo text-sm font-semibold">Publicación</h2><div className="mt-2 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-600 dark:text-slate-300">El evento es visible al público una vez publicado.</p>{item.status === 'DRAFT' ? <button type="button" onClick={() => setConfirmarPublicacion(true)} disabled={publicar.isPending} className="min-h-11 rounded-full bg-marca-600 px-4 text-sm font-bold text-white">Publicar evento</button> : <p role="status" className="text-xs font-semibold">{item.status}</p>}</div></section></article>
        <article className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><section><h2 className="font-titulo text-sm font-semibold">Artistas asociados</h2>{item.artists.length === 0 ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Todavía no hay artistas asociados.</p> : <ul className="mt-3 flex flex-wrap gap-3">{item.artists.map((artist, indice) => <li key={artist.id} className="flex items-center gap-2 text-sm"><AvatarIniciales nombre={artist.stageName} indice={indice} tamano="compacto" /><span>{artist.stageName}</span></li>)}</ul>}
                <form noValidate onSubmit={handleSubmit(({ artistId }) => asociar.mutate(Number(artistId)))} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]"><div><label htmlFor="associate-artist" className="text-xs font-semibold">Agregar artista</label><select id="associate-artist" {...register('artistId')} aria-invalid={Boolean(errors.artistId)} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">Selecciona un artista</option>{disponibles.map((artist) => <option key={artist.id} value={artist.id}>{artist.stageName}</option>)}</select>{errors.artistId && <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.artistId.message}</p>}</div><button type="submit" disabled={asociar.isPending || artistas.isLoading || disponibles.length === 0 || !eventoPermiteAsociarArtistas(item.status)} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold disabled:opacity-50 dark:border-slate-700 dark:text-slate-100"><span aria-hidden="true">+</span>{asociar.isPending ? 'Asociando…' : 'Asociar'}</button></form>
                {artistas.isLoading && <p role="status" className="mt-2 text-sm">Cargando artistas activos…</p>}{artistas.isError && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">No pudimos cargar los artistas. <button type="button" className="underline" onClick={() => void artistas.refetch()}>Reintentar</button></p>}{artistas.data?.length === 0 && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No hay artistas activos.</p>}
            </section></article>
        {errorMutacion && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">{errorMutacion instanceof ApiError && [400, 409].includes(errorMutacion.status) ? errorMutacion.message : 'No pudimos actualizar el evento. Intenta de nuevo.'}</p>}
        {publicar.isSuccess && <AvisoExito className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">El evento está publicado.</AvisoExito>}
        <div className="mt-3"><Link to={RUTAS.staffTickets(item.eventCode)} className="font-semibold text-marca-700 underline dark:text-indigo-300">Tickets pagados →</Link></div>
        {confirmarPublicacion && <Modal titulo="Publicar evento" onCerrar={() => { publicar.reset(); setConfirmarPublicacion(false) }}><p>¿Confirmas que quieres publicar <strong>{item.name}</strong>?</p>{publicar.isError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">{publicar.error instanceof ApiError && publicar.error.status === 409 ? publicar.error.message : 'No pudimos publicar el evento.'}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setConfirmarPublicacion(false)} className="min-h-11 rounded-full border border-slate-300 px-4 dark:border-slate-700">Cancelar</button><button type="button" disabled={publicar.isPending} onClick={() => publicar.mutate()} className="min-h-11 rounded-full bg-marca-600 px-5 font-bold text-white">{publicar.isPending ? 'Publicando…' : 'Confirmar publicación'}</button></div></Modal>}
    </section>
}
