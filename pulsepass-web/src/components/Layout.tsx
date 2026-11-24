import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router'
import { useAuth } from '../features/auth/AuthContext'
import { RUTAS } from '../lib/rutas'

function TemaButton({ oscuro, alternar }: { oscuro: boolean; alternar: () => void }) {
    return <button type="button" aria-pressed={oscuro} aria-label={oscuro ? 'Activar modo claro' : 'Activar modo oscuro'} onClick={alternar} className="min-h-10 rounded-full border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700">{oscuro ? 'Modo claro' : 'Modo oscuro'}</button>
}

function NavPrincipal({ mobile, cerrar }: { mobile?: boolean; cerrar?: () => void }) {
    const { usuario, cargando, cerrarSesion } = useAuth()
    const clase = ({ isActive }: { isActive: boolean }) => `inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 md:px-2 md:text-xs lg:px-4 lg:text-sm ${isActive ? 'bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-indigo-300' : 'text-slate-700 hover:bg-slate-100 hover:text-marca-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300'}`
    const cerrarYSalir = () => { cerrarSesion(); cerrar?.() }

    return <nav aria-label="Principal" className={mobile ? 'flex flex-col gap-1 border-t border-slate-200 py-3 dark:border-slate-800' : 'hidden items-center gap-1 md:flex'}>
        <NavLink to={RUTAS.eventos} className={clase} onClick={cerrar}>Eventos</NavLink>
        <NavLink to={RUTAS.artistas} className={clase} onClick={cerrar}>Artistas</NavLink>
        <NavLink to={RUTAS.sedes} className={clase} onClick={cerrar}>Sedes</NavLink>
        {!cargando && usuario?.roles.some((rol) => rol === 'STAFF' || rol === 'ADMIN') && <><NavLink to={RUTAS.staffValidacion} className={clase} onClick={cerrar}>Validar ingreso</NavLink><NavLink to={`${RUTAS.staffValidacion}#tickets-pagados`} className={clase} onClick={cerrar}>Tickets pagados</NavLink></>}
        {!cargando && usuario?.roles.includes('ADMIN') && <NavLink to={RUTAS.adminEventos} className={clase} onClick={cerrar}>Administrar eventos</NavLink>}
        {!cargando && !usuario && <>
            <NavLink to={RUTAS.login} className={clase} onClick={cerrar}>Ingresar</NavLink>
            <Link to={RUTAS.registro} onClick={cerrar} className="inline-flex min-h-10 items-center justify-center rounded-full bg-marca-600 px-4 py-2 text-sm font-bold text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">Registrarse</Link>
        </>}
        {!cargando && usuario && <details className="group relative md:ml-2">
            <summary aria-label={`Menú de cuenta: ${usuario.username}`} className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold marker:hidden focus-visible:outline-2 dark:border-slate-700"><span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-marca-50 text-xs font-bold text-marca-700 dark:bg-slate-800 dark:text-indigo-300">{usuario.username.slice(0, 1).toLocaleUpperCase('es-CO')}</span><span className="hidden lg:inline">{usuario.username}</span><svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m5 7 5 5 5-5" /></svg></summary>
            <div className={mobile ? 'mt-1 flex flex-col gap-1 rounded-xl bg-slate-50 p-2 dark:bg-slate-900' : 'absolute right-0 top-full z-50 mt-2 flex min-w-48 flex-col gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900'}>
                <NavLink to={RUTAS.cuenta} className={clase} onClick={cerrar}>Mi cuenta</NavLink>
                {usuario.roles.includes('USER') && <NavLink to={RUTAS.misTickets} className={clase} onClick={cerrar}>Mis tickets</NavLink>}
                <button type="button" onClick={cerrarYSalir} className="min-h-10 rounded-lg px-4 text-left text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 dark:text-red-300 dark:hover:bg-red-950">Salir</button>
            </div>
        </details>}
    </nav>
}

export default function Layout() {
    const [temaOscuro, setTemaOscuro] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const [menuAbierto, setMenuAbierto] = useState(false)

    useEffect(() => { document.documentElement.classList.toggle('dark', temaOscuro) }, [temaOscuro])
    useEffect(() => {
        function cerrarConEscape(evento: KeyboardEvent) {
            if (evento.key === 'Escape') setMenuAbierto(false)
        }
        document.addEventListener('keydown', cerrarConEscape)
        return () => document.removeEventListener('keydown', cerrarConEscape)
    }, [])

    return <div className="flex min-h-screen flex-col bg-slate-50 font-cuerpo text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-slate-900">Saltar al contenido</a>
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-16 items-center justify-between gap-3 py-2">
                    <Link to={RUTAS.inicio} className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca-600">
                        <span aria-hidden="true" className="grid size-9 place-items-center rounded-lg bg-marca-600 text-white"><svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M18 3v12.25a3.75 3.75 0 1 1-2-3.32V7.2l-7 1.75v9.3a3.75 3.75 0 1 1-2-3.32V6.6L18 4z" /></svg></span>
                        <span className="font-titulo text-xl font-bold tracking-tight">PulsePass</span>
                    </Link>
                    <NavPrincipal />
                    <div className="flex items-center gap-2">
                        <div className="hidden lg:block"><TemaButton oscuro={temaOscuro} alternar={() => setTemaOscuro((actual) => !actual)} /></div>
                        <button type="button" aria-expanded={menuAbierto} aria-controls="menu-movil" aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuAbierto((abierto) => !abierto)} className="grid size-10 place-items-center rounded-lg border border-slate-300 md:hidden dark:border-slate-700"><svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{menuAbierto ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}</svg></button>
                    </div>
                </div>
                {menuAbierto && <div id="menu-movil" className="pb-3 md:hidden"><NavPrincipal mobile cerrar={() => setMenuAbierto(false)} /><div className="pt-2"><TemaButton oscuro={temaOscuro} alternar={() => setTemaOscuro((actual) => !actual)} /></div></div>}
            </div>
        </header>
        <main id="contenido" className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8"><Outlet /></main>
        <ScrollRestoration />
        <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 dark:text-slate-300"><p>© 2026 PulsePass · Caso de estudio académico</p><nav aria-label="Enlaces del pie" className="flex gap-4"><Link to={RUTAS.sedes} className="hover:text-marca-700 hover:underline dark:hover:text-indigo-300">Sedes</Link><Link to={RUTAS.artistas} className="hover:text-marca-700 hover:underline dark:hover:text-indigo-300">Artistas</Link></nav></div></footer>
    </div>
}
