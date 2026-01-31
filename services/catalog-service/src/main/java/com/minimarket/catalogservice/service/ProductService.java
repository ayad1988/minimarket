package com.minimarket.catalogservice.service;


import com.minimarket.catalogservice.domain.Product;
import com.minimarket.catalogservice.domain.ProductImage;
import com.minimarket.catalogservice.dto.*;
import com.minimarket.catalogservice.exception.ConflictException;
import com.minimarket.catalogservice.exception.NotFoundException;
import com.minimarket.catalogservice.repository.ProductRepository;
import com.minimarket.catalogservice.spec.ProductSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ProductDto getById(UUID id) {
        Product p = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
        return toDto(p);
    }

    @Transactional
    public ProductDto create(CreateProductRequestDto req) {
        if (repository.existsBySku(req.sku())) {
            throw new ConflictException("SKU already exists: " + req.sku());
        }

        OffsetDateTime now = OffsetDateTime.now();
        Product product = Product.create(
                UUID.randomUUID(),
                req.sku(),
                req.name(),
                req.description(),
                req.brand(),
                req.model(),
                req.category(),
                req.price(),
                req.currency(),
                req.mainImageUrl(),
                true,
                now
        );

        // images
        List<ProductImage> imgs = (req.images() == null) ? List.of() :
                req.images().stream()
                        .map(i -> new ProductImage(UUID.randomUUID(), product, i.url(), i.position(), now))
                        .toList();

        product.replaceImages(imgs, now);

        try {
            Product saved = repository.save(product);
            return toDto(saved);
        } catch (DataIntegrityViolationException e) {
            // sécurité DB (unique sku)
            throw new ConflictException("SKU already exists: " + req.sku());
        }
    }

    @Transactional
    public ProductDto update(UUID id, UpdateProductRequestDto req) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));

        // SKU immuable : si fourni et différent -> on refuse
        if (req.sku() != null && !req.sku().equals(product.getSku())) {
            throw new ConflictException("SKU cannot be changed once created.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        product.update(
                req.name(),
                req.description(),
                req.brand(),
                req.model(),
                req.category(),
                req.price(),
                req.currency(),
                req.mainImageUrl(),
                req.active(),
                now
        );

        if (req.images() != null) {
            List<ProductImage> imgs = req.images().stream()
                    .map(i -> new ProductImage(UUID.randomUUID(), product, i.url(), i.position(), now))
                    .toList();
            product.replaceImages(imgs, now);
        }

        Product saved = repository.save(product);
        return toDto(saved);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Product not found: " + id);
        }
        repository.deleteById(id);
    }

    private ProductDto toDto(Product p) {
        List<ProductImageDto> images = p.getImages().stream()
                .map(img -> new ProductImageDto(img.getId().toString(), img.getUrl(), img.getPosition()))
                .toList();

        return new ProductDto(
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
                images
        );
    }
    @Transactional(readOnly = true)
    public Page<ProductDto> searchProducts(
            String category,
            String brand,
            Boolean active,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String q,
            Pageable pageable
    ) {
        Specification<Product> spec = Specification.where(ProductSpecifications.categoryEquals(category))
                .and(ProductSpecifications.brandEquals(brand))
                .and(ProductSpecifications.activeEquals(active))
                .and(ProductSpecifications.priceGte(minPrice))
                .and(ProductSpecifications.priceLte(maxPrice))
                .and(ProductSpecifications.queryLike(q));

        return repository.findAll(spec, pageable).map(this::toDto);
    }
}
