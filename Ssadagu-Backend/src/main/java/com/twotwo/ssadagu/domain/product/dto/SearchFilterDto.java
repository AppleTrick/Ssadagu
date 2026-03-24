package com.twotwo.ssadagu.domain.product.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * LLM이 자연어 검색어를 분석해서 반환하는 구조화된 검색 필터.
 * Text-to-Filter 방식으로, SQL을 직접 생성하지 않고 서버가 안전하게 쿼리를 만든다.
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchFilterDto {

    private String intent;
    private Filters filters;
    private Expanded expanded;
    private String sort;

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Filters {
        private Long minPrice;
        private Long maxPrice;
        private String brand;
        private String productName;
        private String modelName;
        private List<String> colors;
        private String condition;
        private String category;
        private String region;
        private String tradeType;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Expanded {
        private List<String> brandAliases;
        private List<String> productAliases;
        private List<String> modelAliases;
        private List<String> colorAliases;
        private List<String> featureAliases;
    }

    /** LLM 실패 시 반환하는 빈 필터 */
    public static SearchFilterDto empty() {
        SearchFilterDto dto = new SearchFilterDto();
        dto.intent = "product_search";
        dto.filters = new Filters();
        dto.expanded = new Expanded();
        return dto;
    }

    /**
     * 모든 alias를 하나의 리스트로 합칩니다.
     * 서버에서 keywordsMatch Specification에 사용합니다.
     */
    public List<String> collectAllAliases() {
        List<String> allTerms = new ArrayList<>();
        if (expanded != null) {
            if (expanded.brandAliases != null) allTerms.addAll(expanded.brandAliases);
            if (expanded.productAliases != null) allTerms.addAll(expanded.productAliases);
            if (expanded.modelAliases != null) allTerms.addAll(expanded.modelAliases);
            if (expanded.colorAliases != null) allTerms.addAll(expanded.colorAliases);
            if (expanded.featureAliases != null) allTerms.addAll(expanded.featureAliases);
        }
        if (filters != null) {
            if (filters.brand != null) allTerms.add(filters.brand);
            if (filters.productName != null) allTerms.add(filters.productName);
            if (filters.modelName != null) allTerms.add(filters.modelName);
            if (filters.colors != null) allTerms.addAll(filters.colors);
        }
        return allTerms;
    }
}
