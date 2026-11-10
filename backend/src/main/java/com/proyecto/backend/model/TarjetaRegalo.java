package com.proyecto.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(name = "tarjetas_regalo")
public class TarjetaRegalo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal saldo = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean activa = true;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public TarjetaRegalo() {}

    public TarjetaRegalo(String codigo, BigDecimal saldo) {
        this.codigo = codigo;
        this.saldo = saldo;
        this.activa = true;
    }

    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public BigDecimal getSaldo() { return saldo; }
    public boolean isActiva() { return activa; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }

    public void consumir(BigDecimal monto) {
        BigDecimal valor = monto.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        saldo = saldo.subtract(valor).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        activa = saldo.compareTo(BigDecimal.ZERO) > 0;
    }

    public void reembolsar(BigDecimal monto) {
        BigDecimal valor = monto.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        saldo = saldo.add(valor).setScale(2, RoundingMode.HALF_UP);
        activa = true;
    }
}
