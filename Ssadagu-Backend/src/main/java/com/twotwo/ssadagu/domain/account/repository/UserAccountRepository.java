package com.twotwo.ssadagu.domain.account.repository;

import com.twotwo.ssadagu.domain.account.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
}
