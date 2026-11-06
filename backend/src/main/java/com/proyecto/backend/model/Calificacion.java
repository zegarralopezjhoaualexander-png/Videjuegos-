package com.proyecto.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "calificaciones",
        uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "videojuego_id"}))
public class Calificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "videojuego_id", nullable = false)
    private Long videojuegoId;

    @Column(nullable = false)
    private int puntaje;

    public Calificacion() {}

    public Calificacion(Long usuarioId, Long videojuegoId, int puntaje) {
        this.usuarioId = usuarioId;
        this.videojuegoId = videojuegoId;
        this.puntaje = puntaje;
    }

    public Long getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public Long getVideojuegoId() { return videojuegoId; }
    public int getPuntaje() { return puntaje; }
    public void setPuntaje(int puntaje) { this.puntaje = puntaje; }
}