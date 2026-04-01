package com.twotwo.ssadagu.domain.user.entity;

import com.twotwo.ssadagu.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Builder.Default
    @Column(length = 100)
    private String region = "";

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "user_key", length = 100)
    private String userKey;

    @Column(name = "secondary_password_hash")
    private String secondaryPasswordHash;

    @Column(name = "biometric_public_key", columnDefinition = "TEXT")
    private String biometricPublicKey;

    @Builder.Default
    @Column(name = "is_biometric_enabled", nullable = false)
    private Boolean isBiometricEnabled = false;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updateRegion(String region) {
        this.region = region;
    }

    public void updateSecondaryPassword(String hash) {
        this.secondaryPasswordHash = hash;
    }

    public void registerBiometric(String publicKey) {
        this.biometricPublicKey = publicKey;
        this.isBiometricEnabled = true;
    }

    public void updateBiometricEnabled(boolean enabled) {
        this.isBiometricEnabled = enabled;
    }

    public void clearBiometric() {
        this.biometricPublicKey = null;
        this.isBiometricEnabled = false;
    }

    public void updateProfileImage(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public void deleteProfileImage() {
        this.profileImageUrl = null;
    }

    public void setAccountVerified() {
        this.status = "VERIFIED";
    }

    public void verifyAccount() {
        this.status = "ACTIVE";
    }

    public void markAsDeleted() {
        this.status = "DELETED";
        this.deletedAt = java.time.LocalDateTime.now();
    }
}
