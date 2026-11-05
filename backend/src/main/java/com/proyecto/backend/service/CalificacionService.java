package com.proyecto.backend.service;

import com.proyecto.backend.dto.ResumenCalificacionDTO;
import com.proyecto.backend.exception.ErrorApi;
import com.proyecto.backend.model.Calificacion;
import com.proyecto.backend.repository.CalificacionRepository;
import com.proyecto.backend.repository.VideojuegoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CalificacionService {

    private final CalificacionRepository calificaciones;
    private final VideojuegoRepository juegos;

    public CalificacionService(CalificacionRepository calificaciones, VideojuegoRepository juegos) {
        this.calificaciones = calificaciones;
        this.juegos = juegos;
    }

    @Transactional(readOnly = true)
    public ResumenCalificacionDTO resumen(Long juegoId, Long usuarioId) {
        verificarJuego(juegoId);
        return armarResumen(juegoId, usuarioId);
    }

    @Transactional
    public ResumenCalificacionDTO calificar(Long juegoId, Long usuarioId, int puntaje) {
        verificarJuego(juegoId);
        Calificacion voto = calificaciones.findByVideojuegoIdAndUsuarioId(juegoId, usuarioId)
                .orElseGet(() -> new Calificacion(usuarioId, juegoId, puntaje));
        voto.setPuntaje(puntaje);
        calificaciones.save(voto);
        return armarResumen(juegoId, usuarioId);
    }

    private void verificarJuego(Long juegoId) {
        if (!juegos.existsById(juegoId)) {
            throw new ErrorApi(HttpStatus.NOT_FOUND, "Juego no encontrado");
        }
    }

    private ResumenCalificacionDTO armarResumen(Long juegoId, Long usuarioId) {
        long total = calificaciones.countByVideojuegoId(juegoId);
        Double promedio = calificaciones.promedioDe(juegoId);
        if (promedio != null) {
            promedio = Math.round(promedio * 10.0) / 10.0;
        }
        Integer mio = usuarioId == null ? null
                : calificaciones.findByVideojuegoIdAndUsuarioId(juegoId, usuarioId)
                .map(Calificacion::getPuntaje)
                .orElse(null);
        return new ResumenCalificacionDTO(promedio, total, mio);
    }
}