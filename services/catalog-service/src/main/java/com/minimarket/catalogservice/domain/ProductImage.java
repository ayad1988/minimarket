package com.minimarket.catalogservice.domain;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_image")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ProductImage {

 	@Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false)
    private OffsetDateTime createdAt;	
}
