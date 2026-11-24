import { Link } from 'react-router'
import { useAuth } from '../features/auth/AuthContext'
import { useUsuarioPorEmail } from '../features/usuarios/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

function fechaLocal(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number)
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short' }).format(new Date(year, month - 1, day))
}

export default function CuentaPage() {
    const { usuario, token, cerrarSesion } = useAuth()
    const perfil = useUsuarioPorEmail(usuario?.email, token)

    if (perfil.isLoading) return <p className="w-full py-12 text-center" role="status">Cargando tu cuenta…</p>
    if (perfil.isError && perfil.error instanceof ApiError && perfil.error.status === 401) return <p className="w-full py-12 text-center" role="alert">Tu sesión expiró. Inicia sesión de nuevo.</p>
    if (perfil.isError || !perfil.data) return <section className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100" role="alert"><h1 className="font-titulo text-2xl font-bold">No pudimos cargar tu cuenta</h1><button type="button" className="mt-3 underline" onClick={() => void perfil.refetch()}>Reintentar</button></section>

    return (
        <section className="w-full">
            <h1 className="font-titulo text-3xl font-bold">Mi cuenta</h1>
            <article className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-4">
                    <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">{perfil.data.firstName.charAt(0).toUpperCase()}</span>
                    <div>
                        <h2 className="font-titulo text-xl font-bold">{perfil.data.firstName} {perfil.data.lastName}</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300">@{perfil.data.username} · {perfil.data.email}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Nacimiento: {fechaLocal(perfil.data.birthDate)}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm sm:justify-end">
                    {usuario?.roles.map((rol) => <span key={rol} className="inline-flex rounded-full bg-indigo-100 px-3 py-1 font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">{rol}</span>)}
                    <span className={`inline-flex rounded-full px-3 py-1 font-semibold ${perfil.data.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'}`}>{perfil.data.active ? 'Activa' : 'Inactiva'}</span>
                </div>
            </article>
            <div className="mt-5 flex flex-wrap gap-3">
                <Link to={RUTAS.misTickets} className="inline-flex min-h-11 items-center rounded-lg bg-marca-600 px-5 font-bold text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2">Ver mis tickets</Link>
                <button type="button" onClick={cerrarSesion} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 font-bold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-700 dark:hover:bg-slate-800">Cerrar sesión</button>
            </div>
        </section>
    )
}
