package com.proyecto.backend.dto;

import com.proyecto.backend.model.EstadoOrden;
import com.proyecto.backend.model.MetodoPago;

import java.math.BigDecimal;

public record PagoYapeRespuestaDto(
        String codigoOrden,
        BigDecimal total,
        BigDecimal totalPen,
        BigDecimal tipoCambio,
        BigDecimal descuentoRegalo,
        MetodoPago metodo,
        EstadoOrden estado,
        String referencia) {}
