package com.twotwo.ssadagu.domain.account.entity;

import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.twotwo.ssadagu.global.util.AesEncryptConverter;

@Entity
@Table(name = "user_accounts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserAccount extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "bank_code", nullable = false, length = 20)
    private String bankCode;

    @Column(name = "bank_name", nullable = false, length = 50)
    private String bankName;

    @Column(name = "account_number", nullable = false)
    @Convert(converter = AesEncryptConverter.class)
    private String accountNumber;

    @Column(name = "account_hash", nullable = false, length = 64, unique = true)
    private String accountHash;

    @Column(name = "account_holder_name", length = 100)
    private String accountHolderName;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary;

    @Column(name = "verified_status", nullable = false, length = 20)
    private String verifiedStatus;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void verify() {
        this.verifiedStatus = "VERIFIED";
        this.verifiedAt = LocalDateTime.now();
    }

    public void updateAccountAndPending(String bankCode, String bankName, String accountNumber, String accountHash, String accountHolderName) {
        this.bankCode = bankCode;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.accountHash = accountHash;
        this.accountHolderName = accountHolderName;
        this.verifiedStatus = "PENDING";
        this.verifiedAt = null;
    }
}
