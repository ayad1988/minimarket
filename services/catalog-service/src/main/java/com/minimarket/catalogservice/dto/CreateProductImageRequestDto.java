package com.minimarket.catalogservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateProductImageRequestDto(
        @NotBlank
        @Pattern(regexp = "https?://.*", message = "url must be a valid URL")
        String url,

        @Min(1)
        int position
) {}
