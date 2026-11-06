package com.proyecto.backend.repository;

import com.proyecto.backend.model.BibliotecaItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BibliotecaItemRepository extends JpaRepository<BibliotecaItem, Long> {
    boolean existsByUsuarioIdAndJuegoId(Long usuarioId, Long juegoId);
}
