package com.twotwo.ssadagu.global.error;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // User
    EMAIL_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "U001", "동일한 이메일이 존재합니다."),
    NICKNAME_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "U002", "동일한 닉네임입니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U003", "사용자를 찾을 수 없습니다."),
    USER_ALREADY_DELETED(HttpStatus.BAD_REQUEST, "U004", "이미 탈퇴한 사용자입니다."),
    SECONDARY_PASSWORD_NOT_MATCH(HttpStatus.BAD_REQUEST, "U005", "2차 비밀번호가 일치하지 않습니다."),
    SECONDARY_PASSWORD_NOT_SET(HttpStatus.BAD_REQUEST, "U006", "2차 비밀번호가 설정되어 있지 않습니다."),
    BIOMETRIC_NOT_ENABLED(HttpStatus.BAD_REQUEST, "U007", "생체 인증이 비활성화되어 있습니다."),

    // Product
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "상품을 찾을 수 없습니다."),
    NOT_PRODUCT_SELLER(HttpStatus.FORBIDDEN, "P002", "해당 상품의 판매자가 아닙니다."),

    // Global
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "G001", "서버 내부 오류가 발생했습니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "G002", "유효하지 않은 입력 값입니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "G003", "접근 권한이 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
