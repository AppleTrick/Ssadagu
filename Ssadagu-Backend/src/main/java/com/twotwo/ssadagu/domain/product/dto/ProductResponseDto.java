package com.twotwo.ssadagu.domain.product.dto;

import com.twotwo.ssadagu.domain.product.entity.Product;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductResponseDto {
    private Long id;
    private Long sellerId;
    private String title;
    private String description;
    private Long price;
    private String categoryCode;
    private String regionName;
    private String status;
    private Integer wishCount;
    private Integer chatCount;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;

    public static ProductResponseDto from(Product entity) {
        return ProductResponseDto.builder()
                .id(entity.getId())
                .sellerId(entity.getSeller().getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .categoryCode(entity.getCategoryCode())
                .regionName(entity.getRegionName())
                .status(entity.getStatus())
                .wishCount(entity.getWishCount())
                .chatCount(entity.getChatCount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
