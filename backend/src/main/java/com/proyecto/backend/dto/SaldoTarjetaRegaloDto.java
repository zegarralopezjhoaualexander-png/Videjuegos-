package com.proyecto.backend.dto;

import java.math.BigDecimal;

public record SaldoTarjetaRegaloDto(
        String codigo,
        BigDecimal saldo) {}
