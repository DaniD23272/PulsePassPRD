export const artista = {
    id: 1,
    stageName: 'Solar Beat',
    country: 'Colombia',
    genre: 'Electronic',
    active: true,
}

export const sede = {
    id: 1,
    code: 'VEN-SMR-01',
    name: 'Marina Convention Center',
    city: 'Santa Marta',
    address: 'Muelle 3, Santa Marta',
    capacity: 3000,
    active: true,
}

export const eventoResumen = {
    id: 1,
    eventCode: 'CMF-2026',
    name: 'Caribbean Music Fest 2026',
    category: 'MUSIC',
    status: 'PUBLISHED',
    eventDate: '2026-12-12T20:00:00',
}

export const evento = {
    ...eventoResumen,
    description: 'Música en vivo en Santa Marta.',
    minimumAge: 18,
    venueCode: sede.code,
    venueName: sede.name,
    artists: [artista],
}

export const perfil = {
    id: 1,
    username: 'andrea',
    email: 'andrea@pulsepass.test',
    roles: ['USER'],
}

export const usuario = {
    ...perfil,
    active: true,
    firstName: 'Andrea',
    lastName: 'Ruiz',
    phone: null,
    city: 'Santa Marta',
    birthDate: '1998-04-12',
}

export const ticket = {
    id: 1,
    ticketCode: 'TKT-8F2A1C',
    type: 'VIP',
    price: 250000,
    status: 'PAID',
    purchaseDate: '2026-11-05T14:32:00',
    userEmail: perfil.email,
    eventCode: eventoResumen.eventCode,
    eventName: eventoResumen.name,
}

export const tokenPrueba = 'jwt-de-prueba-no-real'
