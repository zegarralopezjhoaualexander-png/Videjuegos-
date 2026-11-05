package com.proyecto.backend.config;

import com.proyecto.backend.model.Cupon;
import com.proyecto.backend.model.TipoCupon;
import com.proyecto.backend.repository.CuponRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

// Cupones de ejemplo para desarrollo. En producción no se cargan.
@Component
@Profile("!prod")
public class CuponesDemo implements CommandLineRunner {

    private final CuponRepository cupones;

    public CuponesDemo(CuponRepository cupones) {
        this.cupones = cupones;
    }

    @Override
    public void run(String... args) {
        LocalDate hoy = LocalDate.now();
        crearSiNoExiste("BIENVENIDO10", TipoCupon.PORCENTAJE, "10.00",
                hoy.minusDays(30), hoy.plusYears(1), null);
        crearSiNoExiste("PROMO5", TipoCupon.MONTO_FIJO, "5.00",
                hoy.minusDays(30), hoy.plusYears(1), null);
    }

    private void crearSiNoExiste(String codigo, TipoCupon tipo, String valor,
                                 LocalDate inicio, LocalDate fin, Integer usosMaximos) {
        if (cupones.existsByCodigoIgnoreCase(codigo)) {
            return;
        }
        Cupon cupon = new Cupon();
        cupon.setCodigo(codigo);
        cupon.setTipo(tipo);
        cupon.setValor(new BigDecimal(valor));
        cupon.setActivo(true);
        cupon.setFechaInicio(inicio);
        cupon.setFechaFin(fin);
        cupon.setUsosMaximos(usosMaximos);
        cupones.save(cupon);
    }
}
