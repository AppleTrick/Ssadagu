package com.twotwo.ssadagu.domain.product.repository;

import com.twotwo.ssadagu.domain.product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
