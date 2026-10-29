import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth.js'
import { useAuth } from '../auth/useAuth.js'
import { inputClasses } from './formStyles.js'
import { validateLogin } from './loginValidation.js'

function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ identificador: '', contrasena: '' })
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setFeedback('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const { errors: nextErrors, isValid } = validateLogin(form)
    setErrors(nextErrors)
    setFeedback('')

    if (!isValid) {
      return
    }

    setIsSubmitting(true)

    try {
      const session = await login({
        identificador: form.identificador.trim(),
        contrasena: form.contrasena,
      })

      signIn(session)
      navigate('/catalogo', { replace: true })
    } catch (error) {
      setErrors(error?.fieldErrors ?? {})
      setFeedback(
        error?.message ||
          'No se pudo iniciar sesión. Inténtalo de nuevo.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 p-4">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
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

        <h1 className="mt-6 text-2xl font-bold text-white">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-400">
          Accede de forma segura para guardar tus datos y gestionar tus compras
          o preferencias.
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
          <div>
            <label
              htmlFor="identificador"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Correo electrónico o usuario
            </label>
            <input
              id="identificador"
              name="identificador"
              type="text"
              value={form.identificador}
              onChange={handleChange}
              autoComplete="username"
              placeholder="usuario@dominio.com o tu usuario"
              aria-invalid={Boolean(errors.identificador)}
              aria-describedby={
                errors.identificador ? 'identificador-error' : undefined
              }
              className={inputClasses(Boolean(errors.identificador))}
            />
            {errors.identificador && (
              <p
                id="identificador-error"
                role="alert"
                className="mt-2 text-xs text-rose-300"
              >
                {errors.identificador}
              </p>
            )}
          </div>

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
                autoComplete="current-password"
                placeholder="Tu contraseña"
                aria-invalid={Boolean(errors.contrasena)}
                aria-describedby={
                  errors.contrasena ? 'contrasena-error' : undefined
                }
                className={`${inputClasses(Boolean(errors.contrasena))} pr-24`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link
            to="/registro"
            className="font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Crear cuenta
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Login
