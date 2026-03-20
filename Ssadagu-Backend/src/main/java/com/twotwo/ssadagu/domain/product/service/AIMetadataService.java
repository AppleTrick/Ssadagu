package com.twotwo.ssadagu.domain.product.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIMetadataService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gms.api.key}")
    private String gmsApiKey;

    @Value("${gms.api.endpoint:https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions}")
    private String gmsEndpoint;

    /**
     * 상품 정보를 기반으로 JSON-LD 메타데이터를 생성합니다.
     */
    public String generateMetadata(String title, String description, Long price, String categoryCode, String regionName) {
        try {
            String prompt = buildPrompt(title, description, price, categoryCode, regionName);
            String response = callGmsApi(prompt);
            return extractJsonFromResponse(response);
        } catch (Exception e) {
            log.error("Failed to generate metadata: {}", e.getMessage());
            return null;
        }
    }

    /**
     * GMS API를 호출하여 메타데이터를 생성합니다.
     */
    private String callGmsApi(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + gmsApiKey);

        String requestBody = objectMapper.writeValueAsString(new GmsRequest(prompt));
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        String response = restTemplate.postForObject(gmsEndpoint, entity, String.class);
        log.debug("GMS API Response: {}", response);

        return response;
    }

    /**
     * 프롬프트를 구성합니다.
     */
    private String buildPrompt(String title, String description, Long price, String categoryCode, String regionName) {
        return String.format("""
                다음 상품 정보를 분석하여 JSON-LD 형식의 구조화된 메타데이터를 생성해줘.
                한국어로 답변하고, 유추 가능한 정보도 포함해줘.

                상품 제목: %s
                상품 설명: %s
                가격: %,d원
                카테고리: %s
                지역: %s

                다음 JSON-LD 스키마로 반환해줘 (JSON만 반환, 설명 없이):
                {
                  "색상": "string or null",
                  "브랜드": "string or null",
                  "제품명": "string or null",
                  "모델": "string or null",
                  "출시년도": "number or null",
                  "상태": "string (신상품/거의새상품/좋음/사용감있음/불량)",
                  "가격": %d,
                  "저장용량": "string or null",
                  "화면크기": "string or null",
                  "배터리상태": "string or null",
                  "주요특징": ["string"],
                  "결함": ["string"],
                  "카테고리": "string",
                  "지역": "string"
                }
                """, title, description, price, categoryCode, regionName, price);
    }

    /**
     * API 응답에서 JSON 메타데이터를 추출합니다.
     */
    private String extractJsonFromResponse(String response) throws Exception {
        JsonNode rootNode = objectMapper.readTree(response);

        // choices[0].message.content에서 메타데이터 추출
        String content = rootNode
                .path("choices")
                .get(0)
                .path("message")
                .path("content")
                .asText();

        // JSON 블록 추출 (마크다운 형식: ```json ... ``` 또는 ```)
        String jsonContent = extractJsonBlock(content);

        // JSON 유효성 검증
        objectMapper.readTree(jsonContent);

        return jsonContent;
    }

    /**
     * 마크다운 형식의 JSON 블록을 추출합니다.
     */
    private String extractJsonBlock(String content) {
        // ```json ... ``` 형식
        if (content.contains("```json")) {
            int start = content.indexOf("```json") + 7;
            int end = content.indexOf("```", start);
            return content.substring(start, end).trim();
        }

        // ``` ... ``` 형식
        if (content.contains("```")) {
            int start = content.indexOf("```") + 3;
            int end = content.indexOf("```", start);
            return content.substring(start, end).trim();
        }

        // JSON 형식이 그대로 있는 경우
        return content.trim();
    }

    /**
     * GMS API 요청 형식
     */
    static class GmsRequest {
        public String model = "gpt-4o-mini";
        public GmsMessage[] messages;
        public int max_tokens = 2048;
        public double temperature = 0.3;

        GmsRequest(String userContent) {
            this.messages = new GmsMessage[]{
                    new GmsMessage("system", "Answer in Korean. You are an expert at analyzing product information and creating structured metadata."),
                    new GmsMessage("user", userContent)
            };
        }

        static class GmsMessage {
            public String role;
            public String content;

            GmsMessage(String role, String content) {
                this.role = role;
                this.content = content;
            }
        }
    }
}
