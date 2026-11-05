package com.proyecto.backend.controller;

import com.proyecto.backend.model.BibliotecaItem;
import com.proyecto.backend.model.Cupon;
import com.proyecto.backend.model.Sesion;
import com.proyecto.backend.model.TipoCupon;
import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.model.Videojuego;
import com.proyecto.backend.repository.BibliotecaItemRepository;
import com.proyecto.backend.repository.CarritoRepository;
import com.proyecto.backend.repository.CuponRepository;
import com.proyecto.backend.repository.SesionRepository;
import com.proyecto.backend.repository.UsuarioRepository;
import com.proyecto.backend.repository.VideojuegoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CarritoControllerTest {

    private static final String TOKEN = "token-carrito-test";

    @Autowired private MockMvc mockMvc;
    @Autowired private CarritoRepository carritos;
    @Autowired private BibliotecaItemRepository biblioteca;
    @Autowired private SesionRepository sesiones;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private CuponRepository cupones;
    @Autowired private VideojuegoRepository juegos;

    private Usuario usuario;
    private Videojuego juego;

    @BeforeEach
    void prepararDatos() {
        carritos.deleteAll();
        biblioteca.deleteAll();
        sesiones.deleteAll();
        usuarios.deleteAll();
        cupones.deleteAll();
        juegos.deleteAll();

        usuario = usuarios.save(new Usuario("u-carrito", "hash", "Cliente", "Prueba",
                "carrito@example.com", LocalDate.of(2000, 1, 1)));
        sesiones.save(new Sesion(TOKEN, usuario, Instant.now().plusSeconds(3600)));

        juego = juegos.save(juego("Juego Test", "59.99"));
    }

    @Test
    void agregaUnJuegoAlCarrito() throws Exception {
        mockMvc.perform(conAuth(post("/api/tienda/carrito/items"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"juegoId\":" + juego.getId() + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cantidadItems").value(1))
                .andExpect(jsonPath("$.items[0].juegoId").value(juego.getId()))
                .andExpect(jsonPath("$.items[0].titulo").value("Juego Test"))
                .andExpect(jsonPath("$.subtotal").value(59.99))
                .andExpect(jsonPath("$.descuento").value(0.00))
                .andExpect(jsonPath("$.impuesto").value(10.80))
                .andExpect(jsonPath("$.total").value(70.79));
    }

    @Test
    void noPermiteAgregarElMismoJuegoDosVeces() throws Exception {
        agregarJuego();

        mockMvc.perform(conAuth(post("/api/tienda/carrito/items"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"juegoId\":" + juego.getId() + "}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje", containsString("ya está en el carrito")));
    }

    @Test
    void noPermiteAgregarUnJuegoQueYaPosee() throws Exception {
        biblioteca.save(new BibliotecaItem(usuario, juego, LocalDate.now()));

        mockMvc.perform(conAuth(post("/api/tienda/carrito/items"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"juegoId\":" + juego.getId() + "}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje").value("Ya posees este videojuego"));
    }

    @Test
    void eliminaUnJuegoDelCarrito() throws Exception {
        agregarJuego();

        mockMvc.perform(conAuth(delete("/api/tienda/carrito/items/" + juego.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cantidadItems").value(0))
                .andExpect(jsonPath("$.subtotal").value(0.00))
                .andExpect(jsonPath("$.total").value(0.00));
    }

    @Test
    void aplicaUnCuponPorcentajeValido() throws Exception {
        crearCupon("BIENVENIDO10", TipoCupon.PORCENTAJE, "10.00",
                LocalDate.now().minusDays(1), LocalDate.now().plusDays(1));
        agregarJuego();

        mockMvc.perform(conAuth(post("/api/tienda/carrito/cupon"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"bienvenido10\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cuponCodigo").value("BIENVENIDO10"))
                .andExpect(jsonPath("$.descuento").value(6.00))
                .andExpect(jsonPath("$.impuesto").value(9.72))
                .andExpect(jsonPath("$.total").value(63.71));
    }

    @Test
    void rechazaUnCuponInexistente() throws Exception {
        mockMvc.perform(conAuth(post("/api/tienda/carrito/cupon"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"NOEXISTE\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje").value("Cupón no encontrado"));
    }

    @Test
    void rechazaUnCuponVencido() throws Exception {
        crearCupon("VIEJO", TipoCupon.MONTO_FIJO, "5.00",
                LocalDate.now().minusDays(10), LocalDate.now().minusDays(1));

        mockMvc.perform(conAuth(post("/api/tienda/carrito/cupon"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"VIEJO\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("El cupón está vencido"));
    }

    @Test
    void exigeAutenticacionParaVerElCarrito() throws Exception {
        mockMvc.perform(get("/api/tienda/carrito"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Debes iniciar sesión"));
    }

    private void agregarJuego() throws Exception {
        mockMvc.perform(conAuth(post("/api/tienda/carrito/items"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"juegoId\":" + juego.getId() + "}"))
                .andExpect(status().isOk());
    }

    private MockHttpServletRequestBuilder conAuth(MockHttpServletRequestBuilder peticion) {
        return peticion.header("Authorization", "Bearer " + TOKEN);
    }

    private Videojuego juego(String nombre, String precio) {
        Videojuego nuevo = new Videojuego();
        nuevo.setNombre(nombre);
        nuevo.setGenero("Aventura");
        nuevo.setPrecio(new BigDecimal(precio));
        nuevo.setStock(10);
        return nuevo;
    }

    private void crearCupon(String codigo, TipoCupon tipo, String valor,
                            LocalDate inicio, LocalDate fin) {
        Cupon cupon = new Cupon();
        cupon.setCodigo(codigo);
        cupon.setTipo(tipo);
        cupon.setValor(new BigDecimal(valor));
        cupon.setActivo(true);
        cupon.setFechaInicio(inicio);
        cupon.setFechaFin(fin);
        cupones.save(cupon);
    }
}
