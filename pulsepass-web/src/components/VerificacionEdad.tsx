import { useState, type FormEvent, type ReactNode } from 'react'
import { cumpleEdadMinima } from '../lib/edad'
import { reloj } from '../lib/reloj'

const CLAVE_VERIFICACION = 'pulsepass.ageGate'
type EstadoVerificacion = 'pendiente' | 'permitido' | 'bloqueado'

function leerEstadoInicial(): EstadoVerificacion {
    try {
        const guardado = window.sessionStorage.getItem(CLAVE_VERIFICACION)
        if (guardado === 'permitido' || guardado === 'bloqueado') return guardado
    } catch {
        // El formulario sigue funcionando durante esta vista aunque el navegador bloquee el storage.
    }
    return 'pendiente'
}

function guardarEstado(estado: Exclude<EstadoVerificacion, 'pendiente'>) {
    try {
        window.sessionStorage.setItem(CLAVE_VERIFICACION, estado)
    } catch {
        // El resultado se conserva en el estado de React hasta que termine esta sesión de página.
    }
}

export default function VerificacionEdad({ children }: { children: ReactNode }) {
    const [estado, setEstado] = useState<EstadoVerificacion>(leerEstadoInicial)
    const [fechaNacimiento, setFechaNacimiento] = useState('')
    const [error, setError] = useState<string | null>(null)

    if (estado === 'permitido') return children

    function verificar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()
        setError(null)

        if (!fechaNacimiento || fechaNacimiento > reloj.fechaHoyISO()) {
            setError('Selecciona una fecha de nacimiento válida.')
            return
        }

        const siguienteEstado = cumpleEdadMinima(fechaNacimiento) ? 'permitido' : 'bloqueado'
        guardarEstado(siguienteEstado)
        setEstado(siguienteEstado)
    }

    const bloqueado = estado === 'bloqueado'

    return (
        <main className="relative grid min-h-screen place-items-center overflow-hidden bg-pulse-nightlife px-4 py-10 text-white">
            <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 size-[28rem] rounded-full bg-pulse-hot-pink/25 blur-[120px]" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-20 size-[32rem] rounded-full bg-pulse-blue/25 blur-[130px]" />
            <section aria-labelledby="edad-heading" className="relative w-full max-w-md rounded-3xl border border-white/15 bg-pulse-velvet/90 p-7 shadow-2xl backdrop-blur sm:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-pulse-light-magenta">PulsePass · 16+</p>
                <h1 id="edad-heading" className="mt-3 font-titulo text-3xl font-bold">
                    {bloqueado ? 'Acceso no disponible' : 'Antes de entrar'}
                </h1>
                {bloqueado ? (
                    <p role="alert" className="mt-4 leading-7 text-white/90">
                        PulsePass está disponible únicamente para personas de 16 años o más. No puedes continuar con la fecha indicada.
                    </p>
                ) : (
                    <>
                        <p className="mt-3 leading-7 text-white/90">Confirma tu fecha de nacimiento para ingresar a PulsePass. Debes tener al menos 16 años.</p>
                        <form onSubmit={verificar} className="mt-7 space-y-4">
                            <div>
                                <label htmlFor="age-gate-birthdate" className="text-sm font-semibold">Fecha de nacimiento</label>
                                <input
                                    id="age-gate-birthdate"
                                    type="date"
                                    required
                                    max={reloj.fechaHoyISO()}
                                    value={fechaNacimiento}
                                    onChange={(evento) => setFechaNacimiento(evento.target.value)}
                                    aria-invalid={Boolean(error)}
                                    aria-describedby={error ? 'age-gate-error' : 'age-gate-privacy'}
                                    className="mt-2 min-h-12 w-full rounded-xl border border-white/25 bg-black/25 px-4 text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse-light-magenta"
                                />
                                {error && <p id="age-gate-error" role="alert" className="mt-2 text-sm font-medium text-pulse-light-magenta">{error}</p>}
                            </div>
                            <button type="submit" className="min-h-12 w-full rounded-full bg-pulse-blue px-5 font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse-light-magenta">
                                Continuar
                            </button>
                            <p id="age-gate-privacy" className="text-xs leading-5 text-white/70">La fecha solo se usa para comprobar la edad y no se guarda en esta verificación.</p>
                        </form>
                    </>
                )}
            </section>
        </main>
    )
}
