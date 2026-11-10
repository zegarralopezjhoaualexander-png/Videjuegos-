package com.proyecto.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "orden_items")
public class OrdenItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "orden_id", nullable = false)
    private Orden orden;

    @ManyToOne(optional = false)
    @JoinColumn(name = "videojuego_id", nullable = false)
    private Videojuego juego;

    @Column(nullable = false, length = 100)
    private String titulo;

    @Column(length = 500)
    private String imagen;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private int cantidad = 1;

    public OrdenItem() {}

    public OrdenItem(Orden orden, Videojuego juego, String titulo, String imagen,
                     BigDecimal precio, int cantidad) {
        this.orden = orden;
        this.juego = juego;
        this.titulo = titulo;
        this.imagen = imagen;
        this.precio = precio;
        this.cantidad = cantidad;
    }

    public Long getId() { return id; }
    public Orden getOrden() { return orden; }
    public void setOrden(Orden orden) { this.orden = orden; }
    public Videojuego getJuego() { return juego; }
    public String getTitulo() { return titulo; }
    public String getImagen() { return imagen; }
    public BigDecimal getPrecio() { return precio; }
    public int getCantidad() { return cantidad; }
}
