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
     * 키워드 목록 중 하나라도 title / description / metadata 에 포함되면 매칭.
     * 각 키워드는 OR 조건, 각 컬럼도 OR 조건으로 연결합니다.
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
                        cb.like(cb.lower(root.get("metadata")), pattern)
                ));
            }
            return cb.or(keywordPredicates.toArray(new Predicate[0]));
        };
    }
}