package com.minimarket.userservice;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "minimarket.keycloak")
public record KeycloakProperties(String url, String realm, String clientId, String clientSecret, String customerRole) {
}
