import { API_BASE, ApiError, requestJson } from "./http.js";

const NETWORK_MESSAGE =
  "No se pudieron cargar las calificaciones. Verifica tu conexión e inténtalo de nuevo.";

function calificacionesUrl(id) {
  return `${API_BASE}/api/tienda/juegos/${encodeURIComponent(id)}/calificaciones`;
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeResumen(payload) {
  const raw = payload?.data ?? payload;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ApiError("El servidor devolvió una respuesta inesperada.");
  }

  const total = toNumberOrNull(raw.total);

  return {
    promedio: toNumberOrNull(raw.promedio),
    total: total === null ? 0 : Math.max(total, 0),
    miPuntaje: toNumberOrNull(raw.miPuntaje),
  };
}

export async function fetchCalificaciones(id, { token, signal } = {}) {
  const url = token ? `${calificacionesUrl(id)}/mia` : calificacionesUrl(id);

  const payload = await requestJson(url, {
    token,
    signal,
    networkMessage: NETWORK_MESSAGE,
  });
  return normalizeResumen(payload);
}

export async function guardarMiCalificacion(
  id,
  puntaje,
  { token, signal } = {}
) {
  const payload = await requestJson(`${calificacionesUrl(id)}/mia`, {
    token,
    method: "PUT",
    body: { puntaje },
    signal,
    networkMessage: NETWORK_MESSAGE,
  });

  return normalizeResumen(payload);
}
