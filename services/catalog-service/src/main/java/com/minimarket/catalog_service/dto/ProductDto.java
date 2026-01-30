package com.minimarket.catalog_service.dto;

import java.math.BigDecimal;

public record ProductDto(
        String id,
        String name,
        BigDecimal price,
        String currency
) {}
