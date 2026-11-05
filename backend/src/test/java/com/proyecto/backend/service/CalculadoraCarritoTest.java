package com.proyecto.backend.service;

import com.proyecto.backend.model.CarritoItem;
import com.proyecto.backend.model.Cupon;
import com.proyecto.backend.model.TipoCupon;
import com.proyecto.backend.model.Videojuego;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CalculadoraCarritoTest {

    private final CalculadoraCarrito calculadora =
            new CalculadoraCarrito(new BigDecimal("0.18"));

    @Test
    void calculaSinCupon() {
        CalculadoraCarrito.ResultadoCarrito resultado = calculadora.calcular(
                List.of(item("59.99"), item("10.00")), null);

        assertThat(resultado.subtotal()).isEqualByComparingTo("69.99");
        assertThat(resultado.descuento()).isEqualByComparingTo("0.00");
        assertThat(resultado.impuesto()).isEqualByComparingTo("12.60");
        assertThat(resultado.total()).isEqualByComparingTo("82.59");
    }

    @Test
    void calculaConCuponPorcentaje() {
        Cupon cupon = cupon(TipoCupon.PORCENTAJE, "10.00");

        CalculadoraCarrito.ResultadoCarrito resultado = calculadora.calcular(
                List.of(item("100.00")), cupon);

        assertThat(resultado.subtotal()).isEqualByComparingTo("100.00");
        assertThat(resultado.descuento()).isEqualByComparingTo("10.00");
        assertThat(resultado.impuesto()).isEqualByComparingTo("16.20");
        assertThat(resultado.total()).isEqualByComparingTo("106.20");
    }

    @Test
    void elDescuentoFijoNoSuperaElSubtotal() {
        Cupon cupon = cupon(TipoCupon.MONTO_FIJO, "50.00");

        CalculadoraCarrito.ResultadoCarrito resultado = calculadora.calcular(
                List.of(item("20.00")), cupon);

        assertThat(resultado.subtotal()).isEqualByComparingTo("20.00");
        assertThat(resultado.descuento()).isEqualByComparingTo("20.00");
        assertThat(resultado.impuesto()).isEqualByComparingTo("0.00");
        assertThat(resultado.total()).isEqualByComparingTo("0.00");
    }

    @Test
    void redondeaConEscalaDosYHalfUp() {
        Cupon cupon = cupon(TipoCupon.PORCENTAJE, "15.00");

        CalculadoraCarrito.ResultadoCarrito resultado = calculadora.calcular(
                List.of(item("19.99")), cupon);

        assertThat(resultado.subtotal()).isEqualByComparingTo("19.99");
        assertThat(resultado.descuento()).isEqualByComparingTo("3.00");
        assertThat(resultado.impuesto()).isEqualByComparingTo("3.06");
        assertThat(resultado.total()).isEqualByComparingTo("20.05");
    }

    private CarritoItem item(String precio) {
        Videojuego juego = new Videojuego();
        juego.setPrecio(new BigDecimal(precio));
        CarritoItem item = new CarritoItem();
        item.setJuego(juego);
        return item;
    }

    private Cupon cupon(TipoCupon tipo, String valor) {
        Cupon cupon = new Cupon();
        cupon.setTipo(tipo);
        cupon.setValor(new BigDecimal(valor));
        cupon.setActivo(true);
        return cupon;
    }
}
