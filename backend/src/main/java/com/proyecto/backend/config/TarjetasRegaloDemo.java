package com.proyecto.backend.config;

import com.proyecto.backend.model.TarjetaRegalo;
import com.proyecto.backend.repository.TarjetaRegaloRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

// Tarjetas de regalo de ejemplo para desarrollo. En producción no se cargan.
@Component
@Profile("!prod")
public class TarjetasRegaloDemo implements CommandLineRunner {

    private final TarjetaRegaloRepository tarjetas;

    public TarjetasRegaloDemo(TarjetaRegaloRepository tarjetas) {
        this.tarjetas = tarjetas;
    }

    @Override
    public void run(String... args) {
        crearSiNoExiste("REGALO10", "10.00");
        crearSiNoExiste("REGALO50", "50.00");
        crearSiNoExiste("REGALO100", "100.00");
    }

    private void crearSiNoExiste(String codigo, String saldo) {
        if (tarjetas.existsByCodigoIgnoreCase(codigo)) {
            return;
        }
        tarjetas.save(new TarjetaRegalo(codigo, new BigDecimal(saldo)));
    }
}
