package com.proyecto.backend.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ordenes")
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<OrdenItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MetodoPago metodo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoOrden estado = EstadoOrden.PENDIENTE;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    private LocalDateTime fechaPago;

    @Column(nullable = false, unique = true, length = 30)
    private String codigoOrden;

    @Column(length = 255)
    private String stripePaymentIntentId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal impuesto = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal descuentoRegalo = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(length = 50)
    private String tarjetaRegaloCodigo;

    @Column(length = 50)
    private String marcaTarjeta;

    @Column(length = 4)
    private String ultimosDigitos;

    @Column(length = 500)
    private String mensajeError;

    // Referencia enmascarada del pago (por ejemplo, "Yape ****-123").
    @Column(length = 120)
    private String referenciaPago;

    public Orden() {}

    public Orden(Usuario usuario, MetodoPago metodo, String codigoOrden,
                 BigDecimal subtotal, BigDecimal descuento, BigDecimal impuesto,
                 BigDecimal descuentoRegalo, BigDecimal total) {
        this.usuario = usuario;
        this.metodo = metodo;
        this.codigoOrden = codigoOrden;
        this.subtotal = subtotal;
        this.descuento = descuento;
        this.impuesto = impuesto;
        this.descuentoRegalo = descuentoRegalo;
        this.total = total;
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public List<OrdenItem> getItems() { return items; }
    public MetodoPago getMetodo() { return metodo; }
    public EstadoOrden getEstado() { return estado; }
    public LocalDateTime getFecha() { return fecha; }
    public LocalDateTime getFechaPago() { return fechaPago; }
    public String getCodigoOrden() { return codigoOrden; }
    public String getStripePaymentIntentId() { return stripePaymentIntentId; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getDescuento() { return descuento; }
    public BigDecimal getImpuesto() { return impuesto; }
    public BigDecimal getDescuentoRegalo() { return descuentoRegalo; }
    public BigDecimal getTotal() { return total; }
    public String getTarjetaRegaloCodigo() { return tarjetaRegaloCodigo; }
    public String getMarcaTarjeta() { return marcaTarjeta; }
    public String getUltimosDigitos() { return ultimosDigitos; }
    public String getMensajeError() { return mensajeError; }
    public String getReferenciaPago() { return referenciaPago; }

    public void setStripePaymentIntentId(String stripePaymentIntentId) {
        this.stripePaymentIntentId = stripePaymentIntentId;
    }

    public void setReferenciaPago(String referenciaPago) {
        this.referenciaPago = referenciaPago;
    }

    public void setTarjetaRegaloCodigo(String tarjetaRegaloCodigo) {
        this.tarjetaRegaloCodigo = tarjetaRegaloCodigo;
    }

    public void agregarItem(OrdenItem item) {
        item.setOrden(this);
        items.add(item);
    }

    public void marcarPagada() {
        this.estado = EstadoOrden.PAGADA;
        this.fechaPago = LocalDateTime.now();
        this.mensajeError = null;
    }

    public void marcarFallida(String mensaje) {
        this.estado = EstadoOrden.FALLIDA;
        this.mensajeError = mensaje == null ? null : mensaje.substring(0, Math.min(500, mensaje.length()));
    }

    public void registrarTarjeta(String marca, String ultimosDigitos) {
        this.marcaTarjeta = marca;
        this.ultimosDigitos = ultimosDigitos;
    }
}
