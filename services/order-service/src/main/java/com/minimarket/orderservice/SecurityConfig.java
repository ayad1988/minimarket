package com.minimarket.orderservice;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Customers can check out as guests (POST /orders) and view their confirmation (GET /orders/{id}, unguessable UUID).
 * Everything under /admin requires the Keycloak realm role admin.
 */
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/actuator/**", "/error").permitAll()
                .requestMatchers(HttpMethod.POST, "/orders").permitAll()
                .requestMatchers(HttpMethod.GET, "/orders/*").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().denyAll())
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(keycloakRoles())));
        return http.build();
    }

    /** Maps the Keycloak realm_access.roles claim to ROLE_* authorities. */
    private JwtAuthenticationConverter keycloakRoles() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Object realm = jwt.getClaim("realm_access");
            if (realm instanceof Map<?, ?> m && m.get("roles") instanceof Collection<?> roles) {
                return roles.stream()
                        .<GrantedAuthority>map(r -> new SimpleGrantedAuthority("ROLE_" + String.valueOf(r).toUpperCase()))
                        .toList();
            }
            return List.<GrantedAuthority>of();
        });
        return converter;
    }
}
