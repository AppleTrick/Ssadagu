package com.twotwo.ssadagu.domain.transaction.repository;

import com.twotwo.ssadagu.domain.transaction.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // 마이페이지 구매 내역 조회
    List<Transaction> findByBuyerId(Long buyerId);
}
