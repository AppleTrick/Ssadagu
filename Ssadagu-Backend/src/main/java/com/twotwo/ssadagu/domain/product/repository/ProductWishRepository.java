package com.twotwo.ssadagu.domain.product.repository;

import com.twotwo.ssadagu.domain.product.entity.ProductWish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface ProductWishRepository extends JpaRepository<ProductWish, Long> {
    java.util.Optional<ProductWish> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    // 마이페이지 관심 목록 조회 (소프트 삭제 제외)
    List<ProductWish> findByUserIdAndDeletedAtIsNull(Long userId);

    // 목록 조회 시 N+1 방지용 배치 조회: 한 번의 쿼리로 찜한 상품 ID 집합을 반환
    @Query("SELECT pw.product.id FROM ProductWish pw WHERE pw.user.id = :userId AND pw.product.id IN :productIds")
    Set<Long> findLikedProductIds(@Param("userId") Long userId, @Param("productIds") Collection<Long> productIds);
}
