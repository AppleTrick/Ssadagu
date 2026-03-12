package com.twotwo.ssadagu.domain.user.service;

import com.twotwo.ssadagu.global.util.SsafyHeaderUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserKeyService {

    private final SsafyHeaderUtil ssafyHeaderUtil;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ssafy.api.base-url}")
    private String baseUrl;

    @Value("${ssafy.api.user-key}")
    private String defaultUserKey;

    /**
     * SSAFY 금융망: 사용자 계정 생성 (MEMBER_01)
     * 회원 가입 시 호출하여 금융망 시스템의 userKey 를 발급받습니다.
     */
    public String createUserKey(String email) {
        String url = baseUrl + "/member/";

        // MEMBER_01 예외: userKey가 없는 상태이므로 빈 문자열이나 임의의 값을 넘김
        // (SsafyHeaderUtil에서는 파라미터로 받은 값이 Header의 userKey로 들어감. MEMBER_01은 그 자체가 발급 로직이므로 공란 처리)
        Map<String, String> header = ssafyHeaderUtil.createHeader("createUserKey", "");

        Map<String, Object> payload = new HashMap<>();
        payload.put("apiKey", header.get("apiKey"));
        payload.put("userId", email);

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, httpHeaders);

        try {
            log.info("[UserKey] 금융망 회원가입 (MEMBER_01) 요청 - email: {}", email);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("userKey")) {
                return (String) body.get("userKey");
            }
        } catch (Exception e) {
            log.error("[UserKey] 금융망 회원가입 연동 실패: {}", e.getMessage());
        }
        
        // 연동 실패 시 기본 테스트 키 반환 (Fallback)
        return defaultUserKey;
    }
}
