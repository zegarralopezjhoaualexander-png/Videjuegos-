import FieldError from "../components/FieldError.jsx";
import { GALERIA_IMAGEN_MAX_LENGTH } from "./adminJuegoValidation.js";
import { inputClasses } from "./formStyles.js";

function AdminJuegoGaleria({
  galeria,
  galeriaErrors,
  errorGeneral,
  onCambiar,
  onAgregar,
  onQuitar,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Galería</h3>
          <p className="mt-1 text-xs text-slate-500">
            Agrega o quita las URLs de las imágenes de la galería.
          </p>
        </div>
        <button
          type="button"
          onClick={onAgregar}
          className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Agregar imagen
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {galeria.map((url, index) => (
          <div key={index}>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <label htmlFor={`galeria-${index}`} className="sr-only">
                  Imagen {index + 1} de la galería
                </label>
                <input
                  id={`galeria-${index}`}
                  name={`galeria-${index}`}
                  type="text"
                  value={url}
                  onChange={(event) => onCambiar(index, event.target.value)}
                  maxLength={GALERIA_IMAGEN_MAX_LENGTH}
                  placeholder="https://... o img/galeria.jpg"
                  aria-invalid={Boolean(galeriaErrors[index])}
                  aria-describedby={
                    galeriaErrors[index]
                      ? `galeria-${index}-error`
                      : undefined
                  }
                  className={inputClasses(Boolean(galeriaErrors[index]))}
                />
              </div>
              <button
                type="button"
                onClick={() => onQuitar(index)}
                aria-label={`Quitar imagen ${index + 1} de la galería`}
                className="mt-0.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-semibold text-rose-200 transition hover:border-rose-400/40 hover:bg-rose-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                Quitar
              </button>
            </div>
            <FieldError
              id={`galeria-${index}-error`}
              message={galeriaErrors[index]}
            />
          </div>
        ))}
      </div>

      {errorGeneral && (
        <p role="alert" className="mt-3 text-xs text-rose-300">
          {errorGeneral}
        </p>
      )}
    </div>
  );
}

export default AdminJuegoGaleria;
