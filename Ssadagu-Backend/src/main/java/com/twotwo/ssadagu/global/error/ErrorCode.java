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

    // Global
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "G001", "서버 내부 오류가 발생했습니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "G002", "유효하지 않은 입력 값입니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
