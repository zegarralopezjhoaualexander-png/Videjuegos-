import { useState } from "react";
import { formatMoney, formatSoles } from "../../utils/format.js";
import { inputClasses } from "../../styles/formStyles.js";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "../carrito/carritoStyles.js";

const PATRON_CELULAR = /^9\d{8}$/;
const PATRON_CODIGO = /^\d{6}$/;

function soloDigitos(valor, maximo) {
  return valor.replace(/\D/g, "").slice(0, maximo);
}

function CheckAprobado() {
  return (
    <span className="check-aprobado mx-auto flex size-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        aria-hidden="true"
        className="size-8 text-emerald-200"
      >
        <circle cx="12" cy="12" r="9" className="check-aprobado__circulo" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m8 12.5 2.6 2.6L16.5 9"
          className="check-aprobado__trazo"
        />
      </svg>
    </span>
  );
}

function PagoAprobado({ resultado, onVerComprobante }) {
  return (
    <div
      className="pago-aparecer mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center"
      role="status"
      aria-live="polite"
    >
      <CheckAprobado />
      <h3 className="mt-4 text-xl font-bold text-white">¡Pago aprobado!</h3>
      <p className="mt-2 text-sm text-emerald-100">
        Tu compra quedó registrada y enviamos la confirmación a tu correo.
      </p>
      <p className="mt-3 text-sm text-slate-300">
        Orden{" "}
        <span className="font-semibold text-indigo-200">
          {resultado.codigoOrden}
        </span>
      </p>
      <p className="mt-1 text-sm text-slate-300">
        {resultado.referencia || "Yape"} ·{" "}
        <span className="font-semibold text-emerald-200">
          {formatSoles(resultado.totalPen)}
        </span>
      </p>
      <button
        type="button"
        onClick={onVerComprobante}
        className={`${PRIMARY_BUTTON} mt-5 w-full sm:w-auto`}
      >
        Ver comprobante
      </button>
    </div>
  );
}

function FormularioYape({
  total,
  tipoCambio = 3.75,
  estado = "idle",
  error = "",
  resultado = null,
  onPagar,
  onVerComprobante,
  onVolver,
}) {
  const [celular, setCelular] = useState("");
  const [codigo, setCodigo] = useState("");
  const [tocadoCelular, setTocadoCelular] = useState(false);
  const [tocadoCodigo, setTocadoCodigo] = useState(false);

  const procesando = estado === "procesando";
  const rechazado = estado === "rechazado";
  const aprobado = estado === "aprobado";

  const errorCelular = PATRON_CELULAR.test(celular)
    ? ""
    : "El número debe tener 9 dígitos y empezar con 9.";
  const errorCodigo = PATRON_CODIGO.test(codigo)
    ? ""
    : "El código de aprobación debe tener 6 dígitos.";
  const valido = !errorCelular && !errorCodigo;

  const mostrarErrorCelular =
    Boolean(errorCelular) &&
    (tocadoCelular || celular.length === 9 || (celular.length > 0 && !celular.startsWith("9")));
  const mostrarErrorCodigo =
    Boolean(errorCodigo) && (tocadoCodigo || codigo.length === 6);

  const totalSoles = Number(total) * Number(tipoCambio);
  const ultimosTres = celular.length >= 3 ? celular.slice(-3) : "•••";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (procesando) {
      return;
    }

    setTocadoCelular(true);
    setTocadoCodigo(true);

    if (!valido) {
      return;
    }

    const datos = { celular, codigoAprobacion: codigo };
    // No conservamos el código de aprobación después de enviarlo.
    setCodigo("");
    await onPagar(datos);
  };

  if (aprobado && resultado) {
    return <PagoAprobado resultado={resultado} onVerComprobante={onVerComprobante} />;
  }

  return (
    <section className="pago-aparecer mt-5 rounded-2xl border border-[#742284]/50 bg-gradient-to-br from-[#742284]/20 via-indigo-500/5 to-transparent p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Paga con Yape</h3>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            Abre tu app Yape, revisa el monto y escribe el código de aprobación
            de 6 dígitos.
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: "#742284" }}
        >
          Yape
        </span>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Monto a pagar
          </p>
          <p className="mt-1 text-xl font-bold text-white">
            {formatSoles(totalSoles)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            ≈ {formatMoney(total)} USD
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Tipo de cambio
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-200">
            1 USD = S/ {Number(tipoCambio).toFixed(2)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            El total se recalcula en el servidor al confirmar.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <label
            htmlFor="yape-celular"
            className="text-sm font-semibold text-slate-200"
          >
            Número de celular
          </label>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-400">
              +51
            </span>
            <input
              id="yape-celular"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={celular}
              onChange={(event) => setCelular(soloDigitos(event.target.value, 9))}
              onBlur={() => setTocadoCelular(true)}
              placeholder="9XXXXXXXX"
              maxLength={9}
              disabled={procesando}
              aria-invalid={mostrarErrorCelular}
              aria-describedby={
                mostrarErrorCelular ? "yape-celular-error" : "yape-celular-ayuda"
              }
              className={`${inputClasses(mostrarErrorCelular)} pl-14 tracking-wider motion-reduce:transition-none`}
            />
          </div>
          {mostrarErrorCelular ? (
            <p
              id="yape-celular-error"
              role="alert"
              className="mt-2 text-sm text-rose-300"
            >
              {errorCelular}
            </p>
          ) : (
            <p id="yape-celular-ayuda" className="mt-1 text-xs text-slate-500">
              Será el número asociado a tu cuenta Yape.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="yape-codigo"
            className="text-sm font-semibold text-slate-200"
          >
            Código de aprobación
          </label>
          <input
            id="yape-codigo"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={codigo}
            onChange={(event) => setCodigo(soloDigitos(event.target.value, 6))}
            onBlur={() => setTocadoCodigo(true)}
            placeholder="••••••"
            maxLength={6}
            disabled={procesando}
            aria-invalid={mostrarErrorCodigo}
            aria-describedby={
              mostrarErrorCodigo ? "yape-codigo-error" : "yape-codigo-ayuda"
            }
            className={`${inputClasses(mostrarErrorCodigo)} mt-2 tracking-[0.5em] motion-reduce:transition-none`}
          />
          {mostrarErrorCodigo ? (
            <p
              id="yape-codigo-error"
              role="alert"
              className="mt-2 text-sm text-rose-300"
            >
              {errorCodigo}
            </p>
          ) : (
            <p id="yape-codigo-ayuda" className="mt-1 text-xs text-slate-500">
              Código de 6 dígitos de tu app Yape. No lo guardamos.
            </p>
          )}
        </div>

        {celular.length >= 3 && (
          <p className="text-xs text-slate-500">
            Referencia del pago:{" "}
            <span className="font-semibold text-slate-300">
              Yape ****-{ultimosTres}
            </span>
          </p>
        )}

        {rechazado && error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200"
          >
            <p className="font-semibold">No pudimos completar el pago</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={procesando}
          aria-busy={procesando}
          className={`${PRIMARY_BUTTON} w-full py-3 text-base`}
        >
          {procesando ? (
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent motion-reduce:animate-none"
              />
              Procesando pago...
            </span>
          ) : rechazado ? (
            `Reintentar pago · ${formatSoles(totalSoles)}`
          ) : (
            `Pagar ${formatSoles(totalSoles)}`
          )}
        </button>

        <button
          type="button"
          onClick={onVolver}
          disabled={procesando}
          className={`${SECONDARY_BUTTON} w-full`}
        >
          Cambiar método de pago
        </button>
      </form>
    </section>
  );
}

export default FormularioYape;
