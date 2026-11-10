import { formatMoney } from "./format.js";
import {
  descripcionTarjeta,
  etiquetaEstadoOrden,
  etiquetaMetodoPago,
} from "./pago.js";

export function formatearFechaHora(valor) {
  if (!valor) {
    return "";
  }

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(fecha);
}

function escaparHtml(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => {
    const reemplazos = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return reemplazos[caracter];
  });
}

export function textoComprobante(comprobante) {
  const lineas = [
    "COMPROBANTE DE COMPRA",
    `Código de orden: ${comprobante.codigoOrden}`,
    `Estado: ${etiquetaEstadoOrden(comprobante.estado)}`,
    `Fecha: ${formatearFechaHora(comprobante.fechaPago || comprobante.fecha)}`,
    `Método de pago: ${etiquetaMetodoPago(comprobante.metodo)}`,
    `Cliente: ${comprobante.nombreCliente}`,
    `Correo: ${comprobante.correoCliente}`,
    "",
    "Artículos:",
    ...comprobante.items.map(
      (item) =>
        `- ${item.titulo} x${item.cantidad}: ${formatMoney(item.precio)}`
    ),
    "",
    `Subtotal: ${formatMoney(comprobante.subtotal)}`,
  ];

  if (comprobante.descuento > 0) {
    lineas.push(`Descuento: -${formatMoney(comprobante.descuento)}`);
  }
  if (comprobante.descuentoRegalo > 0) {
    lineas.push(
      `Tarjeta de regalo: -${formatMoney(comprobante.descuentoRegalo)}`
    );
  }

  lineas.push(`Impuesto: ${formatMoney(comprobante.impuesto)}`);
  lineas.push(`Total: ${formatMoney(comprobante.total)}`);

  const tarjeta = descripcionTarjeta(
    comprobante.marcaTarjeta,
    comprobante.ultimosDigitos
  );
  if (tarjeta) {
    lineas.push(`Tarjeta: ${tarjeta}`);
  }
  if (comprobante.tarjetaRegaloCodigo) {
    lineas.push(`Tarjeta de regalo: ${comprobante.tarjetaRegaloCodigo}`);
  }

  return lineas.join("\n");
}

export function descargarComprobante(comprobante) {
  const filas = comprobante.items
    .map(
      (item) => `
        <tr>
          <td>${escaparHtml(item.titulo)}</td>
          <td class="num">${item.cantidad}</td>
          <td class="num">${escaparHtml(formatMoney(item.precio))}</td>
        </tr>`
    )
    .join("");

  const descuento = comprobante.descuento > 0
    ? `<tr><td colspan="2">Descuento por cupón</td><td class="num">-${escaparHtml(
        formatMoney(comprobante.descuento)
      )}</td></tr>`
    : "";
  const regalo = comprobante.descuentoRegalo > 0
    ? `<tr><td colspan="2">Descuento por tarjeta de regalo</td><td class="num">-${escaparHtml(
        formatMoney(comprobante.descuentoRegalo)
      )}</td></tr>`
    : "";

  const pago = [
    descripcionTarjeta(comprobante.marcaTarjeta, comprobante.ultimosDigitos),
    comprobante.tarjetaRegaloCodigo
      ? `Tarjeta de regalo ${comprobante.tarjetaRegaloCodigo}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Comprobante ${escaparHtml(comprobante.codigoOrden)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .muted { color: #6b7280; font-size: 13px; }
    .box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    th { color: #6b7280; font-size: 12px; text-transform: uppercase; }
    .num { text-align: right; }
    .total { font-size: 18px; font-weight: bold; }
    .row { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; margin-top: 6px; }
  </style>
</head>
<body>
  <h1>Comprobante de compra</h1>
  <p class="muted">Código de orden: ${escaparHtml(comprobante.codigoOrden)}</p>
  <div class="box">
    <p><strong>Estado:</strong> ${escaparHtml(etiquetaEstadoOrden(comprobante.estado))}</p>
    <p><strong>Fecha:</strong> ${escaparHtml(
      formatearFechaHora(comprobante.fechaPago || comprobante.fecha)
    )}</p>
    <p><strong>Método de pago:</strong> ${escaparHtml(
      etiquetaMetodoPago(comprobante.metodo)
    )}</p>
    <p><strong>Cliente:</strong> ${escaparHtml(comprobante.nombreCliente)}</p>
    <p><strong>Correo:</strong> ${escaparHtml(comprobante.correoCliente)}</p>
    ${pago ? `<p><strong>Pago:</strong> ${escaparHtml(pago)}</p>` : ""}

    <table>
      <thead>
        <tr><th>Artículo</th><th class="num">Cant.</th><th class="num">Precio</th></tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>

    <div class="row"><span>Subtotal</span><span>${escaparHtml(
      formatMoney(comprobante.subtotal)
    )}</span></div>
    ${descuento ? `<div class="row"><span>Descuento por cupón</span><span>-${escaparHtml(
      formatMoney(comprobante.descuento)
    )}</span></div>` : ""}
    ${regalo ? `<div class="row"><span>Descuento por tarjeta de regalo</span><span>-${escaparHtml(
      formatMoney(comprobante.descuentoRegalo)
    )}</span></div>` : ""}
    <div class="row"><span>Impuesto</span><span>${escaparHtml(
      formatMoney(comprobante.impuesto)
    )}</span></div>
    <div class="row total"><span>Total</span><span>${escaparHtml(
      formatMoney(comprobante.total)
    )}</span></div>
  </div>
  <p class="muted">Este comprobante no incluye datos completos de tu tarjeta.</p>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `comprobante-${comprobante.codigoOrden}.html`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export function imprimirComprobante() {
  window.print();
}
