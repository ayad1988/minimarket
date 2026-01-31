package com.minimarket.catalogservice.domain;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Product {
	
	@Id
    private UUID id;

    @Column(nullable = false, length = 64, unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String brand;
    private String model;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(columnDefinition = "TEXT")
    private String mainImageUrl;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<ProductImage> images = new ArrayList<>();
    
    public static Product create(UUID id, String sku, String name, String description, String brand, String model,
            String category, BigDecimal price, String currency, String mainImageUrl,
            boolean active, OffsetDateTime now) {
				Product p = new Product();
				p.id = id;
				p.sku = sku;
				p.name = name;
				p.description = description;
				p.brand = brand;
				p.model = model;
				p.category = category;
				p.price = price;
				p.currency = currency;
				p.mainImageUrl = mainImageUrl;
				p.active = active;
				p.createdAt = now;
				p.updatedAt = now;
				return p;
			}
				
			public void update(String name, String description, String brand, String model, String category,
			  BigDecimal price, String currency, String mainImageUrl, Boolean active, OffsetDateTime now) {
				if (name != null) this.name = name;
				if (description != null) this.description = description;
				if (brand != null) this.brand = brand;
				if (model != null) this.model = model;
				if (category != null) this.category = category;
				if (price != null) this.price = price;
				if (currency != null) this.currency = currency;
				if (mainImageUrl != null) this.mainImageUrl = mainImageUrl;
				if (active != null) this.active = active;
				this.updatedAt = now;
			}
			
			public void replaceImages(List<ProductImage> newImages, OffsetDateTime now) {
				this.images.clear();
				if (newImages != null) this.images.addAll(newImages);
				this.updatedAt = now;
			}
}
