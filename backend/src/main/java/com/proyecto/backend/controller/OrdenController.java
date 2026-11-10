package com.proyecto.backend.controller;

import com.proyecto.backend.dto.ComprobanteDto;
import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.service.OrdenService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenController {

    private final OrdenService ordenes;

    public OrdenController(OrdenService ordenes) {
        this.ordenes = ordenes;
    }

    @GetMapping("/{codigo}/comprobante")
    public ComprobanteDto comprobante(@PathVariable String codigo,
                                      @RequestAttribute("usuario") Usuario usuario) {
        return ordenes.obtenerComprobante(usuario, codigo);
    }
}
