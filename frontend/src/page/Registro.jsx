import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registro } from "../api/auth.js";
import { useAuth } from "../auth/useAuth.js";
import FieldError from "../components/FieldError.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import PasswordStrength from "../components/PasswordStrength.jsx";
import { getYesterdayInputValue } from "../utils/date.js";
import { inputClasses } from "./formStyles.js";
import {
  NAME_MAX_LENGTH,
  validateRegistro,
} from "./registerValidation.js";

const INITIAL_FORM = {
  nombre: "",
  apellido: "",
  fechaNacimiento: "",
  correo: "",
  contrasena: "",
  confirmacion: "",
};

const MAX_BIRTH_DATE = getYesterdayInputValue();

function Registro() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFeedback("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { errors: nextErrors, isValid } = validateRegistro(form);
    setErrors(nextErrors);
    setFeedback("");

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await registro({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        fechaNacimiento: form.fechaNacimiento,
        correo: form.correo.trim(),
        contrasena: form.contrasena,
        confirmacion: form.confirmacion,
      });

      signIn(session);
      navigate("/catalogo", { replace: true });
    } catch (error) {
      setErrors(error?.fieldErrors ?? {});
      setFeedback(
        error?.message || "No se pudo crear la cuenta. Inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                aria-describedby={errors.nombre ? "nombre-error" : undefined}
                className={inputClasses(Boolean(errors.nombre))}
              />
              <FieldError id="nombre-error" message={errors.nombre} />
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
                  errors.apellido ? "apellido-error" : undefined
                }
                className={inputClasses(Boolean(errors.apellido))}
              />
              <FieldError id="apellido-error" message={errors.apellido} />
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
                errors.fechaNacimiento ? "fecha-nacimiento-error" : undefined
              }
              className={inputClasses(Boolean(errors.fechaNacimiento))}
            />
            <FieldError
              id="fecha-nacimiento-error"
              message={errors.fechaNacimiento}
            />
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
              aria-describedby={errors.correo ? "correo-error" : undefined}
              className={inputClasses(Boolean(errors.correo))}
            />
            <FieldError id="correo-error" message={errors.correo} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <PasswordInput
              id="contrasena"
              name="contrasena"
              label="Contraseña"
              value={form.contrasena}
              onChange={handleChange}
              error={errors.contrasena}
              autoComplete="new-password"
              placeholder="Crea una contraseña segura"
              showPassword={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
              describedBy="contrasena-requisitos"
            />

            <PasswordInput
              id="confirmacion"
              name="confirmacion"
              label="Confirmar contraseña"
              value={form.confirmacion}
              onChange={handleChange}
              error={errors.confirmacion}
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              showPassword={showPassword}
            />
          </div>

          <PasswordStrength contrasena={form.contrasena} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Iniciar sesión
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Registro;
