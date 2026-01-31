package com.minimarket.catalogservice.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record ProductDto(
	String id,
    String sku,
    String name,
    String description,
    String brand,
    String model,
    String category,
    BigDecimal price,
    String currency,
    String mainImageUrl,
    boolean active,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<ProductImageDto> images
) {}
