package com.twotwo.ssadagu.global.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SsafyApiResponse<T> {

    @JsonProperty("Header")
    private SsafyHeader header;

    @JsonProperty("REC")
    private T rec;

    @JsonProperty("Header")
    public SsafyHeader getHeader() {
        return header;
    }

    @JsonProperty("REC")
    public T getRec() {
        return rec;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SsafyHeader {
        private String responseCode;
        private String responseMessage;
        private String apiName;
        private String transmissionDate;
        private String transmissionTime;
        private String institutionCode;
        private String apiServiceCode;
        private String institutionTransactionUniqueNo;
    }
}
