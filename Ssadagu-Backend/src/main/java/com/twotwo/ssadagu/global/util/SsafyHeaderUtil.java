package com.twotwo.ssadagu.global.util;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class SsafyHeaderUtil {

    @Value("${ssafy.api.institution-code}")
    private String institutionCode;

    @Value("${ssafy.api.fintech-app-no}")
    private String fintechAppNo;

    @Value("${ssafy.api.key}")
    private String apiKey;

    /**
     * SSAFY 금융망 공통 Header 생성
     * @param apiName 요청하려는 API 이름 (명세서 기준)
     * @param userKey 회원별 userKey (본 예제에서는 테스트용 키 사용)
     * @return Header Map 객체
     */
    public Map<String, String> createHeader(String apiName, String userKey) {
        LocalDateTime now = LocalDateTime.now();
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String time = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        
        // 6자리 랜덤 숫자
        String randomStr = String.format("%06d", new Random().nextInt(1000000));
        String uniqueNo = date + time + randomStr; // 20자리 고유번호

        Map<String, String> header = new HashMap<>();
        header.put("apiName", apiName);
        header.put("transmissionDate", date);
        header.put("transmissionTime", time);
        header.put("institutionCode", institutionCode);
        header.put("fintechAppNo", fintechAppNo);
        header.put("apiServiceCode", apiName);
        header.put("institutionTransactionUniqueNo", uniqueNo);
        header.put("apiKey", apiKey);
        header.put("userKey", userKey);

        return header;
    }
}
