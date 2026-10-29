import { useState } from 'react'
import {
  DESARROLLADOR_MAX_LENGTH,
  DESCRIPCION_MAX_LENGTH,
  GALERIA_IMAGEN_MAX_LENGTH,
  GENERO_MAX_LENGTH,
  IMAGEN_MAX_LENGTH,
  NOMBRE_MAX_LENGTH,
  PLATAFORMA_MAX_LENGTH,
  REQUISITOS_MAX_LENGTH,
  TRAILER_MAX_LENGTH,
  getYesterdayInputValue,
  toFormValues,
  toPayload,
  validateJuegoForm,
} from './adminJuegoValidation.js'
import { inputClasses } from './formStyles.js'

const MAX_DATE = getYesterdayInputValue()

function FieldError({ id, message }) {
  if (!message) {
    return null
  }

  return (
    <p id={id} role="alert" className="mt-2 text-xs text-rose-300">
      {message}
    </p>
  )
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  maxLength,
  min,
  max,
  step,
  hint,
}) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [error ? errorId : '', hint ? hintId : ''].filter(Boolean).join(' ') ||
    undefined

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-200"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={inputClasses(Boolean(error))}
      />
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  )
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  rows = 4,
  showCounter = false,
}) {
  const errorId = `${id}-error`

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-200"
        >
          {label}
        </label>
        {showCounter && (
          <span className="text-xs text-slate-500">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`${inputClasses(Boolean(error))} min-h-28 resize-y`}
      />
      <FieldError id={errorId} message={error} />
    </div>
  )
}

function ImagePreview({ src }) {
  const [failedSrc, setFailedSrc] = useState('')
  const value = src.trim()
  const canShow = Boolean(value) && failedSrc !== value

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
      {canShow ? (
        <img
          src={value}
          alt="Vista previa de la portada"
          onError={() => setFailedSrc(value)}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-32 items-center justify-center px-4 text-center text-xs text-slate-500">
          {value
            ? 'No se pudo cargar la vista previa de la imagen.'
            : 'La vista previa de la portada aparecerá aquí.'}
        </div>
      )}
    </div>
  )
}

function AdminJuegoForm({
  juego,
  esEdicion,
  onGuardar,
  onCancelar,
  onUnauthorized,
}) {
  const [form, setForm] = useState(() => toFormValues(juego))
  const [errors, setErrors] = useState({})
  const [galeriaErrors, setGaleriaErrors] = useState([])
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setFeedback('')
  }

  const handleGaleriaChange = (index, value) => {
    setForm((current) => ({
      ...current,
      galeria: current.galeria.map((url, position) =>
        position === index ? value : url,
      ),
    }))
    setGaleriaErrors((current) =>
      current.map((message, position) =>
        position === index ? '' : message,
      ),
    )
    setFeedback('')
  }

  const handleAgregarImagen = () => {
    setForm((current) => ({
      ...current,
      galeria: [...current.galeria, ''],
    }))
    setGaleriaErrors((current) => [...current, ''])
  }

  const handleQuitarImagen = (index) => {
    setForm((current) => {
      const galeria = current.galeria.filter(
        (_, position) => position !== index,
      )

      return {
        ...current,
        galeria: galeria.length > 0 ? galeria : [''],
      }
    })
    setGaleriaErrors((current) => {
      const next = current.filter((_, position) => position !== index)
      return next.length > 0 ? next : ['']
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const resultado = validateJuegoForm(form)
    setErrors(resultado.errors)
    setGaleriaErrors(resultado.galeriaErrors)
    setFeedback('')

    if (!resultado.isValid) {
      return
    }

    setIsSubmitting(true)

    try {
      await onGuardar(toPayload(form))
    } catch (error) {
      if (error?.status === 401) {
        await onUnauthorized()
        return
      }

      if (error?.status === 403) {
        setFeedback('No tienes permiso para hacer esto.')
        return
      }

      setErrors(error?.fieldErrors ?? {})
      setFeedback(
        error?.message ||
          'No se pudo guardar el juego. Revisa los datos e inténtalo de nuevo.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {esEdicion ? 'Editar juego' : 'Nuevo juego'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {esEdicion
              ? 'Se cargaron todos los datos del juego, incluida la ficha completa.'
              : 'Completa la información para registrar un nuevo juego.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Cancelar
        </button>
      </div>

      {feedback && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {feedback}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <TextField
          id="nombre"
          label="Nombre"
          value={form.nombre}
          onChange={handleChange}
          error={errors.nombre}
          maxLength={NOMBRE_MAX_LENGTH}
          placeholder="Ej. The Legend of Zelda"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="genero"
            label="Género"
            value={form.genero}
            onChange={handleChange}
            error={errors.genero}
            maxLength={GENERO_MAX_LENGTH}
            placeholder="Ej. Aventura"
          />
          <TextField
            id="plataforma"
            label="Plataforma"
            value={form.plataforma}
            onChange={handleChange}
            error={errors.plataforma}
            maxLength={PLATAFORMA_MAX_LENGTH}
            placeholder="Ej. Nintendo Switch"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            id="anio"
            label="Año"
            type="number"
            value={form.anio}
            onChange={handleChange}
            error={errors.anio}
            min={1950}
            max={2100}
            step={1}
            placeholder="2024"
          />
          <TextField
            id="puntuacion"
            label="Puntuación editorial"
            type="number"
            value={form.puntuacion}
            onChange={handleChange}
            error={errors.puntuacion}
            min={1}
            max={10}
            step={1}
            placeholder="8"
            hint="Entero entre 1 y 10."
          />
          <TextField
            id="precio"
            label="Precio"
            type="number"
            value={form.precio}
            onChange={handleChange}
            error={errors.precio}
            min={0}
            max={9999.99}
            step={0.01}
            placeholder="59.99"
          />
          <TextField
            id="stock"
            label="Stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            error={errors.stock}
            min={0}
            max={100000}
            step={1}
            placeholder="100"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="desarrollador"
            label="Desarrollador"
            value={form.desarrollador}
            onChange={handleChange}
            error={errors.desarrollador}
            maxLength={DESARROLLADOR_MAX_LENGTH}
            placeholder="Ej. Nintendo"
          />
          <TextField
            id="fechaLanzamiento"
            label="Fecha de lanzamiento"
            type="date"
            value={form.fechaLanzamiento}
            onChange={handleChange}
            error={errors.fechaLanzamiento}
            max={MAX_DATE}
          />
        </div>

        <div>
          <TextField
            id="imagen"
            label="Imagen de portada"
            value={form.imagen}
            onChange={handleChange}
            error={errors.imagen}
            maxLength={IMAGEN_MAX_LENGTH}
            placeholder="https://... o img/portada.jpg"
            hint="Debe empezar por http://, https:// o img/."
          />
          <ImagePreview src={form.imagen} />
        </div>

        <TextAreaField
          id="descripcion"
          label="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          error={errors.descripcion}
          maxLength={DESCRIPCION_MAX_LENGTH}
          rows={5}
          showCounter
        />

        <TextField
          id="trailerUrl"
          label="Enlace del tráiler"
          value={form.trailerUrl}
          onChange={handleChange}
          error={errors.trailerUrl}
          maxLength={TRAILER_MAX_LENGTH}
          placeholder="https://www.youtube.com/watch?v=..."
          hint="Debe empezar por http:// o https://."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <TextAreaField
            id="requisitosMinimos"
            label="Requisitos mínimos"
            value={form.requisitosMinimos}
            onChange={handleChange}
            error={errors.requisitosMinimos}
            maxLength={REQUISITOS_MAX_LENGTH}
            rows={4}
          />
          <TextAreaField
            id="requisitosRecomendados"
            label="Requisitos recomendados"
            value={form.requisitosRecomendados}
            onChange={handleChange}
            error={errors.requisitosRecomendados}
            maxLength={REQUISITOS_MAX_LENGTH}
            rows={4}
          />
        </div>

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
              onClick={handleAgregarImagen}
              className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Agregar imagen
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {form.galeria.map((url, index) => (
              <div key={index}>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <label
                      htmlFor={`galeria-${index}`}
                      className="sr-only"
                    >
                      Imagen {index + 1} de la galería
                    </label>
                    <input
                      id={`galeria-${index}`}
                      name={`galeria-${index}`}
                      type="text"
                      value={url}
                      onChange={(event) =>
                        handleGaleriaChange(index, event.target.value)
                      }
                      maxLength={GALERIA_IMAGEN_MAX_LENGTH}
                      placeholder="https://... o img/galeria.jpg"
                      aria-invalid={Boolean(galeriaErrors[index])}
                      aria-describedby={
                        galeriaErrors[index]
                          ? `galeria-${index}-error`
                          : undefined
                      }
                      className={inputClasses(
                        Boolean(galeriaErrors[index]),
                      )}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuitarImagen(index)}
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

          {errors.galeria && (
            <p role="alert" className="mt-3 text-xs text-rose-300">
              {errors.galeria}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={onCancelar}
            disabled={isSubmitting}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Guardando...'
              : esEdicion
                ? 'Guardar cambios'
                : 'Crear juego'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default AdminJuegoForm
