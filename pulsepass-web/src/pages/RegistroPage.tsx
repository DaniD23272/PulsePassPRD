import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { registrarUsuario, RegistroSchema } from '../features/auth/api'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { reloj } from '../lib/reloj'

type DatosFormulario = z.infer<typeof RegistroSchema>

function nivelFortaleza(password: string) {
    if (!password) return { nivel: 0, etiqueta: 'Sin contraseña' }
    if (password.length < 12) return { nivel: 1, etiqueta: 'Baja' }

    const variedad = [/[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^\p{L}\p{N}]/u.test(password)].filter(Boolean).length
    if (password.length >= 16 && variedad >= 3) return { nivel: 5, etiqueta: 'Alta' }
    return { nivel: 3, etiqueta: 'Media' }
}

export default function RegistroPage() {
    const [errorRegistro, setErrorRegistro] = useState<string | null>(null)
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<DatosFormulario>({
        resolver: zodResolver(RegistroSchema),
        defaultValues: {
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            birthDate: '',
            password: '',
        },
    })

    const fortaleza = nivelFortaleza(password)

    async function enviar(datos: DatosFormulario) {
        setErrorRegistro(null)
        try {
            await registrarUsuario(datos)
            navigate(RUTAS.login, { replace: true, state: { registrado: true } })
        } catch (error) {
            if (error instanceof ApiError && error.status === 400 && Object.keys(error.details).length > 0) {
                const campos = ['username', 'email', 'firstName', 'lastName', 'birthDate', 'password'] as const
                let asignado = false
                for (const [campo, mensaje] of Object.entries(error.details)) {
                    if (campos.includes(campo as (typeof campos)[number])) {
                        setError(campo as (typeof campos)[number], { type: 'server', message: mensaje })
                        asignado = true
                    }
                }
                if (!asignado) setErrorRegistro('Revisa los datos del formulario e intenta de nuevo.')
                return
            }
            setErrorRegistro(
                error instanceof ApiError && error.status === 409
                    ? 'El usuario o correo ya está registrado.'
                    : error instanceof ApiError && error.status === 403
                        ? 'Debes tener al menos 16 años para crear una cuenta.'
                        : 'No pudimos crear tu cuenta. Intenta de nuevo.',
            )
        }
    }

    const claseCampo = (invalido: boolean) =>
        `mt-1.5 min-h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-marca-600 focus:ring-2 focus:ring-marca-600/20 ${invalido ? 'border-red-600' : 'border-slate-300 dark:border-slate-700'} dark:bg-slate-950`

    return (
        <section className="mx-auto flex w-full max-w-md flex-1 items-center justify-center py-6 sm:py-8">
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex justify-center">
                    <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-marca-600 text-white">
                        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M18 3v12.25a3.75 3.75 0 1 1-2-3.32V7.2l-7 1.75v9.3a3.75 3.75 0 1 1-2-3.32V6.6L18 4z" /></svg>
                    </span>
                </div>
                <h1 className="text-center font-titulo text-2xl font-bold">Crea tu cuenta</h1>

                <form className="mt-5 space-y-3.5" onSubmit={handleSubmit(enviar)} noValidate>
                    <div>
                        <label htmlFor="username" className="text-xs font-semibold">Nombre de usuario</label>
                        <input id="username" autoComplete="username" autoCapitalize="none" {...register('username')} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'username-error' : undefined} className={claseCampo(Boolean(errors.username))} />
                        {errors.username && <p id="username-error" className="mt-1 text-xs text-red-700 dark:text-red-300">{errors.username.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="text-xs font-semibold">Correo electrónico</label>
                        <input id="email" type="email" autoComplete="email" autoCapitalize="none" {...register('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} className={claseCampo(Boolean(errors.email))} />
                        {errors.email && <p id="email-error" className="mt-1 text-xs text-red-700 dark:text-red-300">{errors.email.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="firstName" className="text-xs font-semibold">Nombres</label>
                            <input id="firstName" autoComplete="given-name" {...register('firstName')} aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? 'firstName-error' : undefined} className={claseCampo(Boolean(errors.firstName))} />
                            {errors.firstName && <p id="firstName-error" className="mt-1 text-xs text-red-700 dark:text-red-300">{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="lastName" className="text-xs font-semibold">Apellidos</label>
                            <input id="lastName" autoComplete="family-name" {...register('lastName')} aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? 'lastName-error' : undefined} className={claseCampo(Boolean(errors.lastName))} />
                            {errors.lastName && <p id="lastName-error" className="mt-1 text-xs text-red-700 dark:text-red-300">{errors.lastName.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="birthDate" className="text-xs font-semibold">Fecha de nacimiento</label>
                        <input id="birthDate" type="date" max={reloj.fechaHoyISO()} autoComplete="bday" {...register('birthDate')} aria-invalid={Boolean(errors.birthDate)} aria-describedby={errors.birthDate ? 'birthDate-error' : undefined} className={claseCampo(Boolean(errors.birthDate))} />
                        {errors.birthDate && <p id="birthDate-error" className="mt-1 text-xs text-red-700 dark:text-red-300">{errors.birthDate.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="text-xs font-semibold">Contraseña (mín. 12 caracteres)</label>
                        <div className="relative mt-1.5">
                            <input id="password" type={mostrarPassword ? 'text' : 'password'} autoComplete="new-password" {...register('password', { onChange: (evento) => setPassword(evento.target.value) })} aria-invalid={Boolean(errors.password)} aria-describedby="password-help password-strength" className={`${claseCampo(Boolean(errors.password))} mt-0 pr-11`} />
                            <button type="button" aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={mostrarPassword} onClick={() => setMostrarPassword((visible) => !visible)} className="absolute inset-y-0 right-1 grid w-9 place-items-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 dark:text-slate-300 dark:hover:bg-slate-800">
                                {mostrarPassword ? <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A11.3 11.3 0 0 1 12 5c5 0 8.5 4.8 9 7-.2.8-1 2-2.1 3.2M6.2 6.2C4.3 7.5 3.2 9.4 3 12c.5 2.2 4 7 9 7 1.1 0 2.1-.2 3-.6" /></svg> : <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>}
                            </button>
                        </div>
                        <p id="password-help" className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Entre 12 caracteres y 72 bytes.</p>
                        <div id="password-strength" role="meter" aria-label="Fortaleza de la contraseña" aria-valuemin={0} aria-valuemax={5} aria-valuenow={fortaleza.nivel} aria-valuetext={fortaleza.etiqueta} className="mt-1.5 flex gap-1">
                            {[1, 2, 3, 4, 5].map((segmento) => <span key={segmento} aria-hidden="true" className={`h-1 flex-1 rounded-full ${segmento <= fortaleza.nivel ? 'bg-marca-600' : 'bg-slate-200 dark:bg-slate-700'}`} />)}
                        </div>
                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Fortaleza: {fortaleza.etiqueta.toLocaleLowerCase('es-CO')}</p>
                        {errors.password && <p className="mt-1 text-xs text-red-700 dark:text-red-300">{errors.password.message}</p>}
                    </div>

                    {errorRegistro && <p role="alert" aria-live="polite" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{errorRegistro}</p>}

                    <button type="submit" disabled={isSubmitting} className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-marca-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60">
                        {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
                    </button>
                </form>

                <p className="mt-4 text-center text-xs text-slate-600 dark:text-slate-300">
                    ¿Ya tienes cuenta?{' '}
                    <Link to={RUTAS.login} className="font-bold text-marca-700 underline-offset-4 hover:underline dark:text-indigo-300">Inicia sesión</Link>
                </p>
            </div>
        </section>
    )
}
