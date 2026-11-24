import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { CATEGORIAS_EVENTO, crearEvento, obtenerVenuesActivos } from '../features/eventos/api'
import { agregarEventoCreado } from '../features/eventos/eventosSesion'
import { useAuth } from '../features/auth/AuthContext'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

const CrearEventoFormSchema = z.object({
    eventCode: z.string().trim().min(1, 'Escribe el código del evento.'),
    name: z.string().trim().min(1, 'Escribe el nombre del evento.'),
    description: z.string().max(500, 'La descripción no puede superar 500 caracteres.'),
    category: z.enum(CATEGORIAS_EVENTO),
    eventDate: z.string().min(1, 'Selecciona fecha y hora.'),
    minimumAge: z.number().int('La edad debe ser un número entero.').min(0, 'La edad mínima no puede ser negativa.'),
    venueCode: z.string().trim().min(1, 'Selecciona una sede.'),
})
type CrearEventoForm = z.infer<typeof CrearEventoFormSchema>

export default function AdminCrearEventoPage() {
    const { token } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
    const venues = useQuery({ queryKey: ['sedes', 'activas'], queryFn: obtenerVenuesActivos, staleTime: 5 * 60_000 })
    const { control, register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CrearEventoForm>({
        resolver: zodResolver(CrearEventoFormSchema),
        defaultValues: { eventCode: '', name: '', description: '', category: 'MUSIC', eventDate: '', minimumAge: 0, venueCode: '' },
    })
    const descripcion = useWatch({ control, name: 'description', defaultValue: '' })
    const crear = useMutation({
        mutationFn: (datos: CrearEventoForm) => crearEvento({ ...datos, eventCode: datos.eventCode.trim().toUpperCase(), name: datos.name.trim(), description: datos.description.trim() || null }, token ?? ''),
        onSuccess: (evento) => {
            queryClient.setQueryData(['evento', evento.eventCode], evento)
            agregarEventoCreado(evento)
            navigate(RUTAS.adminEvento(evento.eventCode), { state: { creado: true } })
        },
    })

    function enviar(datos: CrearEventoForm) {
        setErrorGeneral(null)
        crear.mutate(datos, {
            onError: (error) => {
                if (error instanceof ApiError && error.status === 403) {
                    navigate(RUTAS.sinPermisos, { replace: true })
                    return
                }
                if (error instanceof ApiError && error.status === 400 && Object.keys(error.details).length) {
                    let hayCampo = false
                    for (const [campo, mensaje] of Object.entries(error.details)) {
                        if (['eventCode', 'name', 'description', 'category', 'eventDate', 'minimumAge', 'venueCode'].includes(campo)) {
                            setError(campo as keyof CrearEventoForm, { type: 'server', message: mensaje })
                            hayCampo = true
                        }
                    }
                    if (!hayCampo) setErrorGeneral('Revisa los datos del evento e inténtalo de nuevo.')
                    return
                }
                setErrorGeneral(error instanceof ApiError && error.status === 409 ? error.message : 'No pudimos crear el evento. Intenta más tarde.')
            },
        })
    }

    const clase = 'mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none focus:border-marca-600 aria-invalid:border-red-600 dark:border-slate-700 dark:bg-slate-950'
    function campoError(campo: keyof CrearEventoForm) { return errors[campo]?.message }

    return <section className="mx-auto w-full max-w-md"><div className="mb-5"><Link to={RUTAS.adminEventos} className="text-sm font-semibold text-marca-700 underline dark:text-indigo-300">← Eventos</Link><h1 className="mt-3 font-titulo text-3xl font-bold">Nuevo evento</h1></div>
        <form noValidate onSubmit={handleSubmit(enviar)} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div><label htmlFor="create-code" className="text-sm font-semibold">Código del evento</label><input id="create-code" autoComplete="off" {...register('eventCode')} aria-invalid={Boolean(errors.eventCode)} aria-describedby={errors.eventCode ? 'create-code-error' : undefined} className={classNameWithError(clase, Boolean(errors.eventCode))} />{campoError('eventCode') && <p id="create-code-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{campoError('eventCode')}</p>}</div>
            <div><label htmlFor="create-name" className="text-sm font-semibold">Nombre</label><input id="create-name" {...register('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'create-name-error' : undefined} className={classNameWithError(clase, Boolean(errors.name))} />{campoError('name') && <p id="create-name-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{campoError('name')}</p>}</div>
            <div><label htmlFor="create-description" className="text-sm font-semibold">Descripción</label><textarea id="create-description" rows={4} maxLength={500} {...register('description')} aria-invalid={Boolean(errors.description)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />{campoError('description') && <p className="mt-1 text-sm text-red-700 dark:text-red-300">{campoError('description')}</p>}<p className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">{descripcion.length}/500</p></div>
            <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                <div><label htmlFor="create-category" className="text-sm font-semibold">Categoría</label><select id="create-category" {...register('category')} className={clase}>{CATEGORIAS_EVENTO.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                <div><label htmlFor="create-age" className="text-sm font-semibold">Edad mínima</label><input id="create-age" type="number" min="0" step="1" {...register('minimumAge', { valueAsNumber: true })} aria-invalid={Boolean(errors.minimumAge)} className={classNameWithError(clase, Boolean(errors.minimumAge))} />{campoError('minimumAge') && <p className="mt-1 text-sm text-red-700 dark:text-red-300">{campoError('minimumAge')}</p>}</div>
            </div>
            <div><label htmlFor="create-date" className="text-sm font-semibold">Fecha y hora</label><input id="create-date" type="datetime-local" {...register('eventDate')} aria-invalid={Boolean(errors.eventDate)} className={classNameWithError(clase, Boolean(errors.eventDate))} />{campoError('eventDate') && <p className="mt-1 text-sm text-red-700 dark:text-red-300">{campoError('eventDate')}</p>}</div>
            <div><label htmlFor="create-venue" className="text-sm font-semibold">Sede</label><select id="create-venue" {...register('venueCode')} aria-invalid={Boolean(errors.venueCode)} className={classNameWithError(clase, Boolean(errors.venueCode))}><option value="">Selecciona una sede</option>{(venues.data ?? []).map((venue) => <option key={venue.code} value={venue.code}>{venue.name} ({venue.code})</option>)}</select>{campoError('venueCode') && <p className="mt-1 text-sm text-red-700 dark:text-red-300">{campoError('venueCode')}</p>}</div>
            {venues.isLoading && <p role="status">Cargando sedes activas…</p>}{venues.isError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">No pudimos cargar las sedes. <button type="button" className="underline" onClick={() => void venues.refetch()}>Reintentar</button></p>}{venues.data?.length === 0 && <p role="status">No hay sedes activas para crear el evento.</p>}
            {errorGeneral && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">{errorGeneral}</p>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link to={RUTAS.adminEventos} className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-5 font-semibold dark:border-slate-700">Cancelar</Link><button type="submit" disabled={isSubmitting || crear.isPending || venues.isLoading || venues.isError || !venues.data?.length} className="min-h-11 rounded-full bg-marca-600 px-6 font-bold text-white disabled:opacity-60">{crear.isPending ? 'Creando evento…' : 'Crear evento'}</button></div>
        </form>
    </section>
}

function classNameWithError(base: string, invalid: boolean): string {
    return invalid ? `${base} border-red-600` : base
}
