import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registro } from "../../api/auth.js";
import { useAuth } from "../../auth/useAuth.js";
import PacmanBackground from "../../components/effects/PacmanBackground.jsx";
import FieldError from "../../components/forms/FieldError.jsx";
import PasswordInput from "../../components/forms/PasswordInput.jsx";
import PasswordStrength from "../../components/forms/PasswordStrength.jsx";
import { getYesterdayInputValue } from "../../utils/date.js";
import { BRAND_MARK, SITE_NAME } from "../../utils/siteContent.js";
import "./authStyles.css";
import { NAME_MAX_LENGTH, validateRegistro } from "./registerValidation.js";

const INITIAL_FORM = {
  nombre: "",
  apellido: "",
  nombreUsuario: "",
  fechaNacimiento: "",
  correo: "",
  contrasena: "",
  confirmacion: "",
};

const MAX_BIRTH_DATE = getYesterdayInputValue();
const SUCCESS_REDIRECT_DELAY = 2000;

// SIMULACIÓN FRONTEND: quitar este bloque cuando el backend controle los duplicados.
const SIMULATED_DUPLICATES = {
  correo: "duplicado@videojuegos.com",
  nombreUsuario: "jugador1",
};
const SIMULATED_DUPLICATE_ERRORS = {
  correo: "El correo electrónico ya está registrado",
  nombreUsuario: "El nombre de usuario ya está en uso",
};

function getSimulatedDuplicateErrors(form) {
  const simulatedErrors = {};

  if (form.correo.trim().toLowerCase() === SIMULATED_DUPLICATES.correo) {
    simulatedErrors.correo = SIMULATED_DUPLICATE_ERRORS.correo;
  }

  if (
    form.nombreUsuario.trim().toLowerCase() ===
    SIMULATED_DUPLICATES.nombreUsuario
  ) {
    simulatedErrors.nombreUsuario = SIMULATED_DUPLICATE_ERRORS.nombreUsuario;
  }

  return simulatedErrors;
}

function Registro() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFeedback("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { errors: nextErrors, isValid } = validateRegistro(form);
    const simulatedErrors = getSimulatedDuplicateErrors(form);
    const mergedErrors = { ...nextErrors, ...simulatedErrors };

    setErrors(mergedErrors);
    setFeedback("");

    if (!isValid || Object.keys(simulatedErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await registro({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        nombreUsuario: form.nombreUsuario.trim(),
        fechaNacimiento: form.fechaNacimiento,
        correo: form.correo.trim(),
        contrasena: form.contrasena,
        confirmacion: form.confirmacion,
      });

      signIn(session);
      setIsRegistered(true);
      redirectTimer.current = setTimeout(() => {
        navigate("/catalogo", { replace: true });
      }, SUCCESS_REDIRECT_DELAY);
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
        <section className="auth-card neon-panel hud-corners">
          <div className="auth-header">
            <div className="brand-badge" aria-hidden="true">
              {BRAND_MARK}
            </div>
            <div>
              <p className="auth-kicker">{SITE_NAME}</p>
              <p className="auth-caption">Tu cuenta de jugador</p>
            </div>
          </div>

          <h1 className="auth-title">PLAYER 1</h1>
          <p className="auth-subtitle">Inserta tus datos para continuar</p>

          {isRegistered && (
            <div
              role="status"
              aria-live="polite"
              className="auth-feedback auth-feedback--success"
            >
              Registro exitoso. Tu cuenta ha sido creada
            </div>
          )}

          {feedback && (
            <div role="alert" aria-live="polite" className="auth-feedback">
              {feedback}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulario de registro"
            className="auth-form"
          >
            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="nombre">Nombre</label>
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
                />
                <FieldError id="nombre-error" message={errors.nombre} />
              </div>

              <div className="auth-field">
                <label htmlFor="apellido">Apellido</label>
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
                />
                <FieldError id="apellido-error" message={errors.apellido} />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="nombreUsuario">Nombre de usuario</label>
              <input
                id="nombreUsuario"
                name="nombreUsuario"
                type="text"
                value={form.nombreUsuario}
                onChange={handleChange}
                autoComplete="username"
                placeholder="ana_gomez"
                aria-invalid={Boolean(errors.nombreUsuario)}
                aria-describedby={
                  errors.nombreUsuario ? "nombre-usuario-error" : undefined
                }
              />
              <FieldError
                id="nombre-usuario-error"
                message={errors.nombreUsuario}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
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
              />
              <FieldError
                id="fecha-nacimiento-error"
                message={errors.fechaNacimiento}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="correo">Correo electrónico</label>
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
              />
              <FieldError id="correo-error" message={errors.correo} />
            </div>

            <div className="auth-row">
              <PasswordInput
                id="contrasena"
                name="contrasena"
                label="Contraseña"
                value={form.contrasena}
                onChange={handleChange}
                error={errors.contrasena}
                autoComplete="new-password"
                placeholder="Crea una contraseña"
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
                placeholder="Repítela"
                showPassword={showPassword}
              />
            </div>

            <PasswordStrength contrasena={form.contrasena} />

            <button
              type="submit"
              disabled={isSubmitting || isRegistered}
              className="neon-button neon-button--primary"
            >
              <span className="neon-button__label">
                {isSubmitting ? "CARGANDO..." : "▶ CREAR CUENTA"}
              </span>
            </button>
          </form>

          <p className="auth-footer">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="neon-link">
              INICIAR SESIÓN
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default Registro;
