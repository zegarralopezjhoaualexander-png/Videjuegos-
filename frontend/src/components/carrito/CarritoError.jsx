import { SECONDARY_BUTTON } from "./carritoStyles.js";

function CarritoError({ error, mostrarReintentar, onReintentar, onCerrar }) {
  return (
    <div
      role="alert"
      className="mt-5 flex flex-col gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200 sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{error}</p>
      <div className="flex shrink-0 gap-2">
        {mostrarReintentar && (
          <button type="button" onClick={onReintentar} className={SECONDARY_BUTTON}>
            Reintentar
          </button>
        )}
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar mensaje de error"
          className={SECONDARY_BUTTON}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default CarritoError;
