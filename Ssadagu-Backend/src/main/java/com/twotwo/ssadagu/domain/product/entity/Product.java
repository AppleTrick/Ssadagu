package com.twotwo.ssadagu.domain.product.entity;

import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long price;

    @Column(name = "category_code", nullable = false, length = 50)
    private String categoryCode;

    @Column(name = "region_name", length = 100)
    private String regionName;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "wish_count", nullable = false)
    private Integer wishCount;

    @Column(name = "chat_count", nullable = false)
    private Integer chatCount;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<ProductImage> images = new java.util.ArrayList<>();

    @Column(columnDefinition = "JSON")
    private String metadata;

    // 검색용 metadata 추출 컬럼 (Phase 2)
    // metadata JSON의 핵심 필드를 별도 컬럼으로 분리해 필드 기반 정밀 검색에 활용.
    // 기존 상품(컬럼 null)은 metadata 문자열 LIKE 검색으로 자동 fallback.
    @Column(name = "metadata_brand", length = 100)
    private String metadataBrand;

    @Column(name = "metadata_product_name", length = 200)
    private String metadataProductName;

    @Column(name = "metadata_model_name", length = 200)
    private String metadataModelName;

    /** 정규화된 색상 목록 (쉼표 구분). 예: "검정,흰색" */
    @Column(name = "metadata_canonical_colors", length = 500)
    private String metadataCanonicalColors;

    @Column(name = "metadata_condition", length = 50)
    private String metadataCondition;

    /** 검색 alias 목록 (공백 구분, LIKE 검색용). 예: "맥북 MacBook 애플 Apple" */
    @Column(name = "metadata_search_aliases", columnDefinition = "TEXT")
    private String metadataSearchAliases;

    public void update(String title, String description, Long price, String categoryCode, String regionName,
            String status) {
        if (title != null)
            this.title = title;
        if (description != null)
            this.description = description;
        if (price != null)
            this.price = price;
        if (categoryCode != null)
            this.categoryCode = categoryCode;
        if (regionName != null)
            this.regionName = regionName;
        if (status != null)
            this.status = status;
    }

    public void markAsDeleted() {
        this.status = "DELETED";
        this.deletedAt = LocalDateTime.now();
    }

    public void increaseWishCount() {
        this.wishCount++;
    }

    public void decreaseWishCount() {
        if (this.wishCount > 0) {
            this.wishCount--;
        }
    }

    public void reserve() {
        this.status = "TRADING";
    }

    public void soldOut() {
        this.status = "SOLD";
    }

    public void cancelReservation() {
        this.status = "ON_SALE";
    }

    public void updateMetadata(String metadata) {
        this.metadata = metadata;
    }

    /** metadata 추출 필드를 한 번에 업데이트합니다. */
    public void updateMetadataFields(String brand, String productName, String modelName,
            String canonicalColors, String condition, String searchAliases) {
        this.metadataBrand = brand;
        this.metadataProductName = productName;
        this.metadataModelName = modelName;
        this.metadataCanonicalColors = canonicalColors;
        this.metadataCondition = condition;
        this.metadataSearchAliases = searchAliases;
    }
}
