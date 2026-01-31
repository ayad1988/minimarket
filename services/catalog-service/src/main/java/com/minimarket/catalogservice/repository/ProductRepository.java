package com.minimarket.catalogservice.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.minimarket.catalogservice.domain.Product;


public interface ProductRepository extends JpaRepository<Product, UUID>{

}
