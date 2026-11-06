package com.proyecto.backend.service;

import com.proyecto.backend.exception.ErrorApi;
import com.proyecto.backend.model.Cupon;
import com.proyecto.backend.model.TipoCupon;
import com.proyecto.backend.repository.CarritoRepository;
import com.proyecto.backend.repository.CuponRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class CuponService {

    private final CuponRepository cupones;
    private final CarritoRepository carritos;

    public CuponService(CuponRepository cupones, CarritoRepository carritos) {
        this.cupones = cupones;
        this.carritos = carritos;
    }

    @Transactional(readOnly = true)
    public List<Cupon> listar() {
        return cupones.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Cupon> obtener(Long id) {
        return cupones.findById(id);
    }

    @Transactional
    public Cupon crear(Cupon datos) {
        datos.setId(null);
        normalizar(datos);
        validar(datos);
        if (cupones.existsByCodigoIgnoreCase(datos.getCodigo())) {
            throw new ErrorApi(HttpStatus.CONFLICT, "Ya existe un cupón con ese código");
        }
        return cupones.save(datos);
    }

    @Transactional
    public Optional<Cupon> actualizar(Long id, Cupon datos) {
        return cupones.findById(id).map(cupon -> {
            normalizar(datos);
            validar(datos);
            if (!cupon.getCodigo().equalsIgnoreCase(datos.getCodigo())
                    && cupones.existsByCodigoIgnoreCase(datos.getCodigo())) {
                throw new ErrorApi(HttpStatus.CONFLICT, "Ya existe un cupón con ese código");
            }
            copiarDatos(cupon, datos);
            return cupones.save(cupon);
        });
    }

    @Transactional
    public boolean eliminar(Long id) {
        if (!cupones.existsById(id)) {
            return false;
        }
        carritos.quitarCuponDeCarritos(id);
        cupones.deleteById(id);
        return true;
    }

    private void normalizar(Cupon datos) {
        if (datos.getCodigo() != null) {
            datos.setCodigo(datos.getCodigo().trim().toUpperCase(Locale.ROOT));
        }
    }

    private void validar(Cupon datos) {
        if (datos.getFechaInicio() != null && datos.getFechaFin() != null
                && datos.getFechaFin().isBefore(datos.getFechaInicio())) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST,
                    "La fecha de fin no puede ser anterior a la fecha de inicio");
        }
        if (datos.getTipo() == TipoCupon.PORCENTAJE
                && datos.getValor() != null
                && datos.getValor().compareTo(new BigDecimal("100")) > 0) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST,
                    "El porcentaje del cupón no puede superar 100");
        }
    }

    private void copiarDatos(Cupon destino, Cupon datos) {
        destino.setCodigo(datos.getCodigo());
        destino.setTipo(datos.getTipo());
        destino.setValor(datos.getValor());
        destino.setActivo(datos.isActivo());
        destino.setFechaInicio(datos.getFechaInicio());
        destino.setFechaFin(datos.getFechaFin());
        destino.setUsosMaximos(datos.getUsosMaximos());
        destino.setUsosActuales(datos.getUsosActuales());
    }
}
