import { inputClasses } from "../../styles/formStyles.js";
import { PANEL, PRIMARY_BUTTON } from "./carritoStyles.js";

function CuponMensajes({ error, aviso }) {
  return (
    <>
      {error && (
        <p id="cupon-error" role="alert" className="mt-2 text-sm text-rose-300">
          {error}
        </p>
      )}
      {aviso && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-sm text-emerald-200"
        >
          {aviso}
        </p>
      )}
    </>
  );
}

function CuponForm({ codigo, onCodigoChange, onSubmit, aplicando, error, aviso }) {
  return (
    <section className={`${PANEL} mt-6`} aria-labelledby="cupon-titulo">
      <h2 id="cupon-titulo" className="text-lg font-semibold text-white">
        Cupón de descuento
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Ingresa un código promocional para aplicarlo al total.
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="codigo-cupon" className="sr-only">
          Código de descuento
        </label>
        <input
          id="codigo-cupon"
          type="text"
          value={codigo}
          onChange={onCodigoChange}
          placeholder="Ej. BIENVENIDO10"
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "cupon-error" : undefined}
          className={`${inputClasses(Boolean(error))} motion-reduce:transition-none`}
        />
        <button
          type="submit"
          disabled={!codigo.trim() || aplicando}
          aria-label="Aplicar cupón de descuento"
          className={`${PRIMARY_BUTTON} sm:shrink-0`}
        >
          {aplicando ? "Aplicando..." : "Aplicar"}
        </button>
      </form>

      <CuponMensajes error={error} aviso={aviso} />
    </section>
  );
}

export default CuponForm;
