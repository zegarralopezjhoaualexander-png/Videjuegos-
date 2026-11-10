package com.proyecto.backend.dto;

import com.proyecto.backend.model.EstadoOrden;
import com.proyecto.backend.model.MetodoPago;

import java.math.BigDecimal;

public record PagoIntentRespuestaDto(
        String codigoOrden,
        String clientSecret,
        boolean requierePago,
        BigDecimal total,
        BigDecimal descuentoRegalo,
        MetodoPago metodo,
        EstadoOrden estado) {}
