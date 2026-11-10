package com.proyecto.backend.dto;

import com.proyecto.backend.model.MetodoPago;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearPagoIntentDto(
        @NotNull(message = "Selecciona un método de pago")
        MetodoPago metodo,

        @Size(max = 50, message = "El código de tarjeta de regalo no puede superar los 50 caracteres")
        String codigoTarjetaRegalo) {}
