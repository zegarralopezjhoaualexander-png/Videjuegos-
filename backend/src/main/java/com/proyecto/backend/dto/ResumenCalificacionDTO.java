package com.proyecto.backend.dto;

// promedio es null cuando todavía no hay calificaciones; miPuntaje es null si el usuario no ha votado.
public record ResumenCalificacionDTO(Double promedio, long total, Integer miPuntaje) {
}