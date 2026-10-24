import { useState } from 'react'
import {
  DEMO_USER,
  normalizeEmail,
  validateCredentials,
  validateLogin,
} from './loginValidation.js'

const inputClasses = (hasError) =>
  [
    'w-full rounded-xl border bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-2',
    hasError
      ? 'border-rose-400/70 focus:border-rose-400 focus:ring-rose-400/30'
      : 'border-white/10 focus:border-indigo-400 focus:ring-indigo-400/30',
  ].join(' ')

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))

    if (feedback?.type === 'error') {
      setFeedback(null)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const { errors: nextErrors, isValid } = validateLogin(form)
    setErrors(nextErrors)

    if (!isValid) {
      setFeedback({
        type: 'error',
        message: 'Revisa los campos marcados antes de continuar.',
      })
      return
    }

    if (!validateCredentials(form.email, form.password)) {
      setFeedback({
        type: 'error',
        message:
          'Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.',
      })
      return
    }

    setAuthenticated(true)
    setFeedback({
      type: 'success',
      message: `Bienvenido, ${normalizeEmail(form.email)}. Tu sesión se inició correctamente.`,
    })
  }

  const handleLogout = () => {
    setForm({ email: '', password: '' })
    setErrors({})
    setFeedback(null)
    setShowPassword(false)
    setAuthenticated(false)
  }

  const useDemoAccount = () => {
    setForm({ email: DEMO_USER.email, password: DEMO_USER.password })
    setErrors({})
    setFeedback(null)
  }

  if (authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 p-4">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/15">
            <svg
              className="size-8 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>

          <h1 className="mt-6 text-2xl font-bold text-white">
            Acceso concedido
          </h1>
          <p className="mt-2 text-sm text-slate-300" role="status">
            {feedback?.message}
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/50 p-4 text-left text-sm text-slate-300">
            <p className="font-semibold text-white">Tu cuenta está lista</p>
            <p className="mt-1">
              Ya puedes gestionar tus compras y preferencias.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Cerrar sesión
          </button>
        </section>
      </main>
    )
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

        {feedback?.type === 'error' && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="usuario@dominio.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={inputClasses(Boolean(errors.email))}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-2 text-xs text-rose-300">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="Mínimo 8 caracteres"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'password-error' : 'password-hint'
                }
                className={`${inputClasses(Boolean(errors.password))} pr-24`}
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
            {errors.password ? (
              <p
                id="password-error"
                role="alert"
                className="mt-2 text-xs text-rose-300"
              >
                {errors.password}
              </p>
            ) : (
              <p id="password-hint" className="mt-2 text-xs text-slate-500">
                Debe tener al menos 8 caracteres.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Iniciar sesión
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4">
          <p className="text-xs font-semibold tracking-wide text-indigo-200 uppercase">
            Cuenta de prueba
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Correo: {DEMO_USER.email}
          </p>
          <p className="text-sm text-slate-300">
            Contraseña: {DEMO_USER.password}
          </p>
          <button
            type="button"
            onClick={useDemoAccount}
            className="mt-3 text-xs font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Usar credenciales de prueba
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Demostración local: no se envían credenciales a un servidor.
        </p>
      </section>
    </main>
  )
}

export default Login
