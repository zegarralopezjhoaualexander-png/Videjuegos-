import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { resolvePublicImage } from "../api/juegos.js";
import {
  formatAvailability,
  formatDate,
  formatPrice,
  formatScore,
  getInitials,
  getStockClasses,
} from "../utils/format.js";

const SECTION_CLASSES =
  "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur sm:p-8";

const TOTAL_FORMATTER = new Intl.NumberFormat("es-MX");

function MissingInfo({ className = "" }) {
  return (
    <p className={`text-sm text-slate-500 ${className}`}>
      Información no disponible
    </p>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-slate-200">
        {value || (
          <span className="text-slate-500">Información no disponible</span>
        )}
      </dd>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className={SECTION_CLASSES}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function RequirementBlock({ title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
      <h3 className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">
        {title}
      </h3>
      {text ? (
        <p className="mt-3 text-sm leading-6 whitespace-pre-line text-slate-300">
          {text}
        </p>
      ) : (
        <MissingInfo className="mt-3" />
      )}
    </div>
  );
}

function StarIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="m12 2.5 2.9 6.05 6.68.97-4.83 4.71 1.14 6.65L12 17.74l-5.89 3.14 1.14-6.65-4.83-4.71 6.68-.97L12 2.5Z" />
    </svg>
  );
}

function CalificacionEstrellas({ valor, onSeleccionar, deshabilitado }) {
  const [resaltado, setResaltado] = useState(0);
  const botonesRef = useRef([]);
  const activo = resaltado || valor || 0;

  const manejarTeclado = (event, index) => {
    let siguiente = null;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      siguiente = Math.min(index + 1, 4);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      siguiente = Math.max(index - 1, 0);
    } else if (event.key === "Home") {
      siguiente = 0;
    } else if (event.key === "End") {
      siguiente = 4;
    }

    if (siguiente === null) {
      return;
    }

    event.preventDefault();
    botonesRef.current[siguiente]?.focus();
  };

  return (
    <div
      role="group"
      aria-label="Selecciona tu calificación de 1 a 5 estrellas"
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((puntaje) => (
        <button
          key={puntaje}
          ref={(element) => {
            botonesRef.current[puntaje - 1] = element;
          }}
          type="button"
          disabled={deshabilitado}
          onClick={() => onSeleccionar(puntaje)}
          onMouseEnter={() => setResaltado(puntaje)}
          onMouseLeave={() => setResaltado(0)}
          onFocus={() => setResaltado(puntaje)}
          onBlur={() => setResaltado(0)}
          onKeyDown={(event) => manejarTeclado(event, puntaje - 1)}
          aria-label={`Calificar con ${puntaje} de 5 estrellas`}
          aria-pressed={valor === puntaje}
          className="rounded-lg p-1 transition duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-wait disabled:opacity-60"
        >
          <StarIcon
            className={`size-8 transition-colors ${
              puntaje <= activo ? "text-amber-300" : "text-slate-700"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function JuegoLoadingSkeleton() {
  return (
    <div className="mt-6 animate-pulse space-y-6">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="grid lg:grid-cols-2">
          <div className="aspect-video bg-white/10 lg:aspect-auto lg:min-h-[380px]" />
          <div className="space-y-4 p-6 sm:p-8">
            <div className="h-8 w-3/4 rounded bg-white/10" />
            <div className="h-4 w-1/2 rounded bg-white/10" />
            <div className="h-24 w-full rounded bg-white/10" />
            <div className="h-20 w-full rounded bg-white/10" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-48 rounded-2xl border border-white/10 bg-white/5" />
        <div className="h-48 rounded-2xl border border-white/10 bg-white/5" />
      </div>
    </div>
  );
}

export function JuegoNotFound() {
  return (
    <div
      role="alert"
      className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-8 text-center"
    >
      <h1 className="text-xl font-semibold text-amber-100">
        Juego no encontrado
      </h1>
      <p className="mt-2 text-sm text-amber-200">
        No existe un juego con el identificador solicitado.
      </p>
      <Link
        to="/catalogo"
        className="mt-5 inline-block rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
      >
        Volver al catálogo
      </Link>
    </div>
  );
}

export function JuegoErrorState({ error, onRetry }) {
  return (
    <div
      role="alert"
      className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 text-center"
    >
      <h1 className="text-xl font-semibold text-rose-100">
        No pudimos cargar este juego
      </h1>
      <p className="mt-2 text-sm text-rose-200">{error}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Reintentar
        </button>
        <Link
          to="/catalogo"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}

export function JuegoHero({ juego, showImage, onImageError }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
      <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="relative aspect-video overflow-hidden bg-linear-to-br from-indigo-500/30 via-slate-900 to-fuchsia-500/30 lg:aspect-auto lg:min-h-[380px]">
          {showImage ? (
            <img
              src={resolvePublicImage(juego.imagen)}
              alt={`Portada de ${juego.titulo}`}
              onError={onImageError}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
              <span className="text-4xl font-black tracking-widest text-white/70">
                {getInitials(juego.titulo)}
              </span>
              <span className="text-xs text-white/50">
                Imagen no disponible
              </span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-bold text-white">{juego.titulo}</h1>
            {Number.isFinite(juego.puntuacion) && (
              <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-200">
                {formatScore(juego.puntuacion)}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {juego.genero && (
              <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-200">
                {juego.genero}
              </span>
            )}
            {juego.plataforma && (
              <span className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-sm text-slate-300">
                {juego.plataforma}
              </span>
            )}
            {juego.anio && (
              <span className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-sm text-slate-300">
                {juego.anio}
              </span>
            )}
          </div>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <MetaItem label="Desarrollador" value={juego.desarrollador} />
            <MetaItem
              label="Fecha de lanzamiento"
              value={formatDate(juego.fechaLanzamiento)}
            />
          </dl>

          <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Precio
                </p>
                {Number.isFinite(juego.precio) ? (
                  <p className="mt-1 text-2xl font-bold text-white">
                    {formatPrice(juego.precio)}
                  </p>
                ) : (
                  <MissingInfo className="mt-1" />
                )}
              </div>
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStockClasses(juego.stock)}`}
              >
                {formatAvailability(juego.stock)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function SinopsisSection({ descripcion }) {
  return (
    <SectionCard title="Sinopsis">
      {descripcion ? (
        <p className="mt-3 text-sm leading-7 whitespace-pre-line text-slate-300">
          {descripcion}
        </p>
      ) : (
        <MissingInfo className="mt-3" />
      )}
    </SectionCard>
  );
}

export function GaleriaSection({ juego, gallery, onSelectImage, onImageError }) {
  return (
    <SectionCard title="Galería">
      {gallery.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => onSelectImage(url)}
              className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-slate-900/60 transition hover:border-indigo-400/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              aria-label={`Ampliar imagen ${index + 1} de ${gallery.length} de ${juego.titulo}`}
            >
              <img
                src={resolvePublicImage(url)}
                alt={`Imagen ${index + 1} de ${juego.titulo}`}
                loading="lazy"
                onError={() => onImageError(url)}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-xs font-semibold text-white opacity-0 transition group-hover:bg-slate-950/40 group-hover:opacity-100">
                Ampliar
              </span>
            </button>
          ))}
        </div>
      ) : (
        <MissingInfo className="mt-3" />
      )}
    </SectionCard>
  );
}

function TrailerEmbed({ titulo, url }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-slate-950/60">
      <div className="aspect-video w-full">
        <iframe
          src={url}
          title={`Tráiler de ${titulo}`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

function TrailerSearchLink({ url }) {
  return (
    <div className="mt-4 flex flex-col gap-4 rounded-xl border border-white/10 bg-slate-950/60 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-white">
          Búsqueda de tráiler en YouTube
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Este enlace es una búsqueda y no se puede incrustar.
        </p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
      >
        Ver tráiler en YouTube
        <span aria-hidden="true">&#8599;</span>
      </a>
    </div>
  );
}

export function TrailerSection({ juego, trailer }) {
  let content = <MissingInfo className="mt-3" />;

  if (trailer?.type === "embed") {
    content = <TrailerEmbed titulo={juego.titulo} url={trailer.url} />;
  } else if (trailer?.type === "search") {
    content = <TrailerSearchLink url={trailer.url} />;
  }

  return <SectionCard title="Tráiler">{content}</SectionCard>;
}

export function RequisitosSection({ juego }) {
  return (
    <SectionCard title="Requisitos del sistema">
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <RequirementBlock title="Mínimos" text={juego.requisitosMinimos} />
        <RequirementBlock
          title="Recomendados"
          text={juego.requisitosRecomendados}
        />
      </div>
    </SectionCard>
  );
}

function ValoracionEditorial({ puntuacion }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
      <h3 className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">
        Valoración editorial
      </h3>
      {Number.isFinite(puntuacion) ? (
        <>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-amber-300">
              {Number.isInteger(puntuacion) ? puntuacion : puntuacion.toFixed(1)}
            </span>
            <span className="text-sm text-slate-400">/ 10</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-amber-400"
              style={{
                width: `${Math.min(Math.max(puntuacion, 0), 10) * 10}%`,
              }}
            />
          </div>
        </>
      ) : (
        <MissingInfo className="mt-3" />
      )}
    </div>
  );
}

function ResumenCalificaciones({ calificaciones }) {
  if (calificaciones.total > 0 && Number.isFinite(calificaciones.promedio)) {
    return (
      <div className="flex items-center gap-2">
        <StarIcon className="size-5 shrink-0 text-amber-300" />
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-white">
            {calificaciones.promedio.toFixed(1)}
          </span>
          <span className="text-slate-500"> · </span>
          {calificaciones.total === 1
            ? "1 calificación"
            : `${TOTAL_FORMATTER.format(calificaciones.total)} calificaciones`}
        </p>
      </div>
    );
  }

  return (
    <p className="text-sm text-slate-500">Aún sin calificaciones</p>
  );
}

function getMiCalificacionTexto(guardando, miPuntaje) {
  if (guardando) {
    return "Guardando tu calificación...";
  }

  if (Number.isFinite(miPuntaje)) {
    return `Tu calificación: ${miPuntaje} de 5`;
  }

  return "Selecciona de 1 a 5 estrellas";
}

function MiCalificacion({
  miPuntaje,
  guardando,
  error,
  onCalificar,
  token,
}) {
  if (!token) {
    return (
      <p className="text-sm text-slate-400">
        <Link
          to="/login"
          className="font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Inicia sesión
        </Link>{" "}
        para calificar
      </p>
    );
  }

  return (
    <div>
      <CalificacionEstrellas
        valor={miPuntaje}
        onSeleccionar={onCalificar}
        deshabilitado={guardando}
      />
      <p className="mt-2 text-sm text-slate-300" aria-live="polite">
        {getMiCalificacionTexto(guardando, miPuntaje)}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

export function CalificacionSection({
  juego,
  calificaciones,
  token,
  guardando,
  onCalificar,
  onRetry,
}) {
  return (
    <SectionCard title="Calificación">
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ValoracionEditorial puntuacion={juego.puntuacion} />

        <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
          <h3 className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">
            Calificación de los usuarios
          </h3>

          {calificaciones.status === "loading" && (
            <p className="mt-3 text-sm text-slate-400" aria-live="polite">
              Cargando calificaciones...
            </p>
          )}

          {calificaciones.status === "error" && (
            <div className="mt-3 space-y-3">
              <p role="alert" className="text-sm text-rose-300">
                {calificaciones.error}
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                Reintentar
              </button>
            </div>
          )}

          {calificaciones.status === "ready" && (
            <div className="mt-3 space-y-4">
              <ResumenCalificaciones calificaciones={calificaciones} />
              <MiCalificacion
                miPuntaje={calificaciones.miPuntaje}
                guardando={guardando}
                error={calificaciones.error}
                onCalificar={onCalificar}
                token={token}
              />
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

export function ImagenAmpliadaModal({ image, titulo, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Imagen ampliada"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full border border-white/20 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Cerrar
        </button>
        <img
          src={resolvePublicImage(image)}
          alt={`Imagen ampliada de ${titulo}`}
          className="max-h-[85vh] w-full rounded-2xl border border-white/10 object-contain"
        />
      </div>
    </div>
  );
}
