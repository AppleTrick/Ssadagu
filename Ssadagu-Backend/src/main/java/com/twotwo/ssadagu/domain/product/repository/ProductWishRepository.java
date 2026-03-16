package com.twotwo.ssadagu.domain.product.repository;

import com.twotwo.ssadagu.domain.product.entity.ProductWish;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductWishRepository extends JpaRepository<ProductWish, Long> {
    java.util.Optional<ProductWish> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
}
