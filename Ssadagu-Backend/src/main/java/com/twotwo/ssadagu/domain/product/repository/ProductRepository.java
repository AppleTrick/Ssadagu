package com.twotwo.ssadagu.domain.product.repository;

import com.twotwo.ssadagu.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // 동네별 조회 (DELETED 상태 상품 제외)
    List<Product> findByRegionNameAndStatusNotOrderByCreatedAtDesc(String regionName, String status);

    // 전체 조회 (DELETED 상태 상품 제외)
    List<Product> findByStatusNotOrderByCreatedAtDesc(String status);

    // 판매자 ID로 조회 (DELETED 상태 상품 제외) - 마이페이지 판매 내역
    List<Product> findBySellerIdAndStatusNot(Long sellerId, String status);

    // 제목 검색 (DELETED 상태 상품 제외)
    List<Product> findByTitleContainingAndStatusNotOrderByCreatedAtDesc(String title, String status);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from Product p where p.id = :id")
    java.util.Optional<Product> findByIdWithLock(Long id);

    // 스케줄러: 특정 상태이면서 일정 시간 동안 업데이트가 없는 상품 조회
    java.util.List<Product> findByStatusAndUpdatedAtBefore(String status, java.time.LocalDateTime dateTime);
}