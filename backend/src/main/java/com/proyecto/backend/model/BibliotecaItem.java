package com.proyecto.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;

@Entity
@Table(name = "biblioteca_items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "videojuego_id"}))
public class BibliotecaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(optional = false)
    @JoinColumn(name = "videojuego_id", nullable = false)
    private Videojuego juego;

    @Column(nullable = false)
    private LocalDate fechaAdquisicion;

    public BibliotecaItem() {}

    public BibliotecaItem(Usuario usuario, Videojuego juego, LocalDate fechaAdquisicion) {
        this.usuario = usuario;
        this.juego = juego;
        this.fechaAdquisicion = fechaAdquisicion;
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public Videojuego getJuego() { return juego; }
    public LocalDate getFechaAdquisicion() { return fechaAdquisicion; }
}
