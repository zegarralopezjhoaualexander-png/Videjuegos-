package com.proyecto.backend.service;

import com.proyecto.backend.dto.CarritoResumenDto;
import com.proyecto.backend.exception.ErrorApi;
import com.proyecto.backend.model.Carrito;
import com.proyecto.backend.model.CarritoItem;
import com.proyecto.backend.model.Cupon;
import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.model.Videojuego;
import com.proyecto.backend.repository.BibliotecaItemRepository;
import com.proyecto.backend.repository.CarritoRepository;
import com.proyecto.backend.repository.CuponRepository;
import com.proyecto.backend.repository.VideojuegoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class CarritoService {

    private final CarritoRepository carritos;
    private final VideojuegoRepository juegos;
    private final CuponRepository cupones;
    private final BibliotecaItemRepository biblioteca;
    private final CalculadoraCarrito calculadora;

    public CarritoService(CarritoRepository carritos,
                          VideojuegoRepository juegos,
                          CuponRepository cupones,
                          BibliotecaItemRepository biblioteca,
                          CalculadoraCarrito calculadora) {
        this.carritos = carritos;
        this.juegos = juegos;
        this.cupones = cupones;
        this.biblioteca = biblioteca;
        this.calculadora = calculadora;
    }

    @Transactional
    public CarritoResumenDto obtener(Usuario usuario) {
        return resumen(cargarOCrear(usuario));
    }

    @Transactional
    public CarritoResumenDto agregar(Usuario usuario, Long juegoId) {
        Carrito carrito = cargarOCrear(usuario);
        Videojuego juego = juegos.findById(juegoId)
                .orElseThrow(() -> new ErrorApi(HttpStatus.NOT_FOUND, "Juego no encontrado"));

        if (biblioteca.existsByUsuarioIdAndJuegoId(usuario.getId(), juegoId)) {
            throw new ErrorApi(HttpStatus.CONFLICT, "Ya posees este videojuego");
        }
        boolean yaEstaEnCarrito = carrito.getItems().stream()
                .anyMatch(item -> item.getJuego().getId().equals(juegoId));
        if (yaEstaEnCarrito) {
            throw new ErrorApi(HttpStatus.CONFLICT, "Este videojuego ya está en el carrito");
        }

        carrito.agregarItem(new CarritoItem(carrito, juego));
        carritos.save(carrito);
        return resumen(carrito);
    }

    @Transactional
    public CarritoResumenDto eliminar(Usuario usuario, Long juegoId) {
        Carrito carrito = cargarOCrear(usuario);
        if (!juegos.existsById(juegoId)) {
            throw new ErrorApi(HttpStatus.NOT_FOUND, "Juego no encontrado");
        }
        CarritoItem item = carrito.getItems().stream()
                .filter(elemento -> elemento.getJuego().getId().equals(juegoId))
                .findFirst()
                .orElseThrow(() -> new ErrorApi(HttpStatus.NOT_FOUND,
                        "El videojuego no está en el carrito"));

        carrito.quitarItem(item);
        carritos.save(carrito);
        return resumen(carrito);
    }

    @Transactional
    public CarritoResumenDto aplicarCupon(Usuario usuario, String codigo) {
        Carrito carrito = cargarOCrear(usuario);
        Cupon cupon = cupones.findByCodigoIgnoreCase(codigo.trim())
                .orElseThrow(() -> new ErrorApi(HttpStatus.NOT_FOUND, "Cupón no encontrado"));

        validarCupon(cupon);
        carrito.setCupon(cupon);
        carritos.save(carrito);
        return resumen(carrito);
    }

    @Transactional
    public CarritoResumenDto quitarCupon(Usuario usuario) {
        Carrito carrito = cargarOCrear(usuario);
        carrito.setCupon(null);
        carritos.save(carrito);
        return resumen(carrito);
    }

    @Transactional
    public CarritoResumenDto vaciar(Usuario usuario) {
        Carrito carrito = cargarOCrear(usuario);
        carrito.vaciar();
        carritos.save(carrito);
        return resumen(carrito);
    }

    private Carrito cargarOCrear(Usuario usuario) {
        return carritos.findByUsuarioId(usuario.getId())
                .orElseGet(() -> carritos.save(new Carrito(usuario)));
    }

    private void validarCupon(Cupon cupon) {
        LocalDate hoy = LocalDate.now();
        if (!cupon.isActivo()) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST, "El cupón está inactivo");
        }
        if (cupon.getFechaInicio() != null && hoy.isBefore(cupon.getFechaInicio())) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST, "El cupón aún no está vigente");
        }
        if (cupon.getFechaFin() != null && hoy.isAfter(cupon.getFechaFin())) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST, "El cupón está vencido");
        }
        if (!cupon.tieneUsosDisponibles()) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST, "El cupón no tiene usos disponibles");
        }
    }

    private CarritoResumenDto resumen(Carrito carrito) {
        List<CarritoResumenDto.ItemCarritoDto> items = carrito.getItems().stream()
                .map(item -> new CarritoResumenDto.ItemCarritoDto(
                        item.getJuego().getId(),
                        item.getJuego().getNombre(),
                        item.getJuego().getImagen(),
                        normalizar(item.getJuego().getPrecio())))
                .toList();

        CalculadoraCarrito.ResultadoCarrito resultado =
                calculadora.calcular(carrito.getItems(), carrito.getCupon());

        return new CarritoResumenDto(
                items,
                items.size(),
                resultado.subtotal(),
                resultado.descuento(),
                carrito.getCupon() == null ? null : carrito.getCupon().getCodigo(),
                resultado.impuesto(),
                resultado.total());
    }

    private BigDecimal normalizar(BigDecimal valor) {
        return (valor == null ? BigDecimal.ZERO : valor)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
