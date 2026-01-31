package com.minimarket.catalogservice.controller;

import java.math.BigDecimal;
import java.net.URI;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.minimarket.catalogservice.dto.CreateProductRequestDto;
import com.minimarket.catalogservice.dto.ProductDto;
import com.minimarket.catalogservice.dto.UpdateProductRequestDto;
import com.minimarket.catalogservice.service.ProductService;

import jakarta.validation.Valid;

@RestController
public class ProductController {
	
	private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/products/{id}")
    public ProductDto getProductById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDto> create(@Valid @RequestBody CreateProductRequestDto req) {
        ProductDto created = service.create(req);
        return ResponseEntity.created(URI.create("/products/" + created.id())).body(created);
    }

    @PutMapping("/products/{id}")
    public ProductDto update(@PathVariable UUID id, @Valid @RequestBody UpdateProductRequestDto req) {
        return service.update(id, req);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/products")
    public Page<ProductDto> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return service.searchProducts(category, brand, active, minPrice, maxPrice, q, pageable);
    }

}
