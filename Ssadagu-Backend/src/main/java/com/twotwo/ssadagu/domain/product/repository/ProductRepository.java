package com.twotwo.ssadagu.domain.product.repository;

import com.twotwo.ssadagu.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // 동네별 조회 (DELETED 상태 상품 제외)
    List<Product> findByRegionNameAndStatusNot(String regionName, String status);

    // 전체 조회 (DELETED 상태 상품 제외)
    List<Product> findByStatusNot(String status);
}
