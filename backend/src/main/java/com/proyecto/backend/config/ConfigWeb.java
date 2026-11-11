package com.proyecto.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ConfigWeb implements WebMvcConfigurer {

    private final AutenticacionInterceptor interceptor;

    public ConfigWeb(AutenticacionInterceptor interceptor) {
        this.interceptor = interceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registro) {
        // El catálogo y el webhook de Stripe son públicos; el resto pide sesión.
        registro.addInterceptor(interceptor)
                .addPathPatterns("/api/admin/**", "/api/auth/logout", "/api/auth/yo",
                        "/api/tienda/juegos/*/calificaciones/mia",
                        "/api/tienda/carrito", "/api/tienda/carrito/**",
                        "/api/pagos/**", "/api/ordenes/**")
                .excludePathPatterns("/api/pagos/webhook");
    }
}