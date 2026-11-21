import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'

export default function InicioPage() {
    return (
        <div className="w-full">
            <section className="overflow-hidden rounded-[2rem] bg-linear-to-r from-marca-600 to-acento-500 px-6 py-14 text-white shadow-xl sm:px-10 md:px-14 md:py-20">
                <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">
                            Tu próxima experiencia comienza aquí
                        </p>

                        <h1 className="mt-5 max-w-3xl font-titulo text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            Encuentra eventos que te hagan vibrar
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
                            Explora conciertos, festivales y experiencias culturales. Elige
                            tu próximo plan y vive el momento con PulsePass.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to={RUTAS.eventos}
                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-marca-700 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            >
                                Explorar eventos
                            </Link>

                            <a
                                href="#como-funciona"
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            >
                                Conoce PulsePass
                            </a>
                        </div>
                    </div>

                    <div
                        aria-hidden="true"
                        className="hidden rounded-[1.75rem] border border-white/30 bg-white/10 p-8 backdrop-blur-sm lg:block"
                    >
                        <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-widest">
                PulsePass
              </span>
                            <span className="size-3 rounded-full bg-white" />
                        </div>

                        <div className="mt-12 space-y-5">
                            <div className="h-2 w-2/3 rounded-full bg-white/80" />
                            <div className="h-2 w-full rounded-full bg-white/40" />
                            <div className="h-2 w-5/6 rounded-full bg-white/40" />
                        </div>

                        <p className="mt-12 font-titulo text-2xl font-semibold">
                            Descubre. Elige. Vive.
                        </p>
                        <p className="mt-2 text-sm text-white/80">
                            Todo empieza con un buen evento.
                        </p>
                    </div>
                </div>
            </section>

            <section
                id="como-funciona"
                className="grid gap-5 py-12 sm:grid-cols-3"
                aria-label="Cómo funciona PulsePass"
            >
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-bold text-marca-600">01</p>
                    <h2 className="mt-3 font-titulo text-lg font-bold">Descubre</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Explora la cartelera y encuentra eventos publicados.
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-bold text-marca-600">02</p>
                    <h2 className="mt-3 font-titulo text-lg font-bold">Elige</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Revisa la información y selecciona la experiencia que prefieras.
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-bold text-marca-600">03</p>
                    <h2 className="mt-3 font-titulo text-lg font-bold">Vive</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Gestiona tus entradas desde PulsePass.
                    </p>
                </article>
            </section>
        </div>
    )
}