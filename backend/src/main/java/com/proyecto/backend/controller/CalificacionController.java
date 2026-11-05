package com.proyecto.backend.controller;

import com.proyecto.backend.dto.CalificarDTO;
import com.proyecto.backend.dto.ResumenCalificacionDTO;
import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.service.CalificacionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tienda/juegos/{id}/calificaciones")
public class CalificacionController {

    private final CalificacionService servicio;

    public CalificacionController(CalificacionService servicio) {
        this.servicio = servicio;
    }

    // Público: promedio y total de votos.
    @GetMapping
    public ResumenCalificacionDTO resumen(@PathVariable Long id) {
        return servicio.resumen(id, null);
    }

    // Con sesión: lo mismo, más el voto de quien consulta.
    @GetMapping("/mia")
    public ResumenCalificacionDTO conMiVoto(@PathVariable Long id,
                                            @RequestAttribute("usuario") Usuario usuario) {
        return servicio.resumen(id, usuario.getId());
    }

    // Con sesión: calificar (o cambiar el voto).
    @PutMapping("/mia")
    public ResumenCalificacionDTO calificar(@PathVariable Long id,
                                            @Valid @RequestBody CalificarDTO datos,
                                            @RequestAttribute("usuario") Usuario usuario) {
        return servicio.calificar(id, usuario.getId(), datos.puntaje());
    }
}