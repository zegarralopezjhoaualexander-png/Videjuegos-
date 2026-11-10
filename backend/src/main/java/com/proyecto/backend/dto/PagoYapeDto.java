package com.proyecto.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PagoYapeDto(
        @NotBlank(message = "Ingresa tu número de celular")
        @Pattern(regexp = "^9\\d{8}$",
                message = "El celular debe tener 9 dígitos y empezar con 9")
        String celular,

        @NotBlank(message = "Ingresa el código de aprobación de Yape")
        @Pattern(regexp = "^\\d{6}$",
                message = "El código de aprobación debe tener 6 dígitos")
        String codigoAprobacion,

        @Size(max = 50,
                message = "El código de tarjeta de regalo no puede superar los 50 caracteres")
        String codigoTarjetaRegalo) {}
