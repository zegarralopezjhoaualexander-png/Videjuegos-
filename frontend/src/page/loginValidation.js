export const EMAIL_MAX_LENGTH = 254

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(correo) {
  const value = correo.trim()

  if (!value) {
    return 'El correo electrónico es obligatorio.'
  }

  if (value.length > EMAIL_MAX_LENGTH) {
    return `El correo electrónico no puede superar los ${EMAIL_MAX_LENGTH} caracteres.`
  }

  if (value.includes('..') || !EMAIL_PATTERN.test(value)) {
    return 'Ingresa un correo válido, por ejemplo usuario@dominio.com.'
  }

  return ''
}

export function validateLogin({ identificador, contrasena }) {
  const errors = {}

  if (!identificador.trim()) {
    errors.identificador = 'Ingresa tu correo electrónico o usuario.'
  }

  if (!contrasena) {
    errors.contrasena = 'La contraseña es obligatoria.'
  }

  return { errors, isValid: Object.keys(errors).length === 0 }
}
