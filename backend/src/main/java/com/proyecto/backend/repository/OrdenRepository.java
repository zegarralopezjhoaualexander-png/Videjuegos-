package com.proyecto.backend.repository;

import com.proyecto.backend.model.Orden;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrdenRepository extends JpaRepository<Orden, Long> {
    Optional<Orden> findByCodigoOrden(String codigoOrden);
    Optional<Orden> findByCodigoOrdenAndUsuarioId(String codigoOrden, Long usuarioId);
    Optional<Orden> findByStripePaymentIntentId(String stripePaymentIntentId);
    boolean existsByCodigoOrden(String codigoOrden);
}
