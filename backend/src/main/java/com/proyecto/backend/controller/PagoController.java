package com.proyecto.backend.controller;

import com.proyecto.backend.dto.ConfiguracionPagoDto;
import com.proyecto.backend.dto.CrearPagoIntentDto;
import com.proyecto.backend.dto.PagoIntentRespuestaDto;
import com.proyecto.backend.dto.PagoYapeDto;
import com.proyecto.backend.dto.PagoYapeRespuestaDto;
import com.proyecto.backend.dto.SaldoTarjetaRegaloDto;
import com.proyecto.backend.dto.VerificarTarjetaRegaloDto;
import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.service.PagoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagos;

    public PagoController(PagoService pagos) {
        this.pagos = pagos;
    }

    @GetMapping("/configuracion")
    public ConfiguracionPagoDto configuracion() {
        return pagos.configuracion();
    }

    @PostMapping("/intent")
    public PagoIntentRespuestaDto crearIntent(@Valid @RequestBody CrearPagoIntentDto datos,
                                              @RequestAttribute("usuario") Usuario usuario) {
        return pagos.crearIntent(usuario, datos);
    }

    @PostMapping("/yape")
    public PagoYapeRespuestaDto pagarConYape(@Valid @RequestBody PagoYapeDto datos,
                                             @RequestAttribute("usuario") Usuario usuario) {
        return pagos.pagarConYape(usuario, datos);
    }

    @PostMapping("/tarjeta-regalo")
    public SaldoTarjetaRegaloDto verificarTarjetaRegalo(
            @Valid @RequestBody VerificarTarjetaRegaloDto datos) {
        return pagos.consultarSaldoTarjetaRegalo(datos.codigo());
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String firma) {
        pagos.procesarWebhook(payload, firma);
        return ResponseEntity.ok("ok");
    }
}
