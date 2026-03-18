package com.twotwo.ssadagu.domain.product.repository;

import com.twotwo.ssadagu.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // 동네별 조회 (DELETED 상태 상품 제외)
    List<Product> findByRegionNameAndStatusNotOrderByCreatedAtDesc(String regionName, String status);

    // 전체 조회 (DELETED 상태 상품 제외)
    List<Product> findByStatusNotOrderByCreatedAtDesc(String status);

    // 판매자 ID로 조회 (DELETED 상태 상품 제외) - 마이페이지 판매 내역
    List<Product> findBySellerIdAndStatusNot(Long sellerId, String status);

    // 제목 검색 (DELETED 상태 상품 제외)
    List<Product> findByTitleContainingAndStatusNotOrderByCreatedAtDesc(String title, String status);
}
