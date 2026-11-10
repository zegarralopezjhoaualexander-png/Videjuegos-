package com.proyecto.backend.service;

import com.proyecto.backend.dto.ComprobanteDto;
import com.proyecto.backend.model.Orden;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class CorreoService {

    private static final Logger log = LoggerFactory.getLogger(CorreoService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String remitente;
    private final boolean habilitado;

    public CorreoService(ObjectProvider<JavaMailSender> mailSender,
                         @Value("${app.correo.remitente:no-reply@videojuegos.test}") String remitente,
                         @Value("${app.correo.habilitado:true}") boolean habilitado) {
        this.mailSender = mailSender;
        this.remitente = remitente;
        this.habilitado = habilitado;
    }

    public void enviarConfirmacion(Orden orden, ComprobanteDto comprobante) {
        String destino = orden.getUsuario().getCorreo();

        if (!habilitado) {
            log.info("Correo deshabilitado. Confirmación de {} para {}", comprobante.codigoOrden(), destino);
            return;
        }

        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.warn("No hay JavaMailSender configurado. No se envió la confirmación de {}",
                    comprobante.codigoOrden());
            return;
        }

        if (destino == null || destino.isBlank()) {
            log.warn("El usuario {} no tiene correo; no se envió la confirmación de {}",
                    orden.getUsuario().getId(), comprobante.codigoOrden());
            return;
        }

        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom(remitente);
            mensaje.setTo(destino);
            mensaje.setSubject("Confirmación de compra " + comprobante.codigoOrden());
            mensaje.setText(texto(comprobante));
            sender.send(mensaje);
        } catch (Exception ex) {
            // Un fallo de correo no debe hacer que Stripe reintente el webhook.
            log.warn("No se pudo enviar el correo de confirmación de {}: {}",
                    comprobante.codigoOrden(), ex.getMessage());
        }
    }

    private String texto(ComprobanteDto comprobante) {
        StringBuilder texto = new StringBuilder();
        texto.append("¡Gracias por tu compra en la tienda de videojuegos!\n\n");
        texto.append("Código de orden: ").append(comprobante.codigoOrden()).append("\n");
        texto.append("Estado: ").append(comprobante.estado()).append("\n");
        texto.append("Método de pago: ").append(comprobante.metodo()).append("\n");
        if (comprobante.referenciaPago() != null
                && !comprobante.referenciaPago().isBlank()) {
            texto.append("Referencia de pago: ")
                    .append(comprobante.referenciaPago()).append("\n");
        }
        texto.append("\nArtículos:\n");
        for (ComprobanteDto.ItemComprobanteDto item : comprobante.items()) {
            texto.append("- ").append(item.titulo())
                    .append(" x").append(item.cantidad())
                    .append(": $").append(item.precio())
                    .append("\n");
        }
        texto.append("\nSubtotal: $").append(comprobante.subtotal());
        if (comprobante.descuento() != null
                && comprobante.descuento().signum() > 0) {
            texto.append("\nDescuento por cupón: -$").append(comprobante.descuento());
        }
        if (comprobante.descuentoRegalo() != null
                && comprobante.descuentoRegalo().signum() > 0) {
            texto.append("\nDescuento por tarjeta de regalo: -$").append(comprobante.descuentoRegalo());
        }
        texto.append("\nImpuesto: $").append(comprobante.impuesto());
        texto.append("\nTotal: $").append(comprobante.total()).append("\n\n");
        texto.append("Puedes consultar tu comprobante digital en la tienda con tu código de orden.\n");
        return texto.toString();
    }
}
