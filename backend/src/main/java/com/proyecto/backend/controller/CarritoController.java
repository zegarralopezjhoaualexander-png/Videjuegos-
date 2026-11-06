package com.proyecto.backend.controller;

import com.proyecto.backend.dto.AgregarItemCarritoDto;
import com.proyecto.backend.dto.AplicarCuponDto;
import com.proyecto.backend.dto.CarritoResumenDto;
import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.service.CarritoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tienda/carrito")
public class CarritoController {

    private final CarritoService servicio;

    public CarritoController(CarritoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public CarritoResumenDto obtener(@RequestAttribute("usuario") Usuario usuario) {
        return servicio.obtener(usuario);
    }

    @PostMapping("/items")
    public CarritoResumenDto agregar(@Valid @RequestBody AgregarItemCarritoDto datos,
                                     @RequestAttribute("usuario") Usuario usuario) {
        return servicio.agregar(usuario, datos.juegoId());
    }

    @DeleteMapping("/items/{juegoId}")
    public CarritoResumenDto eliminar(@PathVariable Long juegoId,
                                      @RequestAttribute("usuario") Usuario usuario) {
        return servicio.eliminar(usuario, juegoId);
    }

    @PostMapping("/cupon")
    public CarritoResumenDto aplicarCupon(@Valid @RequestBody AplicarCuponDto datos,
                                          @RequestAttribute("usuario") Usuario usuario) {
        return servicio.aplicarCupon(usuario, datos.codigo());
    }

    @DeleteMapping("/cupon")
    public CarritoResumenDto quitarCupon(@RequestAttribute("usuario") Usuario usuario) {
        return servicio.quitarCupon(usuario);
    }

    @DeleteMapping
    public CarritoResumenDto vaciar(@RequestAttribute("usuario") Usuario usuario) {
        return servicio.vaciar(usuario);
    }
}
