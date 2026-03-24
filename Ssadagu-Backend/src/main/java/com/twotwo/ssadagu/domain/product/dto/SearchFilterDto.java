package com.twotwo.ssadagu.domain.product.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

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
     * 브랜드/제품명/모델명 계열 alias (필수 검색 그룹).
     * 이 그룹이 있으면 반드시 하나 이상 매칭되어야 한다.
     */
    public List<String> collectCoreTerms() {
        Set<String> terms = new LinkedHashSet<>();
        if (filters != null) {
            addNonBlank(terms, filters.brand);
            addNonBlank(terms, filters.productName);
            addNonBlank(terms, filters.modelName);
        }
        if (expanded != null) {
            addAllNonBlank(terms, expanded.brandAliases);
            addAllNonBlank(terms, expanded.productAliases);
            addAllNonBlank(terms, expanded.modelAliases);
        }
        return new ArrayList<>(terms);
    }

    /**
     * 색상/특징 계열 alias (선택 검색 그룹).
     * 핵심 그룹이 없을 때 fallback으로 사용한다.
     */
    public List<String> collectOptionalTerms() {
        Set<String> terms = new LinkedHashSet<>();
        if (filters != null && filters.colors != null) {
            addAllNonBlank(terms, filters.colors);
        }
        if (expanded != null) {
            addAllNonBlank(terms, expanded.colorAliases);
            addAllNonBlank(terms, expanded.featureAliases);
        }
        return new ArrayList<>(terms);
    }

    private void addNonBlank(Set<String> set, String value) {
        if (value != null && !value.isBlank() && value.length() > 1) set.add(value.trim());
    }

    private void addAllNonBlank(Set<String> set, List<String> values) {
        if (values == null) return;
        for (String v : values) addNonBlank(set, v);
    }
}
