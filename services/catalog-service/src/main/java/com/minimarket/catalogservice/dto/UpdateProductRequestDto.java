package com.minimarket.catalogservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record UpdateProductRequestDto(
        @Size(min = 2, max = 255) String name,
        @Size(min = 3, max = 64) String sku,  // si fourni et différent -> erreur
        String description,
        @Size(max = 120) String brand,
        @Size(max = 120) String model,
        @Size(max = 60) String category,
        @DecimalMin(value = "0.01") BigDecimal price,
        @Pattern(regexp = "EUR|USD") String currency,
        @Pattern(regexp = "https?://.*", message = "mainImageUrl must be a valid URL") String mainImageUrl,
        @Valid List<CreateProductImageRequestDto> images,
        Boolean active
) {}

