package com.proyecto.backend.dto;

import com.proyecto.backend.model.EstadoOrden;
import com.proyecto.backend.model.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ComprobanteDto(
        String codigoOrden,
        EstadoOrden estado,
        LocalDateTime fecha,
        LocalDateTime fechaPago,
        MetodoPago metodo,
        String nombreCliente,
        String correoCliente,
        List<ItemComprobanteDto> items,
        BigDecimal subtotal,
        BigDecimal descuento,
        BigDecimal impuesto,
        BigDecimal descuentoRegalo,
        BigDecimal total,
        String marcaTarjeta,
        String ultimosDigitos,
        String tarjetaRegaloCodigo,
        String referenciaPago) {

    public record ItemComprobanteDto(
            String titulo,
            String imagen,
            BigDecimal precio,
            int cantidad) {}
}
