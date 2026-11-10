export const METODO_TARJETA = "TARJETA_CREDITO_DEBITO";
export const METODO_YAPE = "YAPE";
export const METODO_BILLETERA = "BILLETERA_DIGITAL";
export const METODO_REGALO = "TARJETA_REGALO";

export const METODOS_PAGO = [
  {
    id: METODO_TARJETA,
    icono: "tarjeta",
    titulo: "Tarjeta de crédito o débito",
    descripcion: "Visa, Mastercard, American Express y más.",
  },
  {
    id: METODO_YAPE,
    icono: "yape",
    titulo: "Yape",
    descripcion: "Paga en segundos con tu código de aprobación.",
    destacado: "Más usado",
  },
  {
    id: METODO_BILLETERA,
    icono: "billetera",
    titulo: "Billetera digital",
    descripcion: "Google Pay, Apple Pay o Link según tu dispositivo.",
  },
  {
    id: METODO_REGALO,
    icono: "regalo",
    titulo: "Tarjeta de regalo",
    descripcion: "Usa el saldo de tu tarjeta para cubrir el total.",
    soloSiCubre: true,
  },
];

const ETIQUETAS_METODO = {
  TARJETA_CREDITO_DEBITO: "Tarjeta de crédito o débito",
  YAPE: "Yape",
  BILLETERA_DIGITAL: "Billetera digital",
  TARJETA_REGALO: "Tarjeta de regalo",
};

const ETIQUETAS_ESTADO = {
  PENDIENTE: "Pendiente de pago",
  PAGADA: "Pagada",
  FALLIDA: "Pago fallido",
};

export function etiquetaMetodoPago(metodo) {
  return ETIQUETAS_METODO[metodo] ?? "Método de pago";
}

export function etiquetaEstadoOrden(estado) {
  return ETIQUETAS_ESTADO[estado] ?? "Estado desconocido";
}

export function descripcionTarjeta(marca, ultimosDigitos) {
  if (!marca && !ultimosDigitos) {
    return "";
  }

  const marcaTexto = marca ? marca.toUpperCase() : "TARJETA";
  return ultimosDigitos
    ? `${marcaTexto} •••• ${ultimosDigitos}`
    : marcaTexto;
}
