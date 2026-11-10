import { METODOS_PAGO } from "../../utils/pago.js";

function IconoTarjeta() {
  return (
    <span className="relative flex size-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/60">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
        className="size-6 text-indigo-200"
      >
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="M2.5 9.5h19M6 15h4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function IconoYape() {
  return (
    <span
      className="flex size-11 items-center justify-center rounded-xl text-[11px] font-black tracking-tight text-white shadow-[0_0_22px_rgba(116,34,132,0.55)]"
      style={{ backgroundColor: "#742284" }}
      aria-hidden="true"
    >
      Yape
    </span>
  );
}

function IconoBilletera() {
  return (
    <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/60">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
        className="size-6 text-fuchsia-200"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.5 8.5A2.5 2.5 0 0 1 6 6h11.5A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.5 9h13a2 2 0 0 1 2 2v1H15a2 2 0 0 0 0 4h5.5M6.5 6V4.8a1.3 1.3 0 0 1 1.8-1.2l8.4 3"
        />
      </svg>
    </span>
  );
}

function IconoRegalo() {
  return (
    <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/60">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
        className="size-6 text-emerald-200"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 11h16v8.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5V11ZM3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5V11H3V7.5ZM12 6v15"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6H8.8A2.3 2.3 0 1 1 11.1 3.7L12 6Zm0 0h3.2a2.3 2.3 0 1 0-2.3-2.3L12 6Z"
        />
      </svg>
    </span>
  );
}

const ICONOS = {
  tarjeta: IconoTarjeta,
  yape: IconoYape,
  billetera: IconoBilletera,
  regalo: IconoRegalo,
};

function LogosTarjeta() {
  return (
    <span className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="rounded border border-indigo-400/30 bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-black tracking-widest text-indigo-200">
        VISA
      </span>
      <span className="rounded border border-orange-400/30 bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-bold text-orange-200">
        Mastercard
      </span>
      <span className="rounded border border-sky-400/30 bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-sky-200">
        AMEX
      </span>
    </span>
  );
}

function LogosBilletera() {
  return (
    <span className="mt-2 flex flex-wrap items-center gap-1.5">
      {["G Pay", "Apple Pay", "Link"].map((logo) => (
        <span
          key={logo}
          className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold text-slate-300"
        >
          {logo}
        </span>
      ))}
    </span>
  );
}

function LogoMetodo({ icono }) {
  if (icono === "tarjeta") {
    return <LogosTarjeta />;
  }

  if (icono === "billetera") {
    return <LogosBilletera />;
  }

  return null;
}

function IndicadorSeleccion({ seleccionado }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition motion-reduce:transition-none ${
        seleccionado
          ? "border-fuchsia-300 bg-fuchsia-400 text-slate-950 shadow-[0_0_16px_rgba(232,121,249,0.55)]"
          : "border-white/20 bg-slate-950/40 text-transparent group-hover:border-fuchsia-300/60"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="size-3.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m5 12.5 4.2 4.2L19 7"
        />
      </svg>
    </span>
  );
}

function Candado() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
      className="size-4 shrink-0"
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7M12 15v2"
      />
    </svg>
  );
}

function MetodoPagoSelector({
  valor,
  onChange,
  disabled,
  saldoRegalo = 0,
  total = 0,
}) {
  const puedeUsarRegalo = saldoRegalo > 0 && saldoRegalo >= total;
  const opciones = METODOS_PAGO.filter(
    (metodo) => !metodo.soloSiCubre || puedeUsarRegalo
  );

  return (
    <fieldset disabled={disabled} className="mt-4">
      <legend className="text-sm font-semibold text-slate-200">
        Método de pago
      </legend>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {opciones.map((metodo) => {
          const seleccionado = valor === metodo.id;
          const Icono = ICONOS[metodo.icono] ?? IconoTarjeta;

          return (
            <label
              key={metodo.id}
              className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-fuchsia-400 motion-reduce:transition-none motion-reduce:transform-none ${
                seleccionado
                  ? "-translate-y-0.5 border-fuchsia-400/70 bg-gradient-to-br from-fuchsia-500/15 via-indigo-500/10 to-transparent shadow-[0_0_28px_rgba(217,70,239,0.25),0_12px_30px_rgba(2,6,23,0.45)]"
                  : "border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:shadow-[0_0_22px_rgba(99,102,241,0.18)]"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="metodo-pago"
                value={metodo.id}
                checked={seleccionado}
                onChange={() => onChange(metodo.id)}
                className="sr-only"
              />

              <Icono />

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {metodo.titulo}
                  </span>
                  {metodo.destacado && (
                    <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-fuchsia-200">
                      {metodo.destacado}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">
                  {metodo.descripcion}
                </span>
                <LogoMetodo icono={metodo.icono} />
              </span>

              <IndicadorSeleccion seleccionado={seleccionado} />
            </label>
          );
        })}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <Candado />
        Pago seguro, cifrado de extremo a extremo
      </p>
    </fieldset>
  );
}

export default MetodoPagoSelector;
