package com.proyecto.backend.dto;

import jakarta.validation.constraints.NotNull;

public record AgregarItemCarritoDto(
        @NotNull(message = "El juego es obligatorio")
        Long juegoId) {}
