package com.twotwo.ssadagu.global.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("SUCCESS", "요청에 성공했습니다.", data);
    }

    public static ApiResponse<Void> success() {
        return new ApiResponse<>("SUCCESS", "요청에 성공했습니다.", null);
    }

    public static ApiResponse<Void> error(String message) {
        return new ApiResponse<>("ERROR", message, null);
    }
}
