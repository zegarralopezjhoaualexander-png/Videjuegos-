import { formatMoney, formatSoles } from "../../utils/format.js";
import { PANEL } from "../carrito/carritoStyles.js";

function Linea({ etiqueta, valor, destacada = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={destacada ? "text-base font-semibold text-white" : "text-slate-400"}>
        {etiqueta}
      </dt>
      <dd
        className={
          destacada
            ? "text-xl font-bold text-fuchsia-200"
            : "font-semibold text-slate-100"
        }
      >
        {valor}
      </dd>
    </div>
  );
}

function ResumenPago({
  items,
  resumen,
  descuentoRegalo = 0,
  total,
  totalPen,
  tipoCambio,
}) {
  const totalFinal = Number.isFinite(total) ? total : resumen.total;
  const mostrarSoles = Number.isFinite(totalPen);

  return (
    <aside
      className={`${PANEL} hud-corners lg:sticky lg:top-24`}
      aria-labelledby="resumen-pago"
    >
      <h2 id="resumen-pago" className="text-lg font-semibold text-white">
        Resumen de la orden
      </h2>
      <p className="mt-1 text-xs text-slate-400">
        {items.length === 1 ? "1 videojuego" : `${items.length} videojuegos`}
      </p>

      <ul className="mt-4 space-y-2 border-b border-white/10 pb-4">
        {items.map((item) => (
          <li
            key={item.juegoId}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <span className="min-w-0 text-slate-300">
              <span className="line-clamp-2">{item.titulo || "Videojuego"}</span>
            </span>
            <span className="shrink-0 font-semibold text-slate-100">
              {formatMoney(item.precio)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-3 text-sm">
        <Linea etiqueta="Subtotal" valor={formatMoney(resumen.subtotal)} />
        {resumen.cuponCodigo && (
          <Linea
            etiqueta={`Descuento (${resumen.cuponCodigo})`}
            valor={`-${formatMoney(resumen.descuento)}`}
          />
        )}
        {descuentoRegalo > 0 && (
          <Linea
            etiqueta="Tarjeta de regalo"
            valor={`-${formatMoney(descuentoRegalo)}`}
          />
        )}
        <Linea etiqueta="Impuesto" valor={formatMoney(resumen.impuesto)} />
        <div className="border-t border-white/10 pt-3">
          <Linea etiqueta="Total" valor={formatMoney(totalFinal)} destacada />
        </div>
        {mostrarSoles && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#742284]/40 bg-[#742284]/10 px-3 py-2">
            <dt className="text-xs font-semibold text-fuchsia-200">
              Total con Yape
            </dt>
            <dd className="text-sm font-bold text-white">
              {formatSoles(totalPen)}
            </dd>
          </div>
        )}
      </dl>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        El total se calcula siempre en el servidor.{" "}
        {mostrarSoles && tipoCambio
          ? `Yape usa un tipo de cambio de 1 USD = S/ ${Number(tipoCambio).toFixed(2)}.`
          : "El cobro con Stripe se realiza en USD."}
      </p>
    </aside>
  );
}

export default ResumenPago;
