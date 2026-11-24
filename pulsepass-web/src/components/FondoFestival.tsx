export default function FondoFestival() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[68rem] overflow-hidden">
            <div className="festival-glow-drift absolute -top-36 left-[12%] size-96 rounded-full bg-pulse-hot-pink/15 blur-[110px]" />
            <div className="festival-glow-drift absolute top-64 right-[8%] size-[28rem] rounded-full bg-pulse-blue/15 blur-[120px] [animation-delay:-7s]" />
            <svg viewBox="0 0 1440 1100" preserveAspectRatio="xMidYMin slice" className="absolute inset-0 h-full w-full opacity-25">
                <g fill="none" stroke="#FE6EF0" strokeLinecap="round" opacity=".24">
                    <path d="M80 900V520a640 640 0 0 1 1280 0v380" strokeWidth="3" />
                    <path d="M190 900V560a530 530 0 0 1 1060 0v340" strokeWidth="2" />
                    <path d="M300 900V600a420 420 0 0 1 840 0v300" strokeWidth="2" />
                    <path d="M720 72v200m-90-100h180m-154-64 128 128m0-128L656 300" strokeWidth="2" opacity=".65" />
                    <path d="M85 355h52m-26-26v52m1190 75h44m-22-22v44M265 260h30m-15-15v30m850 310h26m-13-13v26" strokeWidth="4" />
                </g>
                <g fill="#F10393" opacity=".34">
                    <path d="m1090 235 8 20 21 2-16 13 5 20-18-11-18 11 5-20-16-13 21-2z" />
                    <path d="m300 430 6 15 16 1-12 10 4 15-14-9-14 9 4-15-12-10 16-1z" />
                    <circle cx="1170" cy="380" r="5" />
                    <circle cx="236" cy="660" r="4" />
                    <circle cx="970" cy="540" r="4" />
                </g>
                <g fill="#1C1859" opacity=".58">
                    <path d="M0 1035q38-34 76 0 35-42 77 0 38-38 78 0 34-45 82 0 43-36 86 0 41-45 86 0 42-38 84 0 38-44 81 0 40-39 82 0 43-43 87 0 40-38 83 0 44-41 88 0 37-36 77 0 41-44 83 0 39-34 80 0v65H0z" />
                    <circle cx="79" cy="1003" r="16" /><circle cx="153" cy="995" r="18" /><circle cx="231" cy="1004" r="15" />
                    <circle cx="317" cy="991" r="19" /><circle cx="402" cy="1001" r="16" /><circle cx="510" cy="994" r="18" />
                    <circle cx="612" cy="1003" r="15" /><circle cx="720" cy="990" r="20" /><circle cx="829" cy="1002" r="16" />
                    <circle cx="932" cy="995" r="18" /><circle cx="1035" cy="1003" r="15" /><circle cx="1143" cy="991" r="19" />
                    <circle cx="1250" cy="1002" r="16" /><circle cx="1355" cy="994" r="18" />
                </g>
            </svg>
        </div>
    )
}
