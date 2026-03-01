package com.twotwo.ssadagu.domain.product.dto;

import com.twotwo.ssadagu.domain.product.entity.ProductImage;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductImageResponseDto {
    private Long id;
    private String imageUrl;

    public static ProductImageResponseDto from(ProductImage entity) {
        return ProductImageResponseDto.builder()
                .id(entity.getId())
                .imageUrl(entity.getImageUrl())
                .build();
    }
}
