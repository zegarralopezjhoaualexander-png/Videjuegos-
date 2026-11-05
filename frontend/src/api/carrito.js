import { API_BASE, ApiError, parseErrorResponse, requestJson } from "./http.js";
import { resolvePublicImage } from "./juegos.js";

const CARRITO_URL = `${API_BASE}/api/tienda/carrito`;
const NETWORK_MESSAGE =
  "No se pudo conectar con el carrito. Verifica tu conexión e inténtalo de nuevo.";
const CONFLICTO_GENERICO =
  "No se pudo agregar el videojuego: ya está en tu carrito o en tu biblioteca.";

function mensajeConflicto(mensaje) {
  if (!mensaje || mensaje === CONFLICTO_GENERICO) {
    return CONFLICTO_GENERICO;
  }

  if (/posees|biblioteca/i.test(mensaje)) {
    return "Ya posees este videojuego";
  }

  if (/carrito/i.test(mensaje)) {
    return "Este videojuego ya está en tu carrito";
  }

  return CONFLICTO_GENERICO;
}

async function carritoError(response) {
  const error = await parseErrorResponse(response, {
    fallback: (status) => {
      if (status === 401) {
        return "Tu sesión expiró. Inicia sesión de nuevo.";
      }

      if (status === 404) {
        return "El recurso solicitado no existe.";
      }

      if (status === 409) {
        return CONFLICTO_GENERICO;
      }

      if (status === 400) {
        return "El cupón no es válido o ya no está disponible.";
      }

      return "Ocurrió un error al procesar el carrito. Inténtalo de nuevo.";
    },
  });

  if (response.status === 409) {
    error.message = mensajeConflicto(error.message);
  }

  return error;
}

function request(url, options) {
  return requestJson(url, {
    ...options,
    networkMessage: NETWORK_MESSAGE,
    parseError: carritoError,
  });
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toText(value) {
  return typeof value === "string" ? value : "";
}

function normalizeItem(item = {}) {
  return {
    juegoId: String(item.juegoId ?? item.id ?? ""),
    titulo: toText(item.titulo),
    imagen: resolvePublicImage(item.imagen),
    precio: toNumber(item.precio),
  };
}

function normalizeResumen(payload) {
  const raw = payload?.data ?? payload;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ApiError("El servidor devolvió una respuesta inesperada.");
  }

  const items = Array.isArray(raw.items) ? raw.items.map(normalizeItem) : [];

  return {
    items,
    cantidadItems: toNumber(raw.cantidadItems, items.length),
    subtotal: toNumber(raw.subtotal),
    descuento: toNumber(raw.descuento),
    cuponCodigo: raw.cuponCodigo ? String(raw.cuponCodigo) : null,
    impuesto: toNumber(raw.impuesto),
    total: toNumber(raw.total),
  };
}

function normalizeJuegoId(juegoId) {
  const number = Number(juegoId);
  return Number.isSafeInteger(number) ? number : juegoId;
}

export async function obtenerCarrito({ token, signal } = {}) {
  const payload = await request(CARRITO_URL, { token, signal });
  return normalizeResumen(payload);
}

export async function agregarItem(juegoId, { token, signal } = {}) {
  const payload = await request(`${CARRITO_URL}/items`, {
    token,
    method: "POST",
    body: { juegoId: normalizeJuegoId(juegoId) },
    signal,
  });
  return normalizeResumen(payload);
}

export async function quitarItem(juegoId, { token, signal } = {}) {
  const payload = await request(
    `${CARRITO_URL}/items/${encodeURIComponent(juegoId)}`,
    {
      token,
      method: "DELETE",
      signal,
    }
  );
  return normalizeResumen(payload);
}

export async function aplicarCodigoCupon(codigo, { token, signal } = {}) {
  const payload = await request(`${CARRITO_URL}/cupon`, {
    token,
    method: "POST",
    body: { codigo },
    signal,
  });
  return normalizeResumen(payload);
}

export async function quitarCuponDelCarrito({ token, signal } = {}) {
  const payload = await request(`${CARRITO_URL}/cupon`, {
    token,
    method: "DELETE",
    signal,
  });
  return normalizeResumen(payload);
}

export async function vaciarCarrito({ token, signal } = {}) {
  const payload = await request(CARRITO_URL, {
    token,
    method: "DELETE",
    signal,
  });
  return normalizeResumen(payload);
}
