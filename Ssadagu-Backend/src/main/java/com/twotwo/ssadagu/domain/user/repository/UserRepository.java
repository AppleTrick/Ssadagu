package com.twotwo.ssadagu.domain.user.repository;

import com.twotwo.ssadagu.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);

    /**
     * 계좌 인증 성공 시 사용자의 상태를 강제로 VERIFIED로 업데이트 (Email 기반으로 확실하게 처리)
     */
    @Modifying(clearAutomatically = true)
    @Query("update User u set u.status = 'VERIFIED' where u.email = :email")
    void updateStatusToVerifiedByEmail(@Param("email") String email);
}
