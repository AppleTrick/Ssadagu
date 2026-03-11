package com.twotwo.ssadagu.domain.account.repository;

import com.twotwo.ssadagu.domain.account.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByUserId(Long userId);

    @Modifying
    @Query("UPDATE UserAccount ua SET ua.verifiedStatus = :status WHERE ua.id = :accountId")
    void updateVerifiedStatus(@Param("accountId") Long accountId, @Param("status") String status);
}
