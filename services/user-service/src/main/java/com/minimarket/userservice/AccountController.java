package com.minimarket.userservice;

import jakarta.validation.Valid;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final KeycloakAdminClient keycloak;

    public AccountController(KeycloakAdminClient keycloak) {
        this.keycloak = keycloak;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountDtos.RegisterResponse register(@Valid @RequestBody AccountDtos.RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        String id = keycloak.createCustomer(email, req.password(), req.firstName().trim(), req.lastName().trim());
        return new AccountDtos.RegisterResponse(id, email);
    }

    @GetMapping("/me")
    public AccountDtos.Me me(@AuthenticationPrincipal Jwt jwt) {
        return new AccountDtos.Me(jwt.getSubject(), jwt.getClaimAsString("email"), jwt.getClaimAsString("given_name"),
                jwt.getClaimAsString("family_name"), roles(jwt));
    }

    private static List<String> roles(Jwt jwt) {
        Object realm = jwt.getClaim("realm_access");
        if (realm instanceof Map<?, ?> m && m.get("roles") instanceof Collection<?> roles) {
            return roles.stream().map(String::valueOf).filter(r -> r.equals("admin") || r.equals("customer")).sorted().toList();
        }
        return List.of();
    }
}
