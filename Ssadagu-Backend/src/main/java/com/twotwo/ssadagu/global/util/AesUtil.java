package com.twotwo.ssadagu.global.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class AesUtil {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";

    private final SecretKeySpec secretKeySpec;

    public AesUtil(@Value("${ENCRYPT_SECRET_KEY:aB3v9XqE2pL7mK5dR8wN4tC1yU0hF6zJ}") String secretKey) {
        // 단방향 해시 등 다양한 길이가 올 수 있으므로, 최소 16바이트, 24, 32바이트 중 하나를 맞춰줍니다.
        // 현재는 주어진 문자열을 UTF-8 바이트로 변환 후 앞 32바이트(AES-256) 또는 16바이트(AES-128)를 사용합니다.
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        byte[] validKeyBytes = new byte[32]; // AES-256
        System.arraycopy(keyBytes, 0, validKeyBytes, 0, Math.min(keyBytes.length, validKeyBytes.length));
        
        this.secretKeySpec = new SecretKeySpec(validKeyBytes, ALGORITHM);
    }

    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }
        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            // Base64 디코딩 실패 -> 평문일 가능성 높음
            return encryptedText;
        } catch (Exception e) {
            // 복호화 실패(알고리즘 오류, 패딩 오류 등) -> 예전 평문 데이터일 수 있으므로 우선 평문 반환
            // 단, 보안을 더 철저히 하려면 예외를 던지도록 수정 가능.
            return encryptedText;
        }
    }
}
