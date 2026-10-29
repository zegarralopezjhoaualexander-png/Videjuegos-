export const NOMBRE_MAX_LENGTH = 100
export const GENERO_MAX_LENGTH = 50
export const PLATAFORMA_MAX_LENGTH = 50
export const DESCRIPCION_MAX_LENGTH = 1000
export const IMAGEN_MAX_LENGTH = 500
export const DESARROLLADOR_MAX_LENGTH = 100
export const TRAILER_MAX_LENGTH = 500
export const REQUISITOS_MAX_LENGTH = 2000
export const GALERIA_IMAGEN_MAX_LENGTH = 500

const IMAGE_URL_PATTERN = /^(https?:\/\/|img\/)/i
const HTTP_URL_PATTERN = /^https?:\/\//i

export function createEmptyForm() {
  return {
    nombre: '',
    genero: '',
    plataforma: '',
    anio: '',
    puntuacion: '',
    imagen: '',
    descripcion: '',
    precio: '',
    stock: '',
    desarrollador: '',
    fechaLanzamiento: '',
    trailerUrl: '',
    requisitosMinimos: '',
    requisitosRecomendados: '',
    galeria: [''],
  }
}

function toText(value) {
  if (typeof value === 'string') {
    return value
  }

  if (value === undefined || value === null) {
    return ''
  }

  return String(value)
}

export function toFormValues(juego) {
  const form = createEmptyForm()

  if (!juego) {
    return form
  }

  return {
    ...form,
    nombre:
      juego.titulo === 'Juego sin título' ? '' : toText(juego.titulo),
    genero: toText(juego.genero),
    plataforma: toText(juego.plataforma),
    anio: toText(juego.anio),
    puntuacion: Number.isFinite(juego.puntuacion)
      ? String(juego.puntuacion)
      : '',
    imagen: toText(juego.imagen),
    descripcion: toText(juego.descripcion),
    precio: Number.isFinite(juego.precio) ? String(juego.precio) : '',
    stock: Number.isFinite(juego.stock) ? String(juego.stock) : '',
    desarrollador: toText(juego.desarrollador),
    fechaLanzamiento: /^\d{4}-\d{2}-\d{2}/.test(
      toText(juego.fechaLanzamiento),
    )
      ? toText(juego.fechaLanzamiento).slice(0, 10)
      : '',
    trailerUrl: toText(juego.trailerUrl),
    requisitosMinimos: toText(juego.requisitosMinimos),
    requisitosRecomendados: toText(juego.requisitosRecomendados),
    galeria:
      Array.isArray(juego.galeria) && juego.galeria.length > 0
        ? juego.galeria.map((url) => toText(url))
        : [''],
  }
}

export function toPayload(values) {
  return {
    nombre: values.nombre.trim(),
    genero: values.genero.trim(),
    plataforma: values.plataforma.trim(),
    anio: values.anio.trim() === '' ? null : Number(values.anio),
    puntuacion:
      values.puntuacion.trim() === ''
        ? null
        : Number(values.puntuacion),
    imagen: values.imagen.trim(),
    descripcion: values.descripcion.trim(),
    precio: Number(values.precio),
    stock: Number(values.stock),
    desarrollador: values.desarrollador.trim(),
    fechaLanzamiento: values.fechaLanzamiento || null,
    trailerUrl: values.trailerUrl.trim(),
    requisitosMinimos: values.requisitosMinimos.trim(),
    requisitosRecomendados: values.requisitosRecomendados.trim(),
    galeria: values.galeria
      .map((url) => url.trim())
      .filter((url) => Boolean(url)),
  }
}

function parseDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function getYesterdayInputValue() {
  const date = new Date()
  date.setDate(date.getDate() - 1)

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

function validateRequiredText(value, max, label) {
  const trimmed = value.trim()

  if (!trimmed) {
    return `${label} es obligatorio.`
  }

  if (trimmed.length > max) {
    return `${label} no puede superar los ${max} caracteres.`
  }

  return ''
}

function validateOptionalText(value, max, label) {
  if (value.trim().length > max) {
    return `${label} no puede superar los ${max} caracteres.`
  }

  return ''
}

function validateInteger(value, min, max, label) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  if (!/^\d+$/.test(trimmed)) {
    return `${label} debe ser un número entero entre ${min} y ${max}.`
  }

  const number = Number(trimmed)

  if (number < min || number > max) {
    return `${label} debe estar entre ${min} y ${max}.`
  }

  return ''
}

function validatePrecio(value) {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'El precio es obligatorio.'
  }

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return 'El precio debe ser un número con máximo 2 decimales.'
  }

  const number = Number(trimmed)

  if (!Number.isFinite(number) || number < 0 || number > 9999.99) {
    return 'El precio debe estar entre 0 y 9999.99.'
  }

  return ''
}

function validateStock(value) {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'El stock es obligatorio.'
  }

  if (!/^\d+$/.test(trimmed)) {
    return 'El stock debe ser un número entero.'
  }

  const number = Number(trimmed)

  if (number < 0 || number > 100000) {
    return 'El stock debe estar entre 0 y 100000.'
  }

  return ''
}

function validateImagen(value) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  if (trimmed.length > IMAGEN_MAX_LENGTH) {
    return `La imagen no puede superar los ${IMAGEN_MAX_LENGTH} caracteres.`
  }

  if (!IMAGE_URL_PATTERN.test(trimmed)) {
    return 'La imagen debe empezar por http://, https:// o img/.'
  }

  return ''
}

function validateTrailer(value) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  if (trimmed.length > TRAILER_MAX_LENGTH) {
    return `El enlace del tráiler no puede superar los ${TRAILER_MAX_LENGTH} caracteres.`
  }

  if (!HTTP_URL_PATTERN.test(trimmed)) {
    return 'El enlace del tráiler debe empezar por http:// o https://.'
  }

  return ''
}

function validateFechaLanzamiento(value) {
  if (!value) {
    return ''
  }

  const date = parseDateInput(value)

  if (!date) {
    return 'Ingresa una fecha de lanzamiento válida.'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (date >= today) {
    return 'La fecha de lanzamiento debe ser anterior a hoy.'
  }

  return ''
}

function validateGaleria(galeria) {
  return galeria.map((url, index) => {
    const trimmed = url.trim()

    if (!trimmed) {
      return ''
    }

    if (trimmed.length > GALERIA_IMAGEN_MAX_LENGTH) {
      return `La imagen ${index + 1} de la galería no puede superar los ${GALERIA_IMAGEN_MAX_LENGTH} caracteres.`
    }

    if (!IMAGE_URL_PATTERN.test(trimmed)) {
      return `La imagen ${index + 1} de la galería debe empezar por http://, https:// o img/.`
    }

    return ''
  })
}

export function validateJuegoForm(values) {
  const errors = {}

  const nombreError = validateRequiredText(
    values.nombre,
    NOMBRE_MAX_LENGTH,
    'El nombre',
  )
  const generoError = validateRequiredText(
    values.genero,
    GENERO_MAX_LENGTH,
    'El género',
  )
  const plataformaError = validateOptionalText(
    values.plataforma,
    PLATAFORMA_MAX_LENGTH,
    'La plataforma',
  )
  const anioError = validateInteger(
    values.anio,
    1950,
    2100,
    'El año',
  )
  const puntuacionError = validateInteger(
    values.puntuacion,
    1,
    10,
    'La puntuación',
  )
  const imagenError = validateImagen(values.imagen)
  const descripcionError = validateOptionalText(
    values.descripcion,
    DESCRIPCION_MAX_LENGTH,
    'La descripción',
  )
  const precioError = validatePrecio(values.precio)
  const stockError = validateStock(values.stock)
  const desarrolladorError = validateOptionalText(
    values.desarrollador,
    DESARROLLADOR_MAX_LENGTH,
    'El desarrollador',
  )
  const fechaError = validateFechaLanzamiento(values.fechaLanzamiento)
  const trailerError = validateTrailer(values.trailerUrl)
  const requisitosMinimosError = validateOptionalText(
    values.requisitosMinimos,
    REQUISITOS_MAX_LENGTH,
    'El campo de requisitos mínimos',
  )
  const requisitosRecomendadosError = validateOptionalText(
    values.requisitosRecomendados,
    REQUISITOS_MAX_LENGTH,
    'El campo de requisitos recomendados',
  )

  if (nombreError) {
    errors.nombre = nombreError
  }

  if (generoError) {
    errors.genero = generoError
  }

  if (plataformaError) {
    errors.plataforma = plataformaError
  }

  if (anioError) {
    errors.anio = anioError
  }

  if (puntuacionError) {
    errors.puntuacion = puntuacionError
  }

  if (imagenError) {
    errors.imagen = imagenError
  }

  if (descripcionError) {
    errors.descripcion = descripcionError
  }

  if (precioError) {
    errors.precio = precioError
  }

  if (stockError) {
    errors.stock = stockError
  }

  if (desarrolladorError) {
    errors.desarrollador = desarrolladorError
  }

  if (fechaError) {
    errors.fechaLanzamiento = fechaError
  }

  if (trailerError) {
    errors.trailerUrl = trailerError
  }

  if (requisitosMinimosError) {
    errors.requisitosMinimos = requisitosMinimosError
  }

  if (requisitosRecomendadosError) {
    errors.requisitosRecomendados = requisitosRecomendadosError
  }

  const galeriaErrors = validateGaleria(values.galeria)
  const hasGaleriaErrors = galeriaErrors.some(Boolean)

  return {
    errors,
    galeriaErrors,
    isValid:
      Object.keys(errors).length === 0 && !hasGaleriaErrors,
  }
}
