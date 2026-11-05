package com.proyecto.backend.repository;

import com.proyecto.backend.model.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Long> {
    Optional<Carrito> findByUsuarioId(Long usuarioId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Carrito c set c.cupon = null where c.cupon.id = :cuponId")
    int quitarCuponDeCarritos(@Param("cuponId") Long cuponId);
}
