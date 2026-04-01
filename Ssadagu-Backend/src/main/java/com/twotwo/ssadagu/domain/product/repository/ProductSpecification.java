package com.twotwo.ssadagu.domain.product.repository;

import com.twotwo.ssadagu.domain.product.entity.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> notDeleted() {
        return (root, query, cb) -> cb.and(
                cb.notEqual(root.get("status"), "DELETED"),
                cb.isNull(root.get("deletedAt"))
        );
    }

    public static Specification<Product> regionEquals(String regionName) {
        return (root, query, cb) -> cb.equal(root.get("regionName"), regionName);
    }

    public static Specification<Product> maxPrice(Long max) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), max);
    }

    public static Specification<Product> minPrice(Long min) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), min);
    }

    public static Specification<Product> titleContains(String keyword) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("title")), "%" + keyword.toLowerCase() + "%");
    }

    public static Specification<Product> categoryEquals(String categoryCode) {
        return (root, query, cb) -> cb.equal(root.get("categoryCode"), categoryCode);
    }

    /**
     * 브랜드 필드 기반 매칭. metadataBrand 컬럼을 우선 검색하고,
     * 컬럼이 null인 기존 상품은 metadata 문자열 LIKE 검색으로 fallback합니다.
     */
    public static Specification<Product> brandFieldMatch(List<String> terms) {
        return fieldMatch(terms, "metadataBrand");
    }

    /**
     * 제품명 필드 기반 매칭. metadataProductName 컬럼 우선, null이면 metadata fallback.
     */
    public static Specification<Product> productNameFieldMatch(List<String> terms) {
        return fieldMatch(terms, "metadataProductName");
    }

    /**
     * 색상 필드 기반 매칭. metadataCanonicalColors 컬럼 우선, null이면 metadata fallback.
     */
    public static Specification<Product> colorFieldMatch(List<String> terms) {
        return fieldMatch(terms, "metadataCanonicalColors");
    }

    /**
     * 상태(condition) 정확 매칭. metadataCondition 컬럼이 있으면 사용, 없으면 metadata LIKE fallback.
     */
    public static Specification<Product> conditionEquals(String condition) {
        return (root, query, cb) -> {
            if (condition == null) return cb.conjunction();
            String pattern = "%" + condition.toLowerCase() + "%";
            return cb.or(
                    cb.equal(cb.lower(root.get("metadataCondition")), condition.toLowerCase()),
                    cb.and(
                            cb.isNull(root.get("metadataCondition")),
                            cb.like(cb.lower(root.get("metadata")), pattern)
                    )
            );
        };
    }

    /**
     * 공통 필드 매칭 로직: 지정 컬럼이 null이 아니면 컬럼 LIKE, null이면 metadata 문자열 LIKE.
     * 여러 term은 OR로 연결합니다.
     */
    private static Specification<Product> fieldMatch(List<String> terms, String fieldName) {
        return (root, query, cb) -> {
            if (terms == null || terms.isEmpty()) return cb.conjunction();
            List<Predicate> predicates = new ArrayList<>();
            for (String term : terms) {
                String pattern = "%" + term.toLowerCase() + "%";
                predicates.add(cb.or(
                        // 필드가 채워진 경우: 해당 컬럼에서 LIKE 검색
                        cb.and(
                                cb.isNotNull(root.get(fieldName)),
                                cb.like(cb.lower(root.get(fieldName)), pattern)
                        ),
                        // 필드가 null(구버전 데이터): metadata 전체 문자열 fallback
                        cb.and(
                                cb.isNull(root.get(fieldName)),
                                cb.like(cb.lower(root.get("metadata")), pattern)
                        )
                ));
            }
            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * metadataSearchAliases 컬럼에서만 검색합니다.
     * fieldMatch 결과가 없을 때 searchAliases에 있는 동의어/스타일명 등을 찾기 위한 보조 검색입니다.
     */
    public static Specification<Product> searchAliasesMatch(List<String> keywords) {
        return (root, query, cb) -> {
            if (keywords == null || keywords.isEmpty()) return cb.conjunction();

            List<Predicate> predicates = new ArrayList<>();
            for (String kw : keywords) {
                String pattern = "%" + kw.toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("metadataSearchAliases")), pattern));
            }
            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * 키워드 목록 중 하나라도 title / description / metadataSearchAliases / metadata 에 포함되면 매칭.
     * 필드 기반 검색이 없는 경우의 fallback 용도로 사용합니다.
     */
    public static Specification<Product> keywordsMatch(List<String> keywords) {
        return (root, query, cb) -> {
            if (keywords == null || keywords.isEmpty()) return cb.conjunction();

            List<Predicate> keywordPredicates = new ArrayList<>();
            for (String kw : keywords) {
                String pattern = "%" + kw.toLowerCase() + "%";
                keywordPredicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(root.get("metadataSearchAliases")), pattern),
                        cb.like(cb.lower(root.get("metadata")), pattern)
                ));
            }
            return cb.or(keywordPredicates.toArray(new Predicate[0]));
        };
    }
}