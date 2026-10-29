import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registro } from '../api/auth.js'
import { useAuth } from '../auth/useAuth.js'
import { inputClasses } from './formStyles.js'
import {
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  getPasswordChecks,
  getPasswordStrength,
  validateRegistro,
} from './registerValidation.js'

const INITIAL_FORM = {
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  correo: '',
  contrasena: '',
  confirmacion: '',
}

const PASSWORD_REQUIREMENTS = [
  {
    key: 'length',
    label: `Entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres`,
  },
  { key: 'uppercase', label: 'Al menos una mayúscula' },
  { key: 'lowercase', label: 'Al menos una minúscula' },
  { key: 'number', label: 'Al menos un número' },
  { key: 'symbol', label: 'Al menos un símbolo' },
]

const STRENGTH_TONES = {
  slate: { bar: 'bg-slate-600', text: 'text-slate-400' },
  rose: { bar: 'bg-rose-500', text: 'text-rose-300' },
  orange: { bar: 'bg-orange-500', text: 'text-orange-300' },
  amber: { bar: 'bg-amber-400', text: 'text-amber-300' },
  sky: { bar: 'bg-sky-400', text: 'text-sky-300' },
  emerald: { bar: 'bg-emerald-400', text: 'text-emerald-300' },
}

function getYesterdayISO() {
  const date = new Date()
  date.setDate(date.getDate() - 1)

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

const MAX_BIRTH_DATE = getYesterdayISO()

function Registro() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordChecks = getPasswordChecks(form.contrasena)
  const passwordStrength = getPasswordStrength(form.contrasena)
  const strengthTone =
    STRENGTH_TONES[passwordStrength.tone] ?? STRENGTH_TONES.slate

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setFeedback('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const { errors: nextErrors, isValid } = validateRegistro(form)
    setErrors(nextErrors)
    setFeedback('')

    if (!isValid) {
      return
    }

    setIsSubmitting(true)

    try {
      const session = await registro({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        fechaNacimiento: form.fechaNacimiento,
        correo: form.correo.trim(),
        contrasena: form.contrasena,
        confirmacion: form.confirmacion,
      })

      signIn(session)
      navigate('/catalogo', { replace: true })
    } catch (error) {
      setErrors(error?.fieldErrors ?? {})
      setFeedback(
        error?.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 p-4">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-sm font-black text-white">
            VJ
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
              Videojuegos
            </p>
            <p className="text-xs text-slate-400">Tu cuenta de jugador</p>
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-white">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-400">
          Regístrate para guardar tus datos y acceder a tu catálogo de
          videojuegos.
        </p>

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
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                autoComplete="given-name"
                maxLength={NAME_MAX_LENGTH}
                placeholder="Ana"
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                className={inputClasses(Boolean(errors.nombre))}
              />
              {errors.nombre && (
                <p
                  id="nombre-error"
                  role="alert"
                  className="mt-2 text-xs text-rose-300"
                >
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="apellido"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Apellido
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={form.apellido}
                onChange={handleChange}
                autoComplete="family-name"
                maxLength={NAME_MAX_LENGTH}
                placeholder="Gómez"
                aria-invalid={Boolean(errors.apellido)}
                aria-describedby={
                  errors.apellido ? 'apellido-error' : undefined
                }
                className={inputClasses(Boolean(errors.apellido))}
              />
              {errors.apellido && (
                <p
                  id="apellido-error"
                  role="alert"
                  className="mt-2 text-xs text-rose-300"
                >
                  {errors.apellido}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="fechaNacimiento"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Fecha de nacimiento
            </label>
            <input
              id="fechaNacimiento"
              name="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={handleChange}
              autoComplete="bday"
              max={MAX_BIRTH_DATE}
              aria-invalid={Boolean(errors.fechaNacimiento)}
              aria-describedby={
                errors.fechaNacimiento ? 'fecha-nacimiento-error' : undefined
              }
              className={inputClasses(Boolean(errors.fechaNacimiento))}
            />
            {errors.fechaNacimiento && (
              <p
                id="fecha-nacimiento-error"
                role="alert"
                className="mt-2 text-xs text-rose-300"
              >
                {errors.fechaNacimiento}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="correo"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Correo electrónico
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              autoComplete="email"
              maxLength={254}
              placeholder="usuario@dominio.com"
              aria-invalid={Boolean(errors.correo)}
              aria-describedby={errors.correo ? 'correo-error' : undefined}
              className={inputClasses(Boolean(errors.correo))}
            />
            {errors.correo && (
              <p
                id="correo-error"
                role="alert"
                className="mt-2 text-xs text-rose-300"
              >
                {errors.correo}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contrasena"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="contrasena"
                  name="contrasena"
                  type={showPassword ? 'text' : 'password'}
                  value={form.contrasena}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Crea una contraseña segura"
                  aria-invalid={Boolean(errors.contrasena)}
                  aria-describedby={
                    errors.contrasena
                      ? 'contrasena-error contrasena-requisitos'
                      : 'contrasena-requisitos'
                  }
                  className={`${inputClasses(Boolean(errors.contrasena))} pr-24`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                  aria-label={
                    showPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'
                  }
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {errors.contrasena && (
                <p
                  id="contrasena-error"
                  role="alert"
                  className="mt-2 text-xs text-rose-300"
                >
                  {errors.contrasena}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmacion"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmacion"
                name="confirmacion"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmacion}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                aria-invalid={Boolean(errors.confirmacion)}
                aria-describedby={
                  errors.confirmacion ? 'confirmacion-error' : undefined
                }
                className={inputClasses(Boolean(errors.confirmacion))}
              />
              {errors.confirmacion && (
                <p
                  id="confirmacion-error"
                  role="alert"
                  className="mt-2 text-xs text-rose-300"
                >
                  {errors.confirmacion}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Seguridad de la contraseña</span>
              <span className={`font-semibold ${strengthTone.text}`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${strengthTone.bar}`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              />
            </div>

            <ul
              id="contrasena-requisitos"
              className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2"
            >
              {PASSWORD_REQUIREMENTS.map((requirement) => {
                const met = passwordChecks[requirement.key]

                return (
                  <li
                    key={requirement.key}
                    className={`flex items-center gap-2 ${
                      met ? 'text-emerald-300' : 'text-slate-500'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`size-1.5 shrink-0 rounded-full ${
                        met ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                    <span>{requirement.label}</span>
                    <span className="sr-only">
                      {met ? 'Cumplido' : 'Pendiente'}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Iniciar sesión
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Registro
