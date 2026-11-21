export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

function leerMensaje(payload: unknown): string {
    if (
        typeof payload === "object" &&
        payload !== null &&
        "message" in payload &&
        typeof payload.message === "string"
    ) {
        return payload.message;
    }

    return "No fue posible completar la solicitud.";
}

export async function getJson(path: string): Promise<unknown> {
    const response = await fetch(path, {
        headers: {
            Accept: "application/json",
        },
    });

    let payload: unknown = null;

    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        throw new ApiError(response.status, leerMensaje(payload));
    }

    return payload;
}