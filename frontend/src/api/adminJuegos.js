import { API_BASE, parseErrorResponse, requestJson } from "./http.js";

const ADMIN_JUEGOS_URL = `${API_BASE}/api/admin/juegos`;
const NETWORK_MESSAGE =
  "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.";

function defaultErrorMessage(status) {
  if (status === 403) {
    return "No tienes permiso para hacer esto.";
  }

  if (status === 400 || status === 409) {
    return "No se pudo completar la operación. Revisa los datos e inténtalo de nuevo.";
  }

  return "Ocurrió un error al procesar la solicitud. Inténtalo de nuevo.";
}

function parseAdminError(response) {
  return parseErrorResponse(response, { fallback: defaultErrorMessage });
}

function request(url, options) {
  return requestJson(url, {
    ...options,
    networkMessage: NETWORK_MESSAGE,
    parseError: parseAdminError,
  });
}

export async function crearJuego(datos, { token, signal } = {}) {
  return request(ADMIN_JUEGOS_URL, {
    token,
    method: "POST",
    body: datos,
    signal,
  });
}

export async function actualizarJuego(id, datos, { token, signal } = {}) {
  return request(`${ADMIN_JUEGOS_URL}/${encodeURIComponent(id)}`, {
    token,
    method: "PUT",
    body: datos,
    signal,
  });
}

export async function eliminarJuego(id, { token, signal } = {}) {
  return request(`${ADMIN_JUEGOS_URL}/${encodeURIComponent(id)}`, {
    token,
    method: "DELETE",
    signal,
  });
}
