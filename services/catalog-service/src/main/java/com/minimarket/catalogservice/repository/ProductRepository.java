package com.minimarket.catalogservice.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.minimarket.catalogservice.domain.Product;


public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product>{
	
    boolean existsBySku(String sku);

}
