package com.twotwo.ssadagu.domain.product.repository;

import com.twotwo.ssadagu.domain.product.entity.ProductWish;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductWishRepository extends JpaRepository<ProductWish, Long> {
    java.util.Optional<ProductWish> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    // 마이페이지 관심 목록 조회 (소프트 삭제 제외)
    List<ProductWish> findByUserIdAndDeletedAtIsNull(Long userId);
}
