package com.proyecto.backend.service;

import com.proyecto.backend.model.CarritoItem;
import com.proyecto.backend.model.Cupon;
import com.proyecto.backend.model.TipoCupon;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class CalculadoraCarrito {

    private static final int ESCALA = 2;
    private static final BigDecimal CIEN = new BigDecimal("100");

    private final BigDecimal tasImpuesto;

    public CalculadoraCarrito(
            @Value("${app.carrito.tasa-impuesto:0.18}") BigDecimal tasImpuesto) {
        this.tasImpuesto = tasImpuesto;
    }

    public ResultadoCarrito calcular(List<CarritoItem> items, Cupon cupon) {
        BigDecimal subtotal = items.stream()
                .map(CarritoItem::getJuego)
                .map(juego -> juego.getPrecio() == null ? BigDecimal.ZERO : juego.getPrecio())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(ESCALA, RoundingMode.HALF_UP);

        BigDecimal descuento = calcularDescuento(subtotal, cupon);
        BigDecimal base = subtotal.subtract(descuento).max(BigDecimal.ZERO);
        BigDecimal impuesto = base.multiply(tasImpuesto).setScale(ESCALA, RoundingMode.HALF_UP);
        BigDecimal total = base.add(impuesto).setScale(ESCALA, RoundingMode.HALF_UP);

        return new ResultadoCarrito(subtotal, descuento, impuesto, total);
    }

    private BigDecimal calcularDescuento(BigDecimal subtotal, Cupon cupon) {
        if (cupon == null || cupon.getValor() == null) {
            return BigDecimal.ZERO.setScale(ESCALA, RoundingMode.HALF_UP);
        }

        BigDecimal descuento;
        if (cupon.getTipo() == TipoCupon.PORCENTAJE) {
            descuento = subtotal.multiply(cupon.getValor())
                    .divide(CIEN, ESCALA, RoundingMode.HALF_UP);
        } else {
            descuento = cupon.getValor();
        }

        return descuento.max(BigDecimal.ZERO)
                .min(subtotal)
                .setScale(ESCALA, RoundingMode.HALF_UP);
    }

    public record ResultadoCarrito(
            BigDecimal subtotal,
            BigDecimal descuento,
            BigDecimal impuesto,
            BigDecimal total) {}
}
