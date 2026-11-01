import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth.js";
import { useAuth } from "../../auth/useAuth.js";
import PacmanBackground from "../../components/effects/PacmanBackground.jsx";
import FieldError from "../../components/forms/FieldError.jsx";
import PasswordInput from "../../components/forms/PasswordInput.jsx";
import { BRAND_MARK, SITE_NAME } from "../../utils/siteContent.js";
import "./authStyles.css";
import { validateLogin } from "./loginValidation.js";

function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ identificador: "", contrasena: "" });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFeedback("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setShake(false);

    const { errors: nextErrors, isValid } = validateLogin(form);
    setErrors(nextErrors);
    setFeedback("");

    if (!isValid) {
      setShake(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await login({
        identificador: form.identificador.trim(),
        contrasena: form.contrasena,
      });

      signIn(session);
      navigate("/catalogo", { replace: true });
    } catch (error) {
      setErrors(error?.fieldErrors ?? {});
      setFeedback(
        error?.message || "No se pudo iniciar sesión. Inténtalo de nuevo."
      );
      setShake(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PacmanBackground />
      <main className="auth-page">
        <section
          className={`auth-card neon-panel hud-corners${shake ? " auth-card--shake" : ""}`}
          onAnimationEnd={(event) => {
            if (event.animationName === "auth-shake") {
              setShake(false);
            }
          }}
        >
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

          {feedback && (
            <div role="alert" aria-live="polite" className="auth-feedback">
              {feedback}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulario de inicio de sesión"
            className="auth-form"
          >
            <div className="auth-field">
              <label htmlFor="identificador">
                Correo electrónico o usuario
              </label>
              <input
                id="identificador"
                name="identificador"
                type="text"
                value={form.identificador}
                onChange={handleChange}
                autoComplete="username"
                placeholder="tu usuario o correo electrónico"
                aria-invalid={Boolean(errors.identificador)}
                aria-describedby={
                  errors.identificador ? "identificador-error" : undefined
                }
              />
              <FieldError
                id="identificador-error"
                message={errors.identificador}
              />
            </div>

            <PasswordInput
              id="contrasena"
              name="contrasena"
              label="Contraseña"
              value={form.contrasena}
              onChange={handleChange}
              error={errors.contrasena}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              showPassword={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="neon-button neon-button--primary"
            >
              <span className="neon-button__label">
                {isSubmitting ? "CARGANDO..." : "▶ START"}
              </span>
            </button>
          </form>

          <p className="auth-footer">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="neon-link">
              NUEVO JUGADOR
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default Login;
