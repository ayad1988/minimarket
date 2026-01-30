package com.minimarket.catalogservice.dto;

import java.math.BigDecimal;

public record ProductDto(
        String id,
        String name,
        BigDecimal price,
        String currency
) {}
