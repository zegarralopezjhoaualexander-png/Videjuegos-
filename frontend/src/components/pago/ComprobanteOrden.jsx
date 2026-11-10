import { formatMoney } from "../../utils/format.js";
import {
  descripcionTarjeta,
  etiquetaEstadoOrden,
  etiquetaMetodoPago,
} from "../../utils/pago.js";
import {
  descargarComprobante,
  formatearFechaHora,
  imprimirComprobante,
} from "../../utils/comprobante.js";
import { PANEL, SECONDARY_BUTTON } from "../carrito/carritoStyles.js";

function EstadoBadge({ estado }) {
  const clases =
    estado === "PAGADA"
      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
      : estado === "FALLIDA"
        ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
        : "border-amber-400/30 bg-amber-500/10 text-amber-200";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${clases}`}
    >
      {etiquetaEstadoOrden(estado)}
    </span>
  );
}

function Dato({ etiqueta, valor }) {
  if (!valor) {
    return null;
  }

  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {etiqueta}
      </dt>
      <dd className="mt-1 text-sm text-slate-200">{valor}</dd>
    </div>
  );
}

function ComprobanteOrden({ comprobante }) {
  const tarjeta = descripcionTarjeta(
    comprobante.marcaTarjeta,
    comprobante.ultimosDigitos
  );

  return (
    <>
      <article className={`${PANEL} print-area`} aria-labelledby="comprobante-titulo">
        <header className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300 uppercase">
              Comprobante digital
            </p>
            <h2 id="comprobante-titulo" className="mt-1 text-2xl font-bold text-white">
              {comprobante.codigoOrden}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Guarda este código para consultar tu compra.
            </p>
          </div>
          <EstadoBadge estado={comprobante.estado} />
        </header>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Dato
            etiqueta="Fecha"
            valor={formatearFechaHora(comprobante.fechaPago || comprobante.fecha)}
          />
          <Dato etiqueta="Método" valor={etiquetaMetodoPago(comprobante.metodo)} />
          <Dato etiqueta="Cliente" valor={comprobante.nombreCliente} />
          <Dato etiqueta="Correo" valor={comprobante.correoCliente} />
        </dl>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-white">Artículos</h3>
          <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10">
            {comprobante.items.map((item, indice) => (
              <li
                key={`${item.titulo}-${indice}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="min-w-0 text-slate-200">
                  <span className="line-clamp-2">{item.titulo}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Cantidad: {item.cantidad}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-slate-100">
                  {formatMoney(item.precio)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">Subtotal</dt>
            <dd className="font-semibold text-slate-100">
              {formatMoney(comprobante.subtotal)}
            </dd>
          </div>
          {comprobante.descuento > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">Descuento por cupón</dt>
              <dd className="font-semibold text-emerald-200">
                -{formatMoney(comprobante.descuento)}
              </dd>
            </div>
          )}
          {comprobante.descuentoRegalo > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">Tarjeta de regalo</dt>
              <dd className="font-semibold text-emerald-200">
                -{formatMoney(comprobante.descuentoRegalo)}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">Impuesto</dt>
            <dd className="font-semibold text-slate-100">
              {formatMoney(comprobante.impuesto)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <dt className="text-base font-semibold text-white">Total</dt>
            <dd className="text-xl font-bold text-fuchsia-200">
              {formatMoney(comprobante.total)}
            </dd>
          </div>
        </dl>

        {(tarjeta || comprobante.tarjetaRegaloCodigo || comprobante.referenciaPago) && (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            <h3 className="font-semibold text-white">Datos de pago</h3>
            {tarjeta && <p className="mt-1 text-slate-300">{tarjeta}</p>}
            {comprobante.referenciaPago && (
              <p className="mt-1 text-slate-300">{comprobante.referenciaPago}</p>
            )}
            {comprobante.tarjetaRegaloCodigo && (
              <p className="mt-1 text-slate-300">
                Tarjeta de regalo {comprobante.tarjetaRegaloCodigo}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Por seguridad nunca mostramos el número completo de tu tarjeta ni
              el código de aprobación de Yape.
            </p>
          </div>
        )}
      </article>

      <div className="mt-4 flex flex-col gap-2 print:hidden sm:flex-row">
        <button
          type="button"
          onClick={() => imprimirComprobante()}
          className={SECONDARY_BUTTON}
        >
          Imprimir comprobante
        </button>
        <button
          type="button"
          onClick={() => descargarComprobante(comprobante)}
          className={SECONDARY_BUTTON}
        >
          Descargar comprobante
        </button>
      </div>
    </>
  );
}

export default ComprobanteOrden;
