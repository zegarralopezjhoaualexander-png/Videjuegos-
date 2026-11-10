package com.proyecto.backend.service;

import com.proyecto.backend.dto.ConfiguracionPagoDto;
import com.proyecto.backend.dto.CrearPagoIntentDto;
import com.proyecto.backend.dto.PagoIntentRespuestaDto;
import com.proyecto.backend.dto.PagoYapeDto;
import com.proyecto.backend.dto.PagoYapeRespuestaDto;
import com.proyecto.backend.dto.SaldoTarjetaRegaloDto;
import com.proyecto.backend.exception.ErrorApi;
import com.proyecto.backend.model.BibliotecaItem;
import com.proyecto.backend.model.Carrito;
import com.proyecto.backend.model.CarritoItem;
import com.proyecto.backend.model.EstadoOrden;
import com.proyecto.backend.model.MetodoPago;
import com.proyecto.backend.model.Orden;
import com.proyecto.backend.model.OrdenItem;
import com.proyecto.backend.model.TarjetaRegalo;
import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.model.Videojuego;
import com.proyecto.backend.repository.BibliotecaItemRepository;
import com.proyecto.backend.repository.CarritoRepository;
import com.proyecto.backend.repository.OrdenRepository;
import com.proyecto.backend.repository.TarjetaRegaloRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
import com.stripe.model.StripeObject;
import com.stripe.net.RequestOptions;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@Service
public class PagoService {

    private static final Logger log = LoggerFactory.getLogger(PagoService.class);
    private static final BigDecimal CIEN = new BigDecimal("100");
    private static final BigDecimal TIPO_CAMBIO_POR_DEFECTO = new BigDecimal("3.75");

    private final OrdenRepository ordenes;
    private final CarritoRepository carritos;
    private final BibliotecaItemRepository biblioteca;
    private final TarjetaRegaloRepository tarjetas;
    private final TarjetaRegaloService tarjetaRegaloService;
    private final CalculadoraCarrito calculadora;
    private final OrdenService ordenService;
    private final CorreoService correoService;
    private final PasarelaYape pasarelaYape;
    private final BigDecimal tipoCambioPen;
    private final String stripeSecretKey;
    private final String stripeWebhookSecret;

    public PagoService(OrdenRepository ordenes,
                       CarritoRepository carritos,
                       BibliotecaItemRepository biblioteca,
                       TarjetaRegaloRepository tarjetas,
                       TarjetaRegaloService tarjetaRegaloService,
                       CalculadoraCarrito calculadora,
                       OrdenService ordenService,
                       CorreoService correoService,
                       PasarelaYape pasarelaYape,
                       @Value("${pago.tipo-cambio-pen:3.75}") BigDecimal tipoCambioPen,
                       @Value("${stripe.secret-key:}") String stripeSecretKey,
                       @Value("${stripe.webhook-secret:}") String stripeWebhookSecret) {
        this.ordenes = ordenes;
        this.carritos = carritos;
        this.biblioteca = biblioteca;
        this.tarjetas = tarjetas;
        this.tarjetaRegaloService = tarjetaRegaloService;
        this.calculadora = calculadora;
        this.ordenService = ordenService;
        this.correoService = correoService;
        this.pasarelaYape = pasarelaYape;
        this.tipoCambioPen = (tipoCambioPen == null
                || tipoCambioPen.compareTo(BigDecimal.ZERO) <= 0)
                ? TIPO_CAMBIO_POR_DEFECTO
                : tipoCambioPen;
        this.stripeSecretKey = stripeSecretKey == null ? "" : stripeSecretKey.trim();
        this.stripeWebhookSecret = stripeWebhookSecret == null ? "" : stripeWebhookSecret.trim();
    }

    @Transactional
    public PagoIntentRespuestaDto crearIntent(Usuario usuario, CrearPagoIntentDto datos) {
        Orden orden = prepararOrden(usuario, datos.metodo(), datos.codigoTarjetaRegalo());

        // Una tarjeta de regalo puede cubrir el total completo.
        if (orden.getTotal().compareTo(BigDecimal.ZERO) <= 0) {
            orden.marcarPagada();
            orden = ordenes.save(orden);
            finalizarCompra(orden);
            correoService.enviarConfirmacion(orden, ordenService.comprobante(orden));
            return respuesta(orden, null, false);
        }

        orden = ordenes.save(orden);
        PaymentIntent intent = crearPaymentIntent(orden, orden.getTotal());
        orden.setStripePaymentIntentId(intent.getId());
        orden = ordenes.save(orden);

        return respuesta(orden, intent.getClientSecret(), true);
    }

    @Transactional
    public PagoYapeRespuestaDto pagarConYape(Usuario usuario, PagoYapeDto datos) {
        Orden orden = prepararOrden(usuario, MetodoPago.YAPE, datos.codigoTarjetaRegalo());
        BigDecimal totalPen = convertirASoles(orden.getTotal());

        // Si una tarjeta de regalo cubre todo, no hace falta llamar a Yape.
        if (orden.getTotal().compareTo(BigDecimal.ZERO) <= 0) {
            orden.setReferenciaPago("Tarjeta de regalo");
            orden.marcarPagada();
            orden = ordenes.save(orden);
            finalizarCompra(orden);
            correoService.enviarConfirmacion(orden, ordenService.comprobante(orden));
            return respuestaYape(orden, totalPen, orden.getReferenciaPago());
        }

        PasarelaYape.ResultadoYape resultado = pasarelaYape.cobrar(
                datos.celular(), datos.codigoAprobacion(), totalPen);

        if (!resultado.aprobado()) {
            throw new ErrorApi(HttpStatus.PAYMENT_REQUIRED,
                    resultado.mensaje() == null
                            ? "El pago con Yape fue rechazado. Inténtalo de nuevo."
                            : resultado.mensaje());
        }

        orden.setReferenciaPago(resultado.referencia());
        orden.marcarPagada();
        orden = ordenes.save(orden);
        finalizarCompra(orden);
        correoService.enviarConfirmacion(orden, ordenService.comprobante(orden));

        return respuestaYape(orden, totalPen, orden.getReferenciaPago());
    }

    public SaldoTarjetaRegaloDto consultarSaldoTarjetaRegalo(String codigo) {
        TarjetaRegalo tarjeta = tarjetaRegaloService.validar(codigo);
        return new SaldoTarjetaRegaloDto(tarjeta.getCodigo(), normalizar(tarjeta.getSaldo()));
    }

    public ConfiguracionPagoDto configuracion() {
        return new ConfiguracionPagoDto(tipoCambioPen.setScale(2, RoundingMode.HALF_UP));
    }

    private Orden prepararOrden(Usuario usuario, MetodoPago metodo, String codigoRegaloRaw) {
        Carrito carrito = carritos.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new ErrorApi(HttpStatus.BAD_REQUEST,
                        "Tu carrito está vacío"));
        if (carrito.getItems().isEmpty()) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST, "Tu carrito está vacío");
        }

        String codigoRegalo = limpiar(codigoRegaloRaw);
        if (metodo == MetodoPago.TARJETA_REGALO && codigoRegalo == null) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST,
                    "Ingresa el código de la tarjeta de regalo");
        }

        CalculadoraCarrito.ResultadoCarrito resultado =
                calculadora.calcular(carrito.getItems(), carrito.getCupon());
        BigDecimal subtotal = normalizar(resultado.subtotal());
        BigDecimal descuento = normalizar(resultado.descuento());
        BigDecimal impuesto = normalizar(resultado.impuesto());
        BigDecimal total = normalizar(resultado.total());

        BigDecimal descuentoRegalo = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        TarjetaRegalo tarjeta = null;
        if (codigoRegalo != null) {
            tarjeta = tarjetaRegaloService.validar(codigoRegalo);
            descuentoRegalo = tarjeta.getSaldo().min(total)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal totalFinal = total.subtract(descuentoRegalo)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        if (metodo == MetodoPago.TARJETA_REGALO
                && totalFinal.compareTo(BigDecimal.ZERO) > 0) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST,
                    "El saldo de la tarjeta de regalo no cubre el total de la compra");
        }

        Orden orden = new Orden(usuario, metodo,
                ordenService.generarCodigoOrden(), subtotal, descuento, impuesto,
                descuentoRegalo, totalFinal);

        if (tarjeta != null) {
            orden.setTarjetaRegaloCodigo(tarjeta.getCodigo());
            tarjeta.consumir(descuentoRegalo);
            tarjetas.save(tarjeta);
        }

        for (CarritoItem item : carrito.getItems()) {
            Videojuego juego = item.getJuego();
            orden.agregarItem(new OrdenItem(
                    orden,
                    juego,
                    juego.getNombre(),
                    juego.getImagen(),
                    normalizar(juego.getPrecio()),
                    1));
        }

        return orden;
    }

    @Transactional
    public void procesarWebhook(String payload, String firma) {
        if (stripeWebhookSecret.isBlank()) {
            throw new ErrorApi(HttpStatus.SERVICE_UNAVAILABLE,
                    "El webhook de Stripe no está configurado");
        }
        if (firma == null || firma.isBlank()) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST,
                    "Falta la cabecera Stripe-Signature");
        }

        Event evento;
        try {
            evento = Webhook.constructEvent(payload, firma, stripeWebhookSecret);
        } catch (SignatureVerificationException ex) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST, "Firma de webhook inválida");
        }

        String tipo = evento.getType();
        if (!tipo.startsWith("payment_intent.")) {
            return;
        }

        StripeObject objeto = evento.getDataObjectDeserializer().getObject().orElse(null);
        if (!(objeto instanceof PaymentIntent intent)) {
            log.warn("Webhook {} sin PaymentIntent deserializable", tipo);
            return;
        }

        Orden orden = buscarOrden(intent);
        if (orden == null) {
            log.warn("Webhook {} para un PaymentIntent sin orden asociada: {}",
                    tipo, intent.getId());
            return;
        }

        if ("payment_intent.succeeded".equals(tipo)) {
            if (orden.getEstado() == EstadoOrden.PAGADA) {
                return;
            }
            registrarTarjeta(orden, intent);
            orden.marcarPagada();
            ordenes.save(orden);
            finalizarCompra(orden);
            correoService.enviarConfirmacion(orden, ordenService.comprobante(orden));
            return;
        }

        if ("payment_intent.payment_failed".equals(tipo)
                || "payment_intent.canceled".equals(tipo)) {
            if (orden.getEstado() == EstadoOrden.PAGADA
                    || orden.getEstado() == EstadoOrden.FALLIDA) {
                return;
            }
            String mensaje = intent.getLastPaymentError() == null
                    ? "El pago no se pudo completar"
                    : intent.getLastPaymentError().getMessage();
            orden.marcarFallida(mensaje);
            ordenes.save(orden);
            tarjetaRegaloService.reembolsar(orden.getTarjetaRegaloCodigo(),
                    orden.getDescuentoRegalo());
        }
    }

    private PagoIntentRespuestaDto respuesta(Orden orden, String clientSecret,
                                             boolean requierePago) {
        return new PagoIntentRespuestaDto(
                orden.getCodigoOrden(),
                clientSecret,
                requierePago,
                orden.getTotal(),
                orden.getDescuentoRegalo(),
                orden.getMetodo(),
                orden.getEstado());
    }

    private PagoYapeRespuestaDto respuestaYape(Orden orden, BigDecimal totalPen,
                                               String referencia) {
        return new PagoYapeRespuestaDto(
                orden.getCodigoOrden(),
                orden.getTotal(),
                totalPen,
                tipoCambioPen.setScale(2, RoundingMode.HALF_UP),
                orden.getDescuentoRegalo(),
                orden.getMetodo(),
                orden.getEstado(),
                referencia);
    }

    private PaymentIntent crearPaymentIntent(Orden orden, BigDecimal total) {
        if (stripeSecretKey.isBlank()) {
            throw new ErrorApi(HttpStatus.SERVICE_UNAVAILABLE,
                    "Stripe no está configurado. Define STRIPE_SECRET_KEY.");
        }

        long centavos = total.multiply(CIEN)
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

        PaymentIntentCreateParams parametros = PaymentIntentCreateParams.builder()
                .setAmount(centavos)
                .setCurrency("usd")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build())
                .setDescription("Orden " + orden.getCodigoOrden())
                .putAllMetadata(Map.of(
                        "codigoOrden", orden.getCodigoOrden(),
                        "ordenId", String.valueOf(orden.getId())))
                .build();

        try {
            return PaymentIntent.create(parametros, opcionesStripe());
        } catch (StripeException ex) {
            log.warn("Stripe rechazó la creación del PaymentIntent: {}", ex.getMessage());
            throw new ErrorApi(HttpStatus.BAD_GATEWAY,
                    "No se pudo iniciar el pago con Stripe. Inténtalo de nuevo.");
        }
    }

    private Orden buscarOrden(PaymentIntent intent) {
        if (intent.getId() != null) {
            Optional<Orden> porIntent = ordenes.findByStripePaymentIntentId(intent.getId());
            if (porIntent.isPresent()) {
                return porIntent.get();
            }
        }

        String codigo = intent.getMetadata() == null
                ? null
                : intent.getMetadata().get("codigoOrden");
        if (codigo == null || codigo.isBlank()) {
            return null;
        }
        return ordenes.findByCodigoOrden(codigo).orElse(null);
    }

    private void registrarTarjeta(Orden orden, PaymentIntent intent) {
        String paymentMethodId = intent.getPaymentMethod();
        if (paymentMethodId == null || paymentMethodId.isBlank()) {
            return;
        }

        try {
            PaymentMethod metodo = PaymentMethod.retrieve(paymentMethodId, opcionesStripe());
            PaymentMethod.Card tarjeta = metodo.getCard();
            if (tarjeta != null) {
                orden.registrarTarjeta(tarjeta.getBrand(), tarjeta.getLast4());
            } else if (metodo.getType() != null) {
                orden.registrarTarjeta(metodo.getType(), null);
            }
        } catch (StripeException ex) {
            log.warn("No se pudieron obtener los datos de la tarjeta de la orden {}: {}",
                    orden.getCodigoOrden(), ex.getMessage());
        }
    }

    private void finalizarCompra(Orden orden) {
        Carrito carrito = carritos.findByUsuarioId(orden.getUsuario().getId()).orElse(null);

        for (OrdenItem item : orden.getItems()) {
            if (!biblioteca.existsByUsuarioIdAndJuegoId(
                    orden.getUsuario().getId(), item.getJuego().getId())) {
                biblioteca.save(new BibliotecaItem(
                        orden.getUsuario(), item.getJuego(), LocalDate.now()));
            }

            if (carrito != null) {
                carrito.getItems().stream()
                        .filter(carritoItem -> carritoItem.getJuego().getId()
                                .equals(item.getJuego().getId()))
                        .findFirst()
                        .ifPresent(carrito::quitarItem);
            }
        }

        if (carrito != null) {
            if (carrito.getItems().isEmpty()) {
                carrito.setCupon(null);
            }
            carritos.save(carrito);
        }
    }

    private RequestOptions opcionesStripe() {
        return RequestOptions.builder().setApiKey(stripeSecretKey).build();
    }

    private BigDecimal convertirASoles(BigDecimal totalUsd) {
        return normalizar(totalUsd.multiply(tipoCambioPen));
    }

    private String limpiar(String valor) {
        if (valor == null) {
            return null;
        }
        String limpio = valor.trim();
        return limpio.isEmpty() ? null : limpio;
    }

    private BigDecimal normalizar(BigDecimal valor) {
        return (valor == null ? BigDecimal.ZERO : valor)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
