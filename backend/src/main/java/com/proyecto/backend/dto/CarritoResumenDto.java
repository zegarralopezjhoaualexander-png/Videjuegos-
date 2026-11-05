package com.proyecto.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record CarritoResumenDto(
        List<ItemCarritoDto> items,
        int cantidadItems,
        BigDecimal subtotal,
        BigDecimal descuento,
        String cuponCodigo,
        BigDecimal impuesto,
        BigDecimal total) {

    public record ItemCarritoDto(
            Long juegoId,
            String titulo,
            String imagen,
            BigDecimal precio) {}
}
