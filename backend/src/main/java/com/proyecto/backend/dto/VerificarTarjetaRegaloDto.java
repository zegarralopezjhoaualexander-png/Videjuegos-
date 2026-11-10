package com.proyecto.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerificarTarjetaRegaloDto(
        @NotBlank(message = "Ingresa el código de la tarjeta de regalo")
        @Size(max = 50,
                message = "El código de tarjeta de regalo no puede superar los 50 caracteres")
        String codigo) {}
