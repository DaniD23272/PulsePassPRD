import { useId } from 'react'
import type { CategoriaEvento } from '../features/eventos/api'

type Props = {
    categoria: CategoriaEvento
    className?: string
}

const PALETA: Record<CategoriaEvento, { inicio: string; medio: string; fin: string; luz: string; figura: string }> = {
    MUSIC: { inicio: '#0446EF', medio: '#F10393', fin: '#440327', luz: '#FE6EF0', figura: '#1C1859' },
    SPORTS: { inicio: '#0446EF', medio: '#8B0535', fin: '#1C1859', luz: '#FE6EF0', figura: '#440327' },
    TECHNOLOGY: { inicio: '#1C1859', medio: '#0446EF', fin: '#FE6EF0', luz: '#F10393', figura: '#1C1859' },
    EDUCATION: { inicio: '#440327', medio: '#8B0535', fin: '#F10393', luz: '#FE6EF0', figura: '#1C1859' },
    CULTURE: { inicio: '#0446EF', medio: '#1C1859', fin: '#8B0535', luz: '#FE6EF0', figura: '#440327' },
    ENTERTAINMENT: { inicio: '#440327', medio: '#F10393', fin: '#0446EF', luz: '#FE6EF0', figura: '#1C1859' },
}

function FiguraEvento({ categoria, color }: { categoria: CategoriaEvento; color: string }) {
    if (categoria === 'MUSIC') {
        return (
            <g fill={color}>
                <circle cx="323" cy="118" r="20" />
                <path d="M298 145q25-18 50 0l17 110h-83z" />
                <path d="m302 157-43-54q-8-10 3-17 10-7 17 4l48 47z" />
                <path d="m343 157 38-42q8-9 17-1 8 8 0 17l-46 58z" />
                <path d="m302 241-20 73h27l25-64zm38 8 20 65h28l-23-79z" />
                <path d="M243 81q-22 25 0 49m-12-60q-34 37 0 73m179-63q22 25 0 49m12-60q34 37 0 73" fill="none" stroke={color} strokeLinecap="round" strokeWidth="7" opacity=".8" />
            </g>
        )
    }

    if (categoria === 'SPORTS') {
        return (
            <g fill={color}>
                <circle cx="324" cy="105" r="19" />
                <path d="m309 130 35 8 21 49-23 12-20-32-29 30-19-18z" />
                <path d="m295 142-43 19-8-18 45-30zm54 8 39-28 12 15-41 37z" />
                <path d="m315 185-43 49-18-13 33-61zm27 2 40 43-17 16-47-37z" />
                <path d="M229 250h204" fill="none" stroke={color} strokeLinecap="round" strokeWidth="6" opacity=".65" />
            </g>
        )
    }

    if (categoria === 'TECHNOLOGY') {
        return (
            <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
                <path d="m322 63 70 54-70 54-70-54z" strokeWidth="9" />
                <path d="m322 95 37 28-37 28-37-28z" strokeWidth="6" />
                <path d="M322 171v72m-83-92-44 25m210-25 44 25M245 82l-25-26m179 26 25-26" strokeWidth="6" />
                <circle cx="322" cy="117" r="9" fill={color} stroke="none" />
                <circle cx="193" cy="177" r="8" fill={color} stroke="none" />
                <circle cx="451" cy="177" r="8" fill={color} stroke="none" />
            </g>
        )
    }

    if (categoria === 'EDUCATION') {
        return (
            <g fill={color}>
                <path d="M221 111q56-24 101 10 45-34 101-10v113q-56-24-101 10-45-34-101-10z" />
                <path d="M322 121v113" fill="none" stroke="#FE6EF0" strokeWidth="6" opacity=".8" />
                <path d="M239 132q39-14 67 3m-67 19q39-14 67 3m48-22q27-17 67-3m-67 25q27-17 67-3" fill="none" stroke="#FE6EF0" strokeLinecap="round" strokeWidth="5" opacity=".85" />
                <path d="m288 90 13-25 13 25 28 4-20 18 5 27-26-13-25 13 5-27-20-18z" opacity=".9" />
            </g>
        )
    }

    if (categoria === 'CULTURE') {
        return (
            <g fill={color}>
                <path d="M226 121q95-75 190 0v24q-95-66-190 0z" />
                <path d="M244 146h154v12H244zm14 12h10v68h-10zm35 0h10v68h-10zm35 0h10v68h-10zm35 0h10v68h-10zM239 226h164v15H239z" />
                <path d="M278 100q-17-15-28 0 0 21 28 35 28-14 28-35-11-15-28 0zm85 0q-17-15-28 0 0 21 28 35 28-14 28-35-11-15-28 0z" fill="#FE6EF0" opacity=".9" />
            </g>
        )
    }

    return (
        <g fill={color}>
            <path d="M322 62 339 105l45-12-25 39 39 25-47 4-4 47-25-39-39 25 12-45-43-17 43-17z" />
            <circle cx="322" cy="139" r="23" />
            <path d="m309 164 29-2 20 63-26 8-24-38-26 34-21-17z" />
            <path d="m307 171-45-26-12 17 47 39zm36-4 42-38 14 16-39 49z" />
            <path d="m308 224-30 64h25l34-52zm30 4 20 62h25l-17-72z" />
        </g>
    )
}

export default function FestivalIlustracion({ categoria, className = '' }: Props) {
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
    const paleta = PALETA[categoria]
    const fondoId = `fondo-${id}`
    const brilloId = `brillo-${id}`

    return (
        <div aria-hidden="true" className={`pointer-events-none overflow-hidden ${className}`}>
            <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
                <defs>
                    <linearGradient id={fondoId} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={paleta.inicio} />
                        <stop offset="54%" stopColor={paleta.medio} />
                        <stop offset="100%" stopColor={paleta.fin} />
                    </linearGradient>
                    <radialGradient id={brilloId}>
                        <stop offset="0%" stopColor={paleta.luz} stopOpacity=".9" />
                        <stop offset="100%" stopColor={paleta.luz} stopOpacity="0" />
                    </radialGradient>
                </defs>

                <rect width="640" height="360" fill={`url(#${fondoId})`} />
                <circle cx="508" cy="75" r="108" fill={`url(#${brilloId})`} opacity=".72" />
                <circle cx="508" cy="75" r="54" fill={paleta.luz} opacity=".3" />

                <g className="festival-art-float" fill="none" stroke={paleta.luz} strokeLinecap="round" opacity=".62">
                    <circle cx="508" cy="75" r="75" strokeWidth="2" />
                    <circle cx="508" cy="75" r="92" strokeDasharray="2 12" strokeWidth="4" />
                    <path d="M84 96h38m-19-19v38M544 211h25m-12-12v25M153 180h19m-9-9v19" strokeWidth="4" />
                </g>

                <g opacity=".5" fill={paleta.luz}>
                    <path d="m113 72 5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1z" />
                    <path d="m439 205 4 10 11 1-8 7 3 11-10-6-9 6 3-11-9-7 11-1z" />
                    <circle cx="181" cy="71" r="4" /><circle cx="405" cy="126" r="3" /><circle cx="562" cy="154" r="4" />
                </g>

                <g className="festival-art-figure">
                    <FiguraEvento categoria={categoria} color={paleta.figura} />
                </g>

                <g fill={paleta.figura}>
                    <path d="M0 326q30-22 60 0 24-25 50 0 30-28 59 0 25-24 50 0 29-31 57 0 28-26 56 0 31-32 60 0 29-27 58 0 31-31 60 0 30-24 60 0 30-24 70 0v34H0z" />
                    <circle cx="42" cy="307" r="13" /><circle cx="94" cy="300" r="15" /><circle cx="148" cy="308" r="12" />
                    <circle cx="210" cy="300" r="16" /><circle cx="272" cy="308" r="13" /><circle cx="382" cy="302" r="14" />
                    <circle cx="444" cy="306" r="12" /><circle cx="508" cy="300" r="16" /><circle cx="574" cy="307" r="13" />
                </g>
            </svg>
        </div>
    )
}
