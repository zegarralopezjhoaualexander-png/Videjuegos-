import { formatMoney } from "../../utils/format.js";
import { PANEL, PRIMARY_BUTTON } from "./carritoStyles.js";

function LineaResumen({ etiqueta, valor }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-400">{etiqueta}</dt>
      <dd className="font-semibold text-slate-100">{valor}</dd>
    </div>
  );
}

function DescuentoLinea({ resumen, quitandoCupon, onQuitarCupon }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-emerald-200">Descuento ({resumen.cuponCodigo})</dt>
      <dd className="text-right">
        <span className="block font-semibold text-emerald-200">
          -{formatMoney(resumen.descuento)}
        </span>
        <button
          type="button"
          onClick={onQuitarCupon}
          disabled={quitandoCupon}
          aria-label={`Quitar cupón ${resumen.cuponCodigo}`}
          className="mt-1 text-xs font-semibold text-rose-200 underline-offset-2 hover:text-rose-100 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {quitandoCupon ? "Quitando..." : "Quitar cupón"}
        </button>
      </dd>
    </div>
  );
}

function BotonPago() {
  return (
    <button
      type="button"
      disabled
      aria-label="Continuar al pago, próximamente"
      className={`${PRIMARY_BUTTON} mt-5 w-full`}
    >
      <span className="flex flex-col items-center gap-0.5">
        <span>Continuar al pago</span>
        <span className="text-xs font-normal tracking-normal">Próximamente</span>
      </span>
    </button>
  );
}

function ResumenCarrito({ resumen, quitandoCupon, onQuitarCupon }) {
  return (
    <aside
      className={`${PANEL} hud-corners lg:sticky lg:top-24`}
      aria-labelledby="resumen-carrito"
    >
      <h2 id="resumen-carrito" className="text-lg font-semibold text-white">
        Resumen
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <LineaResumen
          etiqueta="Subtotal"
          valor={formatMoney(resumen.subtotal)}
        />
        {resumen.cuponCodigo && (
          <DescuentoLinea
            resumen={resumen}
            quitandoCupon={quitandoCupon}
            onQuitarCupon={onQuitarCupon}
          />
        )}
        <LineaResumen
          etiqueta="Impuesto"
          valor={formatMoney(resumen.impuesto)}
        />
        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <dt className="text-base font-semibold text-white">Total</dt>
          <dd className="text-xl font-bold text-fuchsia-200">
            {formatMoney(resumen.total)}
          </dd>
        </div>
      </dl>

      <BotonPago />
    </aside>
  );
}

export default ResumenCarrito;
