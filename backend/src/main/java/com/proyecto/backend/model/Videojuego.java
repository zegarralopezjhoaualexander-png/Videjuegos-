package com.proyecto.backend.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
public class Videojuego {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;

    // La categoría de la tienda (Acción, RPG, Deportes...).
    @NotBlank(message = "La categoría es obligatoria")
    @Size(max = 50, message = "La categoría no puede superar los 50 caracteres")
    private String genero;

    @Size(max = 50, message = "La plataforma no puede superar los 50 caracteres")
    private String plataforma;

    @Min(value = 1950, message = "El año debe ser 1950 o posterior")
    @Max(value = 2100, message = "El año no puede ser mayor a 2100")
    private Integer anio;

    @Min(value = 1, message = "La puntuación mínima es 1")
    @Max(value = 10, message = "La puntuación máxima es 10")
    private Integer puntuacion;

    @Column(length = 500)
    @Size(max = 500, message = "El enlace de la imagen no puede superar los 500 caracteres")
    @Pattern(regexp = "^(https?://|img/).+",
            message = "La imagen debe ser un enlace http(s) o una ruta que empiece por img/")
    private String imagen;

    @Column(length = 1000)
    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.00", message = "El precio no puede ser negativo")
    @DecimalMax(value = "9999.99", message = "El precio no puede superar 9999.99")
    @Digits(integer = 4, fraction = 2, message = "El precio admite como máximo 2 decimales")
    @Column(precision = 10, scale = 2)
    private BigDecimal precio;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    @Max(value = 100000, message = "El stock no puede superar 100000")
    private Integer stock;

    @Size(max = 100, message = "El desarrollador no puede superar los 100 caracteres")
    private String desarrollador;

    @Past(message = "La fecha de lanzamiento debe ser anterior a hoy")
    private LocalDate fechaLanzamiento;

    @Column(length = 500)
    @Size(max = 500, message = "El enlace del tráiler no puede superar los 500 caracteres")
    @Pattern(regexp = "^https?://.+", message = "El tráiler debe ser un enlace http(s)")
    private String trailerUrl;

    @Column(length = 2000)
    @Size(max = 2000, message = "Los requisitos mínimos no pueden superar los 2000 caracteres")
    private String requisitosMinimos;

    @Column(length = 2000)
    @Size(max = 2000, message = "Los requisitos recomendados no pueden superar los 2000 caracteres")
    private String requisitosRecomendados;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "videojuego_galeria", joinColumns = @JoinColumn(name = "videojuego_id"))
    @Column(name = "url", length = 500)
    private List<String> galeria;

    public Videojuego() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }
    public String getPlataforma() { return plataforma; }
    public void setPlataforma(String plataforma) { this.plataforma = plataforma; }
    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
    public Integer getPuntuacion() { return puntuacion; }
    public void setPuntuacion(Integer puntuacion) { this.puntuacion = puntuacion; }
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public String getDesarrollador() { return desarrollador; }
    public void setDesarrollador(String desarrollador) { this.desarrollador = desarrollador; }
    public LocalDate getFechaLanzamiento() { return fechaLanzamiento; }
    public void setFechaLanzamiento(LocalDate fechaLanzamiento) { this.fechaLanzamiento = fechaLanzamiento; }
    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }
    public String getRequisitosMinimos() { return requisitosMinimos; }
    public void setRequisitosMinimos(String requisitosMinimos) { this.requisitosMinimos = requisitosMinimos; }
    public String getRequisitosRecomendados() { return requisitosRecomendados; }
    public void setRequisitosRecomendados(String requisitosRecomendados) { this.requisitosRecomendados = requisitosRecomendados; }
    public List<String> getGaleria() { return galeria; }
    public void setGaleria(List<String> galeria) { this.galeria = galeria; }
}