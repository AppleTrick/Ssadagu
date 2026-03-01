package com.twotwo.ssadagu.domain.account.repository;

import com.twotwo.ssadagu.domain.account.entity.AccountVerification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountVerificationRepository extends JpaRepository<AccountVerification, Long> {
}
