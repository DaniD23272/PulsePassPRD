import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import AvisoExito from '../components/AvisoExito'
import { useAuth } from '../features/auth/AuthContext'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

const LoginSchema = z.object({
    identifier: z.string().trim().min(1, 'Escribe tu usuario o correo.'),
    password: z.string().min(1, 'Escribe tu contraseña.'),
})

type DatosFormulario = z.infer<typeof LoginSchema>

export default function LoginPage() {
    const { iniciarSesion } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const estadoRedireccion = z.object({
        desde: z.string().refine((path) => path.startsWith('/') && !path.startsWith('//')).optional(),
        motivo: z.enum(['expirada']).optional(),
        registrado: z.boolean().optional(),
    }).safeParse(location.state)
    const [errorAcceso, setErrorAcceso] = useState<string | null>(null)
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<DatosFormulario>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { identifier: '', password: '' },
    })

    async function enviar(datos: DatosFormulario) {
        setErrorAcceso(null)
        try {
            await iniciarSesion(datos.identifier, datos.password)
            navigate(estadoRedireccion.success ? estadoRedireccion.data.desde ?? RUTAS.inicio : RUTAS.inicio, { replace: true })
        } catch (error) {
            if (error instanceof ApiError && error.status === 400 && Object.keys(error.details).length > 0) {
                let asignado = false
                for (const [campo, mensaje] of Object.entries(error.details)) {
                    if (campo === 'identifier' || campo === 'password') {
                        setError(campo, { type: 'server', message: mensaje })
                        asignado = true
                    }
                }
                if (!asignado) setErrorAcceso('Revisa los datos ingresados e intenta de nuevo.')
                return
            }
            setErrorAcceso(
                error instanceof ApiError && error.status === 401
                    ? 'Credenciales inválidas.'
                      : 'No pudimos iniciar sesión. Intenta más tarde.',
            )
        }
    }

    return (
        <section className="mx-auto my-auto w-full max-w-sm py-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto mb-4 grid size-10 place-items-center rounded-lg bg-marca-600 text-white" aria-hidden="true"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg></div>
                <h1 className="text-center font-titulo text-3xl font-bold">Inicia sesión</h1>

                {estadoRedireccion.success && estadoRedireccion.data.motivo === 'expirada' && (
                    <p role="status" aria-live="polite" className="mt-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900">
                        Tu sesión expiró. Inicia sesión de nuevo.
                    </p>
                )}
                {estadoRedireccion.success && estadoRedireccion.data.registrado && (
                    <AvisoExito className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                        Cuenta creada. Inicia sesión.
                    </AvisoExito>
                )}

                <form className="mt-7 space-y-5" onSubmit={handleSubmit(enviar)} noValidate>
                    <div>
                        <label htmlFor="identifier" className="text-sm font-semibold">
                            Usuario o correo
                        </label>
                        <input
                            id="identifier"
                            autoComplete="username"
                            autoCapitalize="none"
                            {...register('identifier')}
                            aria-invalid={Boolean(errors.identifier)}
                            aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                            className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none transition focus:border-marca-600 focus:ring-2 focus:ring-marca-600/20 aria-invalid:border-red-600 dark:border-slate-700 dark:bg-slate-950"
                        />
                        {errors.identifier && (
                            <p id="identifier-error" className="mt-2 text-sm text-red-700 dark:text-red-300">
                                {errors.identifier.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="text-sm font-semibold">
                            Contraseña
                        </label>
                        <div className="relative mt-2">
                            <input
                                id="password"
                                type={mostrarPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                {...register('password')}
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-14 outline-none transition focus:border-marca-600 focus:ring-2 focus:ring-marca-600/20 aria-invalid:border-red-600 dark:border-slate-700 dark:bg-slate-950"
                            />
                            <button
                                type="button"
                                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                aria-pressed={mostrarPassword}
                                onClick={() => setMostrarPassword((visible) => !visible)}
                                className="absolute inset-y-0 right-1 grid min-w-11 place-items-center rounded-lg text-sm font-semibold text-slate-600 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:text-slate-300 dark:hover:text-indigo-300"
                            >
                                {mostrarPassword ? 'Ocultar' : 'Ver'}
                            </button>
                        </div>
                        {errors.password && (
                            <p id="password-error" className="mt-2 text-sm text-red-700 dark:text-red-300">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {errorAcceso && (
                        <p role="alert" aria-live="polite" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                            {errorAcceso}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-marca-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
                    >
                        {isSubmitting ? 'Ingresando…' : 'Ingresar'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
                    ¿Aún no tienes cuenta?{' '}
                    <Link to={RUTAS.registro} className="font-bold text-marca-700 underline-offset-4 hover:underline dark:text-indigo-300">
                        Regístrate
                    </Link>
                </p>
            </div>
        </section>
    )
}
