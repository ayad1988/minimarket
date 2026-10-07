package com.minimarket.userservice;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** Minimal Keycloak admin API client, authenticated as the user-service service account. */
@Component
public class KeycloakAdminClient {

    private static final Logger log = LoggerFactory.getLogger(KeycloakAdminClient.class);

    private final KeycloakProperties props;
    private final RestClient http = RestClient.create();

    private String cachedToken;
    private Instant cachedUntil = Instant.EPOCH;

    public KeycloakAdminClient(KeycloakProperties props) {
        this.props = props;
    }

    /** Creates an enabled user with the customer role and returns its id. */
    public String createCustomer(String email, String password, String firstName, String lastName) {
        String id = createUser(email, password, firstName, lastName);
        try {
            assignRole(id, props.customerRole());
        } catch (RuntimeException e) {
            // Do not leave a half-created account behind: it could not be used as a customer.
            log.error("Role assignment failed for {}, removing the user", id, e);
            deleteQuietly(id);
            throw new AccountException(HttpStatus.BAD_GATEWAY, "Création du compte impossible, réessayez.", e);
        }
        return id;
    }

    private String createUser(String email, String password, String firstName, String lastName) {
        Map<String, Object> body = Map.of(
                "username", email,
                "email", email,
                "firstName", firstName,
                "lastName", lastName,
                "enabled", true,
                "emailVerified", true, // no mail server in this project: verification is skipped
                "credentials", List.of(Map.of("type", "password", "value", password, "temporary", false)));
        try {
            var response = http.post()
                    .uri(admin("/users"))
                    .headers(h -> h.setBearerAuth(token()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            String location = response.getHeaders().getFirst("Location");
            if (location == null) {
                throw new AccountException(HttpStatus.BAD_GATEWAY, "Création du compte impossible, réessayez.");
            }
            return location.substring(location.lastIndexOf('/') + 1);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 409) {
                throw new AccountException(HttpStatus.CONFLICT, "Un compte existe déjà avec cette adresse e-mail.", e);
            }
            if (e.getStatusCode().value() == 400) {
                throw new AccountException(HttpStatus.BAD_REQUEST, "Informations refusées (mot de passe trop faible ?).", e);
            }
            throw unavailable(e);
        } catch (RestClientException e) {
            throw unavailable(e);
        }
    }

    private void assignRole(String userId, String roleName) {
        Map<String, Object> role = http.get()
                .uri(admin("/roles/" + roleName))
                .headers(h -> h.setBearerAuth(token()))
                .retrieve()
                .body(new ParameterizedTypeReference<>() { });
        http.post()
                .uri(admin("/users/" + userId + "/role-mappings/realm"))
                .headers(h -> h.setBearerAuth(token()))
                .contentType(MediaType.APPLICATION_JSON)
                .body(List.of(role))
                .retrieve()
                .toBodilessEntity();
    }

    private void deleteQuietly(String userId) {
        try {
            http.delete().uri(admin("/users/" + userId)).headers(h -> h.setBearerAuth(token())).retrieve().toBodilessEntity();
        } catch (RuntimeException e) {
            log.error("Could not delete half-created user {}", userId, e);
        }
    }

    private synchronized String token() {
        if (cachedToken != null && Instant.now().isBefore(cachedUntil)) {
            return cachedToken;
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", props.clientId());
        form.add("client_secret", props.clientSecret());
        Map<String, Object> res = http.post()
                .uri(props.url() + "/realms/" + props.realm() + "/protocol/openid-connect/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (req, resp) -> {
                    throw new AccountException(HttpStatus.BAD_GATEWAY, "Service d'authentification indisponible.");
                })
                .body(new ParameterizedTypeReference<>() { });
        cachedToken = (String) res.get("access_token");
        cachedUntil = Instant.now().plusSeconds(((Number) res.get("expires_in")).longValue() - 30);
        return cachedToken;
    }

    private String admin(String path) {
        return props.url() + "/admin/realms/" + props.realm() + path;
    }

    private AccountException unavailable(Exception cause) {
        log.error("Keycloak admin call failed", cause);
        return new AccountException(HttpStatus.BAD_GATEWAY, "Service d'authentification indisponible.", cause);
    }
}
