import { Link, NavLink, Outlet } from 'react-router'
import { RUTAS } from '../lib/rutas'

export default function Layout() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <a
                href="#contenido"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-slate-900"
            >
                Saltar al contenido
            </a>

            <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
                <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        to={RUTAS.inicio}
                        className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca-600"
                    >
            <span className="grid size-10 place-items-center rounded-xl bg-marca-600 font-titulo text-sm font-bold text-white">
              PP
            </span>
                        <span className="font-titulo text-xl font-bold tracking-tight">
              PulsePass
            </span>
                    </Link>

                    <nav
                        aria-label="Navegación principal"
                        className="flex items-center gap-2"
                    >
                        <NavLink
                            to={RUTAS.inicio}
                            end
                            className={({ isActive }) =>
                                isActive
                                    ? 'rounded-full bg-marca-50 px-4 py-2 text-sm font-semibold text-marca-700 dark:bg-slate-800 dark:text-indigo-300'
                                    : 'rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-marca-600 dark:text-slate-300'
                            }
                        >
                            Inicio
                        </NavLink>

                        <NavLink
                            to={RUTAS.eventos}
                            className={({ isActive }) =>
                                isActive
                                    ? 'rounded-full bg-marca-50 px-4 py-2 text-sm font-semibold text-marca-700 dark:bg-slate-800 dark:text-indigo-300'
                                    : 'rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-marca-600 dark:text-slate-300'
                            }
                        >
                            Eventos
                        </NavLink>
                    </nav>
                </div>
            </header>

            <main
                id="contenido"
                className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8"
            >
                <Outlet />
            </main>

            <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 dark:text-slate-400">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                        PulsePass
                    </p>
                    <p>Descubre eventos. Vive el momento.</p>
                </div>
            </footer>
        </div>
    )
}