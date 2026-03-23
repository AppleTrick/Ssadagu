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
    BIOMETRIC_NOT_REGISTERED(HttpStatus.BAD_REQUEST, "U008", "생체 인증이 등록되어 있지 않습니다."),
    BIOMETRIC_TOKEN_NOT_MATCH(HttpStatus.UNAUTHORIZED, "U009", "생체 인증 토큰이 일치하지 않습니다."),

    // Product
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "상품을 찾을 수 없습니다."),
    NOT_PRODUCT_SELLER(HttpStatus.FORBIDDEN, "P002", "해당 상품의 판매자가 아닙니다."),
    PRODUCT_ALREADY_TRADING(HttpStatus.BAD_REQUEST, "P003", "이미 거래 중인 상품입니다."),
    PRODUCT_ALREADY_SOLD(HttpStatus.BAD_REQUEST, "P004", "이미 판매 완료된 상품입니다."),
    PRODUCT_NOT_TRADING(HttpStatus.BAD_REQUEST, "P005", "거래 중인 상품이 아닙니다."),

    // Account & Transaction
    ACCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, "A001", "계좌 정보를 찾을 수 없습니다."),
    INSUFFICIENT_BALANCE(HttpStatus.BAD_REQUEST, "A002", "계좌 잔고가 부족합니다."),
    TRANSACTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "T001", "금융망 이체 처리에 실패했습니다."),
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "T002", "거래 내역을 찾을 수 없습니다."),
    INVALID_TRANSACTION_AMOUNT(HttpStatus.BAD_REQUEST, "T003", "상품 가격과 결제 요청 금액이 일치하지 않습니다."),

    // Global
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "G001", "서버 내부 오류가 발생했습니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "G002", "유효하지 않은 입력 값입니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "G003", "접근 권한이 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
