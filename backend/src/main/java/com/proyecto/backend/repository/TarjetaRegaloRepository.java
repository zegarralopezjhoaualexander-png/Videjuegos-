package com.proyecto.backend.repository;

import com.proyecto.backend.model.TarjetaRegalo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TarjetaRegaloRepository extends JpaRepository<TarjetaRegalo, Long> {
    Optional<TarjetaRegalo> findByCodigoIgnoreCase(String codigo);
    boolean existsByCodigoIgnoreCase(String codigo);
}
