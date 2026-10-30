import { parseDateInput } from "../utils/date.js";
import { validateEmail } from "./loginValidation.js";

export const NAME_MAX_LENGTH = 50;
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 72;

const NAME_PATTERN = /^[\p{L} .'-]+$/u;

function validateName(value, label) {
  const trimmed = value.trim();

  if (!trimmed) {
    return `El ${label} es obligatorio.`;
  }

  if (trimmed.length > NAME_MAX_LENGTH) {
    return `El ${label} no puede superar los ${NAME_MAX_LENGTH} caracteres.`;
  }

  if (!NAME_PATTERN.test(trimmed) || !/\p{L}/u.test(trimmed)) {
    return `El ${label} solo puede contener letras, espacios, puntos, guiones o apóstrofos.`;
  }

  return "";
}

function validateFechaNacimiento(value) {
  if (!value) {
    return "La fecha de nacimiento es obligatoria.";
  }

  const date = parseDateInput(value);

  if (!date) {
    return "Ingresa una fecha de nacimiento válida.";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date >= today) {
    return "La fecha de nacimiento debe ser anterior a hoy.";
  }

  return "";
}

export function getPasswordChecks(contrasena = "") {
  return {
    length:
      contrasena.length >= PASSWORD_MIN_LENGTH &&
      contrasena.length <= PASSWORD_MAX_LENGTH,
    uppercase: /\p{Lu}/u.test(contrasena),
    lowercase: /\p{Ll}/u.test(contrasena),
    number: /\p{N}/u.test(contrasena),
    symbol: /[^\p{L}\p{N}\s]/u.test(contrasena),
  };
}

export function getPasswordStrength(contrasena = "") {
  if (!contrasena) {
    return { score: 0, label: "Sin evaluar", tone: "slate" };
  }

  const checks = getPasswordChecks(contrasena);
  const score = Object.values(checks).filter(Boolean).length;

  const levels = [
    { label: "Muy débil", tone: "rose" },
    { label: "Muy débil", tone: "rose" },
    { label: "Débil", tone: "orange" },
    { label: "Aceptable", tone: "amber" },
    { label: "Buena", tone: "sky" },
    { label: "Fuerte", tone: "emerald" },
  ];

  return { score, ...levels[score] };
}

function validatePassword(contrasena) {
  if (!contrasena) {
    return "La contraseña es obligatoria.";
  }

  if (
    contrasena.length < PASSWORD_MIN_LENGTH ||
    contrasena.length > PASSWORD_MAX_LENGTH
  ) {
    return `La contraseña debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres.`;
  }

  const checks = getPasswordChecks(contrasena);

  if (!checks.uppercase) {
    return "La contraseña debe incluir al menos una mayúscula.";
  }

  if (!checks.lowercase) {
    return "La contraseña debe incluir al menos una minúscula.";
  }

  if (!checks.number) {
    return "La contraseña debe incluir al menos un número.";
  }

  if (!checks.symbol) {
    return "La contraseña debe incluir al menos un símbolo.";
  }

  return "";
}

export function validateRegistro({
  nombre,
  apellido,
  fechaNacimiento,
  correo,
  contrasena,
  confirmacion,
}) {
  const errors = {};

  const nombreError = validateName(nombre, "nombre");
  const apellidoError = validateName(apellido, "apellido");
  const fechaError = validateFechaNacimiento(fechaNacimiento);
  const correoError = validateEmail(correo);
  const passwordError = validatePassword(contrasena);

  if (nombreError) {
    errors.nombre = nombreError;
  }

  if (apellidoError) {
    errors.apellido = apellidoError;
  }

  if (fechaError) {
    errors.fechaNacimiento = fechaError;
  }

  if (correoError) {
    errors.correo = correoError;
  }

  if (passwordError) {
    errors.contrasena = passwordError;
  }

  if (!confirmacion) {
    errors.confirmacion = "Debes confirmar la contraseña.";
  } else if (confirmacion !== contrasena) {
    errors.confirmacion = "Las contraseñas no coinciden.";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
