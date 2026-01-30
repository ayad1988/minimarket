package com.minimarket.catalogservice.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.minimarket.catalogservice.dto.ProductDto;

@RestController
public class ProductController {
	@GetMapping("/products")
    public List<ProductDto> getProducts() {
        return List.of(
                new ProductDto("P-001", "Casque Bluetooth", new BigDecimal("59.90"), "EUR"),
                new ProductDto("P-002", "Clavier mécanique", new BigDecimal("89.00"), "EUR"),
                new ProductDto("P-003", "Souris ergonomique", new BigDecimal("39.50"), "EUR")
        );
    }

}
