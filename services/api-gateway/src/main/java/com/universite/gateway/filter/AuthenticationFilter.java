package com.universite.gateway.filter;

import com.universite.gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            // 1. On vérifie si la route est sécurisée, le header doit être là
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                throw new RuntimeException("Accès refusé : Header Authorization manquant");
            }

            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7); // On retire "Bearer "
            }

            try {
                // 2. On valide le token
                jwtUtil.validateToken(authHeader);
            } catch (Exception e) {
                System.out.println("Token invalide : " + e.getMessage());
                throw new RuntimeException("Accès refusé : Token invalide");
            }

            return chain.filter(exchange);
        });
    }

    public static class Config {
    }
}