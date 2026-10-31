import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth.js";
import { useAuth } from "../auth/useAuth.js";
import FieldError from "../components/FieldError.jsx";
import PacmanBackground from "../components/PacmanBackground";
import PasswordInput from "../components/PasswordInput.jsx";
import "./authStyles.css";
import { inputClasses } from "./formStyles.js";
import { validateLogin } from "./loginValidation.js";

function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ identificador: "", contrasena: "" });
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

    const { errors: nextErrors, isValid } = validateLogin(form);
    setErrors(nextErrors);
    setFeedback("");

    if (!isValid) {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PacmanBackground />
      <main className="auth-page">
        <section className="auth-card">
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
                  errors.identificador ? "identificador-error" : undefined
                }
                className={inputClasses(Boolean(errors.identificador))}
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
              className="auth-button"
            >
              {isSubmitting ? "CARGANDO..." : "▶ START"}
            </button>
          </form>

          <p className="auth-footer">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="auth-link">
              Crear cuenta
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default Login;
