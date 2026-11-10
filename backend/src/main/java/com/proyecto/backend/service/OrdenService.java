package com.proyecto.backend.service;

import com.proyecto.backend.dto.ComprobanteDto;
import com.proyecto.backend.exception.ErrorApi;
import com.proyecto.backend.model.Orden;
import com.proyecto.backend.model.OrdenItem;
import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.repository.OrdenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class OrdenService {

    private static final SecureRandom ALEATORIO = new SecureRandom();
    private static final String ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final DateTimeFormatter FECHA = DateTimeFormatter.BASIC_ISO_DATE;

    private final OrdenRepository ordenes;

    public OrdenService(OrdenRepository ordenes) {
        this.ordenes = ordenes;
    }

    public String generarCodigoOrden() {
        String codigo;
        do {
            StringBuilder sufijo = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sufijo.append(ALFABETO.charAt(ALEATORIO.nextInt(ALFABETO.length())));
            }
            codigo = "ORD-" + LocalDate.now().format(FECHA) + "-" + sufijo;
        } while (ordenes.existsByCodigoOrden(codigo));
        return codigo;
    }

    @Transactional(readOnly = true)
    public ComprobanteDto obtenerComprobante(Usuario usuario, String codigo) {
        Orden orden = ordenes.findByCodigoOrdenAndUsuarioId(codigo.trim(), usuario.getId())
                .orElseThrow(() -> new ErrorApi(HttpStatus.NOT_FOUND,
                        "No encontramos el comprobante de esa orden"));
        return comprobante(orden);
    }

    public ComprobanteDto comprobante(Orden orden) {
        return new ComprobanteDto(
                orden.getCodigoOrden(),
                orden.getEstado(),
                orden.getFecha(),
                orden.getFechaPago(),
                orden.getMetodo(),
                orden.getUsuario().nombreCompleto(),
                orden.getUsuario().getCorreo(),
                orden.getItems().stream().map(this::item).toList(),
                orden.getSubtotal(),
                orden.getDescuento(),
                orden.getImpuesto(),
                orden.getDescuentoRegalo(),
                orden.getTotal(),
                orden.getMarcaTarjeta(),
                orden.getUltimosDigitos(),
                orden.getTarjetaRegaloCodigo(),
                orden.getReferenciaPago());
    }

    private ComprobanteDto.ItemComprobanteDto item(OrdenItem item) {
        return new ComprobanteDto.ItemComprobanteDto(
                item.getTitulo(),
                item.getImagen(),
                item.getPrecio(),
                item.getCantidad());
    }
}
