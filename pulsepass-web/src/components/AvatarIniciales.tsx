const PALETA = [
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
] as const

const TAMANOS = {
    compacto: 'size-10 text-xs',
    normal: 'size-16 text-xl',
    grande: 'size-20 text-2xl',
} as const

export default function AvatarIniciales({
    nombre,
    indice = 0,
    tamano = 'normal',
}: {
    nombre: string
    indice?: number
    tamano?: keyof typeof TAMANOS
}) {
    const iniciales = nombre.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toLocaleUpperCase('es-CO')
    const color = PALETA[indice % PALETA.length]

    return <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full font-bold ${TAMANOS[tamano]} ${color}`}>{iniciales}</span>
}
