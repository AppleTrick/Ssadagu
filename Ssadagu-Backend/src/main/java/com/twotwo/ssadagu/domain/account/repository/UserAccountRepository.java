package com.twotwo.ssadagu.domain.account.repository;

import com.twotwo.ssadagu.domain.account.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByUserId(Long userId);
    Optional<UserAccount> findByAccountNumber(String accountNumber);
}
