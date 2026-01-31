package com.minimarket.catalogservice.controller;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.minimarket.catalogservice.dto.ProductDto;
import com.minimarket.catalogservice.service.ProductService;

@RestController
public class ProductController {
	
	private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/products")
    public List<ProductDto> getProducts() {
        return service.getAllProducts().stream()
                .map(p -> new ProductDto(
                        p.id(),
                        p.sku(),
                        p.name(),
                        p.description(),
                        p.brand(),
                        p.model(),
                        p.category(),
                        p.price(),
                        p.currency(),
                        p.mainImageUrl(),
                        p.active(),
                        p.createdAt(),
                        p.updatedAt(),
                        p.images()
                ))
                .toList();
    }

}
