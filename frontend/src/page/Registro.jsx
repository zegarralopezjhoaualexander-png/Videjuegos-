import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registro } from "../api/auth.js";
import { useAuth } from "../auth/useAuth.js";
import FieldError from "../components/FieldError.jsx";
import PacmanBackground from "../components/PacmanBackground.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import PasswordStrength from "../components/PasswordStrength.jsx";
import { getYesterdayInputValue } from "../utils/date.js";
import "./authStyles.css";
import { inputClasses } from "./formStyles.js";
import { NAME_MAX_LENGTH, validateRegistro } from "./registerValidation.js";

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
    <>
      <PacmanBackground />
      <main className="auth-page">
        <section className="auth-card auth-card--wide">
          <div className="auth-header">
            <div className="auth-badge">VJ</div>
            <div>
              <p className="auth-kicker">Videojuegos cheveres</p>
              <p className="auth-caption">Tu cuenta de jugador</p>
            </div>
          </div>

          <h1 className="auth-title">PLAYER 1</h1>
          <p className="auth-subtitle">Inserta tus datos para continuar</p>

          {feedback && (
            <div role="alert" aria-live="polite" className="auth-feedback">
              {feedback}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulario de registro"
            className="mt-6 space-y-5"
          >
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
                placeholder="tu correo electrónico"
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
              className="auth-button"
            >
              {isSubmitting ? "CARGANDO..." : "NUEVO JUGADOR"}
            </button>
          </form>

          <p className="auth-footer">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="auth-link">
              Iniciar sesión
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default Registro;
