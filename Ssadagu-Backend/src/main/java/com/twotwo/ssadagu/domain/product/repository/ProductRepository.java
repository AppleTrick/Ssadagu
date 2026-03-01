package com.twotwo.ssadagu.domain.product.repository;

import com.twotwo.ssadagu.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
