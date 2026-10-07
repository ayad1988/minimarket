package com.minimarket.userservice;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public final class AccountDtos {

    private AccountDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 8, max = 72, message = "8 caractères minimum") String password,
            @NotBlank @Size(max = 80) String firstName,
            @NotBlank @Size(max = 80) String lastName) {
    }

    public record RegisterResponse(String id, String email) {
    }

    public record Me(String id, String email, String firstName, String lastName, List<String> roles) {
    }
}
