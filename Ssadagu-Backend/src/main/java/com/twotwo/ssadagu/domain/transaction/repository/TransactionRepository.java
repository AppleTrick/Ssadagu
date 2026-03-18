package com.twotwo.ssadagu.domain.transaction.repository;

import com.twotwo.ssadagu.domain.transaction.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // 마이페이지 구매 내역 조회 (페이징 지원)
    Page<Transaction> findByBuyerId(Long buyerId, Pageable pageable);

    // 마이페이지 판매 내역 조회 (페이징 지원)
    Page<Transaction> findBySellerId(Long sellerId, Pageable pageable);

    // 전체 거래 내역 조회 (페이징 지원)
    @org.springframework.data.jpa.repository.Query("select t from Transaction t where t.buyer.id = :userId or t.seller.id = :userId")
    Page<Transaction> findByUserId(Long userId, Pageable pageable);
}
