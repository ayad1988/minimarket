package com.minimarket.catalogservice.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.minimarket.catalogservice.domain.Product;
import com.minimarket.catalogservice.dto.ProductDto;
import com.minimarket.catalogservice.dto.ProductImageDto;
import com.minimarket.catalogservice.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public List<ProductDto> getAllProducts() {
    	return repository.findAll().stream()
                .map(p -> new ProductDto(
                        p.getId().toString(),
                        p.getSku(),
                        p.getName(),
                        p.getDescription(),
                        p.getBrand(),
                        p.getModel(),
                        p.getCategory(),
                        p.getPrice(),
                        p.getCurrency(),
                        p.getMainImageUrl(),
                        p.isActive(),
                        p.getCreatedAt(),
                        p.getUpdatedAt(),
                        p.getImages().stream()
                                .map(img -> new ProductImageDto(
                                        img.getId().toString(),
                                        img.getUrl(),
                                        img.getPosition()
                                ))
                                .toList()
                ))
                .toList();
    }
}

