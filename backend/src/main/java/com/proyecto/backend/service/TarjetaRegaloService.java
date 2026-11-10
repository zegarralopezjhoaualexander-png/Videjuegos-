package com.proyecto.backend.service;

import com.proyecto.backend.exception.ErrorApi;
import com.proyecto.backend.model.TarjetaRegalo;
import com.proyecto.backend.repository.TarjetaRegaloRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class TarjetaRegaloService {

    private final TarjetaRegaloRepository tarjetas;

    public TarjetaRegaloService(TarjetaRegaloRepository tarjetas) {
        this.tarjetas = tarjetas;
    }

    @Transactional(readOnly = true)
    public TarjetaRegalo validar(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST,
                    "Ingresa el código de la tarjeta de regalo");
        }

        TarjetaRegalo tarjeta = tarjetas.findByCodigoIgnoreCase(codigo.trim())
                .orElseThrow(() -> new ErrorApi(HttpStatus.NOT_FOUND,
                        "La tarjeta de regalo no existe"));

        if (!tarjeta.isActiva() || tarjeta.getSaldo().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST,
                    "La tarjeta de regalo no tiene saldo disponible");
        }

        return tarjeta;
    }

    @Transactional
    public void reembolsar(String codigo, BigDecimal monto) {
        if (codigo == null || codigo.isBlank() || monto == null
                || monto.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        tarjetas.findByCodigoIgnoreCase(codigo).ifPresent(tarjeta -> {
            tarjeta.reembolsar(monto);
            tarjetas.save(tarjeta);
        });
    }
}
