package com.twotwo.ssadagu.domain.account.repository;

import com.twotwo.ssadagu.domain.account.entity.AccountVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AccountVerificationRepository extends JpaRepository<AccountVerification, Long> {

    @Modifying
    @Query("UPDATE AccountVerification av SET av.status = :status, av.verifiedAt = :verifiedAt WHERE av.id = :verificationId")
    void updateVerificationStatus(@Param("verificationId") Long verificationId, @Param("status") String status,
            @Param("verifiedAt") LocalDateTime verifiedAt);

    Optional<AccountVerification> findTopByAccountIdAndStatusOrderByRequestedAtDesc(Long accountId, String status);
}
