import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchCalificaciones,
  guardarMiCalificacion,
} from "../api/calificaciones.js";
import { fetchJuegoById } from "../api/juegos.js";
import { useAuth } from "../auth/useAuth.js";
import { getYouTubeTrailer } from "../utils/youtube.js";
import {
  CalificacionSection,
  GaleriaSection,
  ImagenAmpliadaModal,
  JuegoErrorState,
  JuegoHero,
  JuegoLoadingSkeleton,
  JuegoNotFound,
  RequisitosSection,
  SinopsisSection,
  TrailerSection,
} from "./JuegoDetalleSections.jsx";

function JuegoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, signOut } = useAuth();
  const [requestState, setRequestState] = useState({
    id: null,
    status: "loading",
    juego: null,
    error: "",
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [mainImageFailed, setMainImageFailed] = useState(false);
  const [failedGalleryImages, setFailedGalleryImages] = useState([]);
  const [calificaciones, setCalificaciones] = useState({
    status: "loading",
    promedio: null,
    total: 0,
    miPuntaje: null,
    error: "",
  });
  const [calificacionesReloadKey, setCalificacionesReloadKey] = useState(0);
  const [guardandoCalificacion, setGuardandoCalificacion] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchJuegoById(id, { signal: controller.signal })
      .then((data) => {
        if (!active) {
          return;
        }

        setSelectedImage(null);
        setMainImageFailed(false);
        setFailedGalleryImages([]);
        setRequestState({ id, status: "ready", juego: data, error: "" });
      })
      .catch((requestError) => {
        if (!active || requestError.name === "AbortError") {
          return;
        }

        setSelectedImage(null);

        if (requestError.status === 404) {
          setRequestState({
            id,
            status: "notFound",
            juego: null,
            error: "",
          });
          return;
        }

        setRequestState({
          id,
          status: "error",
          juego: null,
          error:
            requestError.message ||
            "No se pudo cargar la información del juego.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, reloadKey]);

  const handleUnauthorized = useCallback(async () => {
    await signOut();
    navigate("/login", {
      replace: true,
      state: { from: `/juego/${id}` },
    });
  }, [signOut, navigate, id]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setCalificaciones({
      status: "loading",
      promedio: null,
      total: 0,
      miPuntaje: null,
      error: "",
    });

    fetchCalificaciones(id, { token, signal: controller.signal })
      .then((resumen) => {
        if (!active) {
          return;
        }

        setCalificaciones({ status: "ready", ...resumen, error: "" });
      })
      .catch(async (requestError) => {
        if (!active || requestError.name === "AbortError") {
          return;
        }

        if (requestError.status === 401) {
          await handleUnauthorized();
          return;
        }

        setCalificaciones({
          status: "error",
          promedio: null,
          total: 0,
          miPuntaje: null,
          error:
            requestError.message ||
            "No se pudieron cargar las calificaciones de los usuarios.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, token, calificacionesReloadKey, handleUnauthorized]);

  useEffect(() => {
    if (!selectedImage) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  const status = requestState.id === id ? requestState.status : "loading";
  const juego =
    requestState.id === id && requestState.status === "ready"
      ? requestState.juego
      : null;
  const error = requestState.id === id ? requestState.error : "";

  const handleRetry = () => {
    setRequestState((current) => ({
      ...current,
      status: "loading",
      error: "",
    }));
    setReloadKey((current) => current + 1);
  };

  const handleGalleryImageError = (url) => {
    setFailedGalleryImages((current) =>
      current.includes(url) ? current : [...current, url]
    );
  };

  const handleCalificar = async (puntaje) => {
    if (!token || guardandoCalificacion) {
      return;
    }

    setGuardandoCalificacion(true);
    setCalificaciones((current) => ({ ...current, error: "" }));

    try {
      const resumen = await guardarMiCalificacion(id, puntaje, { token });
      setCalificaciones({ status: "ready", ...resumen, error: "" });
    } catch (requestError) {
      if (requestError?.status === 401) {
        await handleUnauthorized();
        return;
      }

      setCalificaciones((current) => ({
        ...current,
        error:
          requestError?.message ||
          "No se pudo guardar tu calificación. Inténtalo de nuevo.",
      }));
    } finally {
      setGuardandoCalificacion(false);
    }
  };

  const showMainImage = Boolean(juego?.imagen) && !mainImageFailed;
  const gallery = juego
    ? juego.galeria.filter((url) => !failedGalleryImages.includes(url))
    : [];
  const trailer = getYouTubeTrailer(juego?.trailerUrl);

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          <span aria-hidden="true">&larr;</span>
          Volver al catálogo
        </Link>

        {status === "loading" && <JuegoLoadingSkeleton />}

        {status === "notFound" && <JuegoNotFound />}

        {status === "error" && (
          <JuegoErrorState error={error} onRetry={handleRetry} />
        )}

        {status === "ready" && juego && (
          <div className="mt-6 space-y-6">
            <JuegoHero
              juego={juego}
              showImage={showMainImage}
              onImageError={() => setMainImageFailed(true)}
            />
            <SinopsisSection descripcion={juego.descripcion} />
            <GaleriaSection
              juego={juego}
              gallery={gallery}
              onSelectImage={setSelectedImage}
              onImageError={handleGalleryImageError}
            />
            <TrailerSection juego={juego} trailer={trailer} />
            <RequisitosSection juego={juego} />
            <CalificacionSection
              juego={juego}
              calificaciones={calificaciones}
              token={token}
              guardando={guardandoCalificacion}
              onCalificar={handleCalificar}
              onRetry={() =>
                setCalificacionesReloadKey((current) => current + 1)
              }
            />
          </div>
        )}
      </div>

      {selectedImage && (
        <ImagenAmpliadaModal
          image={selectedImage}
          titulo={juego?.titulo ?? "el juego"}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </main>
  );
}

export default JuegoDetalle;
