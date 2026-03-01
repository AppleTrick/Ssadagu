package com.twotwo.ssadagu.domain.transaction.repository;

import com.twotwo.ssadagu.domain.transaction.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}
