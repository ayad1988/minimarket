package com.minimarket.catalogservice.config;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

/** Catalog is public for reading; any write requires the Keycloak realm role "admin". */
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/actuator/**", "/health", "/error").permitAll()
                .requestMatchers(HttpMethod.GET, "/products", "/products/**").permitAll()
                .requestMatchers("/products", "/products/**").hasRole("ADMIN")
                .anyRequest().denyAll())
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(keycloakRoles())));
        return http.build();
    }

    /** Maps Keycloak's realm_access.roles to ROLE_* authorities. */
    private Converter<Jwt, AbstractAuthenticationToken> keycloakRoles() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Object realm = jwt.getClaim("realm_access");
            if (realm instanceof Map<?, ?> m && m.get("roles") instanceof Collection<?> roles) {
                return roles.stream()
                        .<GrantedAuthority>map(r -> new SimpleGrantedAuthority("ROLE_" + String.valueOf(r).toUpperCase()))
                        .toList();
            }
            return List.of();
        });
        return converter;
    }
}
