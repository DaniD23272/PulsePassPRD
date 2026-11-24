const PALETA = [
    'bg-pulse-blue text-white dark:bg-pulse-blue dark:text-white',
    'bg-pulse-nightlife text-white dark:bg-pulse-nightlife dark:text-white',
    'bg-pulse-berry text-white dark:bg-pulse-berry dark:text-white',
    'bg-pulse-light-magenta text-pulse-nightlife dark:bg-pulse-light-magenta dark:text-pulse-nightlife',
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
