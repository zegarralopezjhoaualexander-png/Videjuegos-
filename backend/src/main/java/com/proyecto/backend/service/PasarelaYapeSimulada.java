package com.proyecto.backend.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Simulación local de Yape: el código 111111 aprueba el pago y cualquier otro
 * lo rechaza. No se registra ni se almacena el código de aprobación.
 */
@Service
public class PasarelaYapeSimulada implements PasarelaYape {

    private static final String CODIGO_APROBADO = "111111";

    @Override
    public ResultadoYape cobrar(String celular, String codigoAprobacion, BigDecimal monto) {
        if (monto == null || monto.signum() <= 0) {
            return new ResultadoYape(false, null, "El monto del pago con Yape no es válido");
        }

        simularEspera();

        if (CODIGO_APROBADO.equals(codigoAprobacion)) {
            return new ResultadoYape(true, referencia(celular), "Pago con Yape aprobado");
        }

        return new ResultadoYape(false, null,
                "Yape rechazó el pago. Verifica el código de aprobación e inténtalo de nuevo.");
    }

    private String referencia(String celular) {
        if (celular == null || celular.length() < 3) {
            return "Yape ****-***";
        }
        return "Yape ****-" + celular.substring(celular.length() - 3);
    }

    private void simularEspera() {
        try {
            Thread.sleep(ThreadLocalRandom.current().nextLong(1000, 2001));
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }
}
