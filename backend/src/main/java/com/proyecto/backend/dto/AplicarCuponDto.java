package com.proyecto.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record AplicarCuponDto(
        @NotBlank(message = "El código del cupón es obligatorio")
        String codigo) {}
