
package com.twotwo.ssadagu.domain.product.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twotwo.ssadagu.domain.product.dto.SearchFilterDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIMetadataService {

    private final RestTemplate restTemplate;
    // Bean 주입 - Spring 전역 설정(JavaTimeModule 등)이 반영된 ObjectMapper 사용
    private final ObjectMapper objectMapper;

    @Value("${gms.api.key}")
    private String gmsApiKey;

    @Value("${gms.api.endpoint:https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions}")
    private String gmsEndpoint;

    private static final int MAX_IMAGES_FOR_METADATA = 3;

    /**
     * 상품 정보를 기반으로 검색용 구조화 메타데이터를 생성합니다.
     * 생성된 메타데이터는 DB에 저장되며, 이후 Text-to-Filter 검색에 활용됩니다.
     */
    public String generateMetadata(String title, String description, Long price, String categoryCode, String regionName,
            List<String> imageUrls) {
        try {
            String prompt = buildMetadataPrompt(title, description, price, categoryCode, regionName,
                    imageUrls != null ? imageUrls.size() : 0);
            List<String> limitedImages = (imageUrls != null && imageUrls.size() > MAX_IMAGES_FOR_METADATA)
                    ? imageUrls.subList(0, MAX_IMAGES_FOR_METADATA)
                    : (imageUrls != null ? imageUrls : List.of());
            String response = callGmsApi(prompt, limitedImages);
            return extractJsonFromResponse(response);
        } catch (Exception e) {
            log.error("Failed to generate metadata: {}", e.getMessage());
            return null;
        }
    }

    /**
     * metadata JSON 문자열에서 검색용 핵심 필드를 추출합니다.
     * Product 엔티티의 메타데이터 컬럼 업데이트에 사용됩니다.
     */
    public record MetadataFields(
            String brand, String productName, String modelName,
            String canonicalColors, String condition, String searchAliases) {}

    public MetadataFields extractMetadataFields(String metadataJson) {
        if (metadataJson == null || metadataJson.isBlank()) {
            return new MetadataFields(null, null, null, null, null, null);
        }
        try {
            JsonNode node = objectMapper.readTree(metadataJson);
            String brand = textOrNull(node, "brand");
            String productName = textOrNull(node, "productName");
            String modelName = textOrNull(node, "modelName");
            String condition = textOrNull(node, "condition");

            // canonicalColors: ["검정","흰색"] → "검정,흰색"
            String canonicalColors = null;
            JsonNode colorsNode = node.path("canonicalColors");
            if (colorsNode.isArray() && !colorsNode.isEmpty()) {
                List<String> colorList = toStringList(colorsNode);
                if (!colorList.isEmpty()) canonicalColors = String.join(",", colorList);
            }

            // searchAliases: ["맥북","MacBook","애플"] → "맥북 MacBook 애플"
            String searchAliases = null;
            JsonNode aliasNode = node.path("searchAliases");
            if (aliasNode.isArray() && !aliasNode.isEmpty()) {
                List<String> aliasList = toStringList(aliasNode);
                if (!aliasList.isEmpty()) searchAliases = String.join(" ", aliasList);
            }

            return new MetadataFields(brand, productName, modelName, canonicalColors, condition, searchAliases);
        } catch (Exception e) {
            log.warn("Failed to extract metadata fields: {}", e.getMessage());
            return new MetadataFields(null, null, null, null, null, null);
        }
    }

    /**
     * [Phase 5] 이미지 분석 검증용 메서드.
     * 텍스트 없이 이미지 URL만 GMS에 전달해 실제 비전/OCR 분석이 작동하는지 확인합니다.
     *
     * 검증 방법:
     * 1) 이 메서드 결과와 generateMetadata() 결과를 비교해 이미지가 실제로 분석에 기여하는지 판단
     * 2) detail=low vs detail=high 비교 시 imageUrls를 동일하게 하되 이 메서드를 두 번 호출
     *
     * @param imageUrls 분석할 이미지 URL 목록 (최대 3장)
     * @return GMS 모델이 이미지에서 추출한 텍스트/정보 (JSON 또는 자유 텍스트)
     */
    public String analyzeImagesOnly(List<String> imageUrls) {
        try {
            List<String> limitedImages = imageUrls.size() > MAX_IMAGES_FOR_METADATA
                    ? imageUrls.subList(0, MAX_IMAGES_FOR_METADATA)
                    : imageUrls;

            String prompt = """
                    첨부된 이미지들을 분석하여 아래 항목을 JSON으로 추출하라.
                    텍스트 설명 없이 이미지만 보고 판단하라.
                    확신이 없는 항목은 null로 반환하라.

                    {
                      "detectedText": ["string (OCR로 감지된 텍스트. 예: 모델명, 브랜드 로고, 책 제목)"],
                      "brand": "string or null (로고/텍스트로 감지된 브랜드)",
                      "productType": "string or null (상품 종류 추정. 예: 노트북, 운동화, 소설책)",
                      "colors": ["string (주요 색상)"],
                      "condition": "string or null (새상품/거의새상품/좋음/사용감있음/불량)",
                      "visibleDefects": ["string (육안으로 보이는 결함. 없으면 빈 배열)"],
                      "imageAnalysisConfidence": "high or medium or low (분석 신뢰도)"
                    }
                    """;

            String response = callGmsApi(prompt, limitedImages);
            return extractJsonFromResponse(response);
        } catch (Exception e) {
            log.error("Image analysis failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 자연어 검색어를 분석하여 Text-to-Filter 방식의 구조화된 검색 필터를 생성합니다.
     * LLM은 SQL을 만들지 않고, 브랜드/제품명/색상 해석과 유사어 확장만 담당합니다.
     * 서버가 이 필터를 기반으로 안전하게 DB 검색을 수행합니다.
     *
     * 실패 시 null 대신 SearchFilterDto.empty()를 반환하여 NPE를 방지합니다.
     */
    public SearchFilterDto buildSearchFilter(String query) {
        try {
            String prompt = buildSearchFilterPrompt(query);
            String response = callGmsApi(prompt, List.of());
            String jsonStr = extractJsonFromResponse(response);
            // 직접 DTO 역직렬화 대신 JsonNode 경유 → LLM 출력 불안정성 방어
            JsonNode node = objectMapper.readTree(jsonStr);
            return normalizeSearchFilter(node);
        } catch (Exception e) {
            log.error("Failed to build search filter for query '{}': {}", query, e.getMessage());
            return SearchFilterDto.empty();
        }
    }

    /**
     * GMS API를 호출합니다.
     */
    private String callGmsApi(String prompt, List<String> imageUrls) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + gmsApiKey);

        String requestBody = objectMapper.writeValueAsString(new GmsRequest(prompt, imageUrls));
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        String response = restTemplate.postForObject(gmsEndpoint, entity, String.class);
        log.debug("GMS API Response: {}", response);

        return response;
    }

    /**
     * 상품 등록 시 메타데이터 생성용 프롬프트.
     * condition enum, canonicalColors 화이트리스트, searchAliases 최대 개수를 제한해
     * LLM 출력 품질과 일관성을 높입니다.
     * 가격/카테고리/지역도 메타데이터에 포함합니다.
     */
    private String buildMetadataPrompt(String title, String description, Long price, String categoryCode,
            String regionName, int totalImageCount) {
        String imageNote = totalImageCount > MAX_IMAGES_FOR_METADATA
                ? String.format("(총 %d장 중 앞 %d장 분석)", totalImageCount, MAX_IMAGES_FOR_METADATA)
                : (totalImageCount > 0 ? String.format("(총 %d장 분석)", totalImageCount) : "(이미지 없음)");

        return String.format(
                """
                        첨부된 상품 이미지 %s와 아래 상품 정보를 분석하여 검색용 구조화 메타데이터를 JSON으로 생성해줘.
                        이미지가 있다면 색상, 브랜드, 상태, 결함 등을 직접 확인해줘.
                        JSON만 반환하고 설명은 생략해줘.

                        상품 제목: %s
                        상품 설명: %s
                        가격: %d
                        카테고리: %s
                        지역: %s

                        제약 조건:
                        - condition은 반드시 ["새상품", "거의새상품", "좋음", "사용감있음", "불량"] 중 하나만 사용하라.
                        - canonicalColors는 반드시 ["검정", "흰색", "회색", "빨강", "파랑", "초록", "노랑", "갈색", "베이지", "핑크", "보라", "은색", "금색"] 중에서만 선택하라.
                        - 불확실한 정보는 추측하지 말고 null 또는 빈 배열로 반환하라.
                        - searchAliases는 최대 6개까지만 반환하라.

                        아래 JSON 스키마로 반환 (null 허용):
                        {
                          "brand": "string or null (브랜드명, 영문 공식명 우선. 예: Apple, Samsung, Nike)",
                          "productName": "string or null (제품 종류명. 예: MacBook Pro, 갤럭시 탭)",
                          "modelName": "string or null (구체적 모델명. 예: M2 13인치, S24 Ultra)",
                          "colors": ["string (실제 색상명. 예: 미드나이트, 스페이스 블랙)"],
                          "canonicalColors": ["string (위 화이트리스트에서만 선택)"],
                          "condition": "string (위 enum 중 하나)",
                          "features": ["string (핵심 특징. 예: M2 칩, 256GB, 14인치)"],
                          "defects": ["string (결함 설명, 없으면 빈 배열)"],
                          "searchAliases": ["string (검색 표현, 한국어/영어 모두. 최대 6개)"],
                          "price": %d,
                          "category": "%s",
                          "region": "%s",
                          "extra": {%s}
                        }
                        """,
                imageNote, title, description, price, categoryCode, regionName,
                price, categoryCode, regionName, buildExtraHint(categoryCode));
    }

    private String buildExtraHint(String categoryCode) {
        if (categoryCode == null)
            return "\"key\": \"value\"";
        return switch (categoryCode.toUpperCase()) {
            case "DIGITAL", "ELECTRONICS" ->
                "\"storage\": \"string\", \"memory\": \"string\", \"screenSize\": \"string\"";
            case "FASHION", "CLOTHING" -> "\"size\": \"string\", \"material\": \"string\"";
            case "FURNITURE" -> "\"size\": \"string\", \"material\": \"string\"";
            case "BOOK" -> "\"author\": \"string\", \"publisher\": \"string\"";
            default -> "\"key\": \"value\"";
        };
    }

    /**
     * 검색 시 자연어 → 검색 필터 JSON 변환용 프롬프트.
     *
     * LLM 역할:
     * - brand: 대표 브랜드명 하나 (canonical)
     * - brandAliases: 검색 확장 표현 (한/영)
     * - productName: 대표 제품명 하나 (canonical)
     * - productAliases: 유사 표현 확장 (한/영)
     * - colorAliases: 색상 유사어 확장
     * - 가격/정렬/카테고리 등이 검색어에 명시된 경우 filters에 반영
     */
    private static final Set<String> ALLOWED_SORT = Set.of("LATEST", "PRICE_ASC", "PRICE_DESC");
    private static final Set<String> ALLOWED_CONDITION = Set.of("새상품", "거의새상품", "좋음", "사용감있음", "불량");
    private static final Set<String> ALLOWED_TRADE_TYPE = Set.of("직거래", "택배");

    private String buildSearchFilterPrompt(String query) {
        return String.format("""
                사용자의 중고거래 상품 검색어를 분석하여 검색 필터 JSON으로 변환하라.
                JSON만 반환하라. SQL은 만들지 마라.
                확신이 없는 필드는 null 또는 빈 배열로 반환하라.

                규칙:
                - brand는 대표 브랜드명 하나만 넣고, 확장 표현은 brandAliases에 넣어라.
                - productName은 대표 제품명 하나만 넣고, 유사 표현은 productAliases에 넣어라.
                - colors는 사용자가 의도한 대표색만 넣고, 실제 검색 확장은 colorAliases에 넣어라.
                - 가격/정렬/카테고리/거래방식이 검색어에 명시된 경우 filters에 반영하라.
                - brandAliases, productAliases, colorAliases는 한국어/영어 모두 포함하라.
                - filters의 대표값은 정규화된 값으로, expanded는 검색 확장 표현만 포함하라. 동일 의미 중복 표현은 제거하라.
                - sort는 반드시 [LATEST, PRICE_ASC, PRICE_DESC] 중 하나 또는 null.
                - condition은 반드시 [새상품, 거의새상품, 좋음, 사용감있음, 불량] 중 하나 또는 null.
                - tradeType은 반드시 [직거래, 택배] 중 하나 또는 null.

                검색어: %s

                아래 JSON 스키마로 반환:
                {
                  "intent": "product_search",
                  "filters": {
                    "minPrice": null or number,
                    "maxPrice": null or number,
                    "brand": "string or null (대표 브랜드명)",
                    "productName": "string or null (대표 제품명)",
                    "modelName": "string or null",
                    "colors": [] or null,
                    "condition": "string or null (새상품/거의새상품/좋음/사용감있음/불량 중 하나)",
                    "category": "string or null",
                    "region": "string or null",
                    "tradeType": "string or null (직거래/택배 중 하나)"
                  },
                  "expanded": {
                    "brandAliases": ["string"],
                    "productAliases": ["string"],
                    "modelAliases": ["string"],
                    "colorAliases": ["string"],
                    "featureAliases": ["string"]
                  },
                  "sort": "null or LATEST or PRICE_ASC or PRICE_DESC"
                }
                """, query);
    }

    /**
     * LLM 출력 JsonNode를 안전하게 SearchFilterDto로 변환합니다.
     * "colors": "검정" 처럼 배열 대신 문자열로 오는 경우나 필드 누락에 대응합니다.
     */
    private SearchFilterDto normalizeSearchFilter(JsonNode node) {
        SearchFilterDto dto = SearchFilterDto.empty();

        if (node.has("intent") && !node.get("intent").isNull()) {
            dto.setIntent(node.get("intent").asText("product_search"));
        }

        if (node.has("sort") && !node.get("sort").isNull()) {
            String sort = node.get("sort").asText().trim().toUpperCase();
            if (ALLOWED_SORT.contains(sort)) {
                dto.setSort(sort);
            }
        }

        SearchFilterDto.Filters filters = dto.getFilters();
        JsonNode f = node.path("filters");
        if (!f.isMissingNode() && !f.isNull()) {
            if (f.has("minPrice") && !f.get("minPrice").isNull()) {
                try {
                    filters.setMinPrice(f.get("minPrice").asLong());
                } catch (Exception ignored) {
                }
            }
            if (f.has("maxPrice") && !f.get("maxPrice").isNull()) {
                try {
                    filters.setMaxPrice(f.get("maxPrice").asLong());
                } catch (Exception ignored) {
                }
            }
            filters.setBrand(textOrNull(f, "brand"));
            filters.setProductName(textOrNull(f, "productName"));
            filters.setModelName(textOrNull(f, "modelName"));
            filters.setColors(toStringList(f.path("colors")));
            filters.setCondition(whitelistedOrNull(f, "condition", ALLOWED_CONDITION));
            filters.setCategory(textOrNull(f, "category"));
            filters.setRegion(textOrNull(f, "region"));
            filters.setTradeType(whitelistedOrNull(f, "tradeType", ALLOWED_TRADE_TYPE));
        }

        SearchFilterDto.Expanded expanded = dto.getExpanded();
        JsonNode e = node.path("expanded");
        if (!e.isMissingNode() && !e.isNull()) {
            expanded.setBrandAliases(toDeduplicatedStringList(e.path("brandAliases")));
            expanded.setProductAliases(toDeduplicatedStringList(e.path("productAliases")));
            expanded.setModelAliases(toDeduplicatedStringList(e.path("modelAliases")));
            expanded.setColorAliases(toDeduplicatedStringList(e.path("colorAliases")));
            expanded.setFeatureAliases(toDeduplicatedStringList(e.path("featureAliases")));
        }

        return dto;
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode v = node.path(field);
        if (v.isMissingNode() || v.isNull())
            return null;
        String text = v.asText().trim();
        return text.isEmpty() || "null".equalsIgnoreCase(text) ? null : text;
    }

    /** whitelist에 포함된 값만 반환하고, 그 외는 null 처리합니다. */
    private String whitelistedOrNull(JsonNode node, String field, Set<String> allowed) {
        String value = textOrNull(node, field);
        return (value != null && allowed.contains(value)) ? value : null;
    }

    /** toStringList 결과에서 중복 제거한 리스트를 반환합니다. */
    private List<String> toDeduplicatedStringList(JsonNode node) {
        List<String> raw = toStringList(node);
        return new ArrayList<>(new LinkedHashSet<>(raw));
    }

    /** 배열 또는 단일 문자열을 List<String>으로 안전하게 변환합니다. */
    private List<String> toStringList(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node.isMissingNode() || node.isNull())
            return result;
        if (node.isArray()) {
            for (JsonNode el : node) {
                if (!el.isNull()) {
                    String text = el.asText().trim();
                    if (!text.isEmpty())
                        result.add(text);
                }
            }
        } else if (node.isTextual()) {
            // "colors": "검정" 처럼 문자열로 온 경우 단일 원소 리스트로 변환
            String text = node.asText().trim();
            if (!text.isEmpty())
                result.add(text);
        }
        return result;
    }

    /**
     * API 응답에서 JSON 문자열을 추출합니다.
     */
    private String extractJsonFromResponse(String response) throws Exception {
        JsonNode rootNode = objectMapper.readTree(response);

        JsonNode choices = rootNode.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            throw new IllegalStateException("GMS API 응답에 choices가 없습니다: " + response);
        }

        String content = choices.get(0)
                .path("message")
                .path("content")
                .asText();

        String jsonContent = extractJsonBlock(content);
        objectMapper.readTree(jsonContent); // 유효성 검증
        return jsonContent;
    }

    private String extractJsonBlock(String content) {
        if (content.contains("```json")) {
            int start = content.indexOf("```json") + 7;
            int end = content.indexOf("```", start);
            return content.substring(start, end).trim();
        }
        if (content.contains("```")) {
            int start = content.indexOf("```") + 3;
            int end = content.indexOf("```", start);
            return content.substring(start, end).trim();
        }
        return content.trim();
    }

    /**
     * GMS API 요청 형식
     */
    static class GmsRequest {
        public String model = "gpt-5.2";
        public Object[] messages;
        public int max_completion_tokens = 4096;
        public double temperature = 0.3;

        GmsRequest(String userContent, List<String> imageUrls) {
            Map<String, Object> systemMsg = new java.util.HashMap<>();
            systemMsg.put("role", "developer");
            systemMsg.put("content",
                    "Answer in Korean. You are an expert at analyzing product information and creating structured metadata.");

            Map<String, Object> userMsg = new java.util.HashMap<>();
            userMsg.put("role", "user");

            if (imageUrls != null && !imageUrls.isEmpty()) {
                List<Map<String, Object>> contentParts = new ArrayList<>();
                for (String url : imageUrls) {
                    Map<String, Object> imageUrlObj = new java.util.HashMap<>();
                    imageUrlObj.put("url", url);
                    imageUrlObj.put("detail", "low");
                    Map<String, Object> imagePart = new java.util.HashMap<>();
                    imagePart.put("type", "image_url");
                    imagePart.put("image_url", imageUrlObj);
                    contentParts.add(imagePart);
                }
                Map<String, Object> textPart = new java.util.HashMap<>();
                textPart.put("type", "text");
                textPart.put("text", userContent);
                contentParts.add(textPart);
                userMsg.put("content", contentParts);
            } else {
                userMsg.put("content", userContent);
            }

            this.messages = new Object[] { systemMsg, userMsg };
        }
    }
}
