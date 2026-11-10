package com.proyecto.backend.service;

import java.math.BigDecimal;

/**
 * Contrato de cobro con Yape. La implementación simulada se puede reemplazar
 * por una integración real (por ejemplo, Culqi) sin tocar el resto del flujo.
 */
public interface PasarelaYape {

    ResultadoYape cobrar(String celular, String codigoAprobacion, BigDecimal monto);

    record ResultadoYape(boolean aprobado, String referencia, String mensaje) {}
}
