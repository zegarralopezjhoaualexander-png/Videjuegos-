const DEMO_USER = {
  email: 'jugador@videojuegos.com',
  password: 'gamer1234',
}

const SUSPICIOUS_DOMAINS = new Set([
  '10minutemail.com',
  'disposablemail.com',
  'fakeinbox.com',
  'getnada.com',
  'guerrillamail.com',
  'maildrop.cc',
  'mailinator.com',
  'mintemail.com',
  'sharklasers.com',
  'tempmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'yopmail.com',
])

const RESERVED_TLDS = /\.(example|invalid|local|localhost|test)$/i
const FAKE_DOMAINS = new Set([
  'example.com',
  'example.net',
  'example.org',
  'fake.com',
  'test.com',
])
const EMAIL_PATTERN =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/

export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function validateEmail(email) {
  const normalized = normalizeEmail(email)

  if (!normalized) {
    return 'El correo electrónico es obligatorio.'
  }

  if (normalized.includes('..') || !EMAIL_PATTERN.test(normalized)) {
    return 'Ingresa un correo válido, por ejemplo usuario@dominio.com.'
  }

  const domain = normalized.split('@')[1]

  if (
    SUSPICIOUS_DOMAINS.has(domain) ||
    FAKE_DOMAINS.has(domain) ||
    RESERVED_TLDS.test(domain)
  ) {
    return 'Este dominio no está permitido. Usa un correo personal o corporativo confiable.'
  }

  return ''
}

export function validatePassword(password) {
  if (!password) {
    return 'La contraseña es obligatoria.'
  }

  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }

  return ''
}

export function validateCredentials(email, password) {
  return (
    normalizeEmail(email) === DEMO_USER.email && password === DEMO_USER.password
  )
}

export function validateLogin({ email, password }) {
  const errors = {}

  const emailError = validateEmail(email)
  const passwordError = validatePassword(password)

  if (emailError) {
    errors.email = emailError
  }

  if (passwordError) {
    errors.password = passwordError
  }

  return { errors, isValid: Object.keys(errors).length === 0 }
}

export { DEMO_USER }
