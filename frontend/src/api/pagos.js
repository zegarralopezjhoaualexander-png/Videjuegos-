import { API_BASE, ApiError, parseErrorResponse, requestJson } from "./http.js";

const PAGOS_URL = `${API_BASE}/api/pagos`;
const ORDENES_URL = `${API_BASE}/api/ordenes`;
const NETWORK_MESSAGE =
  "No se pudo conectar con el servicio de pagos. Verifica tu conexión e inténtalo de nuevo.";

async function pagoError(response) {
  return parseErrorResponse(response, {
    fallback: (status) => {
      if (status === 401) {
        return "Tu sesión expiró. Inicia sesión de nuevo.";
      }

      if (status === 404) {
        return "No encontramos la orden o la tarjeta de regalo.";
      }

      if (status === 503) {
        return "El servicio de pagos no está configurado. Contacta al administrador.";
      }

      if (status === 502) {
        return "Stripe no pudo iniciar el pago. Inténtalo de nuevo.";
      }

      if (status === 402) {
        return "Yape rechazó el pago. Verifica el código de aprobación e inténtalo de nuevo.";
      }

      if (status === 400) {
        return "Revisa los datos de pago e inténtalo de nuevo.";
      }

      return "No se pudo procesar el pago. Inténtalo de nuevo.";
    },
  });
}

function request(url, options) {
  return requestJson(url, {
    ...options,
    networkMessage: NETWORK_MESSAGE,
    parseError: pagoError,
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
    titulo: toText(item.titulo),
    imagen: toText(item.imagen),
    precio: toNumber(item.precio),
    cantidad: Math.max(1, toNumber(item.cantidad, 1)),
  };
}

function normalizeIntent(payload) {
  const raw = payload?.data ?? payload;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ApiError("El servidor devolvió una respuesta inesperada.");
  }

  return {
    codigoOrden: toText(raw.codigoOrden),
    clientSecret: raw.clientSecret ? String(raw.clientSecret) : null,
    requierePago: Boolean(raw.requierePago),
    total: toNumber(raw.total),
    descuentoRegalo: toNumber(raw.descuentoRegalo),
    metodo: toText(raw.metodo),
    estado: toText(raw.estado),
  };
}

function normalizeYape(payload) {
  const raw = payload?.data ?? payload;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ApiError("El servidor devolvió una respuesta inesperada.");
  }

  return {
    codigoOrden: toText(raw.codigoOrden),
    total: toNumber(raw.total),
    totalPen: toNumber(raw.totalPen),
    tipoCambio: toNumber(raw.tipoCambio),
    descuentoRegalo: toNumber(raw.descuentoRegalo),
    metodo: toText(raw.metodo),
    estado: toText(raw.estado),
    referencia: toText(raw.referencia),
  };
}

function normalizeComprobante(payload) {
  const raw = payload?.data ?? payload;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ApiError("El servidor devolvió una respuesta inesperada.");
  }

  return {
    codigoOrden: toText(raw.codigoOrden),
    estado: toText(raw.estado),
    fecha: toText(raw.fecha),
    fechaPago: toText(raw.fechaPago),
    metodo: toText(raw.metodo),
    nombreCliente: toText(raw.nombreCliente),
    correoCliente: toText(raw.correoCliente),
    items: Array.isArray(raw.items) ? raw.items.map(normalizeItem) : [],
    subtotal: toNumber(raw.subtotal),
    descuento: toNumber(raw.descuento),
    impuesto: toNumber(raw.impuesto),
    descuentoRegalo: toNumber(raw.descuentoRegalo),
    total: toNumber(raw.total),
    marcaTarjeta: toText(raw.marcaTarjeta),
    ultimosDigitos: toText(raw.ultimosDigitos),
    tarjetaRegaloCodigo: toText(raw.tarjetaRegaloCodigo),
    referenciaPago: toText(raw.referenciaPago),
  };
}

export async function crearPagoIntent(
  { metodo, codigoTarjetaRegalo },
  { token, signal } = {}
) {
  const payload = await request(`${PAGOS_URL}/intent`, {
    token,
    method: "POST",
    body: {
      metodo,
      codigoTarjetaRegalo: codigoTarjetaRegalo?.trim() || null,
    },
    signal,
  });

  return normalizeIntent(payload);
}

export async function pagarConYape(
  { celular, codigoAprobacion, codigoTarjetaRegalo },
  { token, signal } = {}
) {
  const payload = await request(`${PAGOS_URL}/yape`, {
    token,
    method: "POST",
    body: {
      celular: celular?.trim(),
      codigoAprobacion: codigoAprobacion?.trim(),
      codigoTarjetaRegalo: codigoTarjetaRegalo?.trim() || null,
    },
    signal,
  });

  return normalizeYape(payload);
}

export async function verificarTarjetaRegalo(codigo, { token, signal } = {}) {
  const payload = await request(`${PAGOS_URL}/tarjeta-regalo`, {
    token,
    method: "POST",
    body: { codigo: codigo?.trim() },
    signal,
  });

  const raw = payload?.data ?? payload;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ApiError("El servidor devolvió una respuesta inesperada.");
  }

  return {
    codigo: toText(raw.codigo),
    saldo: toNumber(raw.saldo),
  };
}

export async function obtenerConfiguracionPago({ token, signal } = {}) {
  const payload = await request(`${PAGOS_URL}/configuracion`, { token, signal });
  const raw = payload?.data ?? payload;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ApiError("El servidor devolvió una respuesta inesperada.");
  }

  return {
    tipoCambioPen: toNumber(raw.tipoCambioPen, 3.75),
  };
}

export async function obtenerComprobante(codigo, { token, signal } = {}) {
  const payload = await request(
    `${ORDENES_URL}/${encodeURIComponent(codigo)}/comprobante`,
    { token, signal }
  );

  return normalizeComprobante(payload);
}
